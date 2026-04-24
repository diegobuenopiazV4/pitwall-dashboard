import React, { useState, useMemo } from 'react';
import {
  MessageSquare, Plus, Star, Archive, Trash2, Edit2,
  Search, ChevronDown, ChevronRight, Users, Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../../stores/app-store';
import { groupThreadsByClient, searchThreads } from '../../lib/conversations/threads';
import { AGENTS } from '../../lib/agents/agents-data';

export const ConversationsList: React.FC = () => {
  const {
    threads, currentThreadId, clients,
    createNewThread, selectThread, renameThread, deleteThread,
    toggleThreadStar, toggleThreadArchive, setSidebarTab,
  } = useAppStore();

  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  // Mapa rapido clientId -> clientName
  const clientNamesMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of clients) map[c.id] = c.name;
    return map;
  }, [clients]);

  // Filtro + grupo
  const filtered = useMemo(() => {
    const source = showArchived ? threads : threads.filter((t) => !t.archived);
    return searchThreads(source, query);
  }, [threads, query, showArchived]);

  const groups = useMemo(() => groupThreadsByClient(filtered, clientNamesMap), [filtered, clientNamesMap]);

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Inicio: todos os grupos expandidos por default
  useMemo(() => {
    if (Object.keys(expandedGroups).length === 0) {
      const initial: Record<string, boolean> = {};
      for (const g of groups) initial[g.clientId ?? '__general__'] = true;
      setExpandedGroups(initial);
    }
  }, [groups.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNewThread = () => {
    const thread = createNewThread();
    toast.success('Nova conversa criada');
    return thread;
  };

  const handleRename = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditingTitle(currentTitle);
  };

  const commitRename = () => {
    if (editingId && editingTitle.trim()) {
      renameThread(editingId, editingTitle.trim());
    }
    setEditingId(null);
    setEditingTitle('');
  };

  const handleDelete = (id: string) => {
    deleteThread(id);
    toast.success('Conversa removida');
    setConfirmDelete(null);
  };

  const agentIcon = (agentId: string) => {
    const agent = AGENTS.find((a) => a.id === agentId);
    return agent ? { icon: agent.icon, color: agent.color, name: agent.name } : null;
  };

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    const diffMs = Date.now() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    if (diffHours < 1) return 'agora';
    if (diffHours < 24) return `${Math.floor(diffHours)}h`;
    if (diffHours < 24 * 7) return `${Math.floor(diffHours / 24)}d`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header com busca e nova conversa */}
      <div className="p-2 border-b border-slate-800">
        <button
          onClick={handleNewThread}
          className="w-full flex items-center justify-center gap-1.5 py-2 mb-2 bg-gradient-to-r from-[#e4243d] to-[#ff4d5a] hover:opacity-90 text-white text-xs font-semibold rounded-lg shadow"
        >
          <Plus size={12} />
          Nova conversa
        </button>

        <div className="relative">
          <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar conversa..."
            className="w-full pl-7 pr-2 py-1.5 text-[11px] bg-slate-900 border border-slate-800 rounded-md text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#e4243d]/30"
          />
        </div>

        <label className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-500 cursor-pointer">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="w-3 h-3 rounded bg-slate-800 border-slate-600 text-[#e4243d]"
          />
          Mostrar arquivadas
        </label>
      </div>

      {/* Lista agrupada */}
      <div className="flex-1 min-h-0 overflow-y-auto p-1">
        {groups.length === 0 && (
          <div className="p-4 text-center">
            <MessageSquare size={24} className="mx-auto text-slate-600 mb-2" />
            <p className="text-[11px] text-slate-500">Nenhuma conversa ainda</p>
            <p className="text-[10px] text-slate-600 mt-1">Clique em "Nova conversa" para comecar</p>
          </div>
        )}

        {groups.map((group) => {
          const groupKey = group.clientId ?? '__general__';
          const isExpanded = expandedGroups[groupKey] ?? true;
          const client = group.clientId ? clients.find((c) => c.id === group.clientId) : null;
          const brandColor = (client as any)?.brandColor || '#64748b';

          return (
            <div key={groupKey} className="mb-2">
              {/* Header do grupo (cliente) */}
              <button
                onClick={() => toggleGroup(groupKey)}
                className="w-full flex items-center gap-1.5 px-2 py-1 text-[10px] uppercase tracking-wider text-slate-500 hover:text-slate-300"
              >
                {isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                <div
                  className="w-3 h-3 rounded-sm shrink-0"
                  style={{ background: brandColor }}
                />
                <span className="flex-1 text-left truncate font-semibold">{group.clientName}</span>
                <span className="text-[9px] text-slate-600">{group.threads.length}</span>
              </button>

              {/* Lista de threads do grupo */}
              {isExpanded && (
                <div className="space-y-0.5 mt-1">
                  {group.threads.map((thread) => {
                    const agent = agentIcon(thread.primaryAgentId);
                    const isActive = currentThreadId === thread.id;
                    const isEditing = editingId === thread.id;
                    const isConfirmDelete = confirmDelete === thread.id;

                    return (
                      <div
                        key={thread.id}
                        className={`group relative flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                          isActive
                            ? 'bg-[#e4243d]/10 ring-1 ring-[#e4243d]/30'
                            : 'hover:bg-slate-800/50'
                        }`}
                        onClick={() => !isEditing && selectThread(thread.id)}
                      >
                        {/* Agent icon */}
                        {agent && (
                          <span
                            className="w-5 h-5 flex items-center justify-center rounded text-[10px] shrink-0"
                            style={{ backgroundColor: agent.color + '22', color: agent.color }}
                            title={agent.name}
                          >
                            {agent.icon}
                          </span>
                        )}

                        {/* Title ou input de editar */}
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onBlur={commitRename}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitRename();
                              if (e.key === 'Escape') { setEditingId(null); setEditingTitle(''); }
                            }}
                            autoFocus
                            className="flex-1 text-[11px] bg-slate-950 border border-[#e4243d]/30 rounded px-1.5 py-0.5 text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#e4243d]/60"
                          />
                        ) : (
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              {thread.starred && <Star size={9} className="text-amber-400 fill-amber-400 shrink-0" />}
                              <p className={`text-[11px] truncate ${isActive ? 'text-slate-100 font-medium' : 'text-slate-300'}`}>
                                {thread.title}
                              </p>
                            </div>
                            {thread.lastMessagePreview && (
                              <p className="text-[9px] text-slate-600 truncate">
                                {thread.lastMessageRole === 'user' ? 'Voce' : agent?.name || 'Bot'}: {thread.lastMessagePreview}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Timestamp */}
                        {!isEditing && !isConfirmDelete && (
                          <span className="text-[9px] text-slate-600 shrink-0 mr-1">
                            {formatDate(thread.updatedAt)}
                          </span>
                        )}

                        {/* Acoes hover */}
                        {!isEditing && !isConfirmDelete && (
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleThreadStar(thread.id); }}
                              className="p-0.5 text-slate-500 hover:text-amber-400"
                              title="Favoritar"
                            >
                              <Star size={10} className={thread.starred ? 'fill-amber-400 text-amber-400' : ''} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleRename(thread.id, thread.title); }}
                              className="p-0.5 text-slate-500 hover:text-blue-400"
                              title="Renomear"
                            >
                              <Edit2 size={10} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleThreadArchive(thread.id); }}
                              className="p-0.5 text-slate-500 hover:text-slate-300"
                              title={thread.archived ? 'Desarquivar' : 'Arquivar'}
                            >
                              <Archive size={10} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirmDelete(thread.id); }}
                              className="p-0.5 text-slate-500 hover:text-red-400"
                              title="Remover"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        )}

                        {/* Confirmacao de delete */}
                        {isConfirmDelete && (
                          <div className="flex gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleDelete(thread.id)}
                              className="px-1.5 py-0.5 text-[9px] bg-red-600 text-white rounded hover:bg-red-500"
                            >
                              OK
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="px-1.5 py-0.5 text-[9px] bg-slate-700 text-slate-300 rounded hover:bg-slate-600"
                            >
                              X
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Rodape: stats + atalho para clientes */}
      <div className="p-2 border-t border-slate-800 text-[10px] text-slate-600">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <MessageSquare size={9} />
            {threads.filter((t) => !t.archived).length} ativas
          </span>
          <button
            onClick={() => setSidebarTab('clients')}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-300"
          >
            <Users size={9} />
            Gerenciar clientes
          </button>
        </div>
      </div>
    </div>
  );
};
