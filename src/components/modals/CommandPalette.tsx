import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Command, X, Sparkles, Users, Bot, CheckSquare, Zap,
  FileText, Download, Settings, Search, LogOut, BarChart3, Keyboard,
} from 'lucide-react';
import { useAppStore } from '../../stores/app-store';
import { AGENTS } from '../../lib/agents/agents-data';
import { PROMPT_TEMPLATES } from '../../lib/prompts/templates';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string) => void;
  onOpenLibrary: () => void;
  onOpenSettings: () => void;
  onOpenAnalytics: () => void;
}

interface PaletteItem {
  id: string;
  group: 'Navegacao' | 'Agente' | 'Cliente' | 'Comando' | 'Template';
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  shortcut?: string;
  action: () => void;
}

export const CommandPalette: React.FC<Props> = ({ open, onClose, onSelectPrompt, onOpenLibrary, onOpenSettings, onOpenAnalytics }) => {
  const { clients, setSidebarTab, selectAgent, selectClient, setSearchOpen, setOverviewOpen, logout } = useAppStore();
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIdx(0);
    }
  }, [open]);

  const items: PaletteItem[] = useMemo(() => {
    const list: PaletteItem[] = [
      // Navegacao
      { id: 'nav-agents', group: 'Navegacao', icon: <Bot size={13} />, label: 'Ir para Agentes', shortcut: 'Ctrl+1', action: () => { setSidebarTab('agents'); onClose(); } },
      { id: 'nav-clients', group: 'Navegacao', icon: <Users size={13} />, label: 'Ir para Clientes', action: () => { setSidebarTab('clients'); onClose(); } },
      { id: 'nav-tasks', group: 'Navegacao', icon: <CheckSquare size={13} />, label: 'Ir para Tarefas', action: () => { setSidebarTab('tasks'); onClose(); } },
      { id: 'nav-sprint', group: 'Navegacao', icon: <Zap size={13} />, label: 'Ir para Sprint', action: () => { setSidebarTab('sprint'); onClose(); } },

      // Comandos
      { id: 'cmd-library', group: 'Comando', icon: <Sparkles size={13} className="text-amber-400" />, label: 'Abrir Biblioteca de Prompts', shortcut: 'Ctrl+L', action: () => { onOpenLibrary(); onClose(); } },
      { id: 'cmd-search', group: 'Comando', icon: <Search size={13} />, label: 'Buscar rapido', shortcut: 'Ctrl+K', action: () => { setSearchOpen(true); onClose(); } },
      { id: 'cmd-overview', group: 'Comando', icon: <BarChart3 size={13} />, label: 'Overview de Clientes', shortcut: 'Ctrl+O', action: () => { setOverviewOpen(true); onClose(); } },
      { id: 'cmd-analytics', group: 'Comando', icon: <BarChart3 size={13} className="text-purple-400" />, label: 'Dashboard de Analytics', action: () => { onOpenAnalytics(); onClose(); } },
      { id: 'cmd-settings', group: 'Comando', icon: <Settings size={13} />, label: 'Abrir Configuracoes', action: () => { onOpenSettings(); onClose(); } },
      { id: 'cmd-logout', group: 'Comando', icon: <LogOut size={13} className="text-red-400" />, label: 'Sair da conta', action: () => { logout(); onClose(); } },

      // Agentes
      ...AGENTS.map((a) => ({
        id: `agent-${a.id}`,
        group: 'Agente' as const,
        icon: <span className="text-sm">{a.icon}</span>,
        label: `${a.id} - ${a.name}`,
        sublabel: a.area,
        action: () => { selectAgent(a.id); setSidebarTab('agents'); onClose(); },
      })),

      // Clientes
      ...clients.map((c) => ({
        id: `client-${c.id}`,
        group: 'Cliente' as const,
        icon: <span className={`w-2 h-2 rounded-full ${
          c.health === 'green' ? 'bg-emerald-500' :
          c.health === 'yellow' ? 'bg-amber-400' : 'bg-red-500'
        }`} />,
        label: c.name,
        sublabel: `${c.segment} - ${c.step}`,
        action: () => { selectClient(c); setSidebarTab('clients'); onClose(); },
      })),

      // Templates (top 20 mais relevantes)
      ...PROMPT_TEMPLATES.slice(0, 30).map((t) => {
        const agent = AGENTS.find((a) => a.id === t.agentId);
        return {
          id: `template-${t.id}`,
          group: 'Template' as const,
          icon: <span className="text-sm">{agent?.icon ?? '?'}</span>,
          label: t.title,
          sublabel: `${agent?.name} / ${t.category}`,
          action: () => { onSelectPrompt(t.prompt); onClose(); },
        };
      }),
    ];

    if (!query) return list.slice(0, 30);

    const q = query.toLowerCase();
    return list
      .filter((item) =>
        item.label.toLowerCase().includes(q) ||
        item.sublabel?.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [query, clients, selectAgent, selectClient, setSidebarTab, setSearchOpen, setOverviewOpen, logout, onClose, onOpenLibrary, onOpenSettings, onOpenAnalytics, onSelectPrompt]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(i + 1, items.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (items[selectedIdx]) items[selectedIdx].action();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, items, selectedIdx]);

  if (!open) return null;

  // Group items
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, PaletteItem[]>);

  const groupOrder: PaletteItem['group'][] = ['Comando', 'Navegacao', 'Agente', 'Cliente', 'Template'];

  let flatIdx = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-xl bg-[#1a1a24] border border-slate-700 rounded-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700">
          <Command size={16} className="text-slate-500" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Digite um comando, agente, cliente ou template..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
          />
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {groupOrder.map((group) => {
            if (!grouped[group] || grouped[group].length === 0) return null;
            return (
              <div key={group}>
                <div className="px-3 py-1 text-[9px] font-semibold text-slate-600 uppercase tracking-wider bg-[#15151e] sticky top-0">
                  {group}
                </div>
                {grouped[group].map((item) => {
                  const isSelected = flatIdx === selectedIdx;
                  const idx = flatIdx++;
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIdx(idx)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                        isSelected ? 'bg-slate-800' : 'hover:bg-slate-800/50'
                      }`}
                    >
                      <span className="w-5 h-5 flex items-center justify-center text-slate-400">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-200 truncate">{item.label}</div>
                        {item.sublabel && <div className="text-[10px] text-slate-500 truncate">{item.sublabel}</div>}
                      </div>
                      {item.shortcut && (
                        <kbd className="text-[9px] px-1.5 py-0.5 bg-slate-800 text-slate-500 rounded">{item.shortcut}</kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
          {items.length === 0 && (
            <div className="px-4 py-8 text-center text-xs text-slate-600">Nenhum resultado</div>
          )}
        </div>

        <div className="px-3 py-1.5 border-t border-slate-800 bg-[#111118] flex items-center justify-between text-[9px] text-slate-600">
          <div className="flex items-center gap-2">
            <kbd className="px-1 py-0.5 bg-slate-800 rounded">↑↓</kbd> navegar
            <kbd className="px-1 py-0.5 bg-slate-800 rounded">Enter</kbd> selecionar
            <kbd className="px-1 py-0.5 bg-slate-800 rounded">Esc</kbd> fechar
          </div>
          <div className="flex items-center gap-1">
            <Keyboard size={9} />
            Ctrl+Shift+P
          </div>
        </div>
      </div>
    </div>
  );
};
