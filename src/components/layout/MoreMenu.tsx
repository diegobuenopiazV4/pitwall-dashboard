import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Building2, Zap, BarChart3, Plug, DollarSign, Download } from 'lucide-react';

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  onClick: () => void;
  color?: string;
  shortcut?: string;
}

interface Props {
  items: MenuItem[];
}

/**
 * Dropdown "Mais" para consolidar botoes menos usados do Header.
 * Mantem UI limpa enquanto preserva acesso a tudo.
 */
export const MoreMenu: React.FC<Props> = ({ items }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] rounded-md transition-colors ${
          open ? 'bg-slate-700 text-slate-200' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
        }`}
        title="Mais acoes"
      >
        <MoreHorizontal size={14} />
        <span className="hidden md:inline">Mais</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-[#1a1a24] border border-slate-700 rounded-lg shadow-2xl z-50 overflow-hidden">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={i}
                onClick={() => { item.onClick(); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 transition-colors text-left"
                style={{ color: item.color }}
              >
                <Icon size={13} />
                <span className="flex-1">{item.label}</span>
                {item.shortcut && (
                  <kbd className="text-[9px] px-1 py-0.5 bg-slate-800 rounded text-slate-500">{item.shortcut}</kbd>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export { Building2, Zap, BarChart3, Plug, DollarSign, Download };
