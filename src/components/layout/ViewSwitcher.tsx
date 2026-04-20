import React from 'react';
import { MessageSquare, Kanban, BarChart3, FolderOpen } from 'lucide-react';
import { useAppStore, type ViewMode } from '../../stores/app-store';

const VIEWS: { id: ViewMode; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'kanban', label: 'Kanban', icon: Kanban },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'documents', label: 'Documentos', icon: FolderOpen },
];

export const ViewSwitcher: React.FC = () => {
  const { viewMode, setViewMode } = useAppStore();

  return (
    <div className="flex items-center gap-0.5 px-3 py-1.5 bg-[#0d0d14] border-b border-slate-800">
      {VIEWS.map((view) => {
        const Icon = view.icon;
        const active = viewMode === view.id;
        return (
          <button
            key={view.id}
            onClick={() => setViewMode(view.id)}
            className={`flex items-center gap-1.5 px-3 py-1 text-[11px] rounded-md transition-all ${
              active
                ? 'bg-slate-800 text-slate-200 ring-1 ring-slate-700'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            <Icon size={12} />
            {view.label}
          </button>
        );
      })}
    </div>
  );
};
