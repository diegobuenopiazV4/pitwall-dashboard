import React, { useMemo } from 'react';
import { TrendingUp, MessageSquare, Users, Bot, CheckSquare, Calendar, Zap, Target } from 'lucide-react';
import { useAppStore } from '../../stores/app-store';
import { AGENTS } from '../../lib/agents/agents-data';

export const AnalyticsView: React.FC = () => {
  const { messages, clients, tasks, agents, sprintGoals } = useAppStore();

  const stats = useMemo(() => {
    const allMessages = Object.values(messages).flat();
    const userMessages = allMessages.filter((m) => m.role === 'user');
    const botMessages = allMessages.filter((m) => m.role === 'bot');

    // Agent usage
    const agentCounts = new Map<string, number>();
    botMessages.forEach((m) => {
      if (m.agentId) agentCounts.set(m.agentId, (agentCounts.get(m.agentId) ?? 0) + 1);
    });
    const topAgents = Array.from(agentCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => ({ agent: AGENTS.find((a) => a.id === id), count }));

    // Client activity (from conversation keys)
    const clientCounts = new Map<string, number>();
    Object.entries(messages).forEach(([key, msgs]) => {
      const parts = key.split('_');
      const clientId = parts[1];
      if (clientId && clientId !== 'general') {
        clientCounts.set(clientId, (clientCounts.get(clientId) ?? 0) + msgs.length);
      }
    });
    const topClients = Array.from(clientCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => ({ client: clients.find((c) => c.id === id), count }));

    // STEP distribution
    const stepDist = { Saber: 0, Ter: 0, Executar: 0, Potencializar: 0 };
    clients.forEach((c) => { stepDist[c.step]++; });

    // Health distribution
    const healthDist = { green: 0, yellow: 0, red: 0 };
    clients.forEach((c) => { healthDist[c.health]++; });

    // Pilar distribution (from clients)
    const pilarDist = { Aquisicao: 0, Engajamento: 0, Monetizacao: 0, Retencao: 0, Todos: 0 };
    clients.forEach((c) => { pilarDist[c.pilar as keyof typeof pilarDist]++; });

    // Tasks metrics
    const tasksByPriority = {
      P1: tasks.filter((t) => !t.done && t.priority === 'P1').length,
      P2: tasks.filter((t) => !t.done && t.priority === 'P2').length,
      P3: tasks.filter((t) => !t.done && t.priority === 'P3').length,
    };
    const completionRate = tasks.length > 0 ? Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100) : 0;

    // Avg message length
    const avgBotLength = botMessages.length > 0
      ? Math.round(botMessages.reduce((sum, m) => sum + m.content.length, 0) / botMessages.length)
      : 0;

    // Conversations
    const conversations = Object.keys(messages).filter((k) => messages[k].length > 0).length;

    return {
      totalMessages: allMessages.length,
      userMessages: userMessages.length,
      botMessages: botMessages.length,
      topAgents,
      topClients,
      stepDist,
      healthDist,
      pilarDist,
      tasksByPriority,
      completionRate,
      totalTasks: tasks.length,
      tasksDone: tasks.filter((t) => t.done).length,
      avgBotLength,
      conversations,
      totalClients: clients.length,
      agentsUsed: agentCounts.size,
      totalAgents: agents.length,
    };
  }, [messages, clients, tasks, agents]);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0f] overflow-y-auto">
      <div className="px-4 py-3 border-b border-slate-800 bg-[#111118]">
        <h2 className="text-sm font-semibold text-slate-200">Analytics Dashboard</h2>
        <p className="text-[10px] text-slate-500">Metricas de uso e performance do sistema</p>
      </div>

      <div className="p-4 space-y-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard icon={<MessageSquare size={14} />} label="Mensagens" value={stats.totalMessages} subtitle={`${stats.conversations} conversas`} color="blue" />
          <KpiCard icon={<Bot size={14} />} label="Agentes Ativos" value={`${stats.agentsUsed}/${stats.totalAgents}`} subtitle="de 16 agentes" color="purple" />
          <KpiCard icon={<Users size={14} />} label="Clientes" value={stats.totalClients} subtitle="em gerenciamento" color="emerald" />
          <KpiCard icon={<CheckSquare size={14} />} label="Conclusao" value={`${stats.completionRate}%`} subtitle={`${stats.tasksDone}/${stats.totalTasks} tarefas`} color="amber" />
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top Agents */}
          <Card title="Top 5 Agentes Utilizados" icon={<TrendingUp size={12} />}>
            {stats.topAgents.length === 0 ? (
              <EmptyState text="Envie mensagens para ver estatisticas" />
            ) : (
              <div className="space-y-2">
                {stats.topAgents.map(({ agent, count }) => {
                  if (!agent) return null;
                  const max = stats.topAgents[0]?.count ?? 1;
                  const pct = (count / max) * 100;
                  return (
                    <div key={agent.id} className="group">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-1.5">
                          <span style={{ color: agent.color }}>{agent.icon}</span>
                          <span className="text-xs text-slate-300">{agent.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 tabular-nums">{count} msgs</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: agent.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Top Clients */}
          <Card title="Top 5 Clientes Ativos" icon={<Users size={12} />}>
            {stats.topClients.length === 0 ? (
              <EmptyState text="Selecione um cliente e converse" />
            ) : (
              <div className="space-y-2">
                {stats.topClients.map(({ client, count }) => {
                  if (!client) return null;
                  const max = stats.topClients[0]?.count ?? 1;
                  const pct = (count / max) * 100;
                  const color = client.health === 'green' ? '#10b981' : client.health === 'yellow' ? '#f59e0b' : '#ef4444';
                  return (
                    <div key={client.id}>
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                          <span className="text-xs text-slate-300">{client.name}</span>
                          <span className="text-[9px] text-slate-600">{client.step}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 tabular-nums">{count} msgs</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* STEP distribution */}
          <Card title="Distribuicao STEP" icon={<Target size={12} />}>
            <div className="grid grid-cols-4 gap-1.5">
              {(['Saber', 'Ter', 'Executar', 'Potencializar'] as const).map((phase) => {
                const count = stats.stepDist[phase];
                const pct = stats.totalClients > 0 ? Math.round((count / stats.totalClients) * 100) : 0;
                const color =
                  phase === 'Saber' ? 'bg-blue-500/20 text-blue-400' :
                  phase === 'Ter' ? 'bg-amber-500/20 text-amber-400' :
                  phase === 'Executar' ? 'bg-emerald-500/20 text-emerald-400' :
                  'bg-purple-500/20 text-purple-400';
                return (
                  <div key={phase} className={`p-2 rounded-md ${color}`}>
                    <div className="text-lg font-bold tabular-nums">{count}</div>
                    <div className="text-[9px] opacity-80">{phase}</div>
                    <div className="text-[9px] opacity-60">{pct}%</div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Task Distribution */}
          <Card title="Tarefas por Prioridade" icon={<Zap size={12} />}>
            <div className="grid grid-cols-3 gap-1.5">
              {(['P1', 'P2', 'P3'] as const).map((p) => {
                const count = stats.tasksByPriority[p];
                const color =
                  p === 'P1' ? 'bg-red-500/20 text-red-400' :
                  p === 'P2' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-blue-500/20 text-blue-400';
                return (
                  <div key={p} className={`p-2 rounded-md ${color}`}>
                    <div className="text-lg font-bold tabular-nums">{count}</div>
                    <div className="text-[9px] opacity-80">{p} pendentes</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 p-2 rounded-md bg-emerald-500/20 text-emerald-400">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold tabular-nums">{stats.tasksDone}</div>
                  <div className="text-[9px] opacity-80">Concluidas</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">{stats.completionRate}%</div>
                  <div className="text-[9px] opacity-80">Taxa conclusao</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Health distribution */}
          <Card title="Health Score dos Clientes" icon={<TrendingUp size={12} />}>
            <div className="space-y-2">
              {(['green', 'yellow', 'red'] as const).map((h) => {
                const count = stats.healthDist[h];
                const pct = stats.totalClients > 0 ? Math.round((count / stats.totalClients) * 100) : 0;
                const label = h === 'green' ? 'Saudavel' : h === 'yellow' ? 'Atencao' : 'Critico';
                const bg = h === 'green' ? 'bg-emerald-500' : h === 'yellow' ? 'bg-amber-400' : 'bg-red-500';
                return (
                  <div key={h}>
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${bg}`} />
                        <span className="text-xs text-slate-300">{label}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 tabular-nums">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${bg} transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Sprint summary */}
          <Card title="Sprint Ativa" icon={<Calendar size={12} />}>
            {sprintGoals.length === 0 ? (
              <EmptyState text="Configure metas na aba Sprint" />
            ) : (
              <div>
                <p className="text-[11px] text-slate-400 mb-2">{sprintGoals.length} metas ativas</p>
                <div className="space-y-1">
                  {sprintGoals.slice(0, 5).map((g, i) => (
                    <div key={i} className="text-[10px] text-slate-300 flex items-start gap-1.5">
                      <span className="text-red-500 shrink-0 mt-0.5">•</span>
                      <span>{g}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="text-[10px] text-slate-600 text-center py-2">
          Media de {stats.avgBotLength} caracteres por resposta do agente · {stats.botMessages} respostas geradas
        </div>
      </div>
    </div>
  );
};

const KpiCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  color: 'blue' | 'emerald' | 'amber' | 'purple';
}> = ({ icon, label, value, subtitle, color }) => {
  const colors = {
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
  };
  return (
    <div className={`p-3 rounded-lg border ${colors[color]}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="opacity-80">{icon}</span>
        <span className="text-[9px] uppercase tracking-wider opacity-70">{label}</span>
      </div>
      <div className="text-xl font-bold tabular-nums">{value}</div>
      {subtitle && <div className="text-[9px] opacity-60 mt-0.5">{subtitle}</div>}
    </div>
  );
};

const Card: React.FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="bg-[#111118] border border-slate-800 rounded-lg p-3">
    <div className="flex items-center gap-1.5 mb-3">
      <span className="text-slate-500">{icon}</span>
      <h3 className="text-xs font-semibold text-slate-300">{title}</h3>
    </div>
    {children}
  </div>
);

const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <p className="text-center text-[10px] text-slate-600 py-6">{text}</p>
);
