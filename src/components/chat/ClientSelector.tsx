import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, Plus, UserRound } from 'lucide-react';
import { useAppStore } from '../../stores/app-store';

const HEALTH_DOT = { green: 'bg-emerald-500', yellow: 'bg-amber-400', red: 'bg-red-500' };

export const ClientSelector: React.FC = () => {
  const { currentClient, clients, selectClient } = useAppStore();
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
    ? clients.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        (c.segment || '').toLowerCase().includes(query.toLowerCase())
      )
    : clients;

  const brandColor = (currentClient as any)?.brandColor;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 transition-colors"
      >
        {currentClient ? (
          <>
            <span
              className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white shrink-0 overflow-hidden"
              style={{ background: brandColor || '#334155' }}
            >
              {(currentClient as any).logoUrl ? (
                <img src={(currentClient as any).logoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                currentClient.name.charAt(0)
              )}
            </span>
            <div className="text-left min-w-0">
              <div className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${HEALTH_DOT[currentClient.health]}`} />
                <p className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                  {currentClient.name}
                </p>
              </div>
              <p className="text-[9px] text-slate-500 truncate max-w-[120px]">
                {currentClient.segment || currentClient.step}
              </p>
            </div>
          </>
        ) : (
          <>
            <UserRound size={14} className="text-slate-500" />
            <span className="text-xs text-slate-400">Sem cliente</span>
          </>
        )}
        <ChevronDown size={10} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-72 bg-[#1a1a24] border border-slate-700 rounded-lg shadow-2xl z-50 overflow-hidden">
          <div className="p-2 border-b border-slate-800">
            <div className="relative">
              <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar cliente..."
                autoFocus
                className="w-full pl-7 pr-2 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#e4243d]/30"
              />
            </div>
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            {/* Opcao sem cliente */}
            <button
              onClick={() => { selectClient(null); setOpen(false); setQuery(''); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 transition-colors text-left ${
                !currentClient ? 'bg-[#e4243d]/10' : 'hover:bg-slate-800'
              }`}
            >
              <UserRound size={14} className="text-slate-500 shrink-0" />
              <span className="text-xs text-slate-300 flex-1">Sem cliente (geral)</span>
              {!currentClient && <Check size={12} className="text-[#e4243d]" />}
            </button>

            <div className="h-px bg-slate-800 my-1" />

            {filtered.map((client) => {
              const active = currentClient?.id === client.id;
              const color = (client as any).brandColor || '#334155';
              return (
                <button
                  key={client.id}
                  onClick={() => { selectClient(client); setOpen(false); setQuery(''); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 transition-colors text-left ${
                    active ? 'bg-[#e4243d]/10' : 'hover:bg-slate-800'
                  }`}
                >
                  <span
                    className="w-7 h-7 rounded flex items-center justify-center text-[11px] font-bold text-white shrink-0 overflow-hidden"
                    style={{ background: color }}
                  >
                    {(client as any).logoUrl ? (
                      <img src={(client as any).logoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      client.name.charAt(0)
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${HEALTH_DOT[client.health]}`} />
                      <span className={`text-xs ${active ? 'text-slate-100 font-semibold' : 'text-slate-200'}`}>
                        {client.name}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">
                      {client.segment} · {client.step}
                    </p>
                  </div>
                  {active && <Check size={12} className="text-[#e4243d] shrink-0" />}
                </button>
              );
            })}

            {filtered.length === 0 && query && (
              <div className="p-6 text-center text-xs text-slate-500">
                Nenhum cliente encontrado
              </div>
            )}

            {clients.length === 0 && !query && (
              <div className="p-6 text-center">
                <p className="text-xs text-slate-400 mb-2">Nenhum cliente cadastrado</p>
                <button
                  onClick={() => { window.dispatchEvent(new CustomEvent('pitwall:open-clients-modal')); setOpen(false); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#e4243d] hover:bg-[#ff4d5a] text-white text-xs rounded-lg"
                >
                  <Plus size={11} />
                  Adicionar cliente
                </button>
              </div>
            )}
          </div>

          {clients.length > 0 && (
            <div className="p-2 border-t border-slate-800">
              <button
                onClick={() => { window.dispatchEvent(new CustomEvent('pitwall:open-clients-modal')); setOpen(false); }}
                className="w-full flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded transition-colors"
              >
                <Plus size={10} />
                Gerenciar clientes
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
