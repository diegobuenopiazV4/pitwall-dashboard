import React, { useState, useEffect } from 'react';
import { X, DollarSign, Zap, Bot, Users, Calendar, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { computeUsageStats, clearUsageHistory, type UsageStats } from '../../lib/usage/tracker';
import { AGENTS } from '../../lib/agents/agents-data';
import { useAppStore } from '../../stores/app-store';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const UsageDashboardModal: React.FC<Props> = ({ open, onClose }) => {
  const { clients } = useAppStore();
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [usdToBrl, setUsdToBrl] = useState(5.2);

  useEffect(() => {
    if (open) setStats(computeUsageStats(usdToBrl));
  }, [open, usdToBrl]);

  if (!open || !stats) return null;

  const topAgents = Object.entries(stats.byAgent)
    .sort(([, a], [, b]) => b.cost - a.cost)
    .slice(0, 5);

  const topClients = Object.entries(stats.byClient)
    .sort(([, a], [, b]) => b.cost - a.cost)
    .slice(0, 5);

  const topModels = Object.entries(stats.byModel)
    .sort(([, a], [, b]) => b.cost - a.cost)
    .slice(0, 5);

  const maxDaily = Math.max(...stats.last30Days.map((d) => d.cost), 0.01);

  const handleClear = () => {
    if (!confirm('Limpar todo o historico de uso? Esta acao nao pode ser desfeita.')) return;
    clearUsageHistory();
    setStats(computeUsageStats(usdToBrl));
    toast.success('Historico limpo');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-3xl max-h-[90vh] bg-[#1a1a24] border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-emerald-400" />
            <h2 className="text-sm font-semibold text-slate-200">Custos e Uso de Tokens</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Totals */}
          <div className="grid grid-cols-4 gap-2">
            <MetricCard
              icon={<Zap size={12} />}
              label="Total tokens"
              value={stats.totalTokens.toLocaleString()}
              color="blue"
            />
            <MetricCard
              icon={<DollarSign size={12} />}
              label="Custo USD"
              value={`$${stats.totalCostUSD.toFixed(2)}`}
              color="emerald"
            />
            <MetricCard
              icon={<DollarSign size={12} />}
              label={`Custo BRL (${usdToBrl}x)`}
              value={`R$${stats.totalCostBRL.toFixed(2)}`}
              color="amber"
            />
            <MetricCard
              icon={<Bot size={12} />}
              label="Chamadas"
              value={Object.values(stats.byAgent).reduce((s, a) => s + a.count, 0).toString()}
              color="purple"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[10px] text-slate-500">USD/BRL:</label>
            <input
              type="number"
              value={usdToBrl}
              onChange={(e) => setUsdToBrl(parseFloat(e.target.value) || 5.2)}
              step="0.1"
              className="w-16 px-1 py-0.5 text-[10px] bg-slate-900 border border-slate-700 rounded text-slate-200"
            />
          </div>

          {/* Timeline */}
          <Card title="Ultimos 30 dias" icon={<Calendar size={12} />}>
            <div className="flex items-end gap-0.5 h-20">
              {stats.last30Days.map((d) => {
                const h = (d.cost / maxDaily) * 100;
                return (
                  <div
                    key={d.date}
                    className="flex-1 bg-emerald-500/40 hover:bg-emerald-500 transition-colors rounded-t"
                    style={{ height: `${h}%`, minHeight: d.cost > 0 ? '3px' : '1px' }}
                    title={`${d.date}: $${d.cost.toFixed(3)} (${d.tokens} tokens)`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-1 text-[9px] text-slate-600">
              <span>{stats.last30Days[0]?.date.slice(5)}</span>
              <span>{stats.last30Days[stats.last30Days.length - 1]?.date.slice(5)}</span>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card title="Top Agentes (por custo)" icon={<Bot size={12} />}>
              {topAgents.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="space-y-1.5">
                  {topAgents.map(([agentId, data]) => {
                    const agent = AGENTS.find((a) => a.id === agentId);
                    const pct = (data.cost / stats.totalCostUSD) * 100;
                    return (
                      <div key={agentId}>
                        <div className="flex justify-between items-center mb-0.5">
                          <div className="flex items-center gap-1 text-[10px] text-slate-300">
                            <span style={{ color: agent?.color }}>{agent?.icon}</span>
                            {agent?.name ?? agentId}
                          </div>
                          <span className="text-[10px] text-emerald-400 tabular-nums">
                            ${data.cost.toFixed(3)}
                          </span>
                        </div>
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card title="Top Clientes" icon={<Users size={12} />}>
              {topClients.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="space-y-1.5">
                  {topClients.map(([clientId, data]) => {
                    const client = clients.find((c) => c.id === clientId);
                    const pct = (data.cost / stats.totalCostUSD) * 100;
                    return (
                      <div key={clientId}>
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-[10px] text-slate-300">{client?.name ?? 'Geral'}</span>
                          <span className="text-[10px] text-emerald-400 tabular-nums">${data.cost.toFixed(3)}</span>
                        </div>
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card title="Top Modelos" icon={<Bot size={12} />}>
              {topModels.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="space-y-1.5">
                  {topModels.map(([modelId, data]) => {
                    const pct = (data.cost / stats.totalCostUSD) * 100;
                    return (
                      <div key={modelId}>
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-[10px] text-slate-300 truncate">{modelId}</span>
                          <span className="text-[10px] text-emerald-400 tabular-nums">${data.cost.toFixed(3)}</span>
                        </div>
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          <button
            onClick={handleClear}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[10px] text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-md"
          >
            <Trash2 size={11} />
            Limpar historico de uso
          </button>
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string }> = ({ icon, label, value, color }) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
  };
  return (
    <div className={`p-2.5 rounded-lg border ${colors[color]}`}>
      <div className="flex items-center justify-between mb-1">
        <span>{icon}</span>
        <span className="text-[9px] uppercase tracking-wider opacity-70">{label}</span>
      </div>
      <div className="text-sm font-bold tabular-nums">{value}</div>
    </div>
  );
};

const Card: React.FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="bg-[#111118] border border-slate-800 rounded-lg p-3">
    <div className="flex items-center gap-1.5 mb-2">
      <span className="text-slate-500">{icon}</span>
      <h3 className="text-[11px] font-semibold text-slate-300">{title}</h3>
    </div>
    {children}
  </div>
);

const EmptyState: React.FC = () => <p className="text-[10px] text-slate-600 text-center py-3">Nenhum uso registrado ainda</p>;
