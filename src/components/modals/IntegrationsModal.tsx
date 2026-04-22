import React, { useState, useEffect } from 'react';
import { X, Plug, Key, Check, Trash2, Plus, Zap, Copy, ExternalLink, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getCurrentAccountId, // eslint-disable-line @typescript-eslint/no-unused-vars
} from '../../lib/accounts/workspace';
import {
  listWebhooks,
  saveWebhook,
  deleteWebhook,
  testWebhook,
  type WebhookConfig,
  type WebhookEvent,
} from '../../lib/integrations/webhooks';
import {
  setEkyteConfig,
  clearEkyteConfig,
  isEkyteConfigured,
  testEkyteConnection,
} from '../../lib/integrations/ekyte';

interface Props {
  open: boolean;
  onClose: () => void;
}

const EVENT_OPTIONS: { value: WebhookEvent; label: string }[] = [
  { value: 'checkin.generated', label: 'Check-in gerado' },
  { value: 'task.created', label: 'Task criada' },
  { value: 'task.completed', label: 'Task concluida' },
  { value: 'sprint.started', label: 'Sprint iniciada' },
  { value: 'sprint.completed', label: 'Sprint concluida' },
  { value: 'agent.response', label: 'Resposta do agente' },
  { value: 'document.generated', label: 'Documento gerado' },
];

export const IntegrationsModal: React.FC<Props> = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState<'ekyte' | 'webhooks' | 'zapier'>('ekyte');

  // Ekyte state
  const [ekyteApiKey, setEkyteApiKey] = useState('');
  const [ekyteCompanyId, setEkyteCompanyId] = useState('');
  const [ekyteConfigured, setEkyteConfigured] = useState(false);

  // Webhooks state
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [showNewWebhook, setShowNewWebhook] = useState(false);
  const [newWebhook, setNewWebhook] = useState<Partial<WebhookConfig>>({
    type: 'slack',
    events: ['checkin.generated'],
    enabled: true,
  });

  useEffect(() => {
    if (open) {
      setEkyteConfigured(isEkyteConfigured());
      setWebhooks(listWebhooks());
    }
  }, [open]);

  const handleSaveEkyte = async () => {
    if (!ekyteApiKey.trim() || !ekyteCompanyId.trim()) {
      toast.error('Preencha apiKey e companyId');
      return;
    }
    setEkyteConfig({ apiKey: ekyteApiKey.trim(), companyId: ekyteCompanyId.trim() });
    const test = await testEkyteConnection();
    if (test.ok) {
      setEkyteConfigured(true);
      toast.success('Ekyte conectado!');
    } else {
      toast.error(`Erro: ${test.message}`);
    }
  };

  const handleClearEkyte = () => {
    clearEkyteConfig();
    setEkyteApiKey('');
    setEkyteCompanyId('');
    setEkyteConfigured(false);
    toast.success('Ekyte desconectado');
  };

  const handleSaveWebhook = () => {
    if (!newWebhook.url || !newWebhook.name) {
      toast.error('Preencha nome e URL');
      return;
    }
    const saved = saveWebhook({
      name: newWebhook.name,
      url: newWebhook.url,
      type: newWebhook.type as WebhookConfig['type'],
      events: newWebhook.events as WebhookEvent[],
      enabled: true,
    });
    setWebhooks([...webhooks, saved]);
    setShowNewWebhook(false);
    setNewWebhook({ type: 'slack', events: ['checkin.generated'], enabled: true });
    toast.success('Webhook adicionado');
  };

  const handleDeleteWebhook = (id: string) => {
    deleteWebhook(id);
    setWebhooks(webhooks.filter((w) => w.id !== id));
    toast.success('Webhook removido');
  };

  const handleTestWebhook = async (webhook: WebhookConfig) => {
    toast.loading('Testando...');
    const result = await testWebhook(webhook);
    toast.dismiss();
    if (result.ok) toast.success(`OK: ${result.message}`);
    else toast.error(`Falhou: ${result.message}`);
  };

  const copyMcpCommand = () => {
    const cmd = 'claude mcp add ekyte-zapier zapier-mcp-endpoint';
    navigator.clipboard.writeText(cmd);
    toast.success('Copiado');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[90vh] bg-[#1a1a24] border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Plug size={16} className="text-purple-400" />
            <h2 className="text-sm font-semibold text-slate-200">Integracoes</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={16} />
          </button>
        </div>

        <div className="flex border-b border-slate-800 bg-[#111118]">
          {[
            { id: 'ekyte' as const, label: 'Ekyte (mkt.lab)' },
            { id: 'webhooks' as const, label: 'Webhooks' },
            { id: 'zapier' as const, label: 'Zapier / n8n' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 text-xs font-medium ${activeTab === t.id ? 'text-white bg-slate-800 border-b-2 border-purple-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === 'ekyte' && (
            <>
              <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                <p className="text-[11px] text-blue-300">
                  <b>Ekyte / mkt.lab</b> tem API oficial. Configure apiKey + companyId para sincronizar tasks diretamente (sem browser automation).
                </p>
                <p className="text-[10px] text-slate-500 mt-1.5">
                  Obtenha em: app.ekyte.com → <b>Minha Empresa</b> → aba <b>AVANCADO</b>
                </p>
              </div>

              {ekyteConfigured ? (
                <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400" />
                    <span className="text-xs text-emerald-400">Ekyte conectado</span>
                  </div>
                  <button onClick={handleClearEkyte} className="text-[10px] text-red-400 hover:text-red-300">
                    Desconectar
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-1.5">
                      <Key size={12} />
                      API Key
                    </label>
                    <input
                      type="password"
                      value={ekyteApiKey}
                      onChange={(e) => setEkyteApiKey(e.target.value)}
                      placeholder="xyz..."
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-600 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 mb-1.5 block">Company ID</label>
                    <input
                      type="text"
                      value={ekyteCompanyId}
                      onChange={(e) => setEkyteCompanyId(e.target.value)}
                      placeholder="1234"
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-600"
                    />
                  </div>
                  <button
                    onClick={handleSaveEkyte}
                    className="w-full py-2 text-xs text-white bg-blue-600 rounded-lg hover:bg-blue-500"
                  >
                    Conectar Ekyte
                  </button>
                </>
              )}

              <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500">
                <p className="font-semibold text-slate-400 mb-1">O que e possivel apos conectar:</p>
                <ul className="ml-3 space-y-0.5 list-disc">
                  <li>Criar tasks no Ekyte direto das Kanban cards</li>
                  <li>Sincronizar sprints</li>
                  <li>Puxar contextos de projetos</li>
                  <li>Bulk import de tasks</li>
                </ul>
              </div>
            </>
          )}

          {activeTab === 'webhooks' && (
            <>
              <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                <p className="text-[11px] text-purple-300">
                  Envie eventos para Slack, Discord, Zapier, n8n, ou qualquer endpoint HTTP.
                </p>
              </div>

              {webhooks.map((w) => (
                <div key={w.id} className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Zap size={12} className="text-purple-400" />
                      <span className="text-xs font-semibold text-slate-200">{w.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded">{w.type}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleTestWebhook(w)} className="text-[10px] text-blue-400 hover:text-blue-300">
                        Testar
                      </button>
                      <button onClick={() => handleDeleteWebhook(w.id)} className="text-slate-500 hover:text-red-400">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">{w.url}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {w.events.map((e) => (
                      <span key={e} className="text-[9px] px-1.5 py-0.5 bg-purple-500/10 text-purple-300 rounded">{e}</span>
                    ))}
                  </div>
                </div>
              ))}

              {showNewWebhook ? (
                <div className="p-3 bg-slate-900/70 border border-slate-700 rounded-lg space-y-2">
                  <input
                    type="text"
                    value={newWebhook.name ?? ''}
                    onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                    placeholder="Nome (ex: Slack #marketing)"
                    className="w-full px-2 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200"
                  />
                  <select
                    value={newWebhook.type}
                    onChange={(e) => setNewWebhook({ ...newWebhook, type: e.target.value as any })}
                    className="w-full px-2 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200"
                  >
                    <option value="slack">Slack Webhook</option>
                    <option value="discord">Discord Webhook</option>
                    <option value="zapier">Zapier Webhook</option>
                    <option value="n8n">n8n Webhook</option>
                    <option value="email">Email (mailto)</option>
                    <option value="generic">Generic HTTP</option>
                  </select>
                  <input
                    type="url"
                    value={newWebhook.url ?? ''}
                    onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                    placeholder={newWebhook.type === 'email' ? 'destino@email.com' : 'https://hooks.slack.com/...'}
                    className="w-full px-2 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono"
                  />
                  <div>
                    <p className="text-[10px] text-slate-500 mb-1">Eventos:</p>
                    <div className="flex flex-wrap gap-1">
                      {EVENT_OPTIONS.map((opt) => (
                        <label key={opt.value} className="flex items-center gap-1 text-[10px] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newWebhook.events?.includes(opt.value)}
                            onChange={(e) => {
                              const events = new Set(newWebhook.events ?? []);
                              if (e.target.checked) events.add(opt.value);
                              else events.delete(opt.value);
                              setNewWebhook({ ...newWebhook, events: Array.from(events) });
                            }}
                            className="w-3 h-3 accent-purple-500"
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={handleSaveWebhook} className="flex-1 py-1.5 text-xs bg-purple-600 text-white rounded hover:bg-purple-500">
                      Salvar
                    </button>
                    <button onClick={() => setShowNewWebhook(false)} className="flex-1 py-1.5 text-xs bg-slate-700 text-slate-300 rounded hover:bg-slate-600">
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewWebhook(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-purple-400 bg-purple-500/10 rounded-lg hover:bg-purple-500/20"
                >
                  <Plus size={12} />
                  Adicionar webhook
                </button>
              )}
            </>
          )}

          {activeTab === 'zapier' && (
            <>
              <div className="p-3 bg-gradient-to-br from-orange-500/10 to-purple-500/10 border border-orange-500/20 rounded-lg">
                <p className="text-[11px] text-orange-300 mb-2">
                  <b>Zapier / n8n</b> - conecte o V4 PIT WALL a 5000+ apps via Zapier (ou self-hosted via n8n).
                </p>
                <a
                  href="https://zapier.com/mcp/ekyte"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-orange-300 hover:text-orange-200"
                >
                  <ExternalLink size={10} />
                  Ekyte MCP Server no Zapier
                </a>
              </div>

              <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
                <p className="text-[11px] font-semibold text-slate-300 mb-2">Como conectar:</p>
                <ol className="space-y-1.5 text-[10px] text-slate-400 ml-3 list-decimal">
                  <li>Em zapier.com, crie um novo Zap</li>
                  <li>Trigger: "Webhooks by Zapier" → "Catch Hook"</li>
                  <li>Copie a URL gerada pelo Zapier</li>
                  <li>Na aba Webhooks (ao lado), cole essa URL e escolha o evento</li>
                  <li>No Zapier, configure a acao (Gmail, Notion, Slack, etc.)</li>
                </ol>
              </div>

              <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
                <p className="text-[11px] font-semibold text-slate-300 mb-2">MCP via Claude Code:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-slate-950 text-[10px] text-emerald-300 rounded font-mono overflow-x-auto">
                    claude mcp add ekyte-zapier zapier-mcp-url
                  </code>
                  <button onClick={copyMcpCommand} className="p-1.5 text-slate-400 hover:text-slate-200">
                    <Copy size={12} />
                  </button>
                </div>
              </div>

              <div className="p-2 bg-amber-500/5 border border-amber-500/20 rounded-lg flex items-start gap-2">
                <AlertTriangle size={11} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-300">
                  Webhooks acionados em CLIENT-SIDE. Para producao enterprise com maior confiabilidade, considere mover para Edge Function do Supabase.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2 px-4 py-3 border-t border-slate-700 bg-[#111118]">
          <button onClick={onClose} className="flex-1 px-3 py-2 text-xs text-slate-400 bg-slate-800 rounded-lg hover:bg-slate-700">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
