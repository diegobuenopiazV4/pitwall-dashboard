import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Save, Trash2, Upload, MessageSquare, FileText, FolderOpen, Bell, Tag, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../../stores/app-store';
import { updateClientRemote, deleteClientRemote } from '../../hooks/useSupabaseSync';
import type { Client, Pilar, StepPhase, HealthScore, ServiceCategory, ServiceContract } from '../../lib/agents/types';
import { AGENTS } from '../../lib/agents/agents-data';

interface Props {
  open: boolean;
  clientId: string | null;
  onClose: () => void;
}

const PILARES: Pilar[] = ['Aquisicao', 'Engajamento', 'Monetizacao', 'Retencao'];
const STEPS: StepPhase[] = ['Saber', 'Ter', 'Executar', 'Potencializar'];
const HEALTHS: { value: HealthScore; label: string; color: string }[] = [
  { value: 'green', label: 'Saudavel', color: 'bg-emerald-500' },
  { value: 'yellow', label: 'Atencao', color: 'bg-amber-400' },
  { value: 'red', label: 'Critico', color: 'bg-red-500' },
];

const BRAND_COLORS = [
  '#ff4444', '#448aff', '#00e676', '#ff9100', '#e040fb', '#00bcd4',
  '#ffeb3b', '#4caf50', '#f44336', '#9c27b0', '#2196f3', '#ff5722',
];

const SERVICE_CATALOG: { category: ServiceCategory; label: string; icon: string }[] = [
  { category: 'estrategia', label: 'Estrategia', icon: '\u2655' },
  { category: 'trafego', label: 'Trafego Pago', icon: '\uD83D\uDE80' },
  { category: 'design', label: 'Design Ads', icon: '\uD83C\uDFA8' },
  { category: 'social', label: 'Social Media', icon: '\uD83D\uDCF1' },
  { category: 'conteudo', label: 'Copy/Conteudo', icon: '\u270D\uFE0F' },
  { category: 'seo', label: 'SEO', icon: '\uD83D\uDD0D' },
  { category: 'crm', label: 'CRM', icon: '\uD83D\uDCE7' },
  { category: 'automacao', label: 'Automacao', icon: '\u2699\uFE0F' },
  { category: 'web', label: 'Web/LPs', icon: '\uD83C\uDF10' },
  { category: 'video', label: 'Video', icon: '\uD83C\uDFAC' },
  { category: 'cro', label: 'CRO', icon: '\uD83E\uDDEA' },
  { category: 'dados', label: 'Dados/BI', icon: '\uD83D\uDCCA' },
];

export const ClientEditorModal: React.FC<Props> = ({ open, clientId, onClose }) => {
  const { clients, updateClient, setClients, threads, selectThread, messages, setClientDocsOpen, selectClient } = useAppStore();
  const [tab, setTab] = useState<'info' | 'servicos' | 'conversas' | 'documentos' | 'memoria'>('info');
  const [edited, setEdited] = useState<Partial<Client>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const client = useMemo(() => clients.find((c) => c.id === clientId), [clients, clientId]);

  useEffect(() => {
    if (client) setEdited({ ...client });
  }, [client?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Conversas deste cliente
  const clientThreads = useMemo(() => {
    if (!clientId) return [];
    return threads.filter((t) => t.clientId === clientId);
  }, [threads, clientId]);

  // Mensagens deste cliente (legacy + threads)
  const clientMessages = useMemo(() => {
    if (!clientId || !client) return [];
    const list: Array<{ thread?: string; content: string; role: string; createdAt: string }> = [];
    // Mensagens de threads
    for (const thread of clientThreads) {
      const key = `thread_${thread.id}`;
      const msgs = messages[key] || [];
      for (const m of msgs) {
        list.push({ thread: thread.title, content: m.content, role: m.role, createdAt: m.createdAt });
      }
    }
    // Mensagens legacy (agent_clientId)
    for (const [key, msgs] of Object.entries(messages)) {
      if (key.startsWith('thread_')) continue;
      if (key.endsWith(`_${clientId}`)) {
        for (const m of msgs) {
          list.push({ content: m.content, role: m.role, createdAt: m.createdAt });
        }
      }
    }
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [clientId, client, clientThreads, messages]);

  if (!open || !client) return null;

  const save = () => {
    if (!edited.name?.trim()) {
      toast.error('Nome obrigatorio');
      return;
    }
    const updates = { ...edited, updatedAt: new Date().toISOString() };
    updateClient(client.id, updates);
    updateClientRemote(client.id, updates as any);
    toast.success(`${edited.name} atualizado`);
    onClose();
  };

  const handleDelete = async () => {
    await deleteClientRemote(client.id);
    setClients(clients.filter((c) => c.id !== client.id));
    toast.success(`${client.name} removido`);
    onClose();
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo deve ter menos de 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setEdited((prev) => ({ ...prev, logoUrl: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const toggleService = (category: ServiceCategory, label: string) => {
    const services = (edited.contractedServices || []) as ServiceContract[];
    const existing = services.find((s) => s.category === category);
    if (existing) {
      setEdited({ ...edited, contractedServices: services.filter((s) => s.category !== category) });
    } else {
      setEdited({
        ...edited,
        contractedServices: [
          ...services,
          { id: crypto.randomUUID(), category, name: label, active: true, startDate: new Date().toISOString() },
        ],
      });
    }
  };

  const openThreadFromList = (threadId: string) => {
    selectThread(threadId);
    onClose();
  };

  const openDocsFolder = () => {
    selectClient(client);
    setClientDocsOpen(true);
    onClose();
  };

  const brandColor = edited.brandColor || '#334155';
  const services = (edited.contractedServices || []) as ServiceContract[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-4xl max-h-[90vh] bg-[#1a1a24] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header com preview */}
        <div className="relative px-6 py-5 border-b border-slate-700" style={{ background: `linear-gradient(135deg, ${brandColor}15 0%, #1a1a24 60%)` }}>
          <button onClick={onClose} className="absolute top-3 right-3 p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg">
            <X size={16} />
          </button>
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0 overflow-hidden"
              style={{ background: brandColor }}
            >
              {edited.logoUrl ? <img src={edited.logoUrl} alt="" className="w-full h-full object-cover" /> : (edited.name || client.name).charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-slate-100">{(edited.name || client.name).toUpperCase()}</h2>
              <p className="text-xs text-slate-500 truncate">
                {edited.segment || client.segment} · {edited.step || client.step} · {clientThreads.length} conversa(s)
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 bg-[#111118] px-4 overflow-x-auto">
          <TabBtn active={tab === 'info'} onClick={() => setTab('info')} icon={Tag} label="Informacoes" />
          <TabBtn active={tab === 'servicos'} onClick={() => setTab('servicos')} icon={Users} label={`Servicos (${services.length})`} />
          <TabBtn active={tab === 'conversas'} onClick={() => setTab('conversas')} icon={MessageSquare} label={`Conversas (${clientThreads.length})`} />
          <TabBtn active={tab === 'documentos'} onClick={() => setTab('documentos')} icon={FolderOpen} label="Documentos" />
          <TabBtn active={tab === 'memoria'} onClick={() => setTab('memoria')} icon={FileText} label="Memoria" />
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6">
          {/* TAB: INFORMACOES */}
          {tab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Nome</label>
                  <input
                    type="text"
                    value={edited.name || ''}
                    onChange={(e) => setEdited({ ...edited, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#e4243d]/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Segmento</label>
                  <input
                    type="text"
                    value={edited.segment || ''}
                    onChange={(e) => setEdited({ ...edited, segment: e.target.value })}
                    placeholder="Ex: Fibra Optica/Telecom"
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#e4243d]/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Slug (URL)</label>
                  <input
                    type="text"
                    value={edited.slug || ''}
                    onChange={(e) => setEdited({ ...edited, slug: e.target.value })}
                    placeholder="nome-cliente"
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#e4243d]/50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Time/Responsavel</label>
                  <select
                    value={edited.teamId || 'default'}
                    onChange={(e) => setEdited({ ...edited, teamId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#e4243d]/50"
                  >
                    <option value="default">Time Padrao</option>
                    <option value="performance">Time Performance</option>
                    <option value="criativo">Time Criativo</option>
                    <option value="estrategia">Time Estrategia</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Fase STEP</label>
                  <div className="grid grid-cols-4 gap-1">
                    {STEPS.map((s) => (
                      <button key={s} onClick={() => setEdited({ ...edited, step: s })}
                        className={`py-1.5 text-[10px] rounded-md transition-colors ${edited.step === s ? 'bg-[#e4243d] text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                        {s.substring(0, 4)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Pilar V4</label>
                  <div className="grid grid-cols-4 gap-1">
                    {PILARES.map((p) => (
                      <button key={p} onClick={() => setEdited({ ...edited, pilar: p })}
                        className={`py-1.5 text-[10px] rounded-md transition-colors ${edited.pilar === p ? 'bg-[#e4243d] text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                        title={p}>
                        {p.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Health</label>
                  <div className="grid grid-cols-3 gap-1">
                    {HEALTHS.map((h) => (
                      <button key={h.value} onClick={() => setEdited({ ...edited, health: h.value })}
                        className={`flex items-center justify-center gap-1 py-1.5 text-[10px] rounded-md ${edited.health === h.value ? 'bg-slate-700 text-white ring-1 ring-slate-500' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                        <span className={`w-2 h-2 rounded-full ${h.color}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cor da marca */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Cor da marca</label>
                <div className="grid grid-cols-12 gap-1.5 mb-2">
                  {BRAND_COLORS.map((color) => (
                    <button key={color} onClick={() => setEdited({ ...edited, brandColor: color })}
                      className={`aspect-square rounded-md transition-all ${edited.brandColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1a24]' : ''}`}
                      style={{ background: color }} />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input type="color" value={edited.brandColor || '#334155'}
                    onChange={(e) => setEdited({ ...edited, brandColor: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer bg-slate-900 border border-slate-700" />
                  <input type="text" value={edited.brandColor || ''} onChange={(e) => setEdited({ ...edited, brandColor: e.target.value })}
                    placeholder="#ff4444"
                    className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-[#e4243d]/50" />
                </div>
              </div>

              {/* Logo */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Logo</label>
                <div className="flex items-start gap-3">
                  <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden cursor-pointer hover:border-slate-500"
                    style={{ background: edited.logoUrl ? 'transparent' : `${edited.brandColor || '#334155'}15` }}
                    onClick={() => logoInputRef.current?.click()}>
                    {edited.logoUrl ? <img src={edited.logoUrl} alt="" className="w-full h-full object-cover" /> : <Upload size={18} className="text-slate-500" />}
                  </div>
                  <div className="flex-1">
                    <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    <button onClick={() => logoInputRef.current?.click()}
                      className="px-3 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1.5">
                      <Upload size={12} /> {edited.logoUrl ? 'Trocar' : 'Upload'}
                    </button>
                    <p className="text-[10px] text-slate-500 mt-1.5">Max 2MB, PNG/JPG/SVG</p>
                    {edited.logoUrl && (
                      <button onClick={() => setEdited({ ...edited, logoUrl: undefined })}
                        className="text-[10px] text-red-400 hover:text-red-300 mt-1">Remover logo</button>
                    )}
                  </div>
                </div>
              </div>

              {/* Notify approval */}
              <label className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-900">
                <input type="checkbox" checked={edited.notifyOnApproval || false}
                  onChange={(e) => setEdited({ ...edited, notifyOnApproval: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-[#e4243d]" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Bell size={12} className="text-amber-400" />
                    <span className="text-xs font-medium text-slate-200">Notificar ao aprovar tarefa</span>
                  </div>
                </div>
              </label>
            </div>
          )}

          {/* TAB: SERVICOS */}
          {tab === 'servicos' && (
            <div>
              <p className="text-xs text-slate-400 mb-4">Quais servicos V4 este cliente contratou?</p>
              <div className="grid grid-cols-2 gap-2">
                {SERVICE_CATALOG.map((svc) => {
                  const isSelected = services.some((s) => s.category === svc.category);
                  return (
                    <div key={svc.category}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'bg-[#e4243d]/10 border-[#e4243d]/50' : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'}`}
                      onClick={() => toggleService(svc.category, svc.label)}>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={isSelected} onChange={() => {}} className="w-3.5 h-3.5 rounded bg-slate-800 border-slate-600 text-[#e4243d]" />
                        <span className="text-sm">{svc.icon}</span>
                        <span className="text-xs font-medium text-slate-200">{svc.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: CONVERSAS */}
          {tab === 'conversas' && (
            <div>
              <p className="text-xs text-slate-400 mb-4">{clientThreads.length} conversa(s) deste cliente</p>
              {clientThreads.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-xs">Nenhuma conversa ainda</div>
              )}
              <div className="space-y-1.5">
                {clientThreads.map((thread) => {
                  const agent = AGENTS.find((a) => a.id === thread.primaryAgentId);
                  return (
                    <button key={thread.id} onClick={() => openThreadFromList(thread.id)}
                      className="w-full flex items-center gap-3 p-3 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors text-left">
                      {agent && (
                        <span className="w-8 h-8 rounded flex items-center justify-center text-sm shrink-0" style={{ backgroundColor: agent.color + '22', color: agent.color }}>
                          {agent.icon}
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-200 truncate">{thread.title}</p>
                        <p className="text-[10px] text-slate-500">{agent?.name} · {thread.messageCount} msgs · atualizada {new Date(thread.updatedAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <MessageSquare size={11} className="text-slate-600 shrink-0" />
                    </button>
                  );
                })}
              </div>
              {clientMessages.length > 0 && (
                <div className="mt-6">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 font-semibold">Ultimas mensagens trocadas</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {clientMessages.slice(0, 10).map((m, i) => (
                      <div key={i} className="text-[10px] p-2 bg-slate-900/30 rounded">
                        <span className="text-slate-600">{new Date(m.createdAt).toLocaleDateString('pt-BR')} </span>
                        <span className={m.role === 'user' ? 'text-[#ff4d5a]' : 'text-slate-400'}>{m.role === 'user' ? 'Voce: ' : 'Bot: '}</span>
                        <span className="text-slate-300">{m.content.substring(0, 150)}...</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: DOCUMENTOS */}
          {tab === 'documentos' && (
            <div>
              <p className="text-xs text-slate-400 mb-4">Pasta de documentos anexada ao cliente</p>
              <button onClick={openDocsFolder}
                className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-200 transition-colors">
                <FolderOpen size={16} /> Abrir pasta de documentos
              </button>
              <p className="text-[10px] text-slate-500 mt-2 text-center">Upload CSVs, briefings, relatorios, assets do cliente</p>
            </div>
          )}

          {/* TAB: MEMORIA */}
          {tab === 'memoria' && (
            <div>
              <p className="text-xs text-slate-400 mb-4">Memoria persistente - contexto que a IA usa sempre em conversas deste cliente</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Brief do cliente</label>
                  <textarea
                    value={(edited.metadata as any)?.brief || ''}
                    onChange={(e) => setEdited({ ...edited, metadata: { ...(edited.metadata || {}), brief: e.target.value } })}
                    rows={4}
                    placeholder="O que a empresa faz, produtos, publico-alvo..."
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#e4243d]/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Posicionamento</label>
                  <textarea
                    value={(edited.metadata as any)?.positioning || ''}
                    onChange={(e) => setEdited({ ...edited, metadata: { ...(edited.metadata || {}), positioning: e.target.value } })}
                    rows={2}
                    placeholder="Como o cliente quer ser percebido no mercado..."
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#e4243d]/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Tom de voz preferido</label>
                  <input
                    type="text"
                    value={(edited.metadata as any)?.tone || ''}
                    onChange={(e) => setEdited({ ...edited, metadata: { ...(edited.metadata || {}), tone: e.target.value } })}
                    placeholder="Ex: Consultivo direto, tecnico mas acessivel, formal institucional"
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#e4243d]/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Notas livres</label>
                  <textarea
                    value={(edited.metadata as any)?.freeNotes || ''}
                    onChange={(e) => setEdited({ ...edited, metadata: { ...(edited.metadata || {}), freeNotes: e.target.value } })}
                    rows={4}
                    placeholder="Qualquer informacao relevante do cliente..."
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#e4243d]/50"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-6 py-4 border-t border-slate-700 bg-[#111118]">
          {confirmDelete ? (
            <>
              <span className="flex-1 text-xs text-red-400 font-semibold">Certeza? Isso remove o cliente permanentemente.</span>
              <button onClick={() => setConfirmDelete(false)} className="px-3 py-2 text-xs text-slate-400 bg-slate-800 rounded-lg">Cancelar</button>
              <button onClick={handleDelete} className="px-3 py-2 text-xs text-white bg-red-600 rounded-lg font-semibold">Remover</button>
            </>
          ) : (
            <>
              <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-1.5 px-3 py-2 text-xs text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20">
                <Trash2 size={12} /> Remover
              </button>
              <div className="flex-1" />
              <button onClick={onClose} className="px-4 py-2 text-xs text-slate-400 bg-slate-800 rounded-lg hover:bg-slate-700">Cancelar</button>
              <button onClick={save} className="flex items-center gap-1.5 px-4 py-2 text-xs text-white bg-gradient-to-r from-[#e4243d] to-[#ff4d5a] rounded-lg font-semibold">
                <Save size={12} /> Salvar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const TabBtn: React.FC<{ active: boolean; onClick: () => void; icon: React.ComponentType<{ size?: number }>; label: string }> = ({ active, onClick, icon: Icon, label }) => (
  <button onClick={onClick}
    className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
      active ? 'border-[#e4243d] text-slate-100' : 'border-transparent text-slate-500 hover:text-slate-300'
    }`}>
    <Icon size={12} />
    {label}
  </button>
);
