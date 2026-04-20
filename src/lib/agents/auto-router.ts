/**
 * Auto-Router do Agente Mestre (Agent 01).
 * Analisa a mensagem do usuario e sugere/seleciona automaticamente o agente mais adequado.
 */

import type { Agent } from './types';
import { AGENTS } from './agents-data';
import { routeQuery } from './routing-table';

interface AgentScore {
  agent: Agent;
  score: number;
  reason: string;
}

/**
 * Scores each agent based on keyword matching in the user query.
 * Returns sorted list (highest score first).
 */
export function scoreAgents(query: string): AgentScore[] {
  const q = query.toLowerCase();

  // Get baseline routing suggestion
  const routed = routeQuery(query);

  const scores: AgentScore[] = AGENTS.map((agent) => {
    let score = 0;
    const matches: string[] = [];

    // Match agent name, area, frameworks, tools
    const searchableText = [
      agent.name.toLowerCase(),
      agent.area.toLowerCase(),
      agent.frameworks.toLowerCase(),
      agent.tools.toLowerCase(),
      agent.kpis.toLowerCase(),
      agent.quickActions.join(' ').toLowerCase(),
    ].join(' ');

    // Weighted keyword checks
    const keywords = [
      // Agent 01
      { words: ['diagnostico', 'estrategia', 'priorizacao', 'gargalo', 'toc', 'ice', 'aarrr'], agentId: '01', weight: 10 },
      // Agent 02
      { words: ['sprint', 'okr', 'backlog', 'raci', 'scrum', 'kanban', 'retrospectiva'], agentId: '02', weight: 10 },
      // Agent 03
      { words: ['google ads', 'search ads', 'pmax', 'performance max', 'shopping', 'quality score', 'adwords'], agentId: '03', weight: 10 },
      // Agent 04
      { words: ['meta ads', 'facebook ads', 'instagram ads', 'lookalike', 'cbo', 'abo', 'capi'], agentId: '04', weight: 10 },
      // Agent 05
      { words: ['criativo de anuncio', 'banner', 'anuncio visual', 'pack criativo', 'brief criativo'], agentId: '05', weight: 10 },
      // Agent 06
      { words: ['design social', 'brand', 'identidade visual', 'logo', 'manual de marca'], agentId: '06', weight: 10 },
      // Agent 07
      { words: ['calendario editorial', 'legenda', 'hashtag', 'instagram post', 'linkedin post', 'tiktok'], agentId: '07', weight: 10 },
      // Agent 08
      { words: ['landing page copy', 'headline', 'cta', 'copy de vendas', 'copywriting'], agentId: '08', weight: 10 },
      // Agent 09
      { words: ['blog', 'artigo', 'email', 'ebook', 'newsletter', 'case study', 'conteudo'], agentId: '09', weight: 10 },
      // Agent 10
      { words: ['automacao', 'fluxo de nutricao', 'lead scoring', 'webhook', 'zapier', 'make.com'], agentId: '10', weight: 10 },
      // Agent 11
      { words: ['crm', 'pipeline', 'vendas', 'forecast', 'bant', 'prospeccao', 'sdr'], agentId: '11', weight: 10 },
      // Agent 12
      { words: ['gtm', 'ga4', 'google tag manager', 'tracking', 'landing page', 'dev web'], agentId: '12', weight: 10 },
      // Agent 13
      { words: ['dashboard', 'bi', 'business intelligence', 'atribuicao', 'looker', 'power bi', 'cohort'], agentId: '13', weight: 10 },
      // Agent 14
      { words: ['seo', 'keyword research', 'link building', 'organico', 'e-e-a-t'], agentId: '14', weight: 10 },
      // Agent 15
      { words: ['video', 'roteiro', 'youtube', 'reels', 'tiktok video', 'shorts'], agentId: '15', weight: 10 },
      // Agent 16
      { words: ['cro', 'teste a/b', 'heatmap', 'ux', 'conversao', 'lift', 'hotjar'], agentId: '16', weight: 10 },
    ];

    keywords.forEach(({ words, agentId, weight }) => {
      if (agent.id === agentId) {
        words.forEach((w) => {
          if (q.includes(w)) {
            score += weight;
            matches.push(w);
          }
        });
      }
    });

    // Secondary: match against agent searchable text
    const queryWords = q.split(/\s+/).filter((w) => w.length > 3);
    queryWords.forEach((qw) => {
      if (searchableText.includes(qw)) {
        score += 2;
      }
    });

    // Boost if routingTable matched this agent
    if (routed.includes(agent.id)) score += 5;

    const reason =
      matches.length > 0
        ? `Detectou: ${matches.slice(0, 3).join(', ')}`
        : score > 5
          ? 'Area relacionada a consulta'
          : 'Baixa relevancia';

    return { agent, score, reason };
  });

  return scores.sort((a, b) => b.score - a.score);
}

/**
 * Returns the best agent for the query. If confidence is low, falls back to Agent 01 (Mestre).
 */
export function autoSelectAgent(query: string): { agent: Agent; confidence: 'high' | 'medium' | 'low'; reason: string } {
  const scored = scoreAgents(query);
  const top = scored[0];

  if (!top || top.score === 0) {
    return {
      agent: AGENTS[0],
      confidence: 'low',
      reason: 'Nao foi possivel detectar area especifica. Roteando para Mestre.',
    };
  }

  const confidence: 'high' | 'medium' | 'low' =
    top.score >= 15 ? 'high' : top.score >= 8 ? 'medium' : 'low';

  return { agent: top.agent, confidence, reason: top.reason };
}

/**
 * Suggests a sequence of agents that should handle this request collaboratively.
 * Uses inter-agent triggers to chain agents.
 */
export function suggestAgentChain(query: string): Agent[] {
  const primary = autoSelectAgent(query);
  const chain: Agent[] = [primary.agent];

  const q = query.toLowerCase();

  // Chain rules based on common marketing workflows
  const chainRules: { trigger: string; append: string[] }[] = [
    { trigger: 'campanha completa', append: ['03', '04', '05', '08', '12'] }, // traffic + creative + copy + LP
    { trigger: 'lancamento', append: ['01', '08', '09', '04', '05', '07'] },
    { trigger: 'funil', append: ['01', '08', '12', '10', '11'] },
    { trigger: 'crescer organico', append: ['14', '09', '07', '15'] },
    { trigger: 'audit site', append: ['14', '16', '12'] },
    { trigger: 'relatorio', append: ['13', '01'] },
    { trigger: 'landing page', append: ['08', '12', '16'] },
    { trigger: 'email marketing', append: ['09', '10'] },
  ];

  for (const rule of chainRules) {
    if (q.includes(rule.trigger)) {
      rule.append.forEach((id) => {
        if (!chain.find((a) => a.id === id)) {
          const agent = AGENTS.find((a) => a.id === id);
          if (agent) chain.push(agent);
        }
      });
      break;
    }
  }

  return chain;
}

/**
 * Smart suggestion: given the last agent used and the conversation context,
 * recommends the next agent based on inter-agent triggers.
 */
export function suggestNextAgent(currentAgentId: string, lastResponse: string): Agent | null {
  const content = lastResponse.toLowerCase();

  const transitions: Record<string, { conditions: string[]; nextId: string; reason: string }[]> = {
    '01': [
      { conditions: ['criativo', 'visual', 'banner'], nextId: '05', reason: 'Diagnostico menciona criativos' },
      { conditions: ['seo', 'organico', 'keyword'], nextId: '14', reason: 'Oportunidade SEO identificada' },
      { conditions: ['conversao', 'cro', 'landing'], nextId: '16', reason: 'Otimizacao de conversao necessaria' },
      { conditions: ['dados', 'dashboard', 'kpi'], nextId: '13', reason: 'Requer analise de dados' },
    ],
    '03': [
      { conditions: ['criativo', 'banner', 'visual'], nextId: '05', reason: 'Precisa de criativos para campanha' },
      { conditions: ['landing page', 'lp'], nextId: '12', reason: 'LP dedicada para QS' },
      { conditions: ['copy', 'anuncio texto'], nextId: '08', reason: 'Copy de anuncios' },
    ],
    '04': [
      { conditions: ['fatigou', 'refresh', 'novo criativo'], nextId: '05', reason: 'Criativos fatigados' },
      { conditions: ['copy', 'texto anuncio'], nextId: '08', reason: 'Novo angulo de copy' },
      { conditions: ['lookalike', 'retargeting'], nextId: '10', reason: 'Configuracao de audiencias' },
    ],
    '14': [
      { conditions: ['artigo', 'conteudo', 'blog'], nextId: '09', reason: 'Producao de conteudo SEO' },
      { conditions: ['landing page', 'pagina otimizada'], nextId: '12', reason: 'LP otimizada para SEO' },
    ],
    '11': [
      { conditions: ['lead frio', 'nao converte'], nextId: '03', reason: 'Revisar trafego' },
      { conditions: ['nutricao', 'email'], nextId: '09', reason: 'Sequencia de emails' },
    ],
    '13': [
      { conditions: ['bounce', 'abandono'], nextId: '16', reason: 'CRO para reduzir abandono' },
      { conditions: ['trafego baixo', 'acquisicao'], nextId: '14', reason: 'SEO para aumentar organico' },
    ],
  };

  const possibleTransitions = transitions[currentAgentId];
  if (!possibleTransitions) return null;

  for (const t of possibleTransitions) {
    const matchCount = t.conditions.filter((c) => content.includes(c)).length;
    if (matchCount > 0) {
      const agent = AGENTS.find((a) => a.id === t.nextId);
      if (agent) return agent;
    }
  }

  return null;
}
