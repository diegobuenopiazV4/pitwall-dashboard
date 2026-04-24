import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Zap, Users } from 'lucide-react';
import { TasksList } from '../sidebar/TasksList';
import { SprintPanel } from '../sidebar/SprintPanel';
import { ClientsList } from '../sidebar/ClientsList';

type ToolTab = 'tasks' | 'sprint' | 'clients';

export const ToolsModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<ToolTab>('tasks');

  useEffect(() => {
    const handleTasks = () => { setTab('tasks'); setOpen(true); };
    const handleSprint = () => { setTab('sprint'); setOpen(true); };
    const handleClients = () => { setTab('clients'); setOpen(true); };
    window.addEventListener('pitwall:open-tasks-modal', handleTasks);
    window.addEventListener('pitwall:open-sprint-modal', handleSprint);
    window.addEventListener('pitwall:open-clients-modal', handleClients);
    return () => {
      window.removeEventListener('pitwall:open-tasks-modal', handleTasks);
      window.removeEventListener('pitwall:open-sprint-modal', handleSprint);
      window.removeEventListener('pitwall:open-clients-modal', handleClients);
    };
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div
        className="w-full max-w-3xl h-[80vh] bg-[#1a1a24] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-1">
            <TabBtn active={tab === 'clients'} onClick={() => setTab('clients')} icon={Users} label="Clientes" />
            <TabBtn active={tab === 'tasks'} onClick={() => setTab('tasks')} icon={CheckSquare} label="Tarefas" />
            <TabBtn active={tab === 'sprint'} onClick={() => setTab('sprint')} icon={Zap} label="Sprint" />
          </div>
          <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300 p-1">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          {tab === 'clients' && <ClientsList />}
          {tab === 'tasks' && <TasksList />}
          {tab === 'sprint' && <SprintPanel />}
        </div>
      </div>
    </div>
  );
};

const TabBtn: React.FC<{ active: boolean; onClick: () => void; icon: React.ComponentType<{ size?: number }>; label: string }> = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors ${
      active ? 'bg-[#e4243d]/10 text-slate-100 ring-1 ring-[#e4243d]/30' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'
    }`}
  >
    <Icon size={12} />
    {label}
  </button>
);
