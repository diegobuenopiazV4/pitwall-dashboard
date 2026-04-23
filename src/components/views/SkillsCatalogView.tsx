import React, { useState } from 'react';
import { Sparkles, Zap, Newspaper, FileText, Rocket, CheckSquare, LineChart, Megaphone, Mail, Search, Target, Users, Database, Calendar, Workflow, BookOpen, ExternalLink, Eye } from 'lucide-react';
import { useAppStore } from '../../stores/app-store';
import { V4Logo } from '../brand/V4Logo';

type SkillStatus = 'integrated' | 'link' | 'quickaction' | 'coming-soon';

interface SkillCard {
  id: string;
  category: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accent: string;
  status: SkillStatus;
  action?: () => void;
  link?: string;
  prompt?: string;
  priority: 'P1' | 'P2' | 'P3';
}

export const SkillsCatalogView: React.FC = () => {
  const { setViewMode, selectAgent, setCommandPaletteOpen } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'integrated' | 'priority'>('all');

  const SKILLS: SkillCard[] = [
    // INTEGRADAS (views completas)
    {
      id: 'checkin',
      category: 'Relatorios',
      name: 'Check-in Mensal',
      description: 'Dashboard HTML glassmorphism com 20 frameworks e dados Meta/Google Ads. Pedido para cliente.',
      icon: Sparkles,
      accent: '#a855f7',
      status: 'integrated',
      action: () => setViewMode('checkin'),
      priority: 'P1',
    },
    {
      id: 'trafego',
      category: 'Relatorios',
      name: 'Relatorio Trafego Pago',
      description: 'Upload de CSVs Meta/Google Ads, Claude/Gemini analisa e gera relatorio HTML interativo com Chart.js.',
      icon: Zap,
      accent: '#f59420',
      status: 'integrated',
      action: () => setViewMode('trafego'),
      priority: 'P1',
    },
    {
      id: 'clipping',
      category: 'Rapport',
      name: 'Clipping de Rapport',
      description: 'Curadoria de noticias + tendencias + mensagens WhatsApp prontas para cliente.',
      icon: Newspaper,
      accent: '#3b82f6',
      status: 'integrated',
      action: () => setViewMode('clipping'),
      priority: 'P1',
    },
    {
      id: 'criativos',
      category: 'Producao',
      name: 'Criativos Ads \u2192 DOCX',
      description: 'Monte ou cole copies, gera documento .docx no template V4 (headers vermelho, Montserrat).',
      icon: FileText,
      accent: '#10b981',
      status: 'integrated',
      action: () => setViewMode('criativos'),
      priority: 'P2',
    },
    {
      id: 'ekyte',
      category: 'Producao',
      name: 'Ekyte Tasks Bookmarklet',
      description: 'Descreva tasks em texto livre, gera bookmarklet arrastavel para criar direto no mkt.lab.',
      icon: Rocket,
      accent: '#e4243d',
      status: 'integrated',
      action: () => setViewMode('ekyte'),
      priority: 'P2',
    },

    // LINK EXTERNO INTEGRADO
    {
      id: 'pauta-social',
      category: 'Rapport',
      name: 'Aprovacao de Pauta Social',
      description: 'Ferramenta V4 Ruston para o cliente aprovar/pedir alteracoes em pauta de social media.',
      icon: CheckSquare,
      accent: '#e4243d',
      status: 'link',
      link: 'https://v4ruston-aprova.vercel.app/',
      priority: 'P1',
    },

    // QUICK ACTIONS - disponiveis via agentes
    {
      id: 'performance-report',
      category: 'Relatorios',
      name: 'Performance Report',
      description: 'Relatorio multi-canal com KPIs, tendencias, wins/misses, proximos passos priorizados. Via Agente 13 (Analista).',
      icon: LineChart,
      accent: '#f59420',
      status: 'quickaction',
      action: () => { selectAgent('13'); setViewMode('chat'); },
      prompt: 'Gere um performance report completo com: KPIs do periodo, tendencias observadas, 3 wins e 3 misses, e proximos passos P1/P2/P3 para o proximo ciclo.',
      priority: 'P1',
    },
    {
      id: 'campaign-plan',
      category: 'Planejamento',
      name: 'Campaign Plan',
      description: 'Brief completo de campanha: objetivos, audiencia, messaging, calendario semanal, KPIs. Via Gestor de Projetos.',
      icon: Target,
      accent: '#a855f7',
      status: 'quickaction',
      action: () => { selectAgent('02'); setViewMode('chat'); },
      prompt: 'Crie um campaign plan estruturado com: objetivos SMART, perfil de audiencia (ICP), messaging principal + 3 variantes, cronograma semanal detalhado, KPIs de sucesso e risk assessment.',
      priority: 'P1',
    },
    {
      id: 'seo-audit',
      category: 'Aquisicao',
      name: 'SEO Audit',
      description: 'Auditoria completa: keywords, on-page, technical, gaps vs concorrente, plano 90 dias. Via Agente SEO (14).',
      icon: Search,
      accent: '#06b6d4',
      status: 'quickaction',
      action: () => { selectAgent('14'); setViewMode('chat'); },
      prompt: 'Realize um SEO audit completo com: 1) analise on-page da home, 2) gap de keywords vs top 3 concorrentes, 3) issues tecnicas prioritarias, 4) plano 90 dias estruturado P1/P2/P3.',
      priority: 'P2',
    },
    {
      id: 'email-sequence',
      category: 'CRM',
      name: 'Email Sequence',
      description: 'Sequencias de email (onboarding, nurture, win-back) com timing, branching, benchmarks. Via Agente CRM (11).',
      icon: Mail,
      accent: '#8b5cf6',
      status: 'quickaction',
      action: () => { selectAgent('11'); setViewMode('chat'); },
      prompt: 'Desenhe uma sequencia completa de email marketing com: objetivo claro, numero de emails (5-8), timing entre eles, assunto + preview + CTA de cada, branching por comportamento, benchmarks esperados (open/click/conversion), e sugestoes de A/B test.',
      priority: 'P2',
    },
    {
      id: 'competitive-brief',
      category: 'Estrategia',
      name: 'Competitive Brief',
      description: 'Pesquisa + comparativo de concorrentes, gaps de posicionamento, oportunidades e ameacas.',
      icon: Users,
      accent: '#ef4444',
      status: 'quickaction',
      action: () => { selectAgent('01'); setViewMode('chat'); },
      prompt: 'Monte um competitive brief estruturado sobre os 3 principais concorrentes: posicionamento, messaging, canais de aquisicao, pricing percebido, points of parity vs differentiation, gaps de mercado ainda sem dono, e 3 messaging angles que a V4 pode atacar.',
      priority: 'P2',
    },

    // COMING SOON (roadmap)
    {
      id: 'status-report-kanban',
      category: 'Gestao',
      name: 'Status Report (Kanban)',
      description: 'Gera status report semanal automatico do kanban com green/yellow/red por projeto.',
      icon: Database,
      accent: '#64748b',
      status: 'coming-soon',
      priority: 'P2',
    },
    {
      id: 'calendar-reunioes',
      category: 'Produtividade',
      name: 'Agendar Reuniao (Google Calendar)',
      description: 'Integracao com Google Calendar para agendar reunioes direto do kanban ou chat.',
      icon: Calendar,
      accent: '#64748b',
      status: 'coming-soon',
      priority: 'P2',
    },
    {
      id: 'scheduled-prompts',
      category: 'Produtividade',
      name: 'Prompts Agendados (Cron)',
      description: 'Agende prompts para rodar automaticamente (ex: relatorio semanal toda segunda).',
      icon: Workflow,
      accent: '#64748b',
      status: 'coming-soon',
      priority: 'P2',
    },
    {
      id: 'runbook-onboarding',
      category: 'Gestao',
      name: 'Runbook de Onboarding',
      description: 'Gera runbooks operacionais para onboarding de novos clientes/colaboradores.',
      icon: BookOpen,
      accent: '#64748b',
      status: 'coming-soon',
      priority: 'P3',
    },
    {
      id: 'brand-review',
      category: 'Producao',
      name: 'Brand Review',
      description: 'Review automatico de conteudo contra guidelines de voz/tom/messaging do cliente.',
      icon: Megaphone,
      accent: '#64748b',
      status: 'coming-soon',
      priority: 'P3',
    },
  ];

  const filtered = SKILLS.filter((s) => {
    if (filter === 'integrated') return s.status === 'integrated' || s.status === 'link';
    if (filter === 'priority') return s.priority === 'P1';
    return true;
  });

  const byCategory = filtered.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, SkillCard[]>);

  const integratedCount = SKILLS.filter((s) => s.status === 'integrated' || s.status === 'link').length;
  const totalCount = SKILLS.length;

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0f] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <div className="relative mb-6 p-6 rounded-2xl bg-gradient-to-br from-[#e4243d]/10 via-[#111118] to-[#1a1a24] border border-[#e4243d]/20 overflow-hidden">
          <div className="relative z-10">
            <V4Logo size="sm" showSubtitle={false} />
            <h1 className="text-2xl font-bold text-slate-100 mt-3 tracking-tight flex items-center gap-2">
              Catalogo de Skills
              <span className="text-[11px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">
                {integratedCount}/{totalCount} integradas
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Todas as capacidades do V4 PIT WALL. Algumas sao views dedicadas, outras sao quick actions em agentes especificos.
            </p>
          </div>
          <div className="absolute top-0 right-0 opacity-5 text-[160px] font-black text-[#e4243d] leading-none pointer-events-none">
            \u2655
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 mb-6 p-1 bg-slate-900 rounded-lg border border-slate-800 w-fit">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 text-xs rounded-md transition-colors ${
              filter === 'all' ? 'bg-[#e4243d] text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todas ({totalCount})
          </button>
          <button
            onClick={() => setFilter('integrated')}
            className={`px-4 py-1.5 text-xs rounded-md transition-colors ${
              filter === 'integrated' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ja no ar ({integratedCount})
          </button>
          <button
            onClick={() => setFilter('priority')}
            className={`px-4 py-1.5 text-xs rounded-md transition-colors ${
              filter === 'priority' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Prioridade P1
          </button>
        </div>

        {/* Grid por categoria */}
        {Object.entries(byCategory).map(([cat, skills]) => (
          <div key={cat} className="mb-8">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-[#e4243d] rounded" />
              {cat}
              <span className="text-slate-700">·</span>
              <span className="text-slate-600 font-normal">{skills.length} skill(s)</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {skills.map((skill) => {
                const Icon = skill.icon;
                const isActive = skill.status === 'integrated' || skill.status === 'link';
                const isQuickAction = skill.status === 'quickaction';
                const isComingSoon = skill.status === 'coming-soon';

                return (
                  <div
                    key={skill.id}
                    className={`group relative p-4 rounded-xl border transition-all ${
                      isComingSoon
                        ? 'bg-slate-900/30 border-slate-800 opacity-60'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-600 hover:bg-slate-900 cursor-pointer'
                    }`}
                    onClick={() => {
                      if (isComingSoon) return;
                      if (skill.link) {
                        window.open(skill.link, '_blank', 'noopener');
                      } else if (skill.action) {
                        skill.action();
                        if (skill.prompt) {
                          setTimeout(() => {
                            const evt = new CustomEvent('pitwall:inject-prompt', { detail: { prompt: skill.prompt } });
                            window.dispatchEvent(evt);
                          }, 150);
                        }
                      }
                    }}
                  >
                    {/* Status badge */}
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      {skill.priority === 'P1' && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded font-bold">P1</span>
                      )}
                      {skill.priority === 'P2' && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded font-bold">P2</span>
                      )}
                      {skill.status === 'integrated' && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded flex items-center gap-0.5">
                          <span className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" />
                          Ativa
                        </span>
                      )}
                      {skill.status === 'link' && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded">Externa</span>
                      )}
                      {isQuickAction && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded">Quick</span>
                      )}
                      {isComingSoon && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-slate-700 text-slate-400 rounded">Em breve</span>
                      )}
                    </div>

                    {/* Icon */}
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                      style={{ background: `${skill.accent}15`, color: skill.accent }}
                    >
                      <Icon size={16} />
                    </div>

                    {/* Name + Description */}
                    <h3 className="text-sm font-semibold text-slate-100 mb-1.5 pr-16">{skill.name}</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{skill.description}</p>

                    {/* Action hint */}
                    {!isComingSoon && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/50 text-[10px]">
                        <span className="text-slate-500">
                          {skill.status === 'integrated' && 'Abre a view'}
                          {skill.status === 'link' && 'Ferramenta externa'}
                          {isQuickAction && 'Seleciona agente + prompt'}
                        </span>
                        <span className="text-slate-400 flex items-center gap-1 group-hover:text-slate-200">
                          {skill.link ? <ExternalLink size={10} /> : <Eye size={10} />}
                          {skill.link ? 'Abrir' : 'Usar'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Footer com dica */}
        <div className="mt-8 p-4 bg-slate-900/30 rounded-xl border border-slate-800 text-center">
          <p className="text-xs text-slate-400">
            <kbd className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded font-mono">Ctrl+Shift+P</kbd>
            {' '}abre Command Palette para acessar qualquer skill rapidamente
          </p>
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="mt-2 text-[11px] text-[#ff4d5a] hover:text-[#e4243d] underline"
          >
            Abrir Command Palette agora
          </button>
        </div>
      </div>
    </div>
  );
};
