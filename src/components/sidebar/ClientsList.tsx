import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../../stores/app-store';
import { NewClientModal } from '../modals/NewClientModal';
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
  const { clients, currentClient, selectClient, setClients } = useAppStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

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
        {clients.map((client) => (
          <div
            key={client.id}
            className={`group w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all ${
              currentClient?.id === client.id
                ? 'bg-slate-800 ring-1 ring-slate-600'
                : 'hover:bg-slate-800/50'
            }`}
          >
            <button
              onClick={() => selectClient(client)}
              className="flex items-center gap-2 flex-1 min-w-0"
            >
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${HEALTH_COLORS[client.health]}`} />
              <div className="min-w-0 flex-1 text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-200 truncate">{client.name}</span>
                  <span className={`text-[9px] px-1 py-0.5 rounded shrink-0 ${STEP_COLORS[client.step]}`}>
                    {client.step}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 truncate block">{client.segment}</span>
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
              <button
                onClick={() => setConfirmDelete(client.id)}
                className="p-1 text-slate-600 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all shrink-0"
                title="Remover"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        ))}

        <button
          onClick={() => setModalOpen(true)}
          className="w-full flex items-center justify-center gap-1 py-2 text-[11px] text-slate-500 hover:text-slate-300 border border-dashed border-slate-700 rounded-lg hover:border-slate-500 transition-colors"
        >
          <Plus size={12} />
          Novo Cliente
        </button>

        {clients.length === 0 && (
          <p className="text-center text-[10px] text-slate-600 py-4">
            Nenhum cliente ainda. Clique acima para adicionar.
          </p>
        )}
      </div>
      <NewClientModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};
