import React, { useMemo } from 'react';
import { useAppStore } from '../../stores/app-store';
import { getCommandsForAgent, applyCommandPlaceholders } from '../../lib/prompts/quick-commands';

interface Props {
  actions: string[]; // Legacy: agent.quickActions (fallback se nao houver na lib nova)
  onAction: (action: string) => void;
}

export const QuickActions: React.FC<Props> = ({ actions, onAction }) => {
  const { currentAgent, currentClient } = useAppStore();

  const commands = useMemo(() => {
    if (!currentAgent) return [];
    const libCommands = getCommandsForAgent(currentAgent.id);
    return libCommands.length > 0
      ? libCommands
      : actions.map((a, i) => ({
          id: `legacy-${i}`,
          agentId: currentAgent.id,
          label: a,
          description: a,
          category: 'Rapido',
          prompt: a,
        }));
  }, [currentAgent, actions]);

  const handleClick = (command: typeof commands[0]) => {
    const filled = applyCommandPlaceholders(command, {
      cliente: currentClient?.name,
      segmento: currentClient?.segment,
      step: currentClient?.step,
      pilar: currentClient?.pilar,
    });
    onAction(filled);
  };

  return (
    <div className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto border-b border-slate-800/50 bg-[#0d0d14]">
      <span className="shrink-0 text-[9px] text-slate-600 uppercase tracking-wider mr-1">
        {commands.length} comandos
      </span>
      {commands.map((cmd) => (
        <button
          key={cmd.id}
          onClick={() => handleClick(cmd)}
          title={cmd.description}
          className="shrink-0 px-2.5 py-1 text-[10px] text-slate-400 bg-slate-800/50 rounded-full hover:bg-slate-700 hover:text-slate-200 transition-colors whitespace-nowrap"
        >
          {cmd.label}
        </button>
      ))}
    </div>
  );
};
