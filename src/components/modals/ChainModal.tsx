import React, { useState } from 'react';
import { X, Zap, ArrowRight, Play, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../../stores/app-store';
import { AGENTS } from '../../lib/agents/agents-data';
import { suggestAgentChain } from '../../lib/agents/auto-router';
import { buildSystemPrompt } from '../../lib/agents/system-prompt-builder';
import { generateOfflineResponse } from '../../lib/agents/offline-responses';
import { sendChat } from '../../lib/ai/chat-provider';
import type { Agent, Message } from '../../lib/agents/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

type ChainStatus = 'pending' | 'running' | 'done' | 'error';

interface ChainStep {
  agent: Agent;
  status: ChainStatus;
  response?: string;
  error?: string;
}

export const ChainModal: React.FC<Props> = ({ open, onClose }) => {
  const { currentClient, userName, ppFlags, tasks, sprintWeek, sprintGoals, addMessage } = useAppStore();
  const [goal, setGoal] = useState('');
  const [chain, setChain] = useState<ChainStep[]>([]);
  const [running, setRunning] = useState(false);
  const [customAgentIds, setCustomAgentIds] = useState<string[]>([]);

  if (!open) return null;

  const handleSuggestChain = () => {
    if (!goal.trim()) {
      toast.error('Descreva o objetivo primeiro');
      return;
    }
    const suggested = suggestAgentChain(goal);
    setChain(suggested.map((agent) => ({ agent, status: 'pending' })));
    setCustomAgentIds(suggested.map((a) => a.id));
    toast.success(`${suggested.length} agentes sugeridos para o objetivo`);
  };

  const toggleAgent = (agentId: string) => {
    setCustomAgentIds((prev) => {
      if (prev.includes(agentId)) return prev.filter((id) => id !== agentId);
      return [...prev, agentId];
    });
    setChain(
      customAgentIds.includes(agentId)
        ? chain.filter((s) => s.agent.id !== agentId)
        : [...chain, { agent: AGENTS.find((a) => a.id === agentId)!, status: 'pending' }]
    );
  };

  const runChain = async () => {
    if (chain.length === 0) {
      toast.error('Nenhum agente na cadeia');
      return;
    }
    if (!goal.trim()) {
      toast.error('Descreva o objetivo');
      return;
    }

    setRunning(true);
    let previousOutput = '';

    for (let i = 0; i < chain.length; i++) {
      setChain((prev) => prev.map((s, idx) => (idx === i ? { ...s, status: 'running' } : s)));

      const step = chain[i];
      const prompt = i === 0
        ? goal
        : `${goal}\n\nContexto da analise anterior (${chain[i - 1].agent.name}):\n${previousOutput.slice(0, 2000)}\n\nSua tarefa e dar sequencia, focando na sua especialidade.`;

      try {
        const systemPrompt = buildSystemPrompt({
          agent: step.agent,
          client: currentClient,
          userName,
          ppFlags,
          tasks,
          sprintWeek,
          sprintGoals,
          recentMessages: [],
        });

        let response: string;
        const aiResult = await sendChat({
          systemPrompt,
          userPrompt: prompt,
          maxTokens: 8192,
          temperature: 0.8,
        });
        if (aiResult) {
          response = aiResult.text;
        } else {
          response = generateOfflineResponse(prompt, step.agent, currentClient);
        }

        previousOutput = response;

        // Save to main conversation
        const convKey = `${step.agent.id}_${currentClient?.id ?? 'general'}`;
        const userMsg: Message = {
          id: crypto.randomUUID(),
          conversationId: convKey,
          role: 'user',
          content: `[CHAIN] ${prompt.slice(0, 300)}${prompt.length > 300 ? '...' : ''}`,
          createdAt: new Date().toISOString(),
        };
        const botMsg: Message = {
          id: crypto.randomUUID(),
          conversationId: convKey,
          role: 'bot',
          content: response,
          agentId: step.agent.id,
          createdAt: new Date().toISOString(),
        };
        addMessage(convKey, userMsg);
        addMessage(convKey, botMsg);

        setChain((prev) =>
          prev.map((s, idx) => (idx === i ? { ...s, status: 'done', response } : s))
        );
      } catch (err) {
        setChain((prev) =>
          prev.map((s, idx) =>
            idx === i
              ? { ...s, status: 'error', error: err instanceof Error ? err.message : 'Erro' }
              : s
          )
        );
        toast.error(`Erro em ${step.agent.name}`);
        break;
      }
    }

    setRunning(false);
    toast.success('Cadeia executada! Veja as respostas nos chats.');
  };

  const handleReset = () => {
    setChain([]);
    setCustomAgentIds([]);
    setGoal('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-3xl max-h-[90vh] bg-[#1a1a24] border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-purple-400" />
            <h2 className="text-sm font-semibold text-slate-200">Multi-Agent Chain</h2>
            <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded">Beta</span>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Objetivo da Cadeia
            </label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              rows={3}
              placeholder="Ex: Lancar campanha completa de Black Friday para e-commerce - estrategia, criativos, copy, LP e trafego"
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 resize-none"
            />
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handleSuggestChain}
                disabled={!goal.trim() || running}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-500 disabled:opacity-40"
              >
                <Zap size={12} />
                Sugerir Cadeia
              </button>
              {chain.length > 0 && !running && (
                <button onClick={handleReset} className="text-[11px] text-slate-500 hover:text-slate-300">
                  Limpar
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Selecionar Agentes (clique para adicionar/remover)
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {AGENTS.map((a) => {
                const selected = customAgentIds.includes(a.id);
                return (
                  <button
                    key={a.id}
                    disabled={running}
                    onClick={() => toggleAgent(a.id)}
                    className={`flex items-center gap-1.5 px-2 py-1.5 text-[10px] rounded-md text-left transition-all ${
                      selected
                        ? 'bg-purple-500/20 ring-1 ring-purple-500/40 text-white'
                        : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span style={{ color: a.color }}>{a.icon}</span>
                    <span className="truncate">{a.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {chain.length > 0 && (
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Ordem de Execucao
              </label>
              <div className="space-y-1.5">
                {chain.map((step, i) => (
                  <div
                    key={`${step.agent.id}-${i}`}
                    className="flex items-center gap-2 p-2 bg-slate-900/50 border border-slate-800 rounded-lg"
                  >
                    <span className="w-6 h-6 flex items-center justify-center bg-slate-800 rounded-full text-[10px] font-bold text-slate-400 shrink-0">
                      {i + 1}
                    </span>
                    <span
                      className="w-6 h-6 flex items-center justify-center rounded-md text-sm shrink-0"
                      style={{ backgroundColor: step.agent.color + '22', color: step.agent.color }}
                    >
                      {step.agent.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-slate-200">{step.agent.name}</div>
                      <div className="text-[10px] text-slate-500">{step.agent.area}</div>
                    </div>
                    <div className="shrink-0">
                      {step.status === 'running' && <Loader2 size={14} className="animate-spin text-purple-400" />}
                      {step.status === 'done' && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">
                          OK
                        </span>
                      )}
                      {step.status === 'error' && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded">
                          Erro
                        </span>
                      )}
                      {step.status === 'pending' && (
                        <span className="text-[10px] text-slate-600">aguardando</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 px-4 py-3 border-t border-slate-700 bg-[#111118]">
          <button
            onClick={onClose}
            disabled={running}
            className="flex-1 px-3 py-2 text-xs text-slate-400 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-50"
          >
            Fechar
          </button>
          <button
            onClick={runChain}
            disabled={running || chain.length === 0 || !goal.trim()}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-white bg-purple-600 rounded-lg hover:bg-purple-500 disabled:opacity-50"
          >
            {running ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                Executando...
              </>
            ) : (
              <>
                <Play size={12} />
                Executar Cadeia ({chain.length} agente(s))
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
