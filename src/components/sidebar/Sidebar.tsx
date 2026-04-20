import React from 'react';
import { Users, Bot, CheckSquare, Zap } from 'lucide-react';
import { useAppStore } from '../../stores/app-store';
import { AgentsList } from './AgentsList';
import { ClientsList } from './ClientsList';
import { TasksList } from './TasksList';
import { SprintPanel } from './SprintPanel';

const TABS = [
  { id: 'agents' as const, label: 'Agentes', icon: Bot },
  { id: 'clients' as const, label: 'Clientes', icon: Users },
  { id: 'tasks' as const, label: 'Tarefas', icon: CheckSquare },
  { id: 'sprint' as const, label: 'Sprint', icon: Zap },
];

export const Sidebar: React.FC = () => {
  const { sidebarTab, setSidebarTab } = useAppStore();

  return (
    <aside className="w-[280px] min-w-[280px] flex flex-col bg-[#111118] border-r border-slate-800 overflow-hidden">
      <div className="flex border-b border-slate-800">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSidebarTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
              sidebarTab === tab.id
                ? 'text-white bg-slate-800/50 border-b-2 border-red-500'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <tab.icon size={13} />
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {sidebarTab === 'agents' && <AgentsList />}
        {sidebarTab === 'clients' && <ClientsList />}
        {sidebarTab === 'tasks' && <TasksList />}
        {sidebarTab === 'sprint' && <SprintPanel />}
      </div>
    </aside>
  );
};
