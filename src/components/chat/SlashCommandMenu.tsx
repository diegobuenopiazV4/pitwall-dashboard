import React, { useMemo, useEffect, useRef, useState } from 'react';
import {
  CheckSquare, Sparkles, Zap, Newspaper, FileText, Rocket, Grid3x3,
  Plus, MessageSquare, Kanban, FolderOpen, Briefcase, Settings, Command, Bot,
} from 'lucide-react';
import { useAppStore } from '../../stores/app-store';
import {
  STATIC_COMMANDS, filterSlashCommands, generateDynamicCommands,
  type SlashCommand,
} from '../../lib/commands/slash-commands';
import { AGENTS } from '../../lib/agents/agents-data';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  CheckSquare, Sparkles, Zap, Newspaper, FileText, Rocket, Grid3x3,
  Plus, MessageSquare, Kanban, FolderOpen, Briefcase, Settings, Command, Bot,
};

interface Props {
  query: string;                  // Texto depois do "/"
  open: boolean;
  onSelect: (cmd: SlashCommand) => void;
  onClose: () => void;
  anchorBottom?: number;           // Distancia do bottom em px (para posicionar acima do input)
}

export const SlashCommandMenu: React.FC<Props> = ({ query, open, onSelect, onClose, anchorBottom = 80 }) => {
  const { clients } = useAppStore();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  // Monta lista completa (estaticos + dinamicos de agentes/clientes)
  const allCommands = useMemo(() => {
    const dynamic = generateDynamicCommands({
      agents: AGENTS.map((a) => ({ id: a.id, name: a.name, icon: a.icon, color: a.color, area: a.area })),
      clients: clients.map((c) => ({ id: c.id, name: c.name, segment: c.segment })),
    });
    return [...STATIC_COMMANDS, ...dynamic];
  }, [clients]);

  // Filtra baseado na query
  const filtered = useMemo(() => filterSlashCommands(allCommands, query), [allCommands, query]);
  const visible = filtered.slice(0, 10);

  // Reset selected ao mudar query
  useEffect(() => { setSelectedIndex(0); }, [query]);

  // Teclas: Up/Down/Enter/Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, visible.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)); }
      if (e.key === 'Enter' && visible[selectedIndex]) {
        e.preventDefault();
        onSelect(visible[selectedIndex]);
      }
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      if (e.key === 'Tab' && visible[selectedIndex]) {
        e.preventDefault();
        onSelect(visible[selectedIndex]);
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [open, visible, selectedIndex, onSelect, onClose]);

  // Scroll do item selecionado pra visibilidade
  useEffect(() => {
    const el = menuRef.current?.querySelector(`[data-idx="${selectedIndex}"]`);
    (el as HTMLElement)?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!open || visible.length === 0) return null;

  // Agrupamento por categoria para visual
  const grouped: Record<string, SlashCommand[]> = {};
  for (const cmd of visible) {
    if (!grouped[cmd.category]) grouped[cmd.category] = [];
    grouped[cmd.category].push(cmd);
  }

  // Ordem visual das categorias
  const CAT_ORDER: (SlashCommand['category'])[] = ['Skill', 'Navegacao', 'Sistema', 'Agente', 'Cliente'];

  // Monta flat list de indices para navegacao por tecla consistente com agrupamento
  let flatIdx = 0;

  return (
    <div
      ref={menuRef}
      className="absolute left-4 right-4 max-w-2xl mx-auto bg-[#1a1a24] border border-[#e4243d]/30 rounded-xl shadow-2xl z-50 overflow-hidden"
      style={{ bottom: anchorBottom }}
    >
      <div className="px-3 py-2 border-b border-slate-800 bg-[#111118] flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
          Slash Commands {query && `- filtrando: "${query}"`}
        </span>
        <span className="text-[9px] text-slate-600">
          <kbd className="px-1 py-0.5 bg-slate-800 rounded">↑↓</kbd> navegar{' '}
          <kbd className="px-1 py-0.5 bg-slate-800 rounded">Enter</kbd> usar{' '}
          <kbd className="px-1 py-0.5 bg-slate-800 rounded">Esc</kbd> fechar
        </span>
      </div>

      <div className="max-h-[320px] overflow-y-auto">
        {CAT_ORDER.map((cat) => {
          const cmds = grouped[cat];
          if (!cmds) return null;
          return (
            <div key={cat} className="py-1">
              <div className="px-3 py-1 text-[9px] uppercase tracking-widest text-slate-600 font-semibold">
                {cat}
              </div>
              {cmds.map((cmd) => {
                const Icon = ICON_MAP[cmd.icon] || Sparkles;
                const idx = flatIdx++;
                const active = idx === selectedIndex;
                return (
                  <button
                    key={cmd.id}
                    data-idx={idx}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={() => onSelect(cmd)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                      active ? 'bg-[#e4243d]/15' : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                      style={{ background: `${cmd.color}15`, color: cmd.color }}
                    >
                      <Icon size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-medium ${active ? 'text-slate-100' : 'text-slate-200'}`}>
                          /{cmd.keyword}
                        </span>
                        <span className="text-xs text-slate-400 truncate">{cmd.label}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{cmd.description}</p>
                    </div>
                    {cmd.shortcut && (
                      <kbd className="text-[9px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-500 shrink-0">
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
