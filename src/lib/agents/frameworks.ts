export interface AEMRPilar {
  name: string;
  description: string;
  agents: string[];
  metrics: string;
}

export const AEMR_PILARES: AEMRPilar[] = [
  { name: 'Aquisicao', description: 'Gerar demanda qualificada', agents: ['03', '04', '14', '12'], metrics: 'CPL, CPC, ROAS' },
  { name: 'Engajamento', description: 'Nutrir e ativar leads', agents: ['06', '07', '09', '15'], metrics: 'Engagement Rate, Viralidade' },
  { name: 'Monetizacao', description: 'Converter em receita', agents: ['16', '08', '11'], metrics: 'SQL > 40%, Resp < 5min' },
  { name: 'Retencao', description: 'Manter e expandir', agents: ['11', '10', '09'], metrics: 'NPS > 50, Churn < 3%' },
];

export interface STEPPhase {
  phase: string;
  profile: string;
  strategy: string;
}

export const STEP_PHASES: STEPPhase[] = [
  { phase: 'Saber', profile: 'Nao sabe do problema', strategy: 'Educacao, awareness, topo funil' },
  { phase: 'Ter', profile: 'Sabe e quer solucao', strategy: 'Consideracao, comparacao, prova social' },
  { phase: 'Executar', profile: 'Escolheu, implementando', strategy: 'Onboarding, primeiros resultados, conversao' },
  { phase: 'Potencializar', profile: 'Maduro, quer escalar', strategy: 'Otimizacao avancada, expansao, upsell' },
];

export const TOC_STEPS = [
  'IDENTIFICAR a restricao',
  'EXPLORAR ao maximo',
  'SUBORDINAR tudo a ela',
  'ELEVAR investindo',
  'REPETIR',
];

export const TOC_ACCOUNTING = {
  throughput: 'T = Receita - Custos Variaveis (MAXIMIZAR)',
  investment: 'I = Dinheiro preso no sistema (MINIMIZAR)',
  operatingExpense: 'OE = Custo fixo (crescer MENOS que T)',
  roi: 'ROI = (T - OE) / I',
};

export const DBR = {
  drum: 'Ritmo da restricao = ritmo do sistema',
  buffer: 'Reserva antes da restricao',
  rope: 'Nao libere mais trabalho que a restricao absorve',
};

export interface InterAgentTrigger {
  event: string;
  origin: string;
  destination: string;
  action: string;
}

export const INTER_AGENT_TRIGGERS: InterAgentTrigger[] = [
  { event: 'Criativo fatigou (Freq > 3.5)', origin: '04', destination: '05', action: 'Refresh urgente' },
  { event: 'Keyword alto volume', origin: '14', destination: '09, 12', action: 'Artigo + LP' },
  { event: 'Lead nao converte', origin: '11', destination: '03, 04', action: 'Revisar trafego' },
  { event: 'Bounce > 60%', origin: '13', destination: '16, 12', action: 'Auditoria' },
  { event: 'CTR email < 1%', origin: '09', destination: '08', action: 'Reescrever' },
  { event: 'Hook rate < 20%', origin: '15', destination: '05', action: 'Novo conceito' },
  { event: 'Core Web Vitals vermelho', origin: '12', destination: '14', action: 'Impacto rankings' },
  { event: 'NPS < 30', origin: '11', destination: '01', action: 'Plano contencao' },
];
