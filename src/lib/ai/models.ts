/**
 * Catalogo completo de modelos disponiveis.
 * Sistema "Virtual Models" estilo Perplexity MAX:
 * - Apresenta varias opcoes ao usuario
 * - Internamente tudo mapeia para Claude ou Gemini API
 * - Cada "modelo virtual" aplica personalidade/config especifica
 */

export type APIProvider = 'claude' | 'gemini';

export interface ModelDefinition {
  id: string;
  label: string;
  provider: APIProvider;
  apiModel: string;
  category: 'premium' | 'balanced' | 'fast' | 'reasoning' | 'multimodal' | 'creative';
  description: string;
  contextWindow: number;
  maxOutput: number;
  supportsExtendedThinking: boolean;
  supportsVision: boolean;
  supportsAudio: boolean;
  supportsVideo: boolean;
  supportsGoogleSearch: boolean;
  supportsImageGen: boolean;
  idealFor: string[];
  costTier: 1 | 2 | 3 | 4; // 1 = cheapest, 4 = premium
  systemPromptStyle?: string; // Optional personality enhancement
}

export const MODELS: Record<string, ModelDefinition> = {
  // ===== CLAUDE - OPUS (Premium tier) =====
  'claude-opus-4-5': {
    id: 'claude-opus-4-5',
    label: 'Claude Opus 4.5',
    provider: 'claude',
    apiModel: 'claude-opus-4-5',
    category: 'premium',
    description: 'Modelo mais avancado da Anthropic. Raciocinio complexo, escrita longa, analise profunda.',
    contextWindow: 200000,
    maxOutput: 32000,
    supportsExtendedThinking: true,
    supportsVision: true,
    supportsAudio: false,
    supportsVideo: false,
    supportsGoogleSearch: false,
    supportsImageGen: false,
    idealFor: ['estrategia', 'diagnostico profundo', 'relatorio executivo', 'case study', 'ebook completo'],
    costTier: 4,
  },
  'claude-opus-4-5-thinking': {
    id: 'claude-opus-4-5-thinking',
    label: 'Claude Opus 4.5 + Extended Thinking',
    provider: 'claude',
    apiModel: 'claude-opus-4-5',
    category: 'reasoning',
    description: 'Opus 4.5 com raciocinio estendido. Para problemas complexos que exigem "pensamento profundo".',
    contextWindow: 200000,
    maxOutput: 32000,
    supportsExtendedThinking: true,
    supportsVision: true,
    supportsAudio: false,
    supportsVideo: false,
    supportsGoogleSearch: false,
    supportsImageGen: false,
    idealFor: ['problemas multi-variavel', 'debugging estrategico', 'TOC thinking processes', 'forecast avancado'],
    costTier: 4,
    systemPromptStyle: 'Use pensamento estendido. Considere multiplas abordagens antes de responder. Mostre o raciocinio passo a passo.',
  },
  'claude-opus-4-1': {
    id: 'claude-opus-4-1',
    label: 'Claude Opus 4.1',
    provider: 'claude',
    apiModel: 'claude-opus-4-1',
    category: 'premium',
    description: 'Versao anterior do Opus. Estavel e qualidade alta.',
    contextWindow: 200000,
    maxOutput: 32000,
    supportsExtendedThinking: true,
    supportsVision: true,
    supportsAudio: false,
    supportsVideo: false,
    supportsGoogleSearch: false,
    supportsImageGen: false,
    idealFor: ['qualidade premium', 'consistencia em longo prazo'],
    costTier: 4,
  },

  // ===== CLAUDE - SONNET (Balanced tier) =====
  'claude-sonnet-4-5': {
    id: 'claude-sonnet-4-5',
    label: 'Claude Sonnet 4.5',
    provider: 'claude',
    apiModel: 'claude-sonnet-4-5',
    category: 'balanced',
    description: 'Melhor custo-beneficio. Equilibrio entre qualidade e velocidade. RECOMENDADO para maioria dos casos.',
    contextWindow: 200000,
    maxOutput: 16000,
    supportsExtendedThinking: true,
    supportsVision: true,
    supportsAudio: false,
    supportsVideo: false,
    supportsGoogleSearch: false,
    supportsImageGen: false,
    idealFor: ['copy', 'artigo blog', 'email sequencia', 'calendario editorial', 'planning'],
    costTier: 2,
  },
  'claude-sonnet-4-5-thinking': {
    id: 'claude-sonnet-4-5-thinking',
    label: 'Claude Sonnet 4.5 + Extended Thinking',
    provider: 'claude',
    apiModel: 'claude-sonnet-4-5',
    category: 'reasoning',
    description: 'Sonnet com pensamento estendido. Bom para CRO, atribuicao, analise de funil.',
    contextWindow: 200000,
    maxOutput: 16000,
    supportsExtendedThinking: true,
    supportsVision: true,
    supportsAudio: false,
    supportsVideo: false,
    supportsGoogleSearch: false,
    supportsImageGen: false,
    idealFor: ['analise dados', 'hipoteses teste A/B', 'modelos atribuicao'],
    costTier: 2,
    systemPromptStyle: 'Pense cuidadosamente antes de responder. Liste alternativas e justifique a escolha.',
  },

  // ===== CLAUDE - HAIKU (Fast tier) =====
  'claude-haiku-4-5': {
    id: 'claude-haiku-4-5',
    label: 'Claude Haiku 4.5',
    provider: 'claude',
    apiModel: 'claude-haiku-4-5',
    category: 'fast',
    description: 'Ultra rapido e economico. Ideal para legendas sociais, respostas curtas, quick actions.',
    contextWindow: 200000,
    maxOutput: 8000,
    supportsExtendedThinking: false,
    supportsVision: true,
    supportsAudio: false,
    supportsVideo: false,
    supportsGoogleSearch: false,
    supportsImageGen: false,
    idealFor: ['legendas', 'hashtags', 'respostas rapidas', 'headlines A/B'],
    costTier: 1,
  },

  // ===== GEMINI - Latest (Google) =====
  'gemini-2-5-pro': {
    id: 'gemini-2-5-pro',
    label: 'Gemini 2.5 Pro',
    provider: 'gemini',
    apiModel: 'gemini-2.5-pro',
    category: 'premium',
    description: 'Top tier do Google. Suporta audio, video, imagem, Google Search grounding. Ideal para pesquisa.',
    contextWindow: 2000000,
    maxOutput: 64000,
    supportsExtendedThinking: true,
    supportsVision: true,
    supportsAudio: true,
    supportsVideo: true,
    supportsGoogleSearch: true,
    supportsImageGen: false,
    idealFor: ['pesquisa com dados atuais', 'audio/video', 'SEO research', 'analise concorrentes'],
    costTier: 3,
  },
  'gemini-2-5-flash': {
    id: 'gemini-2-5-flash',
    label: 'Gemini 2.5 Flash',
    provider: 'gemini',
    apiModel: 'gemini-2.5-flash',
    category: 'balanced',
    description: 'Rapido, multimodal, com Google Search. Equilibrio Gemini.',
    contextWindow: 1000000,
    maxOutput: 32000,
    supportsExtendedThinking: true,
    supportsVision: true,
    supportsAudio: true,
    supportsVideo: true,
    supportsGoogleSearch: true,
    supportsImageGen: false,
    idealFor: ['multimodal geral', 'pesquisa rapida', 'analise de video curto'],
    costTier: 2,
  },
  'gemini-2-5-flash-image': {
    id: 'gemini-2-5-flash-image',
    label: 'Gemini 2.5 Flash Image (Nano Banana)',
    provider: 'gemini',
    apiModel: 'gemini-2.5-flash-image',
    category: 'multimodal',
    description: 'GERACAO DE IMAGENS. Unico modelo que cria imagens no dashboard. Designer Ads, criativos, banners.',
    contextWindow: 32000,
    maxOutput: 8000,
    supportsExtendedThinking: false,
    supportsVision: true,
    supportsAudio: false,
    supportsVideo: false,
    supportsGoogleSearch: false,
    supportsImageGen: true,
    idealFor: ['criativos ads', 'banners', 'mockups', 'ilustracoes'],
    costTier: 2,
  },
  'gemini-2-0-flash': {
    id: 'gemini-2-0-flash',
    label: 'Gemini 2.0 Flash',
    provider: 'gemini',
    apiModel: 'gemini-2.0-flash',
    category: 'fast',
    description: 'Rapido e multimodal. Com Google Search.',
    contextWindow: 1000000,
    maxOutput: 8000,
    supportsExtendedThinking: false,
    supportsVision: true,
    supportsAudio: true,
    supportsVideo: true,
    supportsGoogleSearch: true,
    supportsImageGen: false,
    idealFor: ['analise rapida', 'search grounding'],
    costTier: 1,
  },

  // ===== VIRTUAL MODELS (estilo perplexity - mesma API com personalidade) =====
  'virtual-creative-powerhouse': {
    id: 'virtual-creative-powerhouse',
    label: 'Creative Powerhouse',
    provider: 'claude',
    apiModel: 'claude-opus-4-5',
    category: 'creative',
    description: 'Claude Opus 4.5 tuned para criatividade extrema. Ideal para copy virais, storytelling, brand voice.',
    contextWindow: 200000,
    maxOutput: 32000,
    supportsExtendedThinking: true,
    supportsVision: true,
    supportsAudio: false,
    supportsVideo: false,
    supportsGoogleSearch: false,
    supportsImageGen: false,
    idealFor: ['copy viral', 'slogans', 'tagline', 'brand story', 'big ideas'],
    costTier: 4,
    systemPromptStyle: 'Voce e um copy master na linhagem de David Ogilvy, Eugene Schwartz e MrBeast. Priorize originalidade, hooks fortes, e ideias que param o scroll. Seja audaz, nao generico.',
  },
  'virtual-strategist-toc': {
    id: 'virtual-strategist-toc',
    label: 'Strategist (TOC Master)',
    provider: 'claude',
    apiModel: 'claude-opus-4-5',
    category: 'reasoning',
    description: 'Opus 4.5 especializado em Teoria das Restricoes e pensamento estrategico Goldratt-style.',
    contextWindow: 200000,
    maxOutput: 32000,
    supportsExtendedThinking: true,
    supportsVision: true,
    supportsAudio: false,
    supportsVideo: false,
    supportsGoogleSearch: false,
    supportsImageGen: false,
    idealFor: ['diagnostico cliente', 'analise gargalos', 'thinking processes', 'priorizacao ICE'],
    costTier: 4,
    systemPromptStyle: 'Voce e um estrategista treinado em Goldratt (TOC), Collins (hedgehog), Drucker (teoria dos negocios), Porter (5 forcas). Identifique SEMPRE a restricao primaria antes de qualquer recomendacao.',
  },
  'virtual-data-analyst': {
    id: 'virtual-data-analyst',
    label: 'Data Analyst (Kaushik-style)',
    provider: 'claude',
    apiModel: 'claude-sonnet-4-5',
    category: 'reasoning',
    description: 'Sonnet 4.5 especializado em analise de dados, KPIs, atribuicao, cohort.',
    contextWindow: 200000,
    maxOutput: 16000,
    supportsExtendedThinking: true,
    supportsVision: true,
    supportsAudio: false,
    supportsVideo: false,
    supportsGoogleSearch: false,
    supportsImageGen: false,
    idealFor: ['dashboards', 'atribuicao', 'cohort', 'forecast', 'ROI calcs'],
    costTier: 2,
    systemPromptStyle: 'Voce e Avinash Kaushik / Brent Dykes. Mostre matematica explicita, use framework "awareness > consideration > intent > evaluation > purchase", sempre proponha data storytelling com insight claro.',
  },
  'virtual-research-pro': {
    id: 'virtual-research-pro',
    label: 'Research Pro (Gemini + Google Search)',
    provider: 'gemini',
    apiModel: 'gemini-2.5-pro',
    category: 'reasoning',
    description: 'Gemini 2.5 Pro com Google Search para pesquisa com dados atuais. SEO, concorrentes, benchmarks.',
    contextWindow: 2000000,
    maxOutput: 64000,
    supportsExtendedThinking: true,
    supportsVision: true,
    supportsAudio: true,
    supportsVideo: true,
    supportsGoogleSearch: true,
    supportsImageGen: false,
    idealFor: ['SEO research', 'analise concorrentes', 'benchmarks BR', 'trends'],
    costTier: 3,
    systemPromptStyle: 'Voce e um pesquisador senior. Use Google Search para buscar dados atuais (<6 meses), cite fontes, e sintetize insights acionaveis. Priorize dados brasileiros quando relevante.',
  },
  'virtual-designer-visual': {
    id: 'virtual-designer-visual',
    label: 'Visual Designer (Image Gen)',
    provider: 'gemini',
    apiModel: 'gemini-2.5-flash-image',
    category: 'multimodal',
    description: 'Gemini Image Gen para criar criativos, banners, mockups. Agente 05 (Designer Ads) usa por default.',
    contextWindow: 32000,
    maxOutput: 8000,
    supportsExtendedThinking: false,
    supportsVision: true,
    supportsAudio: false,
    supportsVideo: false,
    supportsGoogleSearch: false,
    supportsImageGen: true,
    idealFor: ['gerar criativos', 'banners', 'mockups de anuncio', 'variacoes visuais A/B'],
    costTier: 2,
  },
};

export const MODEL_CATEGORIES = {
  premium: { label: 'Premium (Qualidade maxima)', icon: '✨', color: '#a855f7' },
  balanced: { label: 'Balanced (Custo-beneficio)', icon: '⚖️', color: '#3b82f6' },
  fast: { label: 'Fast (Rapido e economico)', icon: '⚡', color: '#10b981' },
  reasoning: { label: 'Reasoning (Pensamento estendido)', icon: '🧠', color: '#f59e0b' },
  multimodal: { label: 'Multimodal (Imagem/Audio/Video)', icon: '🎨', color: '#ec4899' },
  creative: { label: 'Creative (Copy e Storytelling)', icon: '💡', color: '#f97316' },
} as const;

/**
 * Auto-seleciona o melhor modelo baseado na tarefa e agente.
 * Logica similar ao Perplexity MAX Auto mode.
 */
export function autoSelectModel(
  userPrompt: string,
  agentId: string,
  hasClaudeKey: boolean,
  hasGeminiKey: boolean
): ModelDefinition {
  const prompt = userPrompt.toLowerCase();

  // 1. Agente 05 (Designer Ads) com intent de gerar imagem
  if (agentId === '05' && hasGeminiKey && (prompt.includes('gerar') || prompt.includes('criar imagem') || prompt.includes('mockup'))) {
    return MODELS['virtual-designer-visual'];
  }

  // 2. Agente 14 (SEO) ou pedido explicito de pesquisa com dados atuais
  if ((agentId === '14' || prompt.includes('pesquis') || prompt.includes('benchmark') || prompt.includes('concorrente') || prompt.includes('dados atuais')) && hasGeminiKey) {
    return MODELS['virtual-research-pro'];
  }

  // 3. Agente 13 (Dados & BI) -> Data analyst
  if (agentId === '13' && hasClaudeKey) {
    return MODELS['virtual-data-analyst'];
  }

  // 4. Agente 01 (Mestre) -> Strategist
  if (agentId === '01' && hasClaudeKey) {
    return MODELS['virtual-strategist-toc'];
  }

  // 5. Agente 08 (Copy Performance) ou 09 (Copy Conteudo) -> Creative
  if ((agentId === '08' || agentId === '09') && hasClaudeKey) {
    return MODELS['virtual-creative-powerhouse'];
  }

  // 6. Tarefas complexas -> Extended thinking
  if ((prompt.includes('diagnostico') || prompt.includes('estrategia') || prompt.includes('planejamento profundo') || prompt.includes('gargalo')) && hasClaudeKey) {
    return MODELS['claude-opus-4-5-thinking'];
  }

  // 7. Tarefas rapidas (legendas, hashtags) -> Haiku
  if ((prompt.includes('legenda') || prompt.includes('hashtag') || prompt.length < 80) && hasClaudeKey) {
    return MODELS['claude-haiku-4-5'];
  }

  // 8. Default: Sonnet 4.5 (balanced)
  if (hasClaudeKey) return MODELS['claude-sonnet-4-5'];
  if (hasGeminiKey) return MODELS['gemini-2-5-flash'];

  // 9. Fallback
  return MODELS['claude-sonnet-4-5'];
}

export function getModelsByProvider(provider: APIProvider): ModelDefinition[] {
  return Object.values(MODELS).filter((m) => m.provider === provider);
}

export function getModelsByCategory(category: ModelDefinition['category']): ModelDefinition[] {
  return Object.values(MODELS).filter((m) => m.category === category);
}

export function getModel(id: string): ModelDefinition | null {
  return MODELS[id] ?? null;
}
