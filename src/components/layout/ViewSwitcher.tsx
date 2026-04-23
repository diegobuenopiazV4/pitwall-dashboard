import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare, Kanban, BarChart3, FolderOpen,
  Sparkles, Zap, Newspaper, FileText, Rocket, Grid3x3,
  ChevronDown, Wand2,
} from 'lucide-react';
import { useAppStore, type ViewMode } from '../../stores/app-store';

const PRIMARY_VIEWS: { id: ViewMode; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'kanban', label: 'Kanban', icon: Kanban },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'documents', label: 'Documentos', icon: FolderOpen },
];

interface SkillView {
  id: ViewMode;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  color: string;
  description: string;
}

const SKILL_VIEWS: SkillView[] = [
  { id: 'skills', label: 'Catalogo', icon: Grid3x3, color: '#94a3b8', description: 'Ver todas as skills disponiveis' },
  { id: 'checkin', label: 'Check-in Mensal', icon: Sparkles, color: '#a855f7', description: 'Dashboard glassmorphism para clientes' },
  { id: 'trafego', label: 'Relatorio Trafego', icon: Zap, color: '#f59420', description: 'CSV Meta/Google \u2192 HTML interativo' },
  { id: 'clipping', label: 'Clipping Rapport', icon: Newspaper, color: '#3b82f6', description: 'Noticias + mensagens WhatsApp' },
  { id: 'criativos', label: 'Criativos DOCX', icon: FileText, color: '#10b981', description: 'Copies \u2192 .docx template V4' },
  { id: 'ekyte', label: 'Ekyte Tasks', icon: Rocket, color: '#e4243d', description: 'Bookmarklet para mkt.lab' },
];

export const ViewSwitcher: React.FC = () => {
  const { viewMode, setViewMode } = useAppStore();
  const [skillsOpen, setSkillsOpen] = useState(false);
  const skillsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (skillsRef.current && !skillsRef.current.contains(e.target as Node)) setSkillsOpen(false);
    };
    if (skillsOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [skillsOpen]);

  const activeSkill = SKILL_VIEWS.find((v) => v.id === viewMode);

  return (
    <div className="flex items-center gap-1 px-3 py-1.5 bg-[#0d0d14] border-b border-slate-800">
      {/* Views primarias - chat/kanban/analytics/documentos */}
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

      {/* Dropdown unico para Skills V4 */}
      <div className="relative" ref={skillsRef}>
        <button
          onClick={() => setSkillsOpen(!skillsOpen)}
          className={`flex items-center gap-1.5 px-3 py-1 text-[11px] rounded-md transition-all shrink-0 ${
            activeSkill
              ? 'bg-gradient-to-r from-[#e4243d]/20 to-[#e4243d]/5 text-slate-100 ring-1 ring-[#e4243d]/40'
              : 'text-slate-300 hover:bg-slate-800/50 hover:text-slate-100'
          }`}
        >
          <Wand2 size={12} className="text-[#e4243d]" />
          {activeSkill ? activeSkill.label : 'Skills V4'}
          <span className="text-[9px] px-1 py-0.5 bg-[#e4243d]/15 text-[#ff4d5a] rounded font-semibold">6</span>
          <ChevronDown size={10} className={`transition-transform ${skillsOpen ? 'rotate-180' : ''}`} />
        </button>

        {skillsOpen && (
          <div className="absolute left-0 top-full mt-1 w-72 bg-[#1a1a24] border border-slate-700 rounded-lg shadow-2xl z-50 overflow-hidden">
            <div className="px-3 py-2 border-b border-slate-800 bg-[#111118]">
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Skills V4 \u00b7 Geradores</p>
            </div>
            {SKILL_VIEWS.map((view) => {
              const Icon = view.icon;
              const active = viewMode === view.id;
              return (
                <button
                  key={view.id}
                  onClick={() => { setViewMode(view.id); setSkillsOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                    active ? 'bg-[#e4243d]/10' : 'hover:bg-slate-800'
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                    style={{ background: `${view.color}15`, color: view.color }}
                  >
                    <Icon size={13} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium ${active ? 'text-slate-100' : 'text-slate-200'}`}>
                      {view.label}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">{view.description}</p>
                  </div>
                  {active && <span className="w-1.5 h-1.5 bg-[#e4243d] rounded-full shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Breadcrumb do contexto atual - mostra o que esta selecionado */}
      {activeSkill && (
        <span className="ml-2 text-[10px] text-slate-600 italic hidden lg:inline">
          \u2022 {activeSkill.description}
        </span>
      )}
    </div>
  );
};
