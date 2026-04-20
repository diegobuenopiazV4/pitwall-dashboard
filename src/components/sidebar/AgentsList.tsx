import React from 'react';
import { useAppStore } from '../../stores/app-store';

export const AgentsList: React.FC = () => {
  const { agents, currentAgent, selectAgent } = useAppStore();

  return (
    <div className="p-2 space-y-1">
      {agents.map((agent) => (
        <button
          key={agent.id}
          onClick={() => selectAgent(agent.id)}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all ${
            currentAgent?.id === agent.id
              ? 'bg-slate-800 ring-1 ring-slate-600'
              : 'hover:bg-slate-800/50'
          }`}
        >
          <span
            className="w-8 h-8 flex items-center justify-center rounded-lg text-sm shrink-0"
            style={{ backgroundColor: agent.color + '22', color: agent.color }}
          >
            {agent.icon}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-200 truncate">{agent.name}</span>
              <span className="text-[9px] px-1 py-0.5 bg-slate-700 text-slate-400 rounded shrink-0">
                {agent.id}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 truncate block">{agent.area}</span>
          </div>
        </button>
      ))}
    </div>
  );
};
