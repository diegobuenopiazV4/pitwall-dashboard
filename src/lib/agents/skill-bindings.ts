/**
 * Mapeamento de skills V4 aos 16 agentes.
 * Cada agente tem um conjunto de skills diretamente relacionadas ao seu dominio.
 * Usado por AgentSkillsBar e SkillsCatalog.
 */

import type { ViewMode } from '../../stores/app-store';

export interface SkillBinding {
  /** ID da view (para abrir diretamente) OU 'link' (para abrir URL externa) OU 'prompt' (injetar comando no chat) */
  type: 'view' | 'link' | 'prompt';
  /** Se view: ViewMode; se link: URL; se prompt: prompt text */
  target: string;
  label: string;
  icon: string; // nome do icone lucide (string que AgentSkillsBar renderiza)
  color: string;
  description?: string;
}

/**
 * Skills disponiveis para cada agente, rankeadas por relevancia.
 * Agentes com pilar "Todos" recebem skills generalistas;
 * agentes especializados recebem apenas o que toca seu dominio.
 */
export const AGENT_SKILLS: Record<string, SkillBinding[]> = {
  // 01 - Mestre Estrategista (orquestracao)
  '01': [
    { type: 'view', target: 'skills', label: 'Catalogo de Skills', icon: 'Grid3x3', color: '#94a3b8', description: 'Ver todas as skills' },
    { type: 'prompt', target: 'Monte um competitive brief sobre os 3 principais concorrentes com: posicionamento, messaging, canais, gaps de mercado e 3 messaging angles que podemos atacar.', label: 'Competitive Brief', icon: 'Users', color: '#ef4444' },
    { type: 'prompt', target: 'Crie um campaign plan estruturado com: objetivos SMART, ICP, messaging principal + 3 variantes, cronograma semanal, KPIs de sucesso e risk assessment.', label: 'Campaign Plan', icon: 'Target', color: '#a855f7' },
  ],
  // 02 - Gestor de Projetos
  '02': [
    { type: 'view', target: 'ekyte', label: 'Ekyte Tasks', icon: 'Rocket', color: '#e4243d', description: 'Gerar bookmarklet de tasks' },
    { type: 'prompt', target: 'Gere um status report do sprint atual com: metas alcancadas vs planejadas, green/yellow/red por projeto, riscos identificados e acoes P1/P2/P3 para proxima semana.', label: 'Status Report', icon: 'LineChart', color: '#f59420' },
    { type: 'prompt', target: 'Crie um campaign plan com calendario semanal de 4 semanas, responsaveis RACI, KPIs intermediarios e checkpoint de review.', label: 'Campaign Plan', icon: 'Target', color: '#a855f7' },
  ],
  // 03 - Trafego Google
  '03': [
    { type: 'view', target: 'trafego', label: 'Relatorio Trafego', icon: 'Zap', color: '#f59420', description: 'CSV Google Ads -> HTML' },
    { type: 'prompt', target: 'Gere um performance report completo do Google Ads do periodo com: KPIs por campanha, analise de Quality Score, keywords P1 a ativar/pausar, orcamento otimizado por campanha e proximos passos P1/P2/P3.', label: 'Performance Report', icon: 'LineChart', color: '#3b82f6' },
  ],
  // 04 - Trafego Meta
  '04': [
    { type: 'view', target: 'trafego', label: 'Relatorio Trafego', icon: 'Zap', color: '#f59420', description: 'CSV Meta Ads -> HTML' },
    { type: 'view', target: 'criativos', label: 'Criativos DOCX', icon: 'FileText', color: '#10b981', description: 'Exportar copies para .docx' },
    { type: 'prompt', target: 'Gere um performance report do Meta Ads: CPM/CPL/ROAS por conjunto, fadiga criativa (frequencia), audiencias que rodaram melhor, e 5 sugestoes de novos criativos baseadas no que ja funciona.', label: 'Performance Report', icon: 'LineChart', color: '#3b82f6' },
  ],
  // 05 - Designer Ads
  '05': [
    { type: 'view', target: 'criativos', label: 'Criativos DOCX', icon: 'FileText', color: '#10b981', description: 'Copies -> .docx template V4' },
    { type: 'prompt', target: 'Gere 10 conceitos criativos para A/B test Meta Ads baseados em AIDA, cada um com: hook de 3s, copy principal (3 variacoes), CTA e formato recomendado (video/estatico/carrossel).', label: '10 Conceitos A/B', icon: 'Sparkles', color: '#a855f7' },
  ],
  // 06 - Designer Social
  '06': [
    { type: 'link', target: 'https://v4ruston-aprova.vercel.app/', label: 'Aprovacao de Pauta', icon: 'CheckSquare', color: '#e4243d', description: 'Cliente aprova/altera online' },
    { type: 'view', target: 'criativos', label: 'Criativos DOCX', icon: 'FileText', color: '#10b981' },
    { type: 'prompt', target: 'Monte uma brand guide visual completa do cliente: paleta principal + secundaria com hex, tipografia com hierarquia, grid system, shapes/elementos recorrentes, do e dont de uso.', label: 'Brand Guide Visual', icon: 'Palette', color: '#f59420' },
  ],
  // 07 - Social Media
  '07': [
    { type: 'link', target: 'https://v4ruston-aprova.vercel.app/', label: 'Aprovacao de Pauta', icon: 'CheckSquare', color: '#e4243d', description: 'Cliente aprova/altera pauta' },
    { type: 'view', target: 'clipping', label: 'Clipping Rapport', icon: 'Newspaper', color: '#3b82f6', description: 'Noticias + mensagens WhatsApp' },
    { type: 'view', target: 'checkin', label: 'Check-in Mensal', icon: 'Sparkles', color: '#a855f7', description: 'Dashboard para cliente' },
  ],
  // 08 - Copy Performance
  '08': [
    { type: 'view', target: 'criativos', label: 'Criativos DOCX', icon: 'FileText', color: '#10b981' },
    { type: 'prompt', target: 'Desenhe uma sequencia de email marketing completa com: objetivo, 5-8 emails, timing entre eles, subject + preview + CTA de cada, branching por comportamento, benchmarks esperados e A/B test suggestions.', label: 'Email Sequence', icon: 'Mail', color: '#8b5cf6' },
    { type: 'prompt', target: 'Copie completa de landing page usando PAS framework (9 secoes): Hero + P + A + S + prova social + objecoes + urgencia + garantia + CTA final. Cada secao com copy pronto e hook emocional.', label: 'LP PAS 9 Secoes', icon: 'FileText', color: '#ff9100' },
  ],
  // 09 - Copy Conteudo
  '09': [
    { type: 'view', target: 'clipping', label: 'Clipping Rapport', icon: 'Newspaper', color: '#3b82f6', description: 'Curadoria de noticias' },
    { type: 'prompt', target: 'Gere um artigo de blog SEO-optimized de 2000 palavras com: H1 otimizado, meta title+description, TOC com 5-7 H2s, cada H2 com 250-350 palavras, 3 CTAs contextuais, conclusao com next step.', label: 'Artigo Blog SEO', icon: 'FileText', color: '#10b981' },
    { type: 'prompt', target: 'Desenhe uma sequencia de email marketing nurture de 7 emails com: topico de cada, subject + preview + CTA, timing, metricas-alvo e criterios de sucesso.', label: 'Email Sequence', icon: 'Mail', color: '#8b5cf6' },
  ],
  // 10 - Automacoes
  '10': [
    { type: 'prompt', target: 'Desenhe um fluxo de nutricao completo no RD Station com: evento de entrada, lead scoring (regras de pontuacao), 5-7 emails segmentados por interesse, criterios MQL, handoff para SDR e reenvio.', label: 'Fluxo Nutricao Completo', icon: 'Workflow', color: '#78909c' },
    { type: 'prompt', target: 'Monte uma arquitetura de integracao completa entre [ferramenta1] e [ferramenta2] via Zapier/n8n com: triggers, filtros, transformacao de dados, error handling e retry logic.', label: 'Integracao Zapier/n8n', icon: 'Zap', color: '#f59420' },
  ],
  // 11 - CRM & Pipeline
  '11': [
    { type: 'prompt', target: 'Monte uma cadencia de followup de 7 toques (email + call + WhatsApp + LinkedIn) para leads MQL, cada toque com timing, template de mensagem e criterio de escalonamento.', label: 'Cadencia 7 Toques', icon: 'Mail', color: '#ffd600' },
    { type: 'view', target: 'clipping', label: 'Clipping Prospeccao', icon: 'Newspaper', color: '#3b82f6', description: 'Material para rapport com prospects' },
    { type: 'prompt', target: 'Forecast de receita para proximo trimestre com: pipeline atual, win rate por stage, ciclo medio, gaps de prospeccao e sensitivity analysis (cenario base/otimista/pessimista).', label: 'Forecast Receita', icon: 'LineChart', color: '#10b981' },
  ],
  // 12 - Web Dev
  '12': [
    { type: 'prompt', target: 'Monte um setup completo de GA4 + GTM com: eventos customizados (form submit, scroll, cta click), enhanced ecommerce se aplicavel, conversoes primarias e secundarias, audiencias para remarketing.', label: 'GA4/GTM Completo', icon: 'BarChart3', color: '#26c6da' },
    { type: 'prompt', target: 'Auditoria de Core Web Vitals com: medicoes atuais (LCP/FID/CLS), gargalos identificados, priorizacao P1/P2/P3 de otimizacoes e impacto estimado em conversao.', label: 'Audit Core Web Vitals', icon: 'Zap', color: '#f59420' },
  ],
  // 13 - Dados & BI
  '13': [
    { type: 'view', target: 'trafego', label: 'Relatorio Trafego', icon: 'Zap', color: '#f59420', description: 'CSVs -> HTML interativo' },
    { type: 'view', target: 'checkin', label: 'Check-in Mensal', icon: 'Sparkles', color: '#a855f7', description: 'Dashboard premium cliente' },
    { type: 'prompt', target: 'Gere um performance report executivo com: 6 KPIs principais (com sparklines), 4 insights com dados, 3 wins e 3 misses, projecao proximo ciclo e 5 acoes priorizadas.', label: 'Performance Report', icon: 'LineChart', color: '#3b82f6' },
  ],
  // 14 - SEO
  '14': [
    { type: 'prompt', target: 'SEO Audit completo: on-page da home + 3 paginas-chave, gap de keywords vs top 3 concorrentes, issues tecnicas (crawlability/speed/schema), backlink profile e plano 90 dias P1/P2/P3.', label: 'SEO Audit Completo', icon: 'Search', color: '#06b6d4' },
    { type: 'prompt', target: 'Cluster tematico de 20+ keywords organizadas em pillars + supporting content com: search intent, volume, dificuldade, topic authority e calendario de publicacao sugerido.', label: 'Cluster 20+ Keywords', icon: 'Search', color: '#8bc34a' },
  ],
  // 15 - Video
  '15': [
    { type: 'prompt', target: 'Roteiro de YouTube de 8-10 minutos com: hook de 3s (dor/promessa), big promise, story arc com cliffhangers, 3 CTAs intermediarios, outro com call to next video e thumbnail brief.', label: 'Roteiro YouTube', icon: 'FileText', color: '#f44336' },
    { type: 'prompt', target: 'Pack de 10 scripts de Reels/Shorts de 30-60s cada: hook, desenvolvimento, payoff, CTA. Variar entre informativo/emocional/polemico. Incluir sugestoes de B-roll e audio.', label: 'Pack 10 Reels', icon: 'Sparkles', color: '#a855f7' },
  ],
  // 16 - CRO/UX
  '16': [
    { type: 'prompt', target: 'CRO Audit de checkout: identificar friccoes, priorizar por impacto (LIFT model), sugerir 5 testes A/B com hipotese + metrica alvo + tamanho amostral + duracao estimada.', label: 'CRO Audit Checkout', icon: 'Search', color: '#ff7043' },
    { type: 'prompt', target: 'User journey map detalhado do lead ate cliente com: touchpoints, pain points, emocoes, oportunidades de CRO e priorizacao de testes A/B.', label: 'User Journey Map', icon: 'Users', color: '#06b6d4' },
  ],
};

/**
 * Retorna as skills associadas a um agente.
 */
export function getAgentSkills(agentId: string): SkillBinding[] {
  return AGENT_SKILLS[agentId] || [];
}

/**
 * Estatisticas para exibir no UI: quantas skills cada agente tem.
 */
export function getAgentSkillCount(agentId: string): number {
  return (AGENT_SKILLS[agentId] || []).length;
}
