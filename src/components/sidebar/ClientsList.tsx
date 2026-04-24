import React, { useState } from 'react';
import { Plus, Trash2, FolderOpen, FolderTree, Search, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../../stores/app-store';
import { NewClientModal } from '../modals/NewClientModal';
import { FolderImportModal } from '../modals/FolderImportModal';
import { ClientEditorModal } from '../modals/ClientEditorModal';
import { deleteClientRemote } from '../../hooks/useSupabaseSync';

const HEALTH_COLORS = {
  green: 'bg-emerald-500',
  yellow: 'bg-amber-400',
  red: 'bg-red-500',
};

const STEP_COLORS = {
  Saber: 'bg-blue-500/20 text-blue-400',
  Ter: 'bg-amber-500/20 text-amber-400',
  Executar: 'bg-emerald-500/20 text-emerald-400',
  Potencializar: 'bg-purple-500/20 text-purple-400',
};

export const ClientsList: React.FC = () => {
  const { clients, currentClient, selectClient, setClients, setClientDocsOpen } = useAppStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [folderImportOpen, setFolderImportOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [editingClientId, setEditingClientId] = useState<string | null>(null);

  const filtered = query
    ? clients.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        (c.segment || '').toLowerCase().includes(query.toLowerCase())
      )
    : clients;

  const handleDelete = async (clientId: string, name: string) => {
    await deleteClientRemote(clientId);
    setClients(clients.filter((c) => c.id !== clientId));
    if (currentClient?.id === clientId) selectClient(null);
    toast.success(`${name} removido`);
    setConfirmDelete(null);
  };

  return (
    <>
      <div className="p-2 space-y-1">
        {clients.length > 4 && (
          <div className="relative mb-2">
            <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar cliente..."
              className="w-full pl-7 pr-2 py-1.5 text-[11px] bg-slate-900 border border-slate-800 rounded-md text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500/30"
            />
          </div>
        )}

        {filtered.map((client) => {
          const brandColor = (client as any).brandColor || '#334155';
          const logoUrl = (client as any).logoUrl;
          const services = (client as any).contractedServices as any[] | undefined;
          const isActive = currentClient?.id === client.id;
          return (
            <div
              key={client.id}
              className={`group w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all ${
                isActive
                  ? 'bg-slate-800 ring-1 ring-slate-600'
                  : 'hover:bg-slate-800/50'
              }`}
              style={isActive ? { borderLeft: `3px solid ${brandColor}` } : undefined}
            >
              <button
                onClick={() => selectClient(client)}
                className="flex items-center gap-2 flex-1 min-w-0"
              >
                {/* Avatar colorido/logo */}
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center text-white font-bold text-[11px] shrink-0 overflow-hidden"
                  style={{ background: brandColor }}
                >
                  {logoUrl ? (
                    <img src={logoUrl} alt="logo" className="w-full h-full object-cover" />
                  ) : (
                    client.name.trim().charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${HEALTH_COLORS[client.health]}`} />
                    <span className="text-xs font-semibold text-slate-200 truncate">{client.name}</span>
                    <span className={`text-[9px] px-1 py-0.5 rounded shrink-0 ${STEP_COLORS[client.step]}`}>
                      {client.step}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-500 truncate">
                      {client.segment || 'Sem segmento'}
                    </span>
                    {services && services.length > 0 && (
                      <span className="text-[9px] text-blue-400 shrink-0">
                        \u2022 {services.length} svc
                      </span>
                    )}
                  </div>
                </div>
              </button>
              {confirmDelete === client.id ? (
                <div className="flex gap-0.5 shrink-0">
                  <button
                    onClick={() => handleDelete(client.id, client.name)}
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
              ) : (
                <>
                  <button
                    onClick={() => {
                      selectClient(client);
                      setClientDocsOpen(true);
                    }}
                    className="p-1 text-slate-600 opacity-0 group-hover:opacity-100 hover:text-blue-400 transition-all shrink-0"
                    title="Documentos do cliente"
                  >
                    <FolderOpen size={12} />
                  </button>
                  <button
                    onClick={() => setEditingClientId(client.id)}
                    className="p-1 text-slate-600 opacity-0 group-hover:opacity-100 hover:text-emerald-400 transition-all shrink-0"
                    title="Editar cliente completo"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(client.id)}
                    className="p-1 text-slate-600 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all shrink-0"
                    title="Remover"
                  >
                    <Trash2 size={12} />
                  </button>
                </>
              )}
            </div>
          );
        })}

        {query && filtered.length === 0 && (
          <p className="text-center text-[10px] text-slate-600 py-3">
            Nenhum cliente encontrado
          </p>
        )}

        {/* Actions: Novo cliente + Importar pasta */}
        <div className="grid grid-cols-2 gap-1 mt-2">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center justify-center gap-1 py-2 text-[10px] text-slate-400 hover:text-slate-200 border border-dashed border-slate-700 rounded-lg hover:border-slate-500 hover:bg-slate-800/50 transition-colors"
          >
            <Plus size={11} />
            Novo
          </button>
          <button
            onClick={() => setFolderImportOpen(true)}
            className="flex items-center justify-center gap-1 py-2 text-[10px] text-blue-400 hover:text-blue-300 border border-dashed border-blue-500/30 rounded-lg hover:border-blue-500/60 hover:bg-blue-500/5 transition-colors"
            title="Importar clientes a partir de uma pasta local"
          >
            <FolderTree size={11} />
            Importar Pasta
          </button>
        </div>

        {clients.length === 0 && (
          <p className="text-center text-[10px] text-slate-600 py-4">
            Nenhum cliente ainda. Crie manualmente ou importe uma pasta.
          </p>
        )}
      </div>
      <NewClientModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <FolderImportModal open={folderImportOpen} onClose={() => setFolderImportOpen(false)} />
      <ClientEditorModal open={!!editingClientId} clientId={editingClientId} onClose={() => setEditingClientId(null)} />
    </>
  );
};
