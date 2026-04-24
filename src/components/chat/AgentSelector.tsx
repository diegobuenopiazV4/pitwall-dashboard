import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import { useAppStore } from '../../stores/app-store';
import { AGENTS } from '../../lib/agents/agents-data';

/**
 * Dropdown para escolher agente no header do chat (substitui a tab "Agentes" da sidebar).
 * Agrupa por pilar V4 (Aquisicao/Engajamento/Monetizacao/Retencao/Todos).
 */
export const AgentSelector: React.FC = () => {
  const { currentAgent, selectAgent } = useAppStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const filtered = query
    ? AGENTS.filter((a) =>
        a.name.toLowerCase().includes(query.toLowerCase()) ||
        a.area.toLowerCase().includes(query.toLowerCase())
      )
    : AGENTS;

  // Agrupa por pilar para exibicao visual
  const byPilar: Record<string, typeof AGENTS> = {};
  for (const agent of filtered) {
    if (!byPilar[agent.pilar]) byPilar[agent.pilar] = [];
    byPilar[agent.pilar].push(agent);
  }

  const pilarOrder = ['Todos', 'Aquisicao', 'Engajamento', 'Monetizacao', 'Retencao'];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 transition-colors"
      >
        {currentAgent && (
          <span
            className="w-6 h-6 flex items-center justify-center rounded text-sm shrink-0"
            style={{ backgroundColor: currentAgent.color + '22', color: currentAgent.color }}
          >
            {currentAgent.icon}
          </span>
        )}
        <div className="text-left min-w-0">
          <p className="text-xs font-semibold text-slate-200 truncate max-w-[140px]">
            {currentAgent?.name || 'Selecione agente'}
          </p>
          <p className="text-[9px] text-slate-500 truncate max-w-[140px]">
            {currentAgent?.area || ''}
          </p>
        </div>
        <ChevronDown size={10} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-80 bg-[#1a1a24] border border-slate-700 rounded-lg shadow-2xl z-50 overflow-hidden">
          <div className="p-2 border-b border-slate-800">
            <div className="relative">
              <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar agente..."
                autoFocus
                className="w-full pl-7 pr-2 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#e4243d]/30"
              />
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {pilarOrder.map((pilar) => {
              const agents = byPilar[pilar];
              if (!agents || agents.length === 0) return null;
              return (
                <div key={pilar} className="py-1">
                  <div className="px-3 py-1 text-[9px] uppercase tracking-widest text-slate-600 font-semibold">
                    {pilar}
                  </div>
                  {agents.map((agent) => {
                    const active = currentAgent?.id === agent.id;
                    return (
                      <button
                        key={agent.id}
                        onClick={() => { selectAgent(agent.id); setOpen(false); setQuery(''); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-1.5 transition-colors text-left ${
                          active ? 'bg-[#e4243d]/10' : 'hover:bg-slate-800'
                        }`}
                      >
                        <span
                          className="w-7 h-7 flex items-center justify-center rounded text-sm shrink-0"
                          style={{ backgroundColor: agent.color + '22', color: agent.color }}
                        >
                          {agent.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className={`text-xs ${active ? 'text-slate-100 font-semibold' : 'text-slate-200 font-medium'}`}>
                              {agent.name}
                            </span>
                            <span className="text-[9px] text-slate-600">{agent.id}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate">{agent.area}</p>
                        </div>
                        {active && <Check size={12} className="text-[#e4243d] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-500">
                Nenhum agente encontrado
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
