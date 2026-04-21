/**
 * GERADOR PROGRAMATICO DE 1600 COMANDOS.
 * Estrutura: 16 agentes × 10 tipos de entrega × 10 variacoes/contextos = 1600 comandos.
 *
 * Cada comando:
 * - ID unico (agentId-deliverableId-variationId)
 * - Prompt template com placeholders
 * - Modelo ideal mapeado por tipo
 * - Mentor(es) aplicado(s) por contexto
 * - Categoria auto-inferida
 */

import type { ModelDefinition } from '../ai/models';
import { MODELS } from '../ai/models';

export interface GeneratedCommand {
  id: string;
  agentId: string;
  label: string;
  description: string;
  prompt: string;
  category: string;
  preferredModelId: string;
  mentors: string[];
  tags: string[];
}

// Tipos de entrega + modelo ideal + mentores signature por agente
interface DeliverableSpec {
  key: string;
  label: string;
  prompt: string;
  model: string;
  mentors: string[];
  variations: string[];
}

interface AgentSpec {
  agentId: string;
  agentName: string;
  deliverables: DeliverableSpec[];
}

// 10 tipos de entrega x 10 variacoes por agente
const AGENT_SPECS: AgentSpec[] = [
  // ===== AGENTE 01 - MESTRE ESTRATEGISTA =====
  {
    agentId: '01',
    agentName: 'Mestre Estrategista',
    deliverables: [
      {
        key: 'diagnostico',
        label: 'Diagnostico',
        prompt: 'Faca diagnostico {VARIATION} para {{cliente}} ({{segmento}}). Aplique TOC (5 passos focalizadores), STEP (fase {{step}}), AEMR (pilar {{pilar}}). FCA completo + restricao primaria + recomendacoes priorizadas ICE.',
        model: 'claude-opus-4-7-xhigh',
        mentors: ['Goldratt (TOC)', 'Collins (Hedgehog)', 'Drucker (Teoria dos Negocios)'],
        variations: ['STEP completo', 'TOC 5 Passos', 'AEMR 4 Pilares', 'ICE Priorizacao', 'FCA + Gaps', 'Hedgehog (Collins)', '5 Forcas (Porter)', 'AARRR Funnel', 'Blue Ocean', 'Jobs-to-be-Done'],
      },
      {
        key: 'sprint',
        label: 'Sprint Planning',
        prompt: 'Sprint planning {VARIATION} para {{cliente}}. 8-12 tarefas P1/P2/P3 por agente, criterios de sucesso, prazo. Alinhado a STEP {{step}} e pilar {{pilar}}.',
        model: 'claude-sonnet-4-6',
        mentors: ['Sutherland (Scrum)', 'Doerr (OKR)', 'Allen (GTD)'],
        variations: ['Semanal standard', 'Quinzenal', 'Mensal', 'Trimestral OKR', 'Anual OKR', 'Kanban flow', 'Sprint goal', 'Retro+Planning', 'Critical Chain', 'Shape Up'],
      },
      {
        key: 'relatorio',
        label: 'Relatorio',
        prompt: 'Gere relatorio {VARIATION} para {{cliente}}. Resumo executivo + KPIs por pilar AEMR + throughput TOC + top 3 vitorias + top 3 gargalos + recomendacoes ICE.',
        model: 'virtual-data-analyst',
        mentors: ['Kaushik (Web Analytics)', 'Dykes (Data Storytelling)'],
        variations: ['Mensal C-level', 'Semanal operacional', 'Trimestral board', 'Anual consolidado', 'Executive summary 1 pag', 'Deep dive 20 pag', 'Dashboard view', 'Presentation slides', 'Email formato', 'PDF formatado'],
      },
      {
        key: 'nbo',
        label: 'Next Best Offer',
        prompt: 'NBO (Next Best Offer) {VARIATION} para {{cliente}}. Score produtos V4 por (Impact x Prerequisites x Conversion) / Investment. Top 3 com justificativa TOC + Forecast 12M + proximos passos.',
        model: 'virtual-strategist-toc',
        mentors: ['Goldratt (Throughput)', 'Ross (Predictable Revenue)', 'Roberge (Sales Acceleration)'],
        variations: ['Ticket medio', 'Upsell premium', 'Cross-sell portfolio', 'Downsell preventivo', 'Bundle otimizado', 'Recurring revenue', 'Onboarding gate', 'Expansion phase Potencializar', 'Aging accounts', 'Win-back churned'],
      },
      {
        key: 'forecast',
        label: 'Forecast',
        prompt: 'Forecast {VARIATION} para {{cliente}}. Funil matematico (trafego > leads > SQL > vendas > ticket). 3 cenarios (conservador/realista/otimista) com impacto financeiro e sensibilidade.',
        model: 'virtual-data-analyst',
        mentors: ['Kaushik (Analytics)', 'Ross (Predictable Revenue)'],
        variations: ['12 meses', '24 meses', 'Trimestre', 'Semestre', 'Annual Plan', 'Q4 forte (Black Friday)', 'Q1 ramp-up', 'Cenario recessao', 'Cenario expansao', 'Break-even analysis'],
      },
      {
        key: 'toc-thinking',
        label: 'TOC Thinking Process',
        prompt: 'Aplique {VARIATION} (Thinking Process TOC) para {{cliente}}. Mapeie causas/efeitos/solucoes em arvore logica. Entregue visual em markdown.',
        model: 'claude-opus-4-7-thinking',
        mentors: ['Goldratt', 'Dettmer (Systems Thinking)'],
        variations: ['Current Reality Tree', 'Future Reality Tree', 'Evaporating Cloud', 'Prerequisite Tree', 'Transition Tree', 'Negative Branch Reservations', '3 Clouds Technique', 'Strategy & Tactics Tree', 'Thinking Process Completo', 'Layers of Resistance'],
      },
      {
        key: 'estrategia',
        label: 'Estrategia',
        prompt: 'Desenhe estrategia {VARIATION} para {{cliente}} ({{segmento}}). Contexto competitivo + posicionamento + diferenciacao + roadmap 12M + KPIs + riscos.',
        model: 'virtual-strategist-toc',
        mentors: ['Porter (5 Forcas)', 'Kim & Mauborgne (Blue Ocean)', 'Christensen (Innovator Dilemma)'],
        variations: ['Go-to-Market', 'Posicionamento', 'Pricing', 'Channel strategy', 'Brand strategy', 'Digital transformation', 'International expansion', 'Product-led growth', 'Community-led growth', 'Platform strategy'],
      },
      {
        key: 'okr',
        label: 'OKRs',
        prompt: 'Defina OKRs {VARIATION} para {{cliente}}. 3 objetivos ambiciosos alinhados ao pilar {{pilar}}, cada com 3-5 KRs SMART (baseline, target, metodo). Cadencia check-in.',
        model: 'claude-sonnet-4-6',
        mentors: ['Doerr (Measure What Matters)', 'Andy Grove (HP Way)'],
        variations: ['Trimestral', 'Anual', 'Time comercial', 'Time marketing', 'Time produto', 'Individual C-level', 'Individual gerente', 'Time misto', 'North-Star + inputs', 'Outcomes vs Outputs'],
      },
      {
        key: 'diagnostico-v4',
        label: 'Diagnostico V4 AEMR',
        prompt: 'Diagnostico AEMR {VARIATION} para {{cliente}}. Analise 4 pilares (Aquisicao, Engajamento, Monetizacao, Retencao) com metricas, gap vs benchmark, agentes responsaveis, roadmap priorizado.',
        model: 'virtual-data-analyst',
        mentors: ['Kotler (STP)', 'Sean Ellis (Growth)'],
        variations: ['Completo 4 pilares', 'Foco Aquisicao', 'Foco Engajamento', 'Foco Monetizacao', 'Foco Retencao', 'SaaS especifico', 'E-commerce especifico', 'B2B especifico', 'B2C especifico', 'Marketplace'],
      },
      {
        key: 'overview',
        label: 'Overview',
        prompt: 'Gere overview {VARIATION} dos clientes. Tabela consolidada health/STEP/pilar/metricas. Insights cross-cliente + acoes priorizadas.',
        model: 'virtual-data-analyst',
        mentors: ['Kaushik', 'Dykes'],
        variations: ['Cross-cliente portfolio', 'Por vertical', 'Por STEP', 'Por health score', 'Top performers', 'Bottom performers', 'Upsell opportunities', 'Churn risk', 'Expansao potencial', 'Estrategico consolidado'],
      },
    ],
  },

  // ===== AGENTE 02 - GESTOR DE PROJETOS =====
  {
    agentId: '02',
    agentName: 'Gestor de Projetos',
    deliverables: [
      {
        key: 'backlog',
        label: 'Backlog',
        prompt: 'Refine backlog {VARIATION} de {{cliente}}. RICE scoring, criterios aceite, dependencias, story points, MVP cut.',
        model: 'claude-sonnet-4-6',
        mentors: ['Schwaber (Scrum)', 'Cagan (Inspired)'],
        variations: ['Produto core', 'MVP fase 1', 'MVP fase 2', 'Growth features', 'Tech debt', 'Bugs P0/P1', 'Experiments roadmap', 'Compliance', 'Internal tools', 'Integrations'],
      },
      {
        key: 'raci',
        label: 'RACI Matrix',
        prompt: 'Monte RACI {VARIATION} para {{cliente}}. 10-15 atividades x 6 papeis (Cliente/Coord/Trafego/Copy/Design/Dev). R/A/C/I detalhado.',
        model: 'claude-sonnet-4-6',
        mentors: ['Allen (GTD)', 'Dettmer'],
        variations: ['Projeto completo', 'Lancamento produto', 'Black Friday', 'Migracao sistema', 'Onboarding cliente', 'Campanha trimestral', 'Crise recuperacao', 'Multi-agencia', 'Remoto-first', 'Hibrido'],
      },
      {
        key: 'okr',
        label: 'OKRs Time',
        prompt: 'OKRs {VARIATION} para time de {{cliente}}. 3 objetivos, 3-5 KRs/each. Alignment top-down + bottom-up.',
        model: 'claude-sonnet-4-6',
        mentors: ['Doerr', 'Grove'],
        variations: ['Trimestral engineering', 'Trimestral marketing', 'Trimestral vendas', 'Trimestral produto', 'Trimestral customer success', 'Anual C-level', 'Anual gerencia', 'Squad cross-functional', 'Plataforma', 'Time individual'],
      },
      {
        key: 'retro',
        label: 'Retrospectiva',
        prompt: 'Facilite retrospectiva {VARIATION} de {{cliente}}. Formato seguro, acoes concretas, ownership, follow-up.',
        model: 'claude-haiku-4-5',
        mentors: ['Sutherland', 'Derby-Larsen (Agile Retrospectives)'],
        variations: ['Start/Stop/Continue', '4Ls (Liked/Learned/Lacked/Longed)', 'Sailboat', 'Mad/Sad/Glad', '5 Whys', 'KALM (Keep/Add/Less/More)', 'Timeline retro', 'Team radar', 'Lean Coffee', 'Post-mortem projeto'],
      },
      {
        key: 'capacity',
        label: 'Capacity Planning',
        prompt: 'Capacity plan {VARIATION} para {{cliente}}. Demanda vs capacidade, gargalos recursos, cenarios contratacao, buffer seguranca.',
        model: 'virtual-data-analyst',
        mentors: ['Goldratt (TOC)', 'Dettmer'],
        variations: ['Trimestre atual', 'Ano inteiro', 'Peak season', 'Ramp-up novo projeto', 'Downsizing', 'Freelancer mix', 'Agency-side', 'In-house team', 'Hybrid model', 'Outsourcing strategico'],
      },
      {
        key: 'roadmap',
        label: 'Roadmap',
        prompt: 'Roadmap {VARIATION} de {{cliente}} 3-6 meses. Now/Next/Later ou phases. Milestones + KPIs + riscos.',
        model: 'claude-sonnet-4-6',
        mentors: ['Cagan', 'Perri (Escaping the Build Trap)'],
        variations: ['Produto Now/Next/Later', 'Marketing trimestral', 'Go-to-Market', 'Expansion fases', 'Tech debt payoff', 'Compliance', 'Internacionalizacao', 'Mobile-first', 'AI-first', 'Platformizacao'],
      },
      {
        key: 'risco',
        label: 'Risk Register',
        prompt: 'Risk register {VARIATION} para {{cliente}}. Top 10 riscos ranqueados por (probabilidade x impacto), mitigacao, owner, trigger, contingencia.',
        model: 'claude-opus-4-7-thinking',
        mentors: ['Dettmer (TOC Thinking Processes)'],
        variations: ['Projeto especifico', 'Operacional', 'Estrategico', 'Reputacional', 'Tecnologico', 'Regulatorio LGPD', 'Financeiro', 'Mercado/competitivo', 'Pessoas/talento', 'Supply chain'],
      },
      {
        key: 'kanban',
        label: 'Kanban Board',
        prompt: 'Setup Kanban board {VARIATION} para {{cliente}}. Colunas, WIP limits, classes of service, SLAs, metricas (cycle time, throughput, CFD).',
        model: 'claude-haiku-4-5',
        mentors: ['Anderson (Kanban method)', 'Cohn (Agile Estimating)'],
        variations: ['Basic 3 colunas', 'Avancado com swimlanes', 'Devops flow', 'Marketing campanhas', 'Vendas pipeline', 'Customer support', 'Content pipeline', 'Video production', 'Design requests', 'Cross-time'],
      },
      {
        key: 'standup',
        label: 'Daily Standup',
        prompt: 'Formato daily standup {VARIATION} para {{cliente}}. Template, regras de tempo, sync/async, metricas de aderencia.',
        model: 'claude-haiku-4-5',
        mentors: ['Sutherland'],
        variations: ['Sincrono 15min', 'Assincrono Slack', 'Hibrido', 'Multi-time zone', 'Visual walking the board', 'Goal-focused', 'Focus tree', 'Objective deep dive', 'Blockers-only', 'Demo-driven'],
      },
      {
        key: 'process-design',
        label: 'Desenho de Processo',
        prompt: 'Desenhe processo {VARIATION} para {{cliente}}. Fluxograma, SLA por etapa, handoffs, metricas, melhorias continuas.',
        model: 'claude-sonnet-4-6',
        mentors: ['Deming (PDCA)', 'Toyota Production System'],
        variations: ['Onboarding cliente', 'Lancamento campanha', 'Aprovacao criativo', 'Gestao de crise', 'Relatorio mensal', 'Escalada suporte', 'Desenvolvimento produto', 'Contratacao', 'Sprint cerimonias', 'Revisao financeira'],
      },
    ],
  },

  // ===== AGENTES 03-16 usam pattern similar =====
  // Para economia de tokens, vou criar specs compactos abaixo
];

// Specs compactos para agentes 03-16 (mesma estrutura 10x10 = 100 comandos/agente)
const COMPACT_AGENT_SPECS: AgentSpec[] = [
  // AGENTE 03 - TRAFEGO GOOGLE
  {
    agentId: '03',
    agentName: 'Trafego Google',
    deliverables: [
      { key: 'search-campaign', label: 'Campanha Search', prompt: 'Monte campanha Search {VARIATION} para {{cliente}} ({{segmento}}). Estrutura SKAG, 15 keywords/grupo, 15 RSA headlines + 4 descriptions/grupo, 6 sitelinks, 4 callouts, negativas. Orcamento + tCPA.', model: 'claude-sonnet-4-6', mentors: ['Brad Geddes', 'Perry Marshall'], variations: ['Brand protection', 'Produto principal', 'Problema/solucao', 'Competidor', 'Geo-local', 'Long-tail nichos', 'Mobile-first', 'B2B high-ticket', 'B2C e-com', 'Reativacao'] },
    { key: 'pmax', label: 'Performance Max', prompt: 'Setup Performance Max {VARIATION}: 20 headlines, 5 long headlines, 5 descriptions, 20 imagens specs, 5 videos, audience signals, feeds, conversoes prioritarias.', model: 'claude-sonnet-4-6', mentors: ['Vallaeys', 'Neil Patel'], variations: ['E-com basico', 'E-com avancado feed', 'Servicos local', 'Lead gen B2B', 'Lead gen B2C', 'App installs', 'Brand awareness', 'Remarketing dinamico', 'Cross-device', 'Multi-account'] },
    { key: 'quality-score', label: 'Quality Score Audit', prompt: 'Audit Quality Score {VARIATION} de {{cliente}}. Relevancia, CTR, LP exp. Top 10 keywords com QS baixo + plano melhoria.', model: 'claude-sonnet-4-6', mentors: ['Brad Geddes'], variations: ['Conta inteira', 'Por grupo anuncio', 'Mobile vs Desktop', 'Por match type', 'Por segmento', 'Competitive benchmark', 'Historico 90d', 'Emergency QS baixo', 'Pos-migration', 'QS vs CPC paradox'] },
    { key: 'keywords', label: 'Keywords Research', prompt: 'Keyword research Google Ads {VARIATION} para {{cliente}} ({{segmento}}). Volume, competicao, CPC, match types, intent. Cluster por funil.', model: 'virtual-research-pro', mentors: ['Brad Geddes'], variations: ['Branded', 'Produto core', 'Problema-dor', 'Long-tail', 'Competidor', 'Local SEO', 'Seasonal', 'Negative keywords 200+', 'Voice search', 'Near-me'] },
    { key: 'bid-strategy', label: 'Bid Strategy', prompt: 'Estrategia de lance {VARIATION} para {{cliente}}. Smart bidding, portfolio strategy, budget allocation, bid adjustments device/time/location.', model: 'virtual-data-analyst', mentors: ['Vallaeys'], variations: ['Target CPA', 'Target ROAS', 'Maximize conversions', 'Max conv value', 'Enhanced CPC', 'Manual CPC tactical', 'Bid stacking', 'Dayparting', 'Geo-bid adjustments', 'Device-specific'] },
    { key: 'remarketing', label: 'Remarketing Search (RLSA)', prompt: 'RLSA {VARIATION} para {{cliente}}. Listas comportamento + bids adjustments + copy customizada.', model: 'claude-haiku-4-5', mentors: ['Geddes'], variations: ['Visitantes 30d', 'Carrinho 7d', 'Clientes 90d+ win-back', 'High-LTV lookalike', 'Abandonaram blog', 'Convertidos (cross-sell)', 'Video viewers', 'Email openers', 'App users', 'YouTube viewers'] },
    { key: 'shopping', label: 'Google Shopping', prompt: 'Estrutura Shopping {VARIATION}: feed optimization, campanhas Brand/Non-Brand/Shopping Smart, priority levels, bid strategies.', model: 'claude-sonnet-4-6', mentors: ['Vallaeys'], variations: ['E-com simples', 'Multi-marca', 'Sazonal Black Friday', 'Cross-border', 'B2B catalog', 'Luxury high-AOV', 'Fast fashion', 'Electronics', 'Home goods', 'Servico subscricao'] },
    { key: 'youtube-ads', label: 'YouTube Ads', prompt: 'Campanha YouTube Ads {VARIATION}: formatos (in-stream skippable/bumper 6s/discovery/non-skip 15s), roteiros 15s/30s/60s, targeting, bidding CPV, metas view rate.', model: 'claude-sonnet-4-6', mentors: ['Neil Patel'], variations: ['Brand awareness TOFU', 'Consideration MOFU', 'Conversion BOFU', 'Remarketing video', 'Custom affinity', 'In-market', 'Placements manuais', 'Connected TV', 'Shorts ads', 'Podcast ads'] },
    { key: 'display', label: 'Display Network', prompt: 'Campanha Display {VARIATION}: audiencias, placements, exclusoes, formato, frequency cap, view-through attribution.', model: 'claude-haiku-4-5', mentors: ['Vallaeys'], variations: ['Prospecting', 'Remarketing', 'Dynamic remarketing', 'Similar audiences', 'Custom intent', 'Topic targeting', 'Managed placements', 'Gmail ads', 'Discovery', 'Native'] },
    { key: 'tracking', label: 'Conversion Tracking', prompt: 'Setup tracking {VARIATION}: Google Tag Manager + GA4 + conversions API server-side + enhanced conversions. Validacao com Tag Assistant.', model: 'claude-sonnet-4-6', mentors: ['Vallaeys'], variations: ['Basico e-com', 'Avancado multi-touch', 'Server-side CAPI', 'Enhanced conversions', 'Offline conversions', 'Call tracking', 'Store visits', 'App conversions', 'Cross-domain', 'iOS 14.5+ privacy'] },
    ],
  },

  // AGENTE 04 - TRAFEGO META
  {
    agentId: '04',
    agentName: 'Trafego Meta',
    deliverables: [
      { key: 'conversion', label: 'Campanha Conversao', prompt: 'Campanha conversao Meta {VARIATION}: CBO, 4 conjuntos (LAL 1%, LAL 3%, Interesses, Broad), 5 criativos/conjunto. Pixel+CAPI, kill rules, escala +20%/3d.', model: 'claude-sonnet-4-6', mentors: ['Jon Loomer', 'Andrew Foxwell'], variations: ['E-com compra direta', 'Lead gen B2B', 'Lead gen B2C', 'App install', 'Video views', 'Engagement', 'Messenger', 'WhatsApp', 'Store visits', 'Catalog sales'] },
      { key: 'lookalike', label: 'Lookalike Strategy', prompt: 'Estrategia Lookalike {VARIATION}: fontes ranked por valor, LAL 1%/1-3%/3-5%, exclusoes, tamanho min, refresh.', model: 'virtual-data-analyst', mentors: ['Depesh Mandalia'], variations: ['Top 10% compradores', 'Compradores todos', 'LTV alto', 'SQLs', 'Trafego engajado', 'Video viewers 75%+', 'Instagram engagers', 'Facebook page fans', 'Email list', 'App users'] },
      { key: 'retargeting', label: 'Retargeting Funnel', prompt: 'Retargeting por estagio funil {VARIATION}: TOFU (30d visitantes), MOFU (14d produto), BOFU (7d checkout), clientes (60d+ upsell). Copy+criativos/estagio.', model: 'claude-sonnet-4-6', mentors: ['Loomer'], variations: ['E-com compra', 'Lead gen', 'SaaS trial to paid', 'Webinar registrados', 'App installers', 'Cart abandoners', 'Content consumers', 'Video dropouts', 'Engagers quentes', 'Wins-back'] },
      { key: 'creative-testing', label: 'Creative Testing Framework', prompt: 'Framework teste criativos Meta {VARIATION}: 5x5 matrix (hooks x formatos), metricas hook rate/CTR/CPA, budget, iteracao.', model: 'claude-sonnet-4-6', mentors: ['Foxwell'], variations: ['5x5 basico', 'Rapid iteration', 'Big brand test', 'Nicho especifico', 'B2B complexo', 'E-com sazonal', 'UGC heavy', 'Studio production', 'AI-generated', 'Influencer content'] },
      { key: 'scaling', label: 'Escala de Orcamento', prompt: 'Plano escala {VARIATION} para {{cliente}}: triggers (CPA<80% por 3d), kill rules, escala vertical +20%/3d, horizontal duplicando, rotacao criativos.', model: 'virtual-data-analyst', mentors: ['Foxwell', 'Mandalia'], variations: ['Crescimento linear', 'Agressivo 3x', 'Peak season Black Friday', 'Cross-campaign', 'Multi-market', 'Geo-expansion', 'New product launch', 'Recovery post-crise', 'Seasonal spike', 'Steady state'] },
      { key: 'capi', label: 'Conversions API Setup', prompt: 'Setup Conversions API {VARIATION}: implementacao (Shopify app / GTM server / Zapier), eventos mapeados, deduplication com Pixel, quality score 8+.', model: 'claude-sonnet-4-6', mentors: ['Meta docs'], variations: ['Shopify nativo', 'WooCommerce plugin', 'Custom server', 'GTM server-side', 'CAPI Gateway', 'Stape', 'Segment integration', 'RudderStack', 'mParticle', 'Custom SDK'] },
      { key: 'reels-ads', label: 'Reels Ads', prompt: 'Campanha Reels Ads {VARIATION}: 5 conceitos criativos 9:16 15s, hooks 3s, sound trending, copy vertical, CTA. Budget e targeting.', model: 'virtual-creative-powerhouse', mentors: ['Loomer', 'Gary Vee'], variations: ['Product demo', 'Before/after', 'UGC testimonial', 'Day-in-life', 'Tutorial rapido', 'Trend-jack audio', 'Brand story', 'Behind scenes', 'Founder POV', 'Customer success'] },
      { key: 'instagram-shopping', label: 'Instagram Shopping', prompt: 'Setup Instagram Shopping {VARIATION}: catalog, product tagging, posts shoppable, stories stickers, reels shopping, Shops tab, Live shopping.', model: 'claude-sonnet-4-6', mentors: ['Mari Smith'], variations: ['Fashion e-com', 'Beauty', 'Food delivery', 'Home decor', 'Eletronicos', 'Jewelry', 'Books', 'Digital products', 'Services', 'Local business'] },
      { key: 'whatsapp-ads', label: 'Click to WhatsApp', prompt: 'Campanha Click-to-WhatsApp {VARIATION}: Meta Ads + CTWA, fluxo de conversao, templates mensagem, SLA, automacao inicial.', model: 'claude-haiku-4-5', mentors: ['Meta docs'], variations: ['E-com carrinho', 'Lead gen BDR', 'Atendimento 24h', 'Agendamento', 'Cotacao', 'Suporte tecnico', 'Sales outbound', 'Recovery', 'Post-purchase', 'B2B enterprise'] },
      { key: 'audience-insights', label: 'Audience Insights', prompt: 'Audience Insights {VARIATION} para {{cliente}}: demografia, interesses, comportamento, devices, peak hours, page likes, lookalike sources recomendadas.', model: 'virtual-data-analyst', mentors: ['Loomer'], variations: ['Publico atual vs ideal', 'Competitor audiences', 'Persona primary', 'Persona secondary', 'Cross-segmentacao', 'Geo Brasil regional', 'Age brackets', 'Income brackets', 'Life events', 'Purchasing behavior'] },
    ],
  },

  // AGENTE 05 - DESIGNER ADS
  {
    agentId: '05',
    agentName: 'Designer Ads',
    deliverables: [
      { key: 'brief', label: 'Brief Criativo', prompt: 'Brief criativo completo {VARIATION} para {{cliente}}: objetivo, publico-alvo+dores, proposta valor, 5 variacoes mensagem, guidelines marca, specs por canal.', model: 'virtual-creative-powerhouse', mentors: ['Ogilvy', 'Sagmeister'], variations: ['Meta Ads pack', 'Google Display', 'YouTube pre-roll', 'TikTok nativo', 'LinkedIn B2B', 'Pinterest inspiration', 'Programmatic banners', 'Outdoor/OOH', 'Cinema ad', 'Audio Spotify'] },
      { key: 'pack-10', label: 'Pack 10 Conceitos', prompt: 'Pack 10 conceitos criativos {VARIATION} para {{cliente}} ({{segmento}}). Headline visual, elemento principal, CTA, angulo psicologico, formato ideal.', model: 'virtual-creative-powerhouse', mentors: ['Ogilvy', 'Hopkins (Scientific Advertising)'], variations: ['Para Meta feed', 'Para Reels/Stories', 'Para Google Display', 'Para YouTube bumper 6s', 'Para TikTok nativo', 'Para LinkedIn', 'E-com promocional', 'Lead magnet', 'Brand awareness', 'Retargeting'] },
      { key: 'banner-gerar', label: 'Gerar Banner (Nano Banana)', prompt: 'Gere imagem banner {VARIATION} para {{cliente}}. Formato adaptado, headline destacado, visual clean/moderno, cores primarias e secundarias marca. Estilo foto real ou ilustracao.', model: 'virtual-designer-visual', mentors: ['Sagmeister'], variations: ['1:1 feed', '4:5 feed', '9:16 stories/reels', '16:9 YouTube', '1200x628 FB cover ad', '1200x1200 Google Display', '300x250 banner', '728x90 leaderboard', '320x480 interstitial', '1080x1920 mobile full'] },
      { key: 'ab-variations', label: 'Variacoes A/B', prompt: 'Crie 5 variacoes A/B visual {VARIATION} para {{cliente}}: texto-first, imagem-first, UGC style, minimalista, bold contrast. Hipoteses e metricas.', model: 'virtual-designer-visual', mentors: ['Ogilvy'], variations: ['Para feed Meta', 'Para stories Meta', 'Para Reels', 'Para TikTok', 'Para Google Display', 'Para YouTube thumb', 'Para LinkedIn', 'Para Pinterest pin', 'Para email header', 'Para LP hero'] },
      { key: 'carousel', label: 'Carrossel 5 slides', prompt: 'Conceito carrossel 5 slides {VARIATION} para {{cliente}}: capa hook, 3 slides desenvolvimento, slide CTA final. Copy + visual.', model: 'virtual-creative-powerhouse', mentors: ['Chris Do'], variations: ['Educativo how-to', 'Top 5 dicas', 'Mitos vs verdades', 'Antes/depois', 'Cases resultados', 'Checklist', 'Comparacao opcoes', 'Story format', 'Frameworks visual', 'Listicles'] },
      { key: 'refresh', label: 'Refresh Fadiga', prompt: 'Refresh criativos urgente (Freq>3.5) {VARIATION} para {{cliente}}. 3 novos angulos diferentes: (1) problema diferente, (2) prova social nova, (3) urgencia/escassez.', model: 'virtual-creative-powerhouse', mentors: ['Ogilvy', 'Halbert'], variations: ['Angulo dor', 'Angulo desejo', 'Angulo prova social', 'Angulo autoridade', 'Angulo urgencia', 'Angulo escassez', 'Angulo reciprocidade', 'Angulo compromisso', 'Angulo contraste', 'Angulo curiosidade'] },
      { key: 'specs', label: 'Specs por Canal', prompt: 'Cheat-sheet specs criativos {VARIATION} por canal: dimensoes, peso max, formatos aceitos, safe zones, tempo max video.', model: 'claude-haiku-4-5', mentors: ['Meta/Google docs'], variations: ['Meta completo', 'Google completo', 'TikTok completo', 'LinkedIn completo', 'Pinterest completo', 'Snapchat', 'Twitter/X', 'Reddit', 'Spotify audio', 'Podcast audio ads'] },
      { key: 'video-ad-storyboard', label: 'Storyboard Video Ad', prompt: 'Storyboard video ad {VARIATION} para {{cliente}}. Cena-a-cena (tempo + visual + audio + copy), hook 3s, CTA visual e verbal.', model: 'virtual-creative-powerhouse', mentors: ['MrBeast', 'Neistat'], variations: ['Hook 6s bumper', 'In-stream 15s', 'In-stream 30s', 'In-stream 60s', 'Long-form 3min', 'Reels 15s', 'Reels 30s', 'Reels 60s', 'TikTok 9:16', 'YouTube Shorts'] },
      { key: 'ugc-brief', label: 'UGC Brief para Creator', prompt: 'Brief UGC {VARIATION} para creator produzir: produto info, pontos-chave, angulos sugeridos, do/dont, specs (iluminacao/audio/vertical 9:16), duration, tone.', model: 'virtual-creative-powerhouse', mentors: ['Gary Vee'], variations: ['Unboxing', 'Day in life', 'Before/after', 'Tutorial', 'Reaction', 'Testimonial', 'POV', 'Comparison', 'Story', 'Challenge'] },
      { key: 'brand-kit-ads', label: 'Kit Ads do Cliente', prompt: 'Kit ads {VARIATION} para {{cliente}}: templates reutilizaveis, color system, typography, imagens base, logos variations, grid systems.', model: 'claude-design', mentors: ['Sagmeister', 'Walsh'], variations: ['Meta feed 1:1', 'Stories 9:16', 'Google Display', 'YouTube overlay', 'Email headers', 'Pinterest templates', 'LinkedIn', 'Blog headers', 'Presentation covers', 'OOH print'] },
    ],
  },

  // AGENTE 06 - DESIGNER SOCIAL
  {
    agentId: '06',
    agentName: 'Designer Social',
    deliverables: [
      { key: 'brand', label: 'Brand Guidelines', prompt: 'Brand guidelines {VARIATION} para {{cliente}}: paleta hex, tipografia, logo usage, tom de voz, iconografia, fotos diretrizes.', model: 'claude-design', mentors: ['Sagmeister', 'Walsh'], variations: ['Starter MVP', 'Completo 30 pag', 'Digital-only', 'Multi-touchpoint', 'Humanizada', 'Minimalista', 'Bold/disruptiva', 'Luxury', 'Tech startup', 'B2B corporate'] },
      { key: 'templates', label: 'Templates Social', prompt: '10 templates posts {VARIATION} para {{cliente}}: motivacional, dica, carrossel, before/after, case, pergunta, meme, bastidores, lancamento, oferta.', model: 'claude-design', mentors: ['Chris Do'], variations: ['Instagram feed', 'Stories', 'Reels covers', 'LinkedIn', 'Twitter/X', 'Facebook', 'TikTok covers', 'Pinterest pins', 'YouTube thumbnails', 'Cross-platform'] },
      { key: 'carousel-educativo', label: 'Carrossel Educativo', prompt: 'Design carrossel educativo {VARIATION} 10 slides para {{cliente}}: capa hook, 8 slides conteudo, slide CTA.', model: 'claude-design', mentors: ['Do'], variations: ['How-to', '10 tips', 'Mito vs verdade', 'Listicle', 'Step-by-step', 'Before/after', 'Comparison', 'Checklist', 'Framework', 'Case study visual'] },
      { key: 'stories-pack', label: 'Pack Stories', prompt: '15 stories {VARIATION} para {{cliente}} (semana inteira): mix engajamento/conteudo/produto/bastidores/CTA.', model: 'claude-design', mentors: ['Mari Smith'], variations: ['Semana normal', 'Lancamento produto', 'Evento ao vivo', 'Black Friday', 'Natal/Festas', 'Aniversario marca', 'Inauguracao', 'Aula ao vivo', 'Convite webinar', 'Convite live shopping'] },
      { key: 'visual-identity', label: 'Visual Identity Refresh', prompt: 'Proposta refresh visual identity {VARIATION} para {{cliente}}: analise atual, 3 direcoes (evolucao/moderna/disruptiva), mockups, recomendacao.', model: 'claude-design', mentors: ['Paula Scher', 'Walsh'], variations: ['Startup crescendo', 'Rebranding completo', 'Sub-brand', 'Extensao produto', 'Internacionalizacao', 'Mobile-first refresh', 'Digital transformation', 'Heritage respect', 'Youth pivot', 'Luxury upgrade'] },
      { key: 'highlights-covers', label: 'Covers Highlights IG', prompt: '8 covers Highlights Instagram {VARIATION} para {{cliente}}: minimalistas, cores brand, icones unificados.', model: 'claude-design', mentors: ['Do'], variations: ['Sobre/Produtos/Cases/Depoimentos/Dicas/Bastidores/FAQ/Contato', 'E-com simples', 'SaaS', 'Servico local', 'Personal brand', 'Infoprodutor', 'Coach', 'Clinica', 'Restaurante', 'Escola'] },
      { key: 'link-bio', label: 'Link in Bio', prompt: 'Design pagina link-in-bio {VARIATION} para {{cliente}}: layout mobile-first, 6-8 botoes, copy curto, visual brand.', model: 'claude-design', mentors: ['Do'], variations: ['Linktree', 'Beacons', 'Hopp.bio', 'Biosite', 'Linkbio custom', 'Instabio', 'Lnk.bio', 'Milkshake', 'Custom landing page', 'Campaign-specific'] },
      { key: 'landing-design', label: 'Landing Page Design', prompt: 'Design landing page {VARIATION} para {{cliente}}: hero impactante + secoes completas + CTAs. Entregar como HTML+Tailwind live.', model: 'claude-design', mentors: ['Krug (Dont Make Me Think)', 'Walsh'], variations: ['Lancamento produto', 'Lead magnet ebook', 'Webinar signup', 'Waitlist', 'Coming soon', 'Black Friday', 'Event', 'App download', 'SaaS trial', 'Agency service'] },
      { key: 'presentation', label: 'Apresentacao/Deck', prompt: 'Deck pitch {VARIATION} para {{cliente}}: 10 slides Guy Kawasaki, visual impactante, storytelling.', model: 'claude-design', mentors: ['Garr Reynolds (Presentation Zen)', 'Kawasaki'], variations: ['Investidor seed', 'Investidor Serie A', 'Board meeting', 'All-hands', 'Sales deck', 'Produto launch interno', 'Webinar educational', 'Conference keynote', 'Client pitch', 'Vendor proposal'] },
      { key: 'infographic', label: 'Infografico', prompt: 'Design infografico {VARIATION} para {{cliente}}: dados visuais, storytelling, shareable social.', model: 'claude-design', mentors: ['Edward Tufte', 'Alberto Cairo'], variations: ['Estatistico', 'Processo step-by-step', 'Comparativo', 'Timeline', 'Geografico/mapa', 'Hierarquico', 'Causa-efeito', 'Matriz 2x2', 'How-it-works', 'Data storytelling narrative'] },
    ],
  },

  // AGENTE 07 - SOCIAL MEDIA
  {
    agentId: '07',
    agentName: 'Social Media',
    deliverables: [
      { key: 'calendario', label: 'Calendario Editorial', prompt: 'Calendario editorial {VARIATION} para {{cliente}}. 30 posts 70/20/10. Data, canal, pilar, titulo, legenda 120-150p, hashtags, CTA, midia.', model: 'virtual-creative-powerhouse', mentors: ['Gary Vee', 'Ann Handley'], variations: ['Instagram+LinkedIn', 'Instagram+Facebook+Stories', 'TikTok-first', 'LinkedIn B2B deep', 'Twitter/X agil', 'Pinterest e-com', 'YouTube longo', 'Multi-canal completo', 'Peak season (BF)', 'Lancamento produto'] },
      { key: 'legendas', label: 'Pack Legendas', prompt: '10 legendas {VARIATION} para {{cliente}}: educativas com hook, historias, polemicas, perguntas, lancamento, convite DM.', model: 'virtual-creative-powerhouse', mentors: ['Handley', 'Gary Vee'], variations: ['Instagram feed', 'Instagram carrossel', 'Reels', 'Stories', 'LinkedIn B2B', 'Twitter/X threads', 'Facebook', 'TikTok', 'Pinterest', 'YouTube descriptions'] },
      { key: 'hashtags', label: 'Estrategia Hashtags', prompt: 'Estrategia hashtags {VARIATION} para {{cliente}} ({{segmento}}): 30 hashtags mix top/medium/nicho/geo. 3 sets rotativos.', model: 'claude-haiku-4-5', mentors: ['Mari Smith'], variations: ['Instagram 30 max', 'TikTok 5-8', 'LinkedIn 3-5 profissional', 'Twitter/X 2-3', 'Pinterest 20 SEO', 'YouTube tags', 'Nicho especifico', 'Geo-local', 'Trending jacking', 'Branded hashtag'] },
      { key: 'concorrentes', label: 'Analise 5 Concorrentes', prompt: 'Analise 5 concorrentes {VARIATION} de {{cliente}}: seguidores, ER, frequencia, top posts (porque), tom, mix, stories/reels, oportunidades.', model: 'virtual-research-pro', mentors: ['Handley'], variations: ['Instagram direta', 'LinkedIn B2B', 'TikTok ascendente', 'YouTube Shorts', 'Twitter/X conversation', 'Pinterest inspiration', 'Facebook community', 'Cross-canal', 'Influencer-driven', 'UGC-heavy'] },
      { key: 'tiktok-strategy', label: 'Estrategia TikTok', prompt: 'Plano TikTok {VARIATION}: niche, 5 pilares conteudo, audios trending, 10 ideias/pilar, metas.', model: 'virtual-creative-powerhouse', mentors: ['Neistat', 'Gary Vee'], variations: ['Brand zero-to-hero', 'E-com viral', 'Educacao nicho', 'Personal brand', 'Empresa servicos', 'Infoprodutor', 'B2B TikTok', 'Local business', 'Cross-post YouTube Shorts', 'Creator collab-driven'] },
      { key: 'community', label: 'Community Management', prompt: 'Playbook community management {VARIATION} para {{cliente}}: SLA respostas, tom de voz, templates, escalation, policy.', model: 'claude-sonnet-4-6', mentors: ['Mari Smith'], variations: ['Instagram DMs', 'Comentarios feed', 'Reclamacoes publicas', 'Mensoes', 'Grupos Facebook', 'Discord comunidade', 'Telegram', 'WhatsApp Business', 'YouTube comments', 'LinkedIn'] },
      { key: 'live-plan', label: 'Plano de Lives', prompt: 'Plano Live Streaming {VARIATION} para {{cliente}}: 2-4 lives/mes, formatos, roteiros, promocao 7d, repurpose pos.', model: 'claude-sonnet-4-6', mentors: ['Smith'], variations: ['Q&A mensal', 'Entrevista expert', 'Tutorial ao vivo', 'Bastidores', 'Lancamento produto', 'Black Friday', 'Anniversario', 'Parceria influencer', 'Live shopping', 'Aula gratuita'] },
      { key: 'trend-jack', label: 'Trend Jacking', prompt: 'Trend jacking {VARIATION} para {{cliente}} ({{segmento}}): 10 trends ultima semana, audio/formato, como adaptar, risco vs viral.', model: 'virtual-realtime-grok', mentors: ['Gary Vee'], variations: ['TikTok trends', 'Instagram Reels audios', 'Twitter/X threads', 'LinkedIn carousel trends', 'YouTube Shorts', 'Pinterest trends', 'Meme jacking', 'News jacking', 'Cultural moment', 'Pop culture event'] },
      { key: 'brand-voice', label: 'Brand Voice', prompt: 'Brand voice doc {VARIATION} para {{cliente}}: 3 pilares (friendly/professional/playful etc), do/dont com exemplos, personality spectrum, vocabulario proprio.', model: 'virtual-creative-powerhouse', mentors: ['Handley', 'Nielsen Norman'], variations: ['B2B professional', 'B2C casual', 'Youth energetic', 'Luxury sophisticated', 'Family-friendly', 'Tech authoritative', 'Healthcare compassionate', 'Finance trustworthy', 'Entertainment playful', 'Sports intense'] },
      { key: 'content-pillars', label: 'Content Pillars', prompt: 'Defina 5 content pillars {VARIATION} para {{cliente}}: cada pilar (%, goal, exemplos, KPIs). Balanced distribution.', model: 'claude-sonnet-4-6', mentors: ['Pulizzi (Content Inc)', 'Handley'], variations: ['Educacao/Entretenimento/Vendas/Prova/Bastidores', 'Por STEP jornada', 'Por pilar V4', 'Sazonal', 'SaaS tech', 'E-com product', 'Servico local', 'Infoprodutor', 'Personal brand', 'Agency'] },
    ],
  },

  // AGENTE 08 - COPY PERFORMANCE
  {
    agentId: '08',
    agentName: 'Copy Performance',
    deliverables: [
      { key: 'lp-completa', label: 'Copy LP Completa', prompt: 'Copy LP COMPLETA {VARIATION} para {{cliente}} ({{segmento}}): Hero+Problema+Solucao+Beneficios+Prova+Oferta+FAQ+CTA. PAS ou AIDA. Entregar como HTML+Tailwind via Claude Design.', model: 'claude-design', mentors: ['Eugene Schwartz (5 Awareness Levels)', 'Gary Halbert', 'Ogilvy'], variations: ['Alto-ticket B2B', 'E-com produto', 'SaaS trial', 'Webinar', 'Ebook lead magnet', 'App download', 'Servico local', 'Infoproduto', 'Agencia/consultoria', 'Coach/mentoria'] },
      { key: 'headlines', label: '15 Headlines A/B', prompt: '15 headlines A/B {VARIATION} para {{cliente}}: numero+beneficio, pergunta, problema-solucao, prova, urgencia. Frameworks.', model: 'virtual-creative-powerhouse', mentors: ['Schwartz', 'Halbert', 'Hopkins'], variations: ['Para LP hero', 'Para Meta Ads', 'Para Google Ads', 'Para email subjects', 'Para blog titles', 'Para YouTube titles', 'Para podcasts', 'Para press release', 'Para LinkedIn article', 'Para newsletter'] },
      { key: 'email-sales', label: 'Email Vendas PAS', prompt: 'Email vendas {VARIATION} framework PAS: assuntos 4 variacoes, pre-header, corpo (abertura+problema+agitacao+solucao+prova+oferta+CTA+PS). 400-600 pal.', model: 'virtual-creative-powerhouse', mentors: ['Schwartz', 'Halbert'], variations: ['Flash sale 24h', 'Black Friday', 'Lancamento produto', 'Webinar convite', 'Cold outreach B2B', 'Re-engajamento', 'Abandoned cart', 'Post-purchase upsell', 'Annual subscription', 'VIP exclusive'] },
      { key: 'ctas', label: '30 CTAs', prompt: '30 CTAs {VARIATION} por etapa: 10 TOFU (suave), 10 MOFU (beneficio), 10 BOFU (acao direta). Texto + contexto + CTR esperado.', model: 'claude-haiku-4-5', mentors: ['Schwartz'], variations: ['E-com', 'SaaS', 'Lead gen B2B', 'Lead gen B2C', 'Webinar', 'Ebook download', 'Consultoria', 'Servico', 'Curso online', 'Subscription'] },
      { key: 'vsl', label: 'Video Sales Letter', prompt: 'Roteiro VSL {VARIATION} para {{cliente}}: hook+agitacao+solucao+prova+oferta+urgencia+CTA. Marcacoes visuais.', model: 'virtual-creative-powerhouse', mentors: ['Halbert', 'Schwartz'], variations: ['VSL 10min curto', 'VSL 20min medio', 'VSL 45min longo', 'Webinar replay', 'Facebook Ads video', 'YouTube pre-roll', 'LP embed video', 'Sales page inline', 'Pre-launch teaser', 'Objection crusher'] },
      { key: 'upsell', label: 'Copy Upsell OTO', prompt: 'Copy upsell {VARIATION} pos-compra: OTO pagina, 3 variacoes (complementar/upgrade/VIP), valor bullets, urgencia genuina, CTA duplo.', model: 'virtual-creative-powerhouse', mentors: ['Halbert'], variations: ['E-com cross-sell', 'SaaS upgrade tier', 'Info bundle', 'Coaching 1:1', 'Workshop exclusive', 'Annual vs monthly', 'White-glove setup', 'Premium support', 'Certification add-on', 'Done-for-you'] },
      { key: 'objections', label: 'Respostas Objecoes', prompt: 'Script respondendo 10 objecoes comuns {VARIATION}: preco, tempo, confianca, necessidade, concorrente. Reformulacao + prova + convite.', model: 'virtual-creative-powerhouse', mentors: ['Halbert', 'Schwartz'], variations: ['B2B alto-ticket', 'SaaS enterprise', 'E-com premium', 'Servicos locais', 'Coaching', 'Cursos online', 'Consulting', 'Assinaturas', 'Eventos', 'Imoveis/alto valor'] },
      { key: 'long-form-sales', label: 'Long-Form Sales Page', prompt: 'Sales page long-form {VARIATION} para {{cliente}}: 5000+ palavras, storytelling, multiple CTAs, FAQ, guarantee, bonus stack.', model: 'virtual-creative-powerhouse', mentors: ['Halbert', 'Joseph Sugarman'], variations: ['Infoproduto premium', 'High-ticket coaching', 'Membership', 'Mastermind', 'Certificacao', 'Software subscription', 'Consultoria', 'Agencia', 'Evento pago', 'Produto fisico premium'] },
      { key: 'emails-sequence', label: 'Email Sequence Launch', prompt: 'Sequencia 7 emails lancamento {VARIATION}: pre-launch teaser + open cart + social proof + urgency + last call + post-launch.', model: 'virtual-creative-powerhouse', mentors: ['Jeff Walker (PLF)', 'Schwartz'], variations: ['Product Launch Formula', 'Webinar funnel', 'Flash sale 48h', 'Black Friday week', 'Evergreen', 'New course launch', 'SaaS product launch', 'E-com drop', 'App launch', 'Book launch'] },
      { key: 'headline-swipe-file', label: 'Swipe File Headlines', prompt: 'Swipe file {VARIATION}: 50 headlines comprovadas adaptadas para {{cliente}}. Template + angulos + frameworks (Schwartz 5 Awareness).', model: 'virtual-creative-powerhouse', mentors: ['Schwartz', 'Hopkins', 'Halbert'], variations: ['Unaware -> Aware', 'Problem-aware', 'Solution-aware', 'Product-aware', 'Most-aware', 'Curiosity', 'Urgency', 'Authority', 'Social proof', 'Big promise'] },
    ],
  },

  // AGENTE 09 - COPY CONTEUDO
  {
    agentId: '09',
    agentName: 'Copy Conteudo',
    deliverables: [
      { key: 'artigo-blog', label: 'Artigo Blog', prompt: 'Artigo blog {VARIATION} de 2000+ palavras para {{cliente}}: title SEO, meta desc, intro hook, sumario, H2/H3, listas, conclusao+CTA, FAQs schema-ready, 3 imagens alt.', model: 'claude-sonnet-4-6', mentors: ['Ann Handley', 'Joe Pulizzi', 'Ryan Holiday'], variations: ['Tutorial how-to', 'Case study cliente', 'Guia definitivo', 'Comparacao X vs Y', 'Opiniao/thought leadership', 'Listicle top 10', 'Definicao termo tecnico', 'FAQ expandido', 'Original research', 'Controverso/contrarian'] },
      { key: 'email-sequence', label: 'Email Sequencia Nutricao', prompt: 'Sequencia nutricao {VARIATION} (7 emails 14d): E1 boas-vindas+isca, E2-3 historia, E4 problema+educacao, E5 case, E6 oferta+bonus, E7 urgencia.', model: 'virtual-creative-powerhouse', mentors: ['Handley'], variations: ['Novo lead B2B', 'Novo lead B2C', 'SaaS trial user', 'E-com primeiro abandono', 'Ebook download nurture', 'Webinar nao-assistiu', 'Post-compra upsell', 'Anniversary loyalty', 'Re-engajamento', 'Referral program'] },
      { key: 'ebook', label: 'E-book Completo', prompt: 'E-book {VARIATION} 30-40 pag: titulo vendedor, sumario 7-8 caps, intro completa, 1 capitulo modelo (2000 pal), conclusao+CTA, diagramacao.', model: 'claude-sonnet-4-6', mentors: ['Handley', 'Pulizzi'], variations: ['Lead magnet gate', 'Premium paid', 'Industry report anual', 'Survey results', 'Frameworks compilation', 'Case studies book', 'How-to guide', 'Troubleshooting', 'Benchmark report', 'Trends report'] },
      { key: 'newsletter', label: 'Newsletter', prompt: 'Newsletter {VARIATION} para {{cliente}}: assunto curiosidade, abertura pessoal, insight principal, 3 tips, 1 ferramenta, 1 pergunta, CTA suave. 600-800 pal.', model: 'virtual-creative-powerhouse', mentors: ['Handley', 'Holiday'], variations: ['Weekly industry', 'Daily snack', 'Monthly deep', 'Founder letter', 'Curator format', 'Thought leadership', 'Personal brand', 'Community round-up', 'Behind scenes', 'Educational series'] },
      { key: 'case-study', label: 'Case Study', prompt: 'Case study {VARIATION} STAR: Situacao+Task+Acoes+Resultados+Depoimento+Licoes. 1200 pal+grafico.', model: 'virtual-data-analyst', mentors: ['Handley', 'Heath (Made to Stick)'], variations: ['B2B SaaS success', 'E-com growth', 'Agency case', 'Startup scale', 'Turnaround story', 'Digital transformation', 'Post-crisis recovery', 'International expansion', 'Cost reduction', 'Team culture'] },
      { key: 'white-paper', label: 'White Paper', prompt: 'White paper tecnico {VARIATION} B2B {{cliente}}: 15-20 pag, executive summary, problema mercado, abordagem, dados/benchmarks, 3 cases, conclusao.', model: 'claude-sonnet-4-6', mentors: ['Handley', 'Pulizzi'], variations: ['Industry trend', 'Technology deep-dive', 'Regulatory impact', 'ROI framework', 'Best practices', 'Methodology proprietary', 'Survey results', 'Predictions report', 'Buyer guide', 'Vendor comparison'] },
      { key: 'linkedin-article', label: 'Artigo LinkedIn', prompt: 'Artigo LinkedIn thought leadership {VARIATION} 1500 pal: hook, story, framework, 3-5 exemplos, aprendizado, pergunta engajamento, CTA comentario.', model: 'virtual-creative-powerhouse', mentors: ['Handley', 'Gary Vee'], variations: ['Lesson learned', 'Industry insight', 'Counter-narrative', 'Framework original', 'Career story', 'Trend analysis', 'Book/podcast takeaway', 'Customer story', 'Team story', 'Failure story'] },
      { key: 'press-release', label: 'Press Release', prompt: 'Press release {VARIATION} para {{cliente}}: headline news-worthy, lead paragraph 5W, corpo, quotes, boilerplate, contato.', model: 'claude-sonnet-4-6', mentors: ['Holiday'], variations: ['Funding round', 'Product launch', 'Partnership', 'Acquisition/merger', 'Executive hire', 'Award won', 'Research findings', 'Expansion new market', 'Milestone anniversary', 'Crisis response'] },
      { key: 'podcast-script', label: 'Roteiro Podcast', prompt: 'Script podcast {VARIATION} para {{cliente}}: intro hook, 3-5 topicos principais, transicoes, CTAs naturais, outro. 30-45min.', model: 'virtual-creative-powerhouse', mentors: ['Tim Ferriss', 'Joe Rogan-style'], variations: ['Solo expert', 'Interview guest', 'Painel multi', 'Debate', 'Q&A audience', 'News roundup', 'Book review', 'Case teardown', 'Behind scenes', 'Anniversary special'] },
      { key: 'webinar-script', label: 'Roteiro Webinar', prompt: 'Roteiro webinar {VARIATION} 60min: abertura+hook 5min, 3 blocos 15min com slides, Q&A 10min, pitch 10min, CTA. Checklist tecnico.', model: 'virtual-creative-powerhouse', mentors: ['Jeff Walker'], variations: ['Lead gen B2B', 'Lead gen B2C', 'Customer education', 'Product demo', 'Partner co-marketing', 'Thought leadership', 'Workshop hands-on', 'Masterclass', 'Live Q&A', 'Launch event'] },
    ],
  },

  // AGENTE 10 - AUTOMACOES
  {
    agentId: '10',
    agentName: 'Automacoes',
    deliverables: [
      { key: 'fluxo-nutricao', label: 'Fluxo Nutricao', prompt: 'Fluxo automacao {VARIATION} em RD/HubSpot/ActiveCampaign: trigger, 7 emails com delays, condicionais, desvios, tags. Diagrama MD + config.', model: 'claude-sonnet-4-6', mentors: ['Scott Brinker'], variations: ['RD Station Basic', 'RD Station Pro', 'HubSpot workflows', 'ActiveCampaign', 'Mailchimp', 'Klaviyo e-com', 'Customer.io', 'Intercom series', 'Marketo', 'Pardot B2B'] },
      { key: 'lead-scoring', label: 'Lead Scoring', prompt: 'Modelo Lead Scoring {VARIATION}: PERFIL (cargo/empresa/segmento/orcamento) + ENGAJAMENTO (paginas/downloads/emails/webinar). Thresholds, decay.', model: 'virtual-data-analyst', mentors: ['Brinker'], variations: ['B2B enterprise', 'B2B SMB', 'B2C SaaS', 'E-com repeat buyers', 'Informational nurture', 'Event registrants', 'Demo requesters', 'Trial signups', 'Content downloaders', 'Newsletter subs'] },
      { key: 'webhook', label: 'Webhook Integration', prompt: 'Webhook setup {VARIATION} entre sistemas: endpoint, payload schema, auth, triggers, testes, error handling, retry, logs.', model: 'claude-sonnet-4-6', mentors: ['Brinker'], variations: ['CRM -> Slack', 'Form -> CRM', 'Stripe -> Notion', 'Calendar -> email', 'Payment -> fulfillment', 'Signup -> onboarding', 'Churn -> CS alert', 'Review -> Slack', 'Error -> PagerDuty', 'Lead -> sales assigned'] },
      { key: 'zapier-zaps', label: 'Zaps Zapier/Make', prompt: '10 Zaps uteis {VARIATION}: triggers+acoes+filtros+paths. Priorizado por ROI de automacao.', model: 'claude-haiku-4-5', mentors: ['Brinker'], variations: ['Agency automations', 'E-com operations', 'SaaS onboarding', 'Content publishing', 'Sales handoff', 'Customer support', 'HR/Recruiting', 'Finance/invoicing', 'Marketing operations', 'Event management'] },
      { key: 'chatbot', label: 'Chatbot Flow', prompt: 'Chatbot flow {VARIATION} para {{cliente}}: menu, subfluxos, respostas template, handoff humano, FAQ, metricas resolucao.', model: 'claude-sonnet-4-6', mentors: ['Brinker'], variations: ['WhatsApp Business', 'Messenger', 'Website widget', 'Instagram DM', 'Telegram', 'Discord', 'SMS', 'In-app', 'Voice assistant', 'Omnichannel'] },
      { key: 'abandoned-cart', label: 'Carrinho Abandonado', prompt: 'Fluxo abandoned cart {VARIATION}: gatilho 2h apos, E1 lembrete, E2 +24h social proof, E3 +48h desconto, WhatsApp SMS. Copy cada toque.', model: 'virtual-creative-powerhouse', mentors: ['Brinker'], variations: ['E-com fashion', 'E-com eletronicos', 'SaaS trial abandoned', 'Course purchase', 'Subscription signup', 'Booking abandoned', 'Quote request', 'Form partial', 'Checkout error', 'High-value AOV'] },
      { key: 'crm-sync', label: 'CRM Sync Bidirecional', prompt: 'Integracao bidirecional {VARIATION}: fields mapping, rules dedup, trigger MQL>SQL, bounce back, audit trail.', model: 'claude-sonnet-4-6', mentors: ['Brinker'], variations: ['RD<>Pipedrive', 'RD<>HubSpot', 'RD<>Salesforce', 'HubSpot<>Salesforce', 'Pipedrive<>Salesforce', 'Zoho<>HubSpot', 'ActiveCampaign<>Pipedrive', 'Kommo<>RD', 'Agendor<>HubSpot', 'Ploomes<>HubSpot'] },
      { key: 'martech-stack', label: 'MarTech Stack Audit', prompt: 'Audit MarTech stack {VARIATION} para {{cliente}}: mapa atual, overlaps, gaps, custos, recomendacoes, roadmap consolidacao.', model: 'virtual-strategist-toc', mentors: ['Brinker'], variations: ['Starter stack 5 ferramentas', 'Growth stack 15', 'Enterprise 30+', 'E-com stack', 'SaaS stack', 'Agency stack', 'B2B SMB', 'B2C DTC', 'Media/publishing', 'Non-profit'] },
      { key: 'ai-agents-setup', label: 'AI Agents Setup', prompt: 'Setup AI agents {VARIATION} em {{cliente}}: identify tasks automatizaveis, tools (Claude/GPT/Gemini), prompts, integracoes, SLA, escalation humana.', model: 'claude-opus-4-7', mentors: ['Brinker'], variations: ['SDR agent', 'Customer support L1', 'Content research', 'Content repurpose', 'Data entry/enrichment', 'Email triage', 'Meeting summary', 'Proposal drafts', 'Social listening', 'Competitive intel'] },
      { key: 'lifecycle-map', label: 'Lifecycle Marketing Map', prompt: 'Lifecycle marketing map {VARIATION}: etapas (awareness>acquisition>activation>retention>referral), touchpoints, automacoes, KPIs/etapa.', model: 'virtual-data-analyst', mentors: ['Brinker', 'Sean Ellis'], variations: ['SaaS B2C', 'SaaS B2B', 'E-com mass market', 'E-com luxury', 'Services local', 'Subscription box', 'Freemium', 'Marketplace', 'Educational (courses)', 'Membership'] },
    ],
  },

  // AGENTE 11 - CRM & PIPELINE
  {
    agentId: '11',
    agentName: 'CRM & Pipeline',
    deliverables: [
      { key: 'pipeline-review', label: 'Pipeline Review', prompt: 'Pipeline review {VARIATION} {{cliente}}: volume/etapa, conversion rates, tempo medio, deals em risco, forecast 3 cenarios, acoes ICE.', model: 'virtual-data-analyst', mentors: ['Aaron Ross', 'Mark Roberge'], variations: ['Semanal comercial', 'Mensal board', 'Trimestral QBR', 'Anual planning', 'Por vendedor', 'Por produto', 'Por segmento', 'Por geografia', 'Top deals', 'At-risk deals'] },
      { key: 'sales-scripts', label: 'Scripts Vendas', prompt: 'Scripts {VARIATION}: cold call 30s, discovery 30min SPIN, demo agenda+features mapeadas dores, close (alternativa/urgencia/assumptive).', model: 'virtual-creative-powerhouse', mentors: ['Ross', 'Konrath', 'Rackham (SPIN)'], variations: ['SDR cold call', 'AE discovery', 'AE demo', 'AE negotiation', 'Closer final call', 'Objection handling', 'Breakup email', 'Re-engagement', 'Expansion upsell', 'Renewal'] },
      { key: 'cadence', label: 'Cadencia Followup', prompt: 'Cadencia {VARIATION} 21d multicanal: email+LinkedIn+WhatsApp+ligacao. Toques D1/3/5/8/11/14/17/21. Canal+objetivo+mensagem+CTA.', model: 'virtual-creative-powerhouse', mentors: ['Konrath', 'Ross'], variations: ['Cold outbound B2B enterprise', 'Cold B2B SMB', 'Cold B2C', 'Warm inbound B2B', 'Warm inbound B2C', 'Trial activation', 'Demo scheduled no-show', 'Proposal sent', 'Negotiation stuck', 'Win-back'] },
      { key: 'bant-meddic', label: 'BANT + MEDDIC', prompt: 'Framework BANT+MEDDIC {VARIATION} para qualificar leads. Perguntas discovery, criterios qualifica/desqualifica, red flags, sinais verdes. Lead score ajustado.', model: 'claude-sonnet-4-6', mentors: ['Ross', 'Jack Napoli (MEDDIC)'], variations: ['SaaS enterprise', 'SaaS SMB', 'Services alto-ticket', 'E-com B2B', 'Consulting', 'Agency retainer', 'Software license', 'Hardware', 'Subscription', 'Transactional'] },
      { key: 'proposal', label: 'Proposta Comercial', prompt: 'Template proposta {VARIATION}: (1)Resumo exec, (2)Entendimento dor, (3)Solucao, (4)Entregas, (5)Timeline, (6)Investimento 3 opcoes, (7)Cases, (8)Proximos passos. Visual + objecoes preventivas.', model: 'virtual-creative-powerhouse', mentors: ['Ross'], variations: ['B2B SaaS enterprise', 'B2B consulting', 'B2B agency retainer', 'B2B services', 'B2B software license', 'B2C services alto', 'Hybrid subscription', 'Project-based', 'Retainer+Project', 'Success-based pricing'] },
      { key: 'abm', label: 'ABM Plan', prompt: 'Plano ABM {VARIATION}: top 20 contas-alvo fit score, research (decisores/gatilhos/budget), messaging 1:1, canais, orquestracao, metricas.', model: 'virtual-strategist-toc', mentors: ['Ross'], variations: ['One-to-one premium', 'One-to-few clusters', 'One-to-many programatic', 'Vertical specific', 'Geo specific', 'Named accounts', 'Ideal Customer Profile', 'Expansion existing', 'Win-back lost', 'Influencer accounts'] },
      { key: 'win-loss', label: 'Win/Loss Analysis', prompt: 'Win/Loss {VARIATION} ultimos 30 deals: 15 won+15 lost. Padroes motivos, segmentacao perfil, comparacao concorrentes, acoes pipeline+messaging+produto.', model: 'virtual-data-analyst', mentors: ['Roberge'], variations: ['Trimestral', 'Semestral', 'Anual', 'Por vendedor', 'Por produto', 'Por segmento', 'Por geografia', 'Against concorrente X', 'High-value deals', 'Sales velocity'] },
      { key: 'sales-playbook', label: 'Sales Playbook', prompt: 'Sales playbook {VARIATION} completo: ICP, personas, buyer journey, discovery framework, demo flow, objection handling, close techniques, handoff CS.', model: 'claude-sonnet-4-6', mentors: ['Roberge', 'Ross'], variations: ['SaaS B2B', 'SaaS PLG', 'Services consultivo', 'E-com B2B wholesale', 'Agency retainer', 'Hardware complex', 'Subscription', 'Marketplace sellers', 'Platform GTM', 'Community-led'] },
      { key: 'compensation-plan', label: 'Plano Comissao', prompt: 'Plano comissao {VARIATION} para time comercial {{cliente}}: base+variavel, accelerators, quotas, clawback, payout timing.', model: 'virtual-data-analyst', mentors: ['Roberge'], variations: ['SDR comissao', 'AE comissao', 'CSM retention', 'Hybrid AE/CSM', 'Team-based', 'Individual', 'Quarterly quota', 'Annual quota', 'Ramp period', 'Accelerator tiers'] },
      { key: 'revops-metrics', label: 'RevOps Metrics', prompt: 'Metricas RevOps {VARIATION} para {{cliente}}: SAL/SQL/Win/CAC/LTV/NRR. Dashboards, benchmarks, alertas.', model: 'virtual-data-analyst', mentors: ['Roberge'], variations: ['Board metrics', 'Ops daily', 'Sales leaderboard', 'Marketing attribution', 'CS health scores', 'Product-led metrics', 'Expansion metrics', 'Churn early signals', 'Velocity tracking', 'Win rate analysis'] },
    ],
  },

  // AGENTE 12 - WEB DEV
  {
    agentId: '12',
    agentName: 'Web Dev',
    deliverables: [
      { key: 'ga4-setup', label: 'Setup GA4+GTM', prompt: 'Guia completo setup GA4+GTM {VARIATION}: property, GTM, tag base, enhanced measurement, 8 conversoes+triggers, parametros, audiencias, dashboard, testes.', model: 'claude-sonnet-4-6', mentors: ['Vitaly Friedman', 'Krug'], variations: ['E-com basico', 'E-com avancado GA4', 'SaaS B2B', 'Lead gen site', 'Content/blog', 'Marketplace', 'App+Web combined', 'Multi-domain', 'Server-side GTM', 'Privacy-first iOS'] },
      { key: 'cwv-audit', label: 'Core Web Vitals', prompt: 'Audit CWV {VARIATION} de {{cliente}}: LCP, FID/INP, CLS. Valor, meta, gap, causas, acoes (lazy load/image optim/fonts/JS/cache/CDN).', model: 'claude-sonnet-4-6', mentors: ['Friedman', 'Addy Osmani'], variations: ['Desktop', 'Mobile', 'Brasil geo', 'Global CDN', 'Slow 3G simulation', 'First visit', 'Returning', 'With ads', 'Heavy media', 'SSR vs CSR'] },
      { key: 'lp-spec', label: 'Spec LP Dev', prompt: 'Spec tecnica LP {VARIATION} para {{cliente}}: HTML semantico, headings, schema, performance budget, eventos tracking, WCAG AA, meta OG.', model: 'claude-design', mentors: ['Krug'], variations: ['Vite/React', 'Next.js', 'WordPress', 'Webflow', 'Framer', 'Static HTML', 'SvelteKit', 'Astro', 'Remix', 'Headless CMS'] },
      { key: 'schema', label: 'Schema Markup', prompt: 'Schema markup rich snippets {VARIATION} para {{cliente}}: JSON-LD pronto. Validar Rich Results Test.', model: 'claude-haiku-4-5', mentors: ['Schema.org'], variations: ['Organization', 'LocalBusiness', 'Product+Review', 'Article+Author', 'FAQ', 'HowTo', 'Event', 'JobPosting', 'VideoObject', 'Recipe'] },
      { key: 'ab-test-tech', label: 'Setup A/B Test Tecnico', prompt: 'Setup A/B test tecnico {VARIATION}: instalacao script, goals, variacao via visual/codigo, sample size, publicacao, estatistica.', model: 'claude-sonnet-4-6', mentors: ['Laja'], variations: ['VWO', 'Google Optimize (legacy)', 'Optimizely', 'Convert.com', 'AB Tasty', 'Kameleoon', 'Statsig', 'GrowthBook', 'Custom feature flags', 'Server-side test'] },
      { key: 'api', label: 'API Integration', prompt: 'Plano integracao API {VARIATION}: auth (OAuth2/API key), endpoints, rate limits, error handling, webhooks, logs, security, OpenAPI doc.', model: 'claude-opus-4-7', mentors: ['Friedman'], variations: ['Payments Stripe', 'Shipping correios', 'Fiscal NFSe', 'CRM push', 'Email transactional', 'SMS/WhatsApp', 'Calendar', 'Video Zoom', 'Cloud storage', 'Custom backend'] },
      { key: 'headless', label: 'Headless Migration', prompt: 'Plano migracao {VARIATION} para headless: arquitetura, content migration, SEO preservation, performance goals, cronograma 6sem, riscos+mitigacao.', model: 'claude-opus-4-7-thinking', mentors: ['Friedman'], variations: ['WP -> Next.js+Strapi', 'WP -> Gatsby+Contentful', 'Shopify -> Hydrogen', 'Magento -> Vue Storefront', 'Drupal -> Next', 'Joomla -> Astro', 'Blog headless', 'E-com headless', 'Documentation headless', 'Marketing site'] },
      { key: 'accessibility', label: 'Accessibility WCAG AA', prompt: 'Audit acessibilidade WCAG AA {VARIATION}: keyboard, screen readers, contrast, ARIA, images alt, forms labels. Issues + fixes priorizados.', model: 'claude-sonnet-4-6', mentors: ['Friedman'], variations: ['LP single page', 'Blog', 'E-com checkout', 'SaaS dashboard', 'Formularios complex', 'Video content', 'Interactive charts', 'PDF documents', 'Mobile app', 'Email templates'] },
      { key: 'security-audit', label: 'Security Audit', prompt: 'Security audit {VARIATION}: OWASP Top 10, CSP headers, XSS/CSRF, SQL injection, auth flaws, dependencies CVE. Fix plan priorizado.', model: 'claude-opus-4-7', mentors: ['OWASP'], variations: ['Basic site', 'E-com PCI', 'Login auth', 'Admin panel', 'Payment flow', 'File uploads', 'API endpoints', 'Third-party integrations', 'Mobile app', 'Supply chain'] },
      { key: 'deploy', label: 'Deploy Pipeline', prompt: 'Setup deploy pipeline {VARIATION}: CI/CD, staging/prod, rollback, smoke tests, health checks, monitoring.', model: 'claude-sonnet-4-6', mentors: ['DevOps best practices'], variations: ['Vercel', 'Netlify', 'AWS Amplify', 'Cloudflare Pages', 'Github Actions custom', 'GitLab CI', 'CircleCI', 'Jenkins', 'Docker+Kubernetes', 'Firebase Hosting'] },
    ],
  },

  // AGENTE 13 - DADOS & BI
  {
    agentId: '13',
    agentName: 'Dados & BI',
    deliverables: [
      { key: 'dashboard', label: 'Dashboard KPIs', prompt: 'Dashboard {VARIATION} AEMR para {{cliente}}: 4 pilares x 3-4 graficos. MoM+YoY. Data sources. Recomendacoes.', model: 'virtual-data-analyst', mentors: ['Avinash Kaushik', 'Brent Dykes'], variations: ['Looker Studio', 'Power BI', 'Tableau', 'Metabase', 'Grafana', 'Redash', 'Google Sheets native', 'Preset/Superset', 'Mode', 'Sisense'] },
      { key: 'attribution', label: 'Modelo Atribuicao', prompt: 'Modelo atribuicao multi-touch {VARIATION}: compare 6 modelos (last/first/linear/decay/position/data-driven). Recomendacao + impacto.', model: 'virtual-data-analyst', mentors: ['Kaushik'], variations: ['E-com basic', 'B2B long cycle', 'SaaS trial>paid', 'Mobile app', 'Cross-device', 'Offline->Online', 'Influencer attribution', 'Podcast attribution', 'Content attribution', 'Incrementality testing'] },
      { key: 'cohort', label: 'Cohort Analysis', prompt: 'Cohort analysis {VARIATION} de {{cliente}}: mes aquisicao x retencao M1/M3/M6/M12. Melhor/pior cohort, padroes sazonais, recomendacoes.', model: 'virtual-data-analyst', mentors: ['Kaushik'], variations: ['Acquisition cohorts', 'Behavioral cohorts', 'Subscription cohorts', 'E-com AOV cohorts', 'Feature adoption', 'Channel cohorts', 'Campaign cohorts', 'Device cohorts', 'Plan tier cohorts', 'Geographic cohorts'] },
      { key: 'ltv', label: 'LTV Calculation', prompt: 'LTV {VARIATION} {{cliente}} por segmento+canal: formula (ticket x freq x margem x vida_util). Top/bottom 3 segmentos. Decisoes orcamentarias.', model: 'virtual-data-analyst', mentors: ['Kaushik'], variations: ['Predictive LTV', 'Historical LTV', 'Cohort-based', 'Channel-based', 'Product-based', 'Plan-based', 'Geography-based', 'Acquisition source', 'Winbacks', 'Referrals'] },
      { key: 'ab-stats', label: 'Analise A/B Estatistica', prompt: 'Analise estatistica A/B {VARIATION}: Z/Chi, p-value, significancia 95%, uplift, IC, sample size posthoc. Decisao go/no-go.', model: 'claude-sonnet-4-6-thinking', mentors: ['Laja', 'Ron Kohavi (Trustworthy Experiments)'], variations: ['Frequentista', 'Bayesiana', 'Sequential testing', 'Multi-arm bandit', 'Multivariate', 'CUPED variance reduction', 'Heterogeneous treatment', 'Novelty effect', 'Seasonality adjusted', 'Primacy effect'] },
      { key: 'rfm', label: 'Segmentacao RFM', prompt: 'Segmentacao RFM {VARIATION} base clientes {{cliente}}: score 1-5 Recency+Frequency+Monetary. Segmentos (Champions/Loyal/Potential/AtRisk/Lost). Acoes/segmento.', model: 'virtual-data-analyst', mentors: ['Kaushik'], variations: ['E-com', 'SaaS subscription', 'Services', 'Marketplace', 'App users', 'Content subscribers', 'Donors non-profit', 'Event attendees', 'Course students', 'Members association'] },
      { key: 'churn-model', label: 'Churn Model', prompt: 'Modelo preditivo churn {VARIATION}: features (comportamento/tenure/NPS/suporte), scoring 0-100, thresholds, acoes automatizadas.', model: 'claude-opus-4-7-thinking', mentors: ['Kaushik'], variations: ['SaaS B2B', 'SaaS B2C', 'Subscription box', 'Gym/fitness', 'Financial services', 'Telecom', 'Healthcare', 'Education', 'Insurance', 'Streaming'] },
      { key: 'data-pipeline', label: 'Data Pipeline', prompt: 'Data pipeline {VARIATION} de {{cliente}}: sources, ETL/ELT, warehouse, transformation, BI. Arquitetura recomendada.', model: 'claude-opus-4-7', mentors: ['Modern Data Stack'], variations: ['Starter simple', 'BigQuery+dbt', 'Snowflake enterprise', 'Redshift', 'Databricks', 'Postgres+dbt', 'Fivetran+Snowflake', 'Airbyte+BigQuery', 'Stitch+Redshift', 'Custom ELT'] },
      { key: 'forecast-model', label: 'Forecast Model', prompt: 'Forecast model {VARIATION}: time series (ARIMA/Prophet/LSTM), inputs, sazonalidade, intervalos confianca, cenarios.', model: 'claude-opus-4-7-thinking', mentors: ['Kaushik'], variations: ['Revenue monthly', 'Revenue weekly', 'Leads volume', 'Churn forecast', 'Inventory demand', 'Traffic forecast', 'Conversion rate', 'CAC forecast', 'LTV projection', 'Pipeline value'] },
      { key: 'insights-storytelling', label: 'Data Storytelling', prompt: 'Data storytelling {VARIATION} a partir de dados {{cliente}}: narrative arc, hook, insights priorizados, visualizacoes, recomendacao acionavel.', model: 'virtual-data-analyst', mentors: ['Dykes', 'Cole Nussbaumer'], variations: ['Executive summary 1 pag', 'Board deck 10 slides', 'Stakeholder memo', 'Team all-hands', 'Client report', 'Investor update', 'Press release data-driven', 'Blog post data-driven', 'LinkedIn carousel', 'Conference talk'] },
    ],
  },

  // AGENTE 14 - SEO
  {
    agentId: '14',
    agentName: 'SEO',
    deliverables: [
      { key: 'audit', label: 'Audit SEO', prompt: 'Audit SEO {VARIATION} de {{cliente}}: tecnico, on-page, conteudo, backlinks, local. Top 20 acoes priorizadas.', model: 'virtual-research-pro', mentors: ['Rand Fishkin', 'Brian Dean'], variations: ['Tecnico profundo', 'On-page keywords', 'Conteudo gaps', 'Backlinks toxic', 'Local SEO', 'International hreflang', 'Mobile-first', 'Speed CWV', 'E-A-T authority', 'Competitive gap'] },
      { key: 'keyword-research', label: 'Keyword Research', prompt: 'Keyword research {VARIATION} 50+ keywords para {{cliente}}: branded, produto, problema, comparacao, informacional. Volume, dificuldade, CPC, intent, SERP features. Cluster.', model: 'virtual-research-pro', mentors: ['Fishkin'], variations: ['Topic hub', 'Long-tail 100+', 'Local keywords', 'International', 'Voice search', 'Featured snippets', 'PAA boxes', 'Video queries', 'Shopping queries', 'Transactional'] },
      { key: 'link-building', label: 'Link Building', prompt: 'Plano link building {VARIATION} white-hat {{cliente}}: HARO, broken link, skyscraper, guest posts, digital PR, parcerias. Meta 20 backlinks DR>30 em 90d.', model: 'virtual-research-pro', mentors: ['Dean'], variations: ['HARO/Qwoted', 'Broken link', 'Skyscraper', 'Guest posting', 'Digital PR', 'Linkable assets', 'Resource pages', 'Unlinked mentions', 'Influencer outreach', 'Community links'] },
      { key: 'cluster', label: 'Topic Cluster', prompt: 'Topic cluster {VARIATION} tema X: 1 pillar page 4000+ pal + 10 spokes 800-1500 pal + internal links. Keywords, angulos, cronograma.', model: 'claude-sonnet-4-6', mentors: ['Fishkin', 'Dean'], variations: ['Pilar definitivo', 'Comparison hub', 'How-to collection', 'Trends hub', 'Industry guide', 'Tool comparison', 'Use case cluster', 'Persona-based', 'Jobs-to-be-done', 'Buying stage'] },
      { key: 'local-seo', label: 'Local SEO', prompt: 'Local SEO {VARIATION} {{cliente}}: Google Business Profile completo, citations NAP, reviews, local keywords, Maps pack, local link building.', model: 'virtual-research-pro', mentors: ['Fishkin'], variations: ['Single location', 'Multi-location franchise', 'Service-area business', 'E-com com loja fisica', 'Healthcare clinic', 'Restaurant', 'Hotel/hospitality', 'Real estate agent', 'Lawyer', 'Auto services'] },
      { key: 'featured-snippets', label: 'Featured Snippets', prompt: 'Otimizacao FS {VARIATION}: 20 keywords com oportunidade, formato (paragraph/list/table/video), template H2 pergunta+resposta 40-50 pal, updates.', model: 'virtual-research-pro', mentors: ['Dean'], variations: ['Paragraph snippets', 'List snippets', 'Table snippets', 'Video snippets', 'Definition queries', 'How-to queries', 'Comparison queries', 'Numeric queries', 'Local queries', 'Shopping queries'] },
      { key: 'international', label: 'International SEO', prompt: 'International SEO {VARIATION}: hreflang, URL structure (sub/sub/cc), keyword research/pais, cultural adaptation, local link building, GSC/pais.', model: 'virtual-research-pro', mentors: ['Fishkin'], variations: ['EN-BR expansion', 'ES-BR Portuguese-Spanish', 'EN para LatAm', 'Portugues BR-PT', 'Multi-pais Europa', 'Multi-pais Asia', 'UAE/GCC', 'India English+Hindi', 'Japan culture', 'China baidu adaptation'] },
      { key: 'technical-seo', label: 'SEO Tecnico', prompt: 'SEO tecnico {VARIATION}: crawlability, indexability, rendering, speed, mobile, schema, canonical, robots, sitemap, log analysis.', model: 'claude-opus-4-7', mentors: ['Friedman', 'Dean'], variations: ['JavaScript SEO', 'Faceted navigation', 'Pagination', 'Duplicate content', 'Log file analysis', 'Render-blocking', 'Large site architecture', 'E-com categories', 'Blog categories', 'Migration SEO'] },
      { key: 'content-brief', label: 'Content Brief SEO', prompt: 'Content brief {VARIATION}: target keyword, intent, search volume, top SERP analysis, H2/H3 outline, target length, internal/external links, FAQ from PAA.', model: 'virtual-research-pro', mentors: ['Dean', 'Fishkin'], variations: ['How-to tutorial', 'Comparison', 'Listicle', 'Definition', 'Tool roundup', 'Case study', 'Guide definitive', 'Review product', 'News/trends', 'Controversial opinion'] },
      { key: 'seo-monitoring', label: 'SEO Monitoring', prompt: 'SEO monitoring dashboard {VARIATION}: rankings, traffic, conversions, CWV, backlinks, issues. Alertas + weekly report.', model: 'virtual-data-analyst', mentors: ['Fishkin'], variations: ['Ahrefs', 'SEMrush', 'Sistrix', 'Search Console+Looker', 'Serpstat', 'Moz Pro', 'Ubersuggest', 'Rank Math', 'SE Ranking', 'Custom GSC API'] },
    ],
  },

  // AGENTE 15 - VIDEO
  {
    agentId: '15',
    agentName: 'Video',
    deliverables: [
      { key: 'youtube-roteiro', label: 'Roteiro YouTube', prompt: 'Roteiro YouTube {VARIATION} 10min {{cliente}} sobre X: hook 15s, pattern interrupt 15s, credibilidade 30s, 3-5 pontos 7min, CTA 1min, outro 1min. B-roll, cortes, CTAs visuais.', model: 'virtual-creative-powerhouse', mentors: ['MrBeast', 'Casey Neistat', 'Ali Abdaal'], variations: ['Educational tutorial', 'Vlog lifestyle', 'Review produto', 'Reaction content', 'Challenge/experiment', 'Interview', 'Documentary style', 'How-to DIY', 'Storytelling personal', 'Investigation series'] },
      { key: 'reels-scripts', label: '5 Reels Scripts', prompt: '5 scripts Reels {VARIATION} 30-60s {{cliente}}: hook 3s, punchline, CTA verbal+visual, audio trending, legendas. 5 formatos diferentes.', model: 'virtual-creative-powerhouse', mentors: ['Neistat', 'MrBeast'], variations: ['Tutorial rapido', 'Antes/depois', 'Mito vs verdade', 'POV/storytime', '3 erros comuns', 'Challenge recreated', 'Reaction to X', 'Day-in-life', 'Product demo', 'Trend-jack'] },
      { key: 'shorts-estrategia', label: 'YouTube Shorts Plan', prompt: 'Plano YouTube Shorts {VARIATION}: 30 ideias 60s, hooks 3s, 5 categorias (dicas/listas/antes-depois/stories/perguntas). Cadencia diaria, CTAs canal.', model: 'virtual-creative-powerhouse', mentors: ['Abdaal'], variations: ['Channel starter', 'Existing channel repurpose', 'Daily posting schedule', 'Educational niche', 'Entertainment', 'Gaming', 'Fitness', 'Business/entrepreneurship', 'Tech reviews', 'Lifestyle'] },
      { key: 'vsl', label: 'VSL 10min', prompt: 'VSL 10min {{cliente}}: estrutura {VARIATION} (hook+agitacao+solucao+prova+oferta+urgencia+CTA). Slides+B-roll/bloco, tempo, tom.', model: 'virtual-creative-powerhouse', mentors: ['Halbert', 'Schwartz'], variations: ['Info product', 'SaaS demo', 'Coaching program', 'Workshop', 'Mastermind', 'Membership', 'High-ticket consulting', 'Course launch', 'Book launch', 'Event registration'] },
      { key: 'live-event', label: 'Live/Webinar Roteiro', prompt: 'Roteiro live/webinar {VARIATION} 60min {{cliente}}: abertura 5min+hook, 3 blocos 15min slides, Q&A 10min, pitch 10min, CTAs intermediarios. Checklist OBS+multicam+chat+gravacao.', model: 'virtual-creative-powerhouse', mentors: ['Walker'], variations: ['Lead gen webinar', 'Sales webinar', 'Product launch event', 'Educational masterclass', 'Partner co-marketing', 'Panel discussion', 'Workshop hands-on', 'Q&A session', 'Live shopping', 'Anniversary event'] },
      { key: 'ugc-brief-creator', label: 'Brief UGC Creator', prompt: 'Brief UGC {VARIATION} para creator {{cliente}}: produto info, pontos-chave, angulos sugeridos, do/dont, specs tecnicas, duration, tone.', model: 'virtual-creative-powerhouse', mentors: ['Gary Vee'], variations: ['Unboxing', 'Day-in-life', 'Before/after', 'Tutorial', 'Reaction', 'Testimonial', 'POV first-person', 'Comparison', 'Story narrative', 'Challenge'] },
      { key: 'trend-jack', label: 'Trend Jacking Video', prompt: '10 trends ultima semana {VARIATION} {{cliente}} ({{segmento}}): audio trending, estrutura, adaptacao nicho, exemplos brands, risco vs viral.', model: 'virtual-realtime-grok', mentors: ['Gary Vee'], variations: ['TikTok audios', 'Reels transitions', 'YouTube Shorts trends', 'Twitter/X threads', 'Meme formats', 'Cultural events', 'News jacking', 'Industry conferences', 'Celebrity moments', 'Seasonal trends'] },
      { key: 'docuseries', label: 'Docuseries Planning', prompt: 'Docuseries {VARIATION} {{cliente}} 5 episodios 15min cada: arco narrativo, characters, hook/episodio, CTAs, release cadence.', model: 'virtual-creative-powerhouse', mentors: ['Neistat'], variations: ['Behind-the-scenes company', 'Customer journey', 'Industry deep-dive', 'Founder story', 'Team portraits', 'Product creation', 'Event coverage', 'Investigation', 'Experiment series', 'Transformation'] },
      { key: 'podcast-video', label: 'Podcast Video Setup', prompt: 'Setup podcast video {VARIATION} para {{cliente}}: formato (solo/duo/panel), equipment recomendado, roteiro tipo, cortes shorts, distribuicao.', model: 'claude-sonnet-4-6', mentors: ['Ferriss'], variations: ['Solo monolog', 'Duo host', 'Interview guest', 'Panel multi', 'Live podcast', 'Video-first', 'Audio-first', 'Remote hybrid', 'Studio in-person', 'Field recording'] },
      { key: 'video-ads', label: 'Video Ads 15s/30s/60s', prompt: 'Scripts video ads {VARIATION} {{cliente}}: versoes 15s bumper, 30s in-stream, 60s long. Hook, desenvolvimento, CTA. Adaptacoes por canal.', model: 'virtual-creative-powerhouse', mentors: ['MrBeast', 'Ogilvy'], variations: ['Facebook/Instagram', 'YouTube pre-roll', 'YouTube bumper', 'TikTok nativo', 'LinkedIn B2B', 'Google Display', 'OTT/CTV', 'Cinema ad', 'OOH video', 'Podcast host-read'] },
    ],
  },

  // AGENTE 16 - CRO/UX
  {
    agentId: '16',
    agentName: 'CRO/UX',
    deliverables: [
      { key: 'audit-lift', label: 'Audit CRO LIFT', prompt: 'Audit CRO LIFT {VARIATION} {{cliente}}: 6 dimensoes (Proposta/Relevancia/Clareza/Ansiedade/Distracao/Urgencia). Score 1-10, top 10 hipoteses ICE.', model: 'claude-opus-4-7-thinking', mentors: ['Peep Laja', 'Talia Wolf'], variations: ['LP standalone', 'Checkout funnel', 'Signup flow', 'Onboarding app', 'Product page', 'Category page', 'Search results page', 'Pricing page', 'Feature landing', 'Hero home'] },
      { key: 'ab-tests-5', label: '5 Testes A/B ICE', prompt: '5 testes A/B {VARIATION} priorizados ICE. Cada: hipotese "Se X entao Y porque Z", control, treatment, metrica, sample size, duracao, ICE.', model: 'claude-opus-4-7-thinking', mentors: ['Laja'], variations: ['Hero message', 'CTA variations', 'Form fields reduction', 'Trust signals', 'Social proof position', 'Pricing layout', 'Urgency/scarcity', 'Value prop framing', 'Navigation structure', 'Checkout simplification'] },
      { key: 'heatmap', label: 'Heatmap Analysis', prompt: 'Analise heatmaps {VARIATION} {{cliente}}: click, scroll, move. Dead clicks, rage clicks, scroll depth, pontos abandono, patterns inesperados. Top 10 acoes.', model: 'virtual-data-analyst', mentors: ['Krug'], variations: ['Hotjar', 'Microsoft Clarity', 'Fullstory', 'CrazyEgg', 'Mouseflow', 'Lucky Orange', 'Smartlook', 'Plerdy', 'Inspectlet', 'Custom heatmap'] },
      { key: 'checkout', label: 'Checkout Optimization', prompt: 'Otimizar checkout {VARIATION} e-com {{cliente}}: step-by-step (cart>info>shipping>payment>confirm), gargalos, 10 melhorias priorizadas.', model: 'virtual-data-analyst', mentors: ['Laja'], variations: ['Single-page checkout', 'Multi-step', 'Guest checkout', 'Saved payment methods', 'One-click buy', 'Subscription checkout', 'Mobile-first', 'PIX integrado BR', 'Pay-in-installments', 'Cross-border'] },
      { key: 'user-journey', label: 'User Journey Map', prompt: 'User Journey Map {VARIATION} {{cliente}}: 5 stages (awareness/consideration/decision/purchase/retention), touchpoints, thoughts/feelings/pain, oportunidades.', model: 'claude-sonnet-4-6', mentors: ['Krug', 'Nielsen Norman'], variations: ['B2C e-com', 'B2B SaaS', 'B2B services', 'App download', 'Subscription box', 'Healthcare patient', 'Student education', 'Financial services', 'Hospitality guest', 'Non-profit donor'] },
      { key: 'forms', label: 'Form Optimization', prompt: 'Otimizacao forms {VARIATION} {{cliente}}: reducao campos, inline validation, conditional logic, progressive profiling, mobile UX, copy submit.', model: 'claude-haiku-4-5', mentors: ['Luke Wroblewski (Web Form Design)'], variations: ['Contact form', 'Lead gen form', 'Signup form', 'Survey', 'Checkout info', 'Quote request', 'Multi-step form', 'Mobile form', 'Long form application', 'Quiz form'] },
      { key: 'mobile-audit', label: 'Mobile UX Audit', prompt: 'Audit UX mobile {VARIATION} {{cliente}}: checklist 30 itens (touch targets 44px, fontes 16px+, spacing, hamburger, CTAs sticky, forms, performance, thumb zone). Score+plano.', model: 'claude-sonnet-4-6', mentors: ['Krug', 'Luke W'], variations: ['LP', 'E-com', 'SaaS app', 'News/content', 'Social app', 'Banking', 'Healthcare', 'Travel booking', 'Education', 'Marketplace'] },
      { key: 'persuasion', label: 'Persuasion Audit', prompt: 'Persuasion audit {VARIATION} {{cliente}} aplicando Cialdini 7 principios + Fogg Behavior Model + LIFT. Onde esta faltando, sugestoes por principio.', model: 'claude-opus-4-7-thinking', mentors: ['Cialdini (Influence)', 'Fogg'], variations: ['Reciprocidade', 'Compromisso/Consistencia', 'Prova social', 'Afinidade/Liking', 'Autoridade', 'Escassez', 'Unidade/Tribe', 'Fogg B=MAT', 'LIFT Model', 'Nudge theory'] },
      { key: 'search-onsite', label: 'On-site Search Optim', prompt: 'Otimizacao search on-site {VARIATION}: autocomplete, filters, sorting, zero-results handling, typo tolerance, synonyms, relevance ranking.', model: 'claude-sonnet-4-6', mentors: ['Krug'], variations: ['E-com search', 'Blog/content search', 'Documentation', 'SaaS dashboard', 'Marketplace', 'Classifieds', 'Real estate', 'Travel search', 'Jobs board', 'Healthcare directory'] },
      { key: 'personalization', label: 'Personalization Strategy', prompt: 'Personalization strategy {VARIATION} {{cliente}}: segmentacao, rules vs ML, touchpoints, testes, privacy LGPD.', model: 'virtual-strategist-toc', mentors: ['Laja'], variations: ['Geolocation', 'Device-based', 'Referrer-based', 'Behavior-based', 'AI recommendations', 'Email segmentation', 'Dynamic content', 'Pricing personalization', 'Feature gating', 'Journey-based'] },
    ],
  },
];

// Merge base + compact specs
const ALL_SPECS: AgentSpec[] = [...AGENT_SPECS, ...COMPACT_AGENT_SPECS];

/**
 * Gera todos os 1600 comandos programaticamente.
 */
export function generateAllCommands(): GeneratedCommand[] {
  const commands: GeneratedCommand[] = [];

  for (const agent of ALL_SPECS) {
    for (const deliverable of agent.deliverables) {
      for (const variation of deliverable.variations) {
        const filledPrompt = deliverable.prompt.replace(/\{VARIATION\}/g, variation.toLowerCase());
        commands.push({
          id: `${agent.agentId}-${deliverable.key}-${variation.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}`,
          agentId: agent.agentId,
          label: `${deliverable.label}: ${variation}`,
          description: `${agent.agentName} - ${deliverable.label} (${variation})`,
          prompt: filledPrompt,
          category: deliverable.label,
          preferredModelId: deliverable.model,
          mentors: deliverable.mentors,
          tags: [deliverable.key, variation.toLowerCase(), agent.agentId],
        });
      }
    }
  }

  return commands;
}

// Cache para nao re-gerar toda vez
let _cached: GeneratedCommand[] | null = null;

export function getAllCommands(): GeneratedCommand[] {
  if (_cached) return _cached;
  _cached = generateAllCommands();
  return _cached;
}

export function getCommandsForAgent(agentId: string): GeneratedCommand[] {
  return getAllCommands().filter((c) => c.agentId === agentId);
}

export function getTotalCommandsCount(): number {
  return getAllCommands().length;
}

/**
 * Aplica placeholders de cliente no prompt do comando.
 */
export function applyCommandPlaceholders(
  command: GeneratedCommand,
  ctx: { cliente?: string; segmento?: string; step?: string; pilar?: string; health?: string }
): string {
  return command.prompt
    .replace(/\{\{cliente\}\}/g, ctx.cliente ?? 'seu cliente')
    .replace(/\{\{segmento\}\}/g, ctx.segmento ?? 'seu segmento')
    .replace(/\{\{step\}\}/g, ctx.step ?? 'atual')
    .replace(/\{\{pilar\}\}/g, ctx.pilar ?? 'definir')
    .replace(/\{\{health\}\}/g, ctx.health ?? 'neutro');
}
