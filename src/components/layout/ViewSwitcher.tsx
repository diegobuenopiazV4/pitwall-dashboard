import React from 'react';
import { MessageSquare, Kanban, BarChart3, FolderOpen, Sparkles, Zap, Newspaper, FileText, Rocket } from 'lucide-react';
import { useAppStore, type ViewMode } from '../../stores/app-store';

const PRIMARY_VIEWS: { id: ViewMode; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'kanban', label: 'Kanban', icon: Kanban },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'documents', label: 'Documentos', icon: FolderOpen },
];

const SKILL_VIEWS: { id: ViewMode; label: string; icon: React.ComponentType<{ size?: number }>; color: string }[] = [
  { id: 'checkin', label: 'Check-in', icon: Sparkles, color: 'text-purple-400' },
  { id: 'trafego', label: 'Trafego Pago', icon: Zap, color: 'text-amber-400' },
  { id: 'clipping', label: 'Clipping', icon: Newspaper, color: 'text-blue-400' },
  { id: 'criativos', label: 'Criativos DOCX', icon: FileText, color: 'text-emerald-400' },
  { id: 'ekyte', label: 'Ekyte Tasks', icon: Rocket, color: 'text-[#e4243d]' },
];

export const ViewSwitcher: React.FC = () => {
  const { viewMode, setViewMode } = useAppStore();

  return (
    <div className="flex items-center gap-1 px-3 py-1.5 bg-[#0d0d14] border-b border-slate-800 overflow-x-auto">
      {PRIMARY_VIEWS.map((view) => {
        const Icon = view.icon;
        const active = viewMode === view.id;
        return (
          <button
            key={view.id}
            onClick={() => setViewMode(view.id)}
            className={`flex items-center gap-1.5 px-3 py-1 text-[11px] rounded-md transition-all shrink-0 ${
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

      <div className="w-px h-5 bg-slate-800 mx-1 shrink-0" />

      <span className="text-[9px] text-slate-600 uppercase tracking-widest font-semibold mr-1 shrink-0">Skills V4</span>

      {SKILL_VIEWS.map((view) => {
        const Icon = view.icon;
        const active = viewMode === view.id;
        return (
          <button
            key={view.id}
            onClick={() => setViewMode(view.id)}
            className={`flex items-center gap-1.5 px-3 py-1 text-[11px] rounded-md transition-all shrink-0 ${
              active
                ? 'bg-gradient-to-r from-[#e4243d]/20 to-[#e4243d]/5 text-slate-100 ring-1 ring-[#e4243d]/40'
                : `${view.color} hover:bg-slate-800/50 opacity-75 hover:opacity-100`
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
