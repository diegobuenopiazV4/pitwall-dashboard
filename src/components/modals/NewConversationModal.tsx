import React, { useState, useMemo } from 'react';
import { X, Plus, Search, Check, User, Bot } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../../stores/app-store';
import { AGENTS } from '../../lib/agents/agents-data';

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * Modal para nova conversa com:
 * - Selecao de cliente (opcional)
 * - Selecao de agente primario
 * - Titulo inicial opcional (auto-gerado da 1a mensagem depois)
 */
export const NewConversationModal: React.FC<Props> = ({ open, onClose }) => {
  const { clients, createNewThread, selectThread, selectAgent, selectClient } = useAppStore();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('01');
  const [clientQuery, setClientQuery] = useState('');
  const [agentQuery, setAgentQuery] = useState('');

  const filteredClients = useMemo(() => {
    if (!clientQuery) return clients;
    const q = clientQuery.toLowerCase();
    return clients.filter((c) =>
      c.name.toLowerCase().includes(q) || (c.segment || '').toLowerCase().includes(q)
    );
  }, [clients, clientQuery]);

  const filteredAgents = useMemo(() => {
    if (!agentQuery) return AGENTS;
    const q = agentQuery.toLowerCase();
    return AGENTS.filter((a) =>
      a.name.toLowerCase().includes(q) || a.area.toLowerCase().includes(q)
    );
  }, [agentQuery]);

  const agentsByPilar = useMemo(() => {
    const grouped: Record<string, typeof AGENTS> = {};
    for (const agent of filteredAgents) {
      if (!grouped[agent.pilar]) grouped[agent.pilar] = [];
      grouped[agent.pilar].push(agent);
    }
    return grouped;
  }, [filteredAgents]);

  const handleCreate = () => {
    // Seleciona agente + cliente no store antes de criar thread
    selectAgent(selectedAgentId);
    const client = selectedClientId ? clients.find((c) => c.id === selectedClientId) : null;
    selectClient(client ?? null);
    // Cria thread
    const thread = createNewThread();
    selectThread(thread.id);
    toast.success('Nova conversa criada', { icon: '\u2728' });
    onClose();
    // Reset
    setSelectedClientId(null);
    setSelectedAgentId('01');
    setClientQuery('');
    setAgentQuery('');
  };

  if (!open) return null;

  const selectedClient = selectedClientId ? clients.find((c) => c.id === selectedClientId) : null;
  const selectedAgent = AGENTS.find((a) => a.id === selectedAgentId)!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-4xl max-h-[85vh] bg-[#1a1a24] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Plus size={16} className="text-[#e4243d]" />
            <h2 className="text-sm font-semibold text-slate-200">Nova Conversa</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1">
            <X size={16} />
          </button>
        </div>

        {/* Body: 2 colunas (cliente + agente) */}
        <div className="flex-1 min-h-0 overflow-hidden flex">
          {/* Coluna Cliente */}
          <div className="flex-1 border-r border-slate-800 flex flex-col">
            <div className="px-4 py-3 border-b border-slate-800">
              <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                <User size={10} className="inline mr-1" />
                Cliente (opcional)
              </h3>
              <div className="relative">
                <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={clientQuery}
                  onChange={(e) => setClientQuery(e.target.value)}
                  placeholder="Buscar cliente..."
                  className="w-full pl-7 pr-2 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-md text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#e4243d]/30"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {/* Opcao "Sem cliente" */}
              <button
                onClick={() => setSelectedClientId(null)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors mb-1 ${
                  selectedClientId === null ? 'bg-[#e4243d]/10 ring-1 ring-[#e4243d]/30' : 'hover:bg-slate-800/50'
                }`}
              >
                <User size={14} className="text-slate-500 shrink-0" />
                <span className="text-xs text-slate-300 flex-1 text-left">Sem cliente (geral)</span>
                {selectedClientId === null && <Check size={12} className="text-[#e4243d]" />}
              </button>

              {filteredClients.map((client) => {
                const color = (client as any).brandColor || '#334155';
                const logo = (client as any).logoUrl;
                return (
                  <button
                    key={client.id}
                    onClick={() => setSelectedClientId(client.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors mb-0.5 ${
                      selectedClientId === client.id ? 'bg-[#e4243d]/10 ring-1 ring-[#e4243d]/30' : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded flex items-center justify-center text-[11px] font-bold text-white shrink-0 overflow-hidden"
                      style={{ background: color }}
                    >
                      {logo ? (
                        <img src={logo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        client.name.charAt(0)
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-medium text-slate-200 truncate">{client.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{client.segment} · {client.step}</p>
                    </div>
                    {selectedClientId === client.id && <Check size={12} className="text-[#e4243d] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Coluna Agente */}
          <div className="flex-1 flex flex-col">
            <div className="px-4 py-3 border-b border-slate-800">
              <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                <Bot size={10} className="inline mr-1" />
                Agente inicial
              </h3>
              <div className="relative">
                <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={agentQuery}
                  onChange={(e) => setAgentQuery(e.target.value)}
                  placeholder="Buscar agente..."
                  className="w-full pl-7 pr-2 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-md text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#e4243d]/30"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {Object.entries(agentsByPilar).map(([pilar, agents]) => (
                <div key={pilar} className="mb-2">
                  <p className="px-2 py-1 text-[9px] uppercase tracking-widest text-slate-600 font-semibold">{pilar}</p>
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgentId(agent.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors mb-0.5 ${
                        selectedAgentId === agent.id ? 'bg-[#e4243d]/10 ring-1 ring-[#e4243d]/30' : 'hover:bg-slate-800/50'
                      }`}
                    >
                      <span
                        className="w-7 h-7 rounded flex items-center justify-center text-sm shrink-0"
                        style={{ backgroundColor: agent.color + '22', color: agent.color }}
                      >
                        {agent.icon}
                      </span>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-medium text-slate-200">{agent.name}</span>
                          <span className="text-[9px] text-slate-600">{agent.id}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">{agent.area}</p>
                      </div>
                      {selectedAgentId === agent.id && <Check size={12} className="text-[#e4243d] shrink-0" />}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer: preview + create */}
        <div className="px-6 py-4 border-t border-slate-700 bg-[#111118]">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Preview:</span>
            <div className="flex items-center gap-2 text-xs">
              <span
                className="w-5 h-5 rounded flex items-center justify-center text-xs shrink-0"
                style={{ backgroundColor: selectedAgent.color + '22', color: selectedAgent.color }}
              >
                {selectedAgent.icon}
              </span>
              <span className="font-semibold text-slate-200">{selectedAgent.name}</span>
              {selectedClient && (
                <>
                  <span className="text-slate-600">·</span>
                  <div className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white" style={{ background: (selectedClient as any).brandColor || '#334155' }}>
                    {selectedClient.name.charAt(0)}
                  </div>
                  <span className="text-slate-300">{selectedClient.name}</span>
                </>
              )}
              {!selectedClient && <span className="text-slate-500 italic">sem cliente</span>}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-xs text-slate-400 bg-slate-800 rounded-lg hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreate}
              className="flex-1 px-4 py-2 text-xs text-white bg-gradient-to-r from-[#e4243d] to-[#ff4d5a] rounded-lg font-semibold flex items-center justify-center gap-1.5"
            >
              <Plus size={12} />
              Criar conversa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
