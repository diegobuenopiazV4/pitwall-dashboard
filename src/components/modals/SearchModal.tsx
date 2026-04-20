import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useAppStore } from '../../stores/app-store';

interface SearchResult {
  type: 'Agente' | 'Cliente' | 'Comando';
  label: string;
  sublabel?: string;
  action: () => void;
}

export const SearchModal: React.FC = () => {
  const { agents, clients, setSearchOpen, selectAgent, selectClient, setSidebarTab } = useAppStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results: SearchResult[] = [];

  if (query) {
    const q = query.toLowerCase();

    agents.forEach((a) => {
      if ((a.name + a.area + a.id).toLowerCase().includes(q)) {
        results.push({
          type: 'Agente',
          label: `${a.icon} ${a.name}`,
          sublabel: a.area,
          action: () => { selectAgent(a.id); setSidebarTab('agents'); setSearchOpen(false); },
        });
      }
    });

    clients.forEach((c) => {
      if (c.name.toLowerCase().includes(q)) {
        results.push({
          type: 'Cliente',
          label: c.name,
          sublabel: c.segment,
          action: () => { selectClient(c); setSidebarTab('clients'); setSearchOpen(false); },
        });
      }
    });

    const cmds = ['diagnostico', 'sprint', 'relatorio', 'artigo', 'email', 'campanha', 'social', 'roteiro', 'seo', 'crm', 'automacao', 'dashboard'];
    cmds.forEach((cmd) => {
      if (cmd.includes(q)) {
        results.push({
          type: 'Comando',
          label: cmd,
          action: () => { setSearchOpen(false); },
        });
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
      <div className="w-full max-w-md bg-[#1a1a24] border border-slate-700 rounded-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700">
          <Search size={16} className="text-slate-500" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar agentes, clientes, comandos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
          />
          <button onClick={() => setSearchOpen(false)} className="text-slate-500 hover:text-slate-300">
            <X size={16} />
          </button>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {results.length > 0 ? (
            results.slice(0, 10).map((r, i) => (
              <button
                key={i}
                onClick={r.action}
                className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-slate-800 transition-colors"
              >
                <div>
                  <span className="text-xs text-slate-200">{r.label}</span>
                  {r.sublabel && <span className="text-[10px] text-slate-500 block">{r.sublabel}</span>}
                </div>
                <span className="text-[9px] px-1.5 py-0.5 bg-slate-700 text-slate-400 rounded">{r.type}</span>
              </button>
            ))
          ) : query ? (
            <div className="px-4 py-6 text-center text-xs text-slate-600">Nenhum resultado</div>
          ) : (
            <div className="px-4 py-6 text-center text-xs text-slate-600">Digite para buscar...</div>
          )}
        </div>
      </div>
    </div>
  );
};
