import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, MessageSquare, Bot, FileText } from 'lucide-react';
import { useAppStore } from '../../stores/app-store';
import { AGENTS } from '../../lib/agents/agents-data';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<Props> = ({ open, onClose }) => {
  const { messages, clients, selectAgent, selectClient, setSidebarTab, setViewMode } = useAppStore();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (open) setQuery('');
  }, [open]);

  const results = useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();

    const all: {
      id: string;
      agentId: string;
      clientId: string;
      role: 'user' | 'bot';
      content: string;
      createdAt: string;
      snippet: string;
      score: number;
    }[] = [];

    Object.entries(messages).forEach(([key, msgs]) => {
      const [agentId, clientId] = key.split('_');
      msgs.forEach((m) => {
        const content = m.content.toLowerCase();
        if (content.includes(q)) {
          // Extract snippet around match
          const idx = content.indexOf(q);
          const start = Math.max(0, idx - 50);
          const end = Math.min(m.content.length, idx + 150);
          const snippet = (start > 0 ? '...' : '') + m.content.slice(start, end) + (end < m.content.length ? '...' : '');

          // Score: bot mais alto, match prefix alto, multiplas ocorrencias
          const occurrences = (content.match(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) ?? []).length;
          const score = (m.role === 'bot' ? 2 : 1) * occurrences + (idx === 0 ? 3 : 0);

          all.push({
            id: m.id,
            agentId: m.agentId ?? agentId,
            clientId,
            role: m.role,
            content: m.content,
            createdAt: m.createdAt,
            snippet,
            score,
          });
        }
      });
    });

    return all.sort((a, b) => b.score - a.score).slice(0, 30);
  }, [messages, query]);

  const highlightMatch = (text: string, q: string) => {
    if (!q) return text;
    const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === q.toLowerCase() ? (
        <mark key={i} className="bg-amber-500/40 text-amber-200 px-0.5 rounded">{part}</mark>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      )
    );
  };

  const handleClick = (result: typeof results[0]) => {
    selectAgent(result.agentId);
    const client = clients.find((c) => c.id === result.clientId);
    if (client) selectClient(client);
    setSidebarTab('agents');
    setViewMode('chat');
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-2xl bg-[#1a1a24] border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700">
          <Search size={16} className="text-amber-400" />
          <input
            type="text"
            autoFocus
            placeholder="Buscar em todas as mensagens..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
          />
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {query.length < 2 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              <Search size={32} className="mx-auto text-slate-700 mb-2" />
              <p>Digite ao menos 2 caracteres para buscar</p>
              <p className="text-[10px] text-slate-600 mt-1">Procura em todo historico de conversas, por agente e cliente</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Nenhum resultado para "{query}"
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {results.map((result) => {
                const agent = AGENTS.find((a) => a.id === result.agentId);
                const client = clients.find((c) => c.id === result.clientId);

                return (
                  <button
                    key={result.id}
                    onClick={() => handleClick(result)}
                    className="w-full text-left p-3 hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className="w-6 h-6 flex items-center justify-center rounded text-xs shrink-0"
                        style={{ backgroundColor: (agent?.color ?? '#888') + '22', color: agent?.color ?? '#888' }}
                      >
                        {agent?.icon ?? '?'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1 text-[10px]">
                          <span className="text-slate-300 font-semibold">{agent?.name ?? 'Agente'}</span>
                          {client && <span className="text-slate-500">· {client.name}</span>}
                          <span className={`px-1 py-0.5 rounded text-[9px] ${
                            result.role === 'bot' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                          }`}>
                            {result.role === 'bot' ? agent?.name ?? 'bot' : 'voce'}
                          </span>
                          <span className="text-slate-600 ml-auto">
                            {new Date(result.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {highlightMatch(result.snippet, query)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-3 py-2 border-t border-slate-800 bg-[#111118] flex items-center justify-between text-[9px] text-slate-600">
          <span>{results.length} resultado(s)</span>
          <div className="flex items-center gap-2">
            <kbd className="px-1 py-0.5 bg-slate-800 rounded">Esc</kbd> fechar
            <kbd className="px-1 py-0.5 bg-slate-800 rounded">Ctrl+Shift+F</kbd>
          </div>
        </div>
      </div>
    </div>
  );
};
