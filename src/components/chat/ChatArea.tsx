import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Mic, MicOff, Wand2, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../../stores/app-store';
import { MessageBubble } from './MessageBubble';
import { QuickActions } from './QuickActions';
import { SmartSuggestion } from './SmartSuggestion';
import { PautaSuggestion } from './PautaSuggestion';
import { AgentSkillsBar } from './AgentSkillsBar';
import { ScrollButtons } from './ScrollButtons';
import { AgentSelector } from './AgentSelector';
import { ClientSelector } from './ClientSelector';
import { SlashCommandMenu } from './SlashCommandMenu';
import { IntentBanner } from './IntentBanner';
import { isComplaint, categorizeComplaint, addCorrection, getRelevantCorrections, buildCorrectionsBlock } from '../../lib/learning/feedback-system';
import { detectIntent } from '../../lib/intent/intent-detector';
import type { SlashCommand } from '../../lib/commands/slash-commands';
import { loadClientMemory, formatMemoryForPrompt } from '../../lib/memory/client-memory';
import { generateThreadTitle } from '../../lib/conversations/auto-title';
import { FileUpload, type AttachedFile } from '../upload/FileUpload';
import { buildSystemPrompt } from '../../lib/agents/system-prompt-builder';
import { autoSelectAgent } from '../../lib/agents/auto-router';
import { supabase } from '../../lib/supabase/client';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { sendChat, resolveModel, resolveModelWithOverride, getProviderStatus } from '../../lib/ai/chat-provider';
import { listClientDocs, buildClientDocsContext } from '../../lib/clients/client-docs';
import { trackMessageUsage } from '../../hooks/useUsageTracking';
import type { Message } from '../../lib/agents/types';

export const ChatArea: React.FC = () => {
  const {
    currentAgent, currentClient, messages, ppFlags,
    tasks, sprintWeek, sprintGoals, userName, userId,
    streaming, autoRouterEnabled, setAutoRouter,
    setStreaming, addMessage, getConvKey, selectAgent,
    setLibraryOpen,
    currentThreadId, createNewThread, updateThreadAfterMessage, renameThread,
  } = useAppStore();

  const [input, setInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [pendingModelId, setPendingModelId] = useState<string | undefined>(undefined);
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [intentDismissed, setIntentDismissed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const convKey = getConvKey();
  const currentMessages = messages[convKey] ?? [];

  const { setViewMode, selectClient } = useAppStore();

  // Intent detection reativo enquanto usuario digita
  const intentSuggestion = React.useMemo(() => {
    if (intentDismissed || slashOpen) return null;
    return detectIntent(input);
  }, [input, intentDismissed, slashOpen]);

  // Reset dismiss quando input muda muito
  React.useEffect(() => {
    if (input.length < 5) setIntentDismissed(false);
  }, [input]);

  // Escutar evento Cmd+/ para abrir slash menu
  React.useEffect(() => {
    const handler = () => {
      setInput((prev) => prev.endsWith('/') ? prev : prev + '/');
      setSlashOpen(true);
      setSlashQuery('');
      setTimeout(() => textareaRef.current?.focus(), 50);
    };
    window.addEventListener('pitwall:open-slash', handler);
    return () => window.removeEventListener('pitwall:open-slash', handler);
  }, []);

  // Executa acao de um slash command
  const handleSlashSelect = (cmd: SlashCommand) => {
    const action = cmd.action;
    // Limpa o "/..." do input
    setInput((prev) => prev.replace(/\/[\w-]*$/, '').trimEnd());
    setSlashOpen(false);
    setSlashQuery('');

    if (action.kind === 'view') {
      setViewMode(action.target);
    } else if (action.kind === 'link') {
      window.open(action.url, '_blank', 'noopener');
    } else if (action.kind === 'event') {
      window.dispatchEvent(new CustomEvent(action.name));
    } else if (action.kind === 'agent') {
      selectAgent(action.agentId);
    } else if (action.kind === 'client') {
      const client = action.clientId ? useAppStore.getState().clients.find((c) => c.id === action.clientId) : null;
      selectClient(client ?? null);
    } else if (action.kind === 'new-thread') {
      createNewThread();
    } else if (action.kind === 'prompt') {
      setInput(action.prompt);
    }
  };

  // Ativa a sugestao de intent
  const handleIntentActivate = () => {
    if (!intentSuggestion) return;
    // Extrai apenas o keyword sem "/"
    const kw = intentSuggestion.slashCommand.replace('/', '');
    // Simula execucao via mapeamento
    const skillMap: Record<string, () => void> = {
      pauta: () => window.open('https://v4ruston-aprova.vercel.app/', '_blank', 'noopener'),
      checkin: () => setViewMode('checkin'),
      trafego: () => setViewMode('trafego'),
      clipping: () => setViewMode('clipping'),
      criativos: () => setViewMode('criativos'),
      ekyte: () => setViewMode('ekyte'),
      documentos: () => setViewMode('documents'),
    };
    const action = skillMap[kw];
    if (action) action();
    setIntentDismissed(true);
  };

  const { isListening, isSupported: voiceSupported, toggle: toggleVoice } = useVoiceInput((transcript) => {
    setInput(transcript);
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length]);

  // Listen for prompt injection events (from Command Palette / Library)
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<{ prompt: string }>;
      if (customEvent.detail?.prompt) {
        setInput(customEvent.detail.prompt);
        setTimeout(() => {
          textareaRef.current?.focus();
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
          }
        }, 50);
      }
    };
    window.addEventListener('pitwall:inject-prompt', handler);
    return () => window.removeEventListener('pitwall:inject-prompt', handler);
  }, []);

  const persistMessages = async (userMsg: Message, botMsg: Message, agentId: string) => {
    if (!userId || userId === 'offline') return;
    try {
      const { data: conv } = await supabase
        .from('conversations')
        .upsert(
          {
            user_id: userId,
            agent_id: agentId,
            client_id: currentClient?.id ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,agent_id,client_id' }
        )
        .select()
        .single();

      if (conv) {
        await supabase.from('messages').insert([
          { conversation_id: conv.id, role: 'user', content: userMsg.content, agent_id: agentId },
          { conversation_id: conv.id, role: 'bot', content: botMsg.content, agent_id: agentId },
        ]);
      }
    } catch {
      // silent
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && attachedFiles.length === 0) || streaming || !currentAgent) return;

    let finalAgent = currentAgent;
    let userText = input.trim();

    // Apply auto-router if enabled
    if (autoRouterEnabled && userText) {
      const routed = autoSelectAgent(userText);
      if (routed.confidence !== 'low' && routed.agent.id !== currentAgent.id) {
        finalAgent = routed.agent;
        selectAgent(routed.agent.id);
        toast.success(`Auto-roteado para ${routed.agent.name} (${routed.reason})`, { duration: 3000 });
      }
    }

    // Append file context to the message
    if (attachedFiles.length > 0) {
      const fileContext = attachedFiles
        .map((f) => {
          if (f.text) return `[Arquivo: ${f.name}]\n${f.text}`;
          if (f.dataUrl) return `[Imagem anexada: ${f.name}]`;
          return `[Arquivo: ${f.name}]`;
        })
        .join('\n\n');
      userText = `${userText}\n\n---\n${fileContext}`;
    }

    // Auto-cria thread se nao ha uma ativa (primeira mensagem)
    let activeThreadId = currentThreadId;
    if (!activeThreadId) {
      const newThread = createNewThread(userText);
      activeThreadId = newThread.id;
    }

    const newConvKey = `thread_${activeThreadId}`;
    const newMessages = messages[newConvKey] ?? [];

    const userMsg: Message = {
      id: crypto.randomUUID(),
      conversationId: newConvKey,
      role: 'user',
      content: userText,
      createdAt: new Date().toISOString(),
    };
    addMessage(newConvKey, userMsg);
    updateThreadAfterMessage(activeThreadId, { content: userText, role: 'user' });

    // DETECCAO DE FEEDBACK: se a mensagem parece reclamacao, salva correcao
    if (newMessages.length > 0 && isComplaint(userText)) {
      const lastBotMsg = [...newMessages].reverse().find((m) => m.role === 'bot');
      const prevUserMsg = [...newMessages].reverse().find((m) => m.role === 'user');
      if (lastBotMsg && prevUserMsg) {
        const category = categorizeComplaint(userText);
        addCorrection({
          agentId: finalAgent.id,
          clientId: currentClient?.id,
          category,
          originalPrompt: prevUserMsg.content.substring(0, 500),
          originalResponse: lastBotMsg.content.substring(0, 500),
          userComplaint: userText.substring(0, 500),
          correctionInstruction: `Usuario reclamou da resposta anterior. Reclamacao: "${userText.substring(0, 300)}". Ajustar futuras respostas de acordo.`,
          userId: userId || 'offline',
        });
        toast.success('Aprendi com seu feedback. Vou aplicar em futuras respostas.', { icon: '🧠', duration: 4000 });
      }
    }
    setInput('');
    setAttachedFiles([]);
    setShowUpload(false);
    setStreaming(true);

    try {
      // Resolve modelo que vai ser usado (considerando preferredModelId do comando)
      const modelToUse = pendingModelId
        ? resolveModelWithOverride(pendingModelId)
        : resolveModel(userText, finalAgent.id);

      // Client docs context (injetar documentos do cliente se houver)
      let clientDocsContext = '';
      if (currentClient) {
        try {
          const docs = await listClientDocs(userId || 'offline', currentClient.id);
          if (docs.length > 0) {
            clientDocsContext = await buildClientDocsContext(docs);
          }
        } catch {
          // offline/no docs
        }
      }

      const baseSystemPrompt = buildSystemPrompt({
        agent: finalAgent,
        client: currentClient,
        userName,
        ppFlags,
        tasks,
        sprintWeek,
        sprintGoals,
        recentMessages: newMessages.slice(-6).map((m) => ({
          role: m.role,
          content: m.content,
        })),
        userPrompt: userText,
        model: modelToUse ?? undefined,
        includeReferences: true,
      });

      // Correcoes aprendidas com feedback anterior (globais por agente/cliente)
      const relevantCorrections = getRelevantCorrections({
        agentId: finalAgent.id,
        clientId: currentClient?.id,
        limit: 10,
      });
      const correctionsBlock = buildCorrectionsBlock(relevantCorrections);

      // Memoria persistente do cliente (brief, decisoes, preferencias)
      const clientMemory = currentClient ? loadClientMemory(currentClient.id) : null;
      const memoryBlock = formatMemoryForPrompt(clientMemory);

      const systemPrompt = (clientDocsContext ? `${baseSystemPrompt}\n${clientDocsContext}` : baseSystemPrompt) + memoryBlock + correctionsBlock;

      // MODO EXECUCAO: aumenta tokens maximos e injeta instrucao de resposta extensa
      const executionDirective = `\n\n## MODO EXECUCAO ATIVADO (OBRIGATORIO)
Voce esta no V4 PIT WALL, dashboard de execucao profissional. TODA resposta deve ser:
1. **EXTENSA**: minimo 3000 palavras para qualquer solicitacao nao-trivial (excecao: perguntas factuais de 1 frase)
2. **PRONTA-PARA-USO**: entregue o conteudo FINAL, nao diretrizes. Ex: se pediu "3 legendas", entregue 3 legendas completas + 6 variantes A/B + cronograma de postagem + brief de imagem + metricas esperadas + hashtags por eixo (autoridade/interacao/oferta)
3. **ESTRUTURADA**: use H2/H3, tabelas com dados, checklists, codigo se aplicavel, callouts
4. **COM DADOS REAIS**: benchmarks BR quando relevantes (CPL, ROAS, engagement rates do mercado)
5. **SEM PEDIR PERMISSAO**: nao pergunte "quer que eu faca X?", ja faca X
6. **INCLUA VARIACOES**: quando aplicavel, entregue 3-10 versoes alternativas para A/B
7. **INCLUA TIMELINE**: prazos P1/P2/P3 com agentes responsaveis

Se a solicitacao for ambigua, assuma o interpretacao mais COMPLETA possivel e entregue. NUNCA peca esclarecimento — interprete e execute.`;

      const enhancedSystemPrompt = systemPrompt + executionDirective;

      const aiResult = await sendChat({
        systemPrompt: enhancedSystemPrompt,
        userPrompt: userText,
        maxTokens: Math.max(modelToUse?.maxOutput ?? 16384, 16384),
        temperature: 0.85,
        agentId: finalAgent.id,
        overrideModelId: pendingModelId,
      });
      // Reset pending override apos envio
      setPendingModelId(undefined);

      let responseText: string;
      let modelLabel: string | undefined;
      let modelProvider: 'claude' | 'gemini' | 'openrouter' | undefined;
      let thinkingTokens: number | undefined;
      let images: string[] | undefined;

      if (aiResult) {
        responseText = aiResult.text;
        modelLabel = aiResult.model.label;
        modelProvider = aiResult.model.provider;
        thinkingTokens = aiResult.thinkingTokens;
        images = aiResult.images;

        if (thinkingTokens && thinkingTokens > 0) {
          toast.success(`${modelLabel} pensou por ${thinkingTokens} tokens`, { duration: 2000 });
        }

        // Track usage + dispara webhooks (nao bloqueia UI)
        try {
          trackMessageUsage({
            userId: userId || 'offline',
            agentId: finalAgent.id,
            clientId: currentClient?.id,
            modelId: aiResult.model.apiModel,
            modelProvider: aiResult.model.provider,
            inputText: userText + systemPrompt,
            outputText: responseText,
            thinkingTokens,
          });
        } catch {
          // silent
        }
      } else {
        // Nenhuma chave configurada - mostra erro claro em vez de resposta offline generica
        const providerStatus = getProviderStatus();
        const hasAnyKey = providerStatus.hasClaudeKey || providerStatus.hasGeminiKey || providerStatus.hasOpenRouterKey;

        if (!hasAnyKey) {
          responseText = `## \u26a0\ufe0f Nenhuma chave de IA configurada

Para o V4 PIT WALL funcionar, configure ao menos uma chave:

- **Claude API** (Anthropic) - melhor qualidade de escrita - https://console.anthropic.com
- **Gemini API** (Google) - gratuita - https://aistudio.google.com/app/apikey
- **OpenRouter** - acesso a 400+ modelos - https://openrouter.ai/keys

Va em **Settings (engrenagem no header)** e cole sua chave.

Enquanto nao configura, eu nao consigo gerar conteudo com IA real. Prefiro te avisar isso a entregar uma resposta offline mediocre.`;
          toast.error('Configure uma chave em Settings');
        } else {
          // Tem chave mas sendChat retornou null - erro de resolucao
          responseText = `## \u26a0\ufe0f Erro de resolucao de modelo

Suas chaves estao configuradas, mas nenhum modelo pode ser resolvido no momento. Possiveis causas:
1. Modelo selecionado em Settings nao existe mais
2. Provider do modelo selecionado esta temporariamente bloqueado por erro recente

**Acoes:**
- Va em Settings \u2192 Modelos e clique em "Auto-Select"
- Ou aguarde 5 minutos e tente novamente (cache de erros expira)`;
          toast.error('Erro de resolucao - ver Settings');
        }
      }

      const botMsg: Message = {
        id: crypto.randomUUID(),
        conversationId: newConvKey,
        role: 'bot',
        content: responseText,
        agentId: finalAgent.id,
        createdAt: new Date().toISOString(),
        modelUsed: modelLabel,
        modelProvider,
        thinkingTokens,
        images,
      };
      addMessage(newConvKey, botMsg);
      if (activeThreadId) {
        updateThreadAfterMessage(activeThreadId, { content: responseText, role: 'bot' });

        // Titulo IA: gera apos 3+ mensagens (contando user+bot)
        // Evita rename multiplas vezes - checa se titulo ainda parece automatic
        const finalCount = newMessages.length + 2; // user + bot recem adicionados
        const thread = useAppStore.getState().threads.find((t) => t.id === activeThreadId);
        if (finalCount >= 2 && thread && thread.title.length < 80) {
          // Dispara em background, nao bloqueia UI
          generateThreadTitle(userText, responseText).then((aiTitle) => {
            if (aiTitle && aiTitle.length > 3) {
              renameThread(activeThreadId!, aiTitle);
            }
          }).catch(() => { /* silent */ });
        }
      }

      persistMessages(userMsg, botMsg, finalAgent.id);
    } catch (err) {
      // NUNCA usa offline quando ha chaves configuradas. Mostra erro real da API.
      const errMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      const content = `## \u274c Falha na comunicacao com a IA

**Erro tecnico:** ${errMessage}

### O que aconteceu
As tentativas de comunicacao com os providers de IA (Claude, Gemini, OpenRouter na ordem) falharam. O V4 PIT WALL **nao entrega respostas offline** porque voce precisa de output de IA real.

### Como resolver
1. **Verifique seu saldo** na Anthropic Console ou Google AI Studio
2. **Teste sua conexao de rede** (a API pode estar inacessivel)
3. **Clique em Settings e \u201cLimpar cache de erros\u201d** (se o erro foi ha >5 min)
4. **Tente outro modelo** em Settings \u2192 Modelos

### Prompt original
> ${userText.substring(0, 500)}${userText.length > 500 ? '...' : ''}

Tente novamente apos ajustar. Peco desculpas pela interrupcao.`;
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        conversationId: newConvKey,
        role: 'bot',
        content,
        agentId: finalAgent.id,
        createdAt: new Date().toISOString(),
      };
      addMessage(newConvKey, errorMsg);
      toast.error(`API falhou: ${errMessage.slice(0, 80)}`);
    } finally {
      setStreaming(false);
    }
  };

  const handleQuickAction = (action: string, preferredModelId?: string) => {
    setInput(action);
    if (preferredModelId) setPendingModelId(preferredModelId);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';

    // Detecta slash command: "/keyword" no final ou apenas "/" em linha nova
    const match = val.match(/(?:^|\s)\/([\w-]*)$/);
    if (match) {
      setSlashOpen(true);
      setSlashQuery(match[1]);
    } else {
      if (slashOpen) setSlashOpen(false);
    }
  };

  const handleAttach = (files: AttachedFile[]) => {
    setAttachedFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-[#0a0a0f] relative">
      <ScrollButtons />
      {/* Header ultra-limpo: apenas AgentSelector + ClientSelector + toggle Auto */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-[#111118]">
        <div className="flex items-center gap-2">
          <AgentSelector />
          <span className="text-slate-700">/</span>
          <ClientSelector />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRouter(!autoRouterEnabled)}
            className={`flex items-center gap-1 px-2 py-1 text-[10px] rounded-md transition-colors ${
              autoRouterEnabled
                ? 'bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/30'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
            }`}
            title="Auto-Router: Mestre escolhe o agente ideal automaticamente"
          >
            <Wand2 size={11} />
            Auto
          </button>
        </div>
      </div>

      {/* Smart Suggestion */}
      <SmartSuggestion />

      {/* Social Pauta Suggestion (aparece para agentes 06/07/08 ou quando user digita palavras-chave) */}
      <PautaSuggestion userInput={input} />

      {/* Quick Actions (1600 comandos) */}
      {currentAgent && <QuickActions actions={currentAgent.quickActions} onAction={handleQuickAction} />}

      {/* Skills V4 relacionadas ao agente */}
      <AgentSkillsBar onInjectPrompt={(p) => setInput(p)} />

      {/* Messages */}
      <div id="chat-messages-container" className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4" style={{overscrollBehavior: 'contain'}}>
        {currentMessages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <span className="text-5xl block mb-3">{currentAgent?.icon ?? '\u2655'}</span>
              <h3 className="text-sm font-semibold text-slate-300 mb-1">
                {currentAgent?.name ?? 'Selecione um agente'}
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                {currentAgent
                  ? `Pronto para ajudar com ${currentAgent.area}.`
                  : 'Selecione um agente na barra lateral para comecar.'}
              </p>
              {currentAgent && !currentClient && (
                <p className="text-[10px] text-slate-600 mb-4">
                  Dica: selecione um cliente para contexto personalizado.
                </p>
              )}
              {currentAgent && (
                <button
                  onClick={() => setLibraryOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-amber-400 bg-amber-500/10 rounded-full hover:bg-amber-500/20 transition-colors"
                >
                  <Sparkles size={12} />
                  Explorar biblioteca de prompts
                </button>
              )}
            </div>
          </div>
        )}
        {currentMessages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            agentColor={currentAgent?.color}
            agentName={currentAgent?.name}
            clientName={currentClient?.name}
          />
        ))}
        {streaming && (
          <div className="flex items-start gap-3 animate-in fade-in duration-300">
            <div
              className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-sm relative overflow-hidden"
              style={{ backgroundColor: (currentAgent?.color || '#e4243d') + '22', color: currentAgent?.color }}
            >
              <span className="relative z-10">{currentAgent?.icon ?? '\u2655'}</span>
              <span
                className="absolute inset-0 rounded-lg animate-ping"
                style={{ background: (currentAgent?.color || '#e4243d') + '33' }}
              />
            </div>
            <div className="flex-1 bg-slate-800/40 border border-slate-700/40 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[85%]">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold text-slate-300">{currentAgent?.name}</span>
                <span className="text-[9px] px-1.5 py-0.5 bg-[#e4243d]/15 text-[#ff4d5a] rounded font-medium">
                  pensando...
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-[#e4243d] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-[#e4243d] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-[#e4243d] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-[10px] text-slate-500">
                  processando pela IA ({currentClient?.name || 'contexto geral'})
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Slash Command Menu (flutua acima do input) */}
      <SlashCommandMenu
        query={slashQuery}
        open={slashOpen}
        onSelect={handleSlashSelect}
        onClose={() => setSlashOpen(false)}
        anchorBottom={120}
      />

      {/* Intent Banner (sugestao de skill ao digitar) */}
      {intentSuggestion && (
        <div className="pt-1">
          <IntentBanner
            suggestion={intentSuggestion}
            onActivate={handleIntentActivate}
            onDismiss={() => setIntentDismissed(true)}
          />
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-slate-800 bg-[#111118]">
        {showUpload && (
          <div className="mb-2">
            <FileUpload
              attachedFiles={attachedFiles}
              onAttach={handleAttach}
              onRemove={handleRemoveFile}
            />
          </div>
        )}

        {attachedFiles.length > 0 && !showUpload && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {attachedFiles.map((f) => (
              <div key={f.id} className="flex items-center gap-1 px-2 py-0.5 bg-slate-800 rounded text-[10px] text-slate-300">
                <span className="truncate max-w-[120px]">{f.name}</span>
                <button onClick={() => handleRemoveFile(f.id)} className="text-slate-500 hover:text-red-400">×</button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={() => setShowUpload(!showUpload)}
              className={`p-2 rounded-lg transition-colors ${
                showUpload ? 'bg-slate-800 text-slate-200' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
              }`}
              title="Anexar arquivos"
            >
              <FileUpload attachedFiles={[]} onAttach={handleAttach} onRemove={() => {}} compact />
            </button>
            <button
              onClick={() => setLibraryOpen(true)}
              className="p-2 text-slate-500 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Biblioteca de prompts (Ctrl+L)"
            >
              <Sparkles size={16} />
            </button>
            {voiceSupported && (
              <button
                onClick={toggleVoice}
                className={`p-2 rounded-lg transition-colors ${
                  isListening
                    ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30 animate-pulse'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                }`}
                title={isListening ? 'Parar gravacao' : 'Voice input (pt-BR)'}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            )}
          </div>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'Ouvindo... fale naturalmente.' : `Mensagem para ${currentAgent?.name ?? 'agente'}...`}
            rows={1}
            className="flex-1 px-3 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-600 resize-none max-h-[120px] focus:outline-none focus:ring-1 focus:ring-red-500/50"
            style={{ minHeight: '42px' }}
          />
          <button
            onClick={handleSend}
            disabled={(!input.trim() && attachedFiles.length === 0) || streaming}
            className="p-2.5 bg-red-600 text-white rounded-lg hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-[10px] text-slate-600 mt-1.5 flex items-center gap-2 flex-wrap">
          <span>Enter para enviar, Shift+Enter nova linha</span>
          <ProviderBadge />
          {autoRouterEnabled && (
            <span className="flex items-center gap-1 text-purple-400">
              <Zap size={10} />
              Auto-Router ativo
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

const ProviderBadge: React.FC = () => {
  const status = getProviderStatus();

  if (!status.hasClaudeKey && !status.hasGeminiKey) {
    return (
      <span className="flex items-center gap-1 text-amber-500/70">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        Modo Offline
      </span>
    );
  }

  if (status.autoModelEnabled) {
    const hasBoth = status.hasClaudeKey && status.hasGeminiKey;
    return (
      <span className="flex items-center gap-1 text-purple-400">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
        {hasBoth ? 'Auto-Select (Claude + Gemini)' : status.hasClaudeKey ? 'Auto-Select (Claude)' : 'Auto-Select (Gemini)'}
      </span>
    );
  }

  // Manual model selected
  if (status.provider === 'claude') {
    return (
      <span className="flex items-center gap-1 text-orange-400">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
        Claude (manual)
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 text-blue-400">
      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
      Gemini (manual)
    </span>
  );
};
