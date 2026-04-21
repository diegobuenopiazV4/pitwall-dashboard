import React, { useMemo, useState } from 'react';
import { Sparkles, ChevronDown } from 'lucide-react';
import { useAppStore } from '../../stores/app-store';
import { getCommandsForAgent as getNewCommands, applyCommandPlaceholders } from '../../lib/prompts/command-generator';

interface Props {
  actions: string[];
  onAction: (action: string, preferredModelId?: string) => void;
}

/**
 * QuickActions agora usa o gerador de 1600 comandos.
 * Mostra top 12 por default + dropdown com todos agrupados por categoria.
 */
export const QuickActions: React.FC<Props> = ({ actions, onAction }) => {
  const { currentAgent, currentClient, setLibraryOpen } = useAppStore();
  const [showAll, setShowAll] = useState(false);

  const commands = useMemo(() => {
    if (!currentAgent) return [];
    return getNewCommands(currentAgent.id);
  }, [currentAgent]);

  // Top 12 = primeiros comandos de cada categoria (mais variedade)
  const topCommands = useMemo(() => {
    const byCategory: Record<string, typeof commands> = {};
    for (const cmd of commands) {
      if (!byCategory[cmd.category]) byCategory[cmd.category] = [];
      byCategory[cmd.category].push(cmd);
    }
    // Pega 1 de cada categoria ate 12
    const top: typeof commands = [];
    for (const cat of Object.keys(byCategory)) {
      if (top.length >= 12) break;
      top.push(byCategory[cat][0]);
    }
    return top;
  }, [commands]);

  const handleClick = (command: typeof commands[0]) => {
    const filled = applyCommandPlaceholders(command, {
      cliente: currentClient?.name,
      segmento: currentClient?.segment,
      step: currentClient?.step,
      pilar: currentClient?.pilar,
    });
    onAction(filled, command.preferredModelId);
  };

  if (commands.length === 0 && actions.length > 0) {
    // Fallback legacy
    return (
      <div className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto border-b border-slate-800/50 bg-[#0d0d14]">
        {actions.map((action) => (
          <button
            key={action}
            onClick={() => onAction(action)}
            className="shrink-0 px-2.5 py-1 text-[10px] text-slate-400 bg-slate-800/50 rounded-full hover:bg-slate-700 hover:text-slate-200 transition-colors whitespace-nowrap"
          >
            {action}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto border-b border-slate-800/50 bg-[#0d0d14]">
      <span className="shrink-0 text-[9px] text-slate-600 uppercase tracking-wider mr-1">
        {commands.length} cmds
      </span>
      {topCommands.map((cmd) => (
        <button
          key={cmd.id}
          onClick={() => handleClick(cmd)}
          title={`${cmd.description}\nModelo: ${cmd.preferredModelId}\nMentores: ${cmd.mentors.join(', ')}`}
          className="shrink-0 px-2.5 py-1 text-[10px] text-slate-400 bg-slate-800/50 rounded-full hover:bg-slate-700 hover:text-slate-200 transition-colors whitespace-nowrap"
        >
          {cmd.category}
        </button>
      ))}
      <button
        onClick={() => setLibraryOpen(true)}
        className="shrink-0 flex items-center gap-1 px-2.5 py-1 text-[10px] text-amber-400 bg-amber-500/10 rounded-full hover:bg-amber-500/20 transition-colors whitespace-nowrap"
        title="Ver todos os comandos na biblioteca"
      >
        <Sparkles size={10} />
        Ver todos ({commands.length})
      </button>
    </div>
  );
};
