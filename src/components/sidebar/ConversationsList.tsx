import React, { useState, useMemo } from 'react';
import {
  Plus, Search, Star, Archive, Trash2, Edit2, Settings as SettingsIcon,
  Briefcase, Users, CheckSquare, Zap, LogOut,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../../stores/app-store';
import { groupThreadsByTime, searchThreads } from '../../lib/conversations/threads';
import { AGENTS } from '../../lib/agents/agents-data';
import { V4Logo } from '../brand/V4Logo';
import { supabase } from '../../lib/supabase/client';

export const ConversationsList: React.FC = () => {
  const {
    threads, currentThreadId, clients, userName,
    createNewThread, selectThread, renameThread, deleteThread,
    toggleThreadStar, toggleThreadArchive, logout,
  } = useAppStore();

  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showTools, setShowTools] = useState(false);

  // Filtra
  const filtered = useMemo(() => searchThreads(threads, query), [threads, query]);

  // Agrupa por tempo (estilo Claude)
  const timeGroups = useMemo(() => groupThreadsByTime(filtered), [filtered]);

  // Mapa de cor do cliente para mostrar o dotzinho
  const clientColorMap = useMemo(() => {
    const map: Record<string, { name: string; color: string }> = {};
    for (const c of clients) {
      map[c.id] = { name: c.name, color: (c as any).brandColor || '#64748b' };
    }
    return map;
  }, [clients]);

  const handleNewThread = () => {
    createNewThread();
    setQuery('');
    toast.success('Nova conversa', { duration: 1500 });
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
    toast.success('Removida');
    setConfirmDelete(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
  };

  const getAgent = (id: string) => AGENTS.find((a) => a.id === id);

  return (
    <div className="flex flex-col h-full">
      {/* Logo + New chat */}
      <div className="p-3 border-b border-slate-800/50">
        <div className="mb-3">
          <V4Logo size="sm" showSubtitle={true} showDots={false} />
        </div>
        <button
          onClick={handleNewThread}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#e4243d] to-[#ff4d5a] hover:opacity-90 text-white text-sm font-semibold rounded-lg shadow-lg transition-all"
        >
          <Plus size={14} />
          Nova conversa
        </button>
      </div>

      {/* Busca */}
      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar conversa..."
            className="w-full pl-8 pr-3 py-2 text-xs bg-slate-900/50 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#e4243d]/30 focus:border-[#e4243d]/30"
          />
        </div>
      </div>

      {/* Lista de conversas agrupadas por tempo */}
      <div className="flex-1 min-h-0 overflow-y-auto px-2 py-1">
        {timeGroups.length === 0 && (
          <div className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-800/50 flex items-center justify-center">
              <Plus size={20} className="text-slate-500" />
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {query ? 'Nenhuma conversa encontrada' : 'Comece sua primeira conversa'}
            </p>
            <p className="text-[10px] text-slate-600 mt-1">
              {query ? 'Tente outro termo' : 'Clique em "Nova conversa" acima'}
            </p>
          </div>
        )}

        {timeGroups.map((group) => (
          <div key={group.key} className="mb-4">
            <h3 className="px-2 py-1 text-[10px] uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-1.5">
              {group.key === 'starred' && <Star size={9} className="text-amber-400 fill-amber-400" />}
              {group.label}
              <span className="ml-auto text-slate-600 font-normal">{group.threads.length}</span>
            </h3>
            <div className="space-y-0.5">
              {group.threads.map((thread) => {
                const agent = getAgent(thread.primaryAgentId);
                const client = thread.clientId ? clientColorMap[thread.clientId] : null;
                const isActive = currentThreadId === thread.id;
                const isEditing = editingId === thread.id;
                const isConfirmDelete = confirmDelete === thread.id;

                return (
                  <div
                    key={thread.id}
                    className={`group relative px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-[#e4243d]/10 text-slate-100'
                        : 'hover:bg-slate-800/50 text-slate-300'
                    }`}
                    onClick={() => !isEditing && selectThread(thread.id)}
                  >
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
                        className="w-full text-xs bg-slate-950 border border-[#e4243d]/30 rounded px-2 py-1 text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#e4243d]/60"
                      />
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {thread.starred && <Star size={9} className="text-amber-400 fill-amber-400 shrink-0" />}
                          <p className={`text-xs truncate flex-1 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                            {thread.title}
                          </p>
                          {/* Dotzinho colorido do cliente */}
                          {client && (
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ background: client.color }}
                              title={client.name}
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                          {agent && <span style={{ color: agent.color }}>{agent.icon}</span>}
                          <span className="truncate">
                            {client?.name || 'Geral'}
                          </span>
                          <span className="text-slate-700 shrink-0 ml-auto">
                            {thread.messageCount} msg
                          </span>
                        </div>

                        {/* Acoes no hover */}
                        {!isConfirmDelete && (
                          <div className="absolute right-1.5 top-1.5 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-[#111118] rounded px-0.5">
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleThreadStar(thread.id); }}
                              className="p-1 text-slate-500 hover:text-amber-400"
                              title="Favoritar"
                            >
                              <Star size={10} className={thread.starred ? 'fill-amber-400 text-amber-400' : ''} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleRename(thread.id, thread.title); }}
                              className="p-1 text-slate-500 hover:text-blue-400"
                              title="Renomear"
                            >
                              <Edit2 size={10} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleThreadArchive(thread.id); }}
                              className="p-1 text-slate-500 hover:text-slate-300"
                              title="Arquivar"
                            >
                              <Archive size={10} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirmDelete(thread.id); }}
                              className="p-1 text-slate-500 hover:text-red-400"
                              title="Remover"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        )}

                        {isConfirmDelete && (
                          <div className="absolute right-1.5 top-1.5 flex gap-0.5 bg-[#111118] rounded px-0.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleDelete(thread.id)}
                              className="px-2 py-0.5 text-[9px] bg-red-600 text-white rounded hover:bg-red-500"
                            >
                              OK
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="px-2 py-0.5 text-[9px] bg-slate-700 text-slate-300 rounded hover:bg-slate-600"
                            >
                              X
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer: ferramentas + user */}
      <div className="p-2 border-t border-slate-800/50 relative">
        {showTools && (
          <div className="absolute bottom-full left-2 right-2 mb-2 bg-[#1a1a24] border border-slate-700 rounded-lg shadow-xl py-1 z-50">
            <ToolButton icon={Briefcase} label="Clientes" onClick={() => { window.dispatchEvent(new CustomEvent('pitwall:open-clients-modal')); setShowTools(false); }} />
            <ToolButton icon={CheckSquare} label="Tarefas" onClick={() => { window.dispatchEvent(new CustomEvent('pitwall:open-tasks-modal')); setShowTools(false); }} />
            <ToolButton icon={Zap} label="Sprint" onClick={() => { window.dispatchEvent(new CustomEvent('pitwall:open-sprint-modal')); setShowTools(false); }} />
            <div className="h-px bg-slate-800 my-1" />
            <ToolButton icon={SettingsIcon} label="Configuracoes" onClick={() => { window.dispatchEvent(new CustomEvent('pitwall:open-settings')); setShowTools(false); }} />
            <ToolButton icon={LogOut} label="Sair" color="text-red-400" onClick={handleLogout} />
          </div>
        )}

        <button
          onClick={() => setShowTools(!showTools)}
          className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-slate-800/50 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#e4243d] to-[#ff4d5a] flex items-center justify-center text-white text-xs font-bold shrink-0">
            {userName?.charAt(0).toUpperCase() || 'V'}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-medium text-slate-200 truncate">{userName || 'Usuario'}</p>
            <p className="text-[9px] text-slate-500">Clique para opcoes</p>
          </div>
          <Users size={11} className="text-slate-500" />
        </button>
      </div>
    </div>
  );
};

const ToolButton: React.FC<{ icon: React.ComponentType<{ size?: number; className?: string }>; label: string; onClick: () => void; color?: string }> = ({ icon: Icon, label, onClick, color = 'text-slate-300' }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2 px-3 py-2 text-xs ${color} hover:bg-slate-800 transition-colors text-left`}
  >
    <Icon size={12} className="shrink-0" />
    {label}
  </button>
);
