import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Mic, MicOff, Wand2, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../../stores/app-store';
import { MessageBubble } from './MessageBubble';
import { QuickActions } from './QuickActions';
import { SmartSuggestion } from './SmartSuggestion';
import { FileUpload, type AttachedFile } from '../upload/FileUpload';
import { buildSystemPrompt } from '../../lib/agents/system-prompt-builder';
import { generateOfflineResponse } from '../../lib/agents/offline-responses';
import { autoSelectAgent } from '../../lib/agents/auto-router';
import { supabase } from '../../lib/supabase/client';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { sendChat, resolveModel, resolveModelWithOverride, getProviderStatus } from '../../lib/ai/chat-provider';
import { listClientDocs, buildClientDocsContext } from '../../lib/clients/client-docs';
import type { Message } from '../../lib/agents/types';

export const ChatArea: React.FC = () => {
  const {
    currentAgent, currentClient, messages, ppFlags,
    tasks, sprintWeek, sprintGoals, userName, userId,
    streaming, autoRouterEnabled, setAutoRouter,
    setStreaming, addMessage, getConvKey, selectAgent,
    setLibraryOpen,
  } = useAppStore();

  const [input, setInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [pendingModelId, setPendingModelId] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const convKey = getConvKey();
  const currentMessages = messages[convKey] ?? [];

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

    const newConvKey = `${finalAgent.id}_${currentClient?.id ?? 'general'}`;
    const newMessages = messages[newConvKey] ?? [];

    const userMsg: Message = {
      id: crypto.randomUUID(),
      conversationId: newConvKey,
      role: 'user',
      content: userText,
      createdAt: new Date().toISOString(),
    };
    addMessage(newConvKey, userMsg);
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

      const systemPrompt = clientDocsContext ? `${baseSystemPrompt}\n${clientDocsContext}` : baseSystemPrompt;

      const aiResult = await sendChat({
        systemPrompt,
        userPrompt: userText,
        maxTokens: modelToUse?.maxOutput ?? 8192,
        temperature: 0.8,
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
      } else {
        responseText = generateOfflineResponse(userText, finalAgent, currentClient);
        toast('Modo offline. Configure Claude ou Gemini em Settings.', { icon: 'ℹ️', duration: 3000 });
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

      persistMessages(userMsg, botMsg, finalAgent.id);
    } catch (err) {
      const fallback = generateOfflineResponse(userText, finalAgent, currentClient);
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        conversationId: newConvKey,
        role: 'bot',
        content: `> **Aviso:** ${err instanceof Error ? err.message : 'Erro ao processar'}\n> Usando resposta offline.\n\n${fallback}`,
        agentId: finalAgent.id,
        createdAt: new Date().toISOString(),
      };
      addMessage(newConvKey, errorMsg);
      toast.error('Erro na API. Resposta offline gerada.');
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
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const handleAttach = (files: AttachedFile[]) => {
    setAttachedFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0f]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-[#111118]">
        <div className="flex items-center gap-2">
          {currentAgent && (
            <>
              <span
                className="w-7 h-7 flex items-center justify-center rounded-md text-sm"
                style={{ backgroundColor: currentAgent.color + '22', color: currentAgent.color }}
              >
                {currentAgent.icon}
              </span>
              <div>
                <span className="text-sm font-semibold text-slate-200">{currentAgent.name}</span>
                <span className="text-[10px] text-slate-500 block">{currentAgent.area}</span>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRouter(!autoRouterEnabled)}
            className={`flex items-center gap-1 px-2 py-1 text-[10px] rounded-md transition-colors ${
              autoRouterEnabled
                ? 'bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/30'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
            }`}
            title="Auto-Router do Agente Mestre"
          >
            <Wand2 size={11} />
            Auto
          </button>
          {currentClient && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 rounded text-xs text-slate-400">
              <span className={`w-2 h-2 rounded-full ${
                currentClient.health === 'green' ? 'bg-emerald-500' :
                currentClient.health === 'yellow' ? 'bg-amber-400' : 'bg-red-500'
              }`} />
              {currentClient.name}
            </div>
          )}
        </div>
      </div>

      {/* Smart Suggestion */}
      <SmartSuggestion />

      {/* Quick Actions */}
      {currentAgent && <QuickActions actions={currentAgent.quickActions} onAction={handleQuickAction} />}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
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
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-[10px] text-slate-500">{currentAgent?.name} esta pensando...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

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
