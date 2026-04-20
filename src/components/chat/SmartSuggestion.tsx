import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAppStore } from '../../stores/app-store';
import { suggestNextAgent } from '../../lib/agents/auto-router';

export const SmartSuggestion: React.FC = () => {
  const { currentAgent, messages, getConvKey, selectAgent } = useAppStore();

  if (!currentAgent) return null;

  const convKey = getConvKey();
  const currentMessages = messages[convKey] ?? [];
  const lastBotMessage = [...currentMessages].reverse().find((m) => m.role === 'bot');

  if (!lastBotMessage) return null;

  const suggested = suggestNextAgent(currentAgent.id, lastBotMessage.content);
  if (!suggested || suggested.id === currentAgent.id) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-500/5 border-b border-amber-500/10">
      <Sparkles size={11} className="text-amber-400 shrink-0" />
      <span className="text-[10px] text-amber-400/80">
        Proximo agente recomendado baseado na resposta:
      </span>
      <button
        onClick={() => selectAgent(suggested.id)}
        className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full hover:bg-amber-500/30 transition-colors text-[10px] font-medium"
      >
        <span style={{ color: suggested.color }}>{suggested.icon}</span>
        {suggested.name}
        <ArrowRight size={10} />
      </button>
    </div>
  );
};
