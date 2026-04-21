/**
 * Catalogo de 30+ modelos de IA (Abril 2026).
 * 3 providers: Claude direto, Gemini direto, OpenRouter (gateway para 400+).
 * Sistema "Virtual Models" estilo Perplexity MAX com auto-selecao.
 */

export type APIProvider = 'claude' | 'gemini' | 'openrouter';

export interface ModelDefinition {
  id: string;
  label: string;
  provider: APIProvider;
  apiModel: string;
  category: 'frontier' | 'reasoning' | 'balanced' | 'fast' | 'multimodal' | 'creative' | 'opensource' | 'specialist';
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
  costTier: 1 | 2 | 3 | 4 | 5;
  systemPromptStyle?: string;
  badge?: string;
}

export const MODELS: Record<string, ModelDefinition> = {
  // ========= FRONTIER (TOP DE LINHA - Abril 2026) =========

  'gpt-5-4': {
    id: 'gpt-5-4',
    label: 'GPT-5.4 (OpenAI)',
    provider: 'openrouter',
    apiModel: 'openai/gpt-5.4',
    category: 'frontier',
    description: 'Flagship OpenAI (Marco 2026). Unifica Codex + GPT com 1M contexto e computer use.',
    contextWindow: 1000000,
    maxOutput: 32000,
    supportsExtendedThinking: true,
    supportsVision: true,
    supportsAudio: false,
    supportsVideo: false,
    supportsGoogleSearch: false,
    supportsImageGen: false,
    idealFor: ['raciocinio complexo', 'logica', 'matematica', 'codificacao', 'computer use'],
    costTier: 5,
    badge: 'NEW',
  },

  'gpt-5-4-mini': {
    id: 'gpt-5-4-mini',
    label: 'GPT-5.4 Mini',
    provider: 'openrouter',
    apiModel: 'openai/gpt-5.4-mini',
    category: 'balanced',
    description: 'Versao equilibrada do GPT-5.4. Otimo custo-beneficio.',
    contextWindow: 1000000,
    maxOutput: 16000,
    supportsExtendedThinking: false,
    supportsVision: true,
    supportsAudio: false,
    supportsVideo: false,
    supportsGoogleSearch: false,
    supportsImageGen: false,
    idealFor: ['tarefas gerais', 'codigo rapido', 'analise'],
    costTier: 2,
  },

  'gemini-3-1-pro': {
    id: 'gemini-3-1-pro',
    label: 'Gemini 3.1 Pro',
    provider: 'gemini',
    apiModel: 'gemini-3.1-pro',
    category: 'frontier',
    description: 'Flagship Google (Fevereiro 2026). 2x reasoning vs Gemini 3. 1M contexto, 65K output. #1 em 12/18 benchmarks.',
    contextWindow: 1000000,
    maxOutput: 65000,
    supportsExtendedThinking: true,
    supportsVision: true,
    supportsAudio: true,
    supportsVideo: true,
    supportsGoogleSearch: true,
    supportsImageGen: false,
    idealFor: ['multimodal avancado', 'raciocinio', 'grandes contextos', 'audio/video'],
    costTier: 4,
    badge: 'NEW',
  },

  'claude-opus-4-5': {
    id: 'claude-opus-4-5',
    label: 'Claude Opus 4.5',
    provider: 'claude',
    apiModel: 'claude-opus-4-5',
    category: 'frontier',
    description: 'Flagship Anthropic (Nov 2025). 80.9% SWE-bench. Respostas mais "humanas" e raciocinio avancado.',
    contextWindow: 200000,
    maxOutput: 32000,
    supportsExtendedThinking: true,
    supportsVision: true,
    supportsAudio: false,
    supportsVideo: false,
    supportsGoogleSearch: false,
    supportsImageGen: false,
    idealFor: ['estrategia', 'escrita longa', 'analise profunda', 'codigo'],
    costTier: 5,
  },

  'grok-4': {
    id: 'grok-4',
    label: 'Grok 4 (xAI)',
    provider: 'openrouter',
    apiModel: 'x-ai/grok-4',
    category: 'frontier',
    description: 'Modelo da xAI com acesso a dados em tempo real via X.',
    contextWindow: 256000,
    maxOutput: 16000,
    supportsExtendedThinking: true,
    supportsVision: true,
    supportsAudio: false,
    supportsVideo: false,
    supportsGoogleSearch: true,
    supportsImageGen: false,
    idealFor: ['tempo real', 'trending topics', 'social listening', 'noticias'],
    costTier: 4,
  },

  // ========= REASONING (PENSAMENTO ESTENDIDO) =========

  'claude-opus-4-5-thinking': {
    id: 'claude-opus-4-5-thinking',
    label: 'Claude Opus 4.5 + Extended Thinking',
    provider: 'claude',
    apiModel: 'claude-opus-4-5',
    category: 'reasoning',
    description: 'Opus 4.5 com raciocinio estendido. Mostra o pensamento antes de responder.',
    contextWindow: 200000,
    maxOutput: 32000,
    supportsExtendedThinking: true,
    supportsVision: true,
    supportsAudio: false,
    supportsVideo: false,
    supportsGoogleSearch: false,
    supportsImageGen: false,
    idealFor: ['diagnostico TOC', 'problemas multi-variavel', 'estrategia complexa'],
    costTier: 5,
    systemPromptStyle: 'Use pensamento estendido. Considere multiplas abordagens, mostre trade-offs, justifique escolhas.',
  },

  'openai-o3': {
    id: 'openai-o3',
    label: 'OpenAI o3 (Reasoning)',
    provider: 'openrouter',
    apiModel: 'openai/o3',
    category: 'reasoning',
    description: 'Modelo de raciocinio puro da OpenAI. Resolve problemas complexos passo a passo.',
    contextWindow: 200000,
    maxOutput: 32000,
    supportsExtendedThinking: true,
    supportsVision: true,
    supportsAudio: false,
    supportsVideo: false,
    supportsGoogleSearch: false,
    supportsImageGen: false,
    idealFor: ['matematica', 'logica', 'science', 'pesquisa analitica'],
    costTier: 5,
  },

  'openai-o3-mini': {
    id: 'openai-o3-mini',
    label: 'OpenAI o3-mini',
    provider: 'openrouter',
    apiModel: 'openai/o3-mini',
    category: 'reasoning',
    description: 'Versao compacta do o3. Raciocinio rapido e economico.',
    contextWindow: 128000,
    maxOutput: 16000,
    supportsExtendedThinking: true,
    supportsVision: false,
    supportsAudio: false,
    supportsVideo: false,
    supportsGoogleSearch: false,
    supportsImageGen: false,
    idealFor: ['codigo', 'calculos', 'debugging'],
    costTier: 2,
  },

  'deepseek-r1': {
    id: 'deepseek-r1',
    label: 'DeepSeek-R1',
    provider: 'openrouter',
    apiModel: 'deepseek/deepseek-r1',
    category: 'reasoning',
    description: 'Modelo chines focado em raciocinio matematico e logico. Excelente custo-beneficio.',
    contextWindow: 128000,
    maxOutput: 16000,
    supportsExtendedThinking: true,
    supportsVision: false,
    supportsAudio: false,
    supportsVideo: false,
    supportsGoogleSearch: false,
    supportsImageGen: false,
    idealFor: ['matematica', 'calculos ROI', 'logica', 'atribuicao'],
    costTier: 1,
  },

  'kimi-k2-thinking': {
    id: 'kimi-k2-thinking',
    label: 'Kimi K2 Thinking',
    provider: 'openrouter',
    apiModel: 'moonshotai/kimi-k2-thinking',
    category: 'reasoning',
    description: 'Modelo chines (Moonshot AI) focado em contextos longos e raciocinio avancado.',
    contextWindow: 2000000,
    maxOutput: 32000,
    supportsExtendedThinking: true,
    supportsVision: false,
    supportsAudio: false,
    supportsVideo: false,
    supportsGoogleSearch: false,
    supportsImageGen: false,
    idealFor: ['analise documentos longos', 'pesquisa profunda', 'sintese'],
    costTier: 2,
  },

  // ========= BALANCED (CUSTO-BENEFICIO) =========

  'claude-sonnet-4-5': {
    id: 'claude-sonnet-4-5',
    label: 'Claude Sonnet 4.5',
    provider: 'claude',
    apiModel: 'claude-sonnet-4-5',
    category: 'balanced',
    description: 'Workhorse Anthropic. 77.2% SWE-bench. 30h+ operacao autonoma. RECOMENDADO.',
    contextWindow: 200000,
    maxOutput: 16000,
    supportsExtendedThinking: true,
    supportsVision: true,
    supportsAudio: false,
    supportsVideo: false,
    supportsGoogleSearch: false,
    supportsImageGen: false,
    idealFor: ['copy', 'artigo', 'email sequencia', 'planning', 'codigo'],
    costTier: 3,
  },

  'claude-sonnet-4-5-thinking': {
    id: 'claude-sonnet-4-5-thinking',
    label: 'Claude Sonnet 4.5 + Thinking',
    provider: 'claude',
    apiModel: 'claude-sonnet-4-5',
    category: 'reasoning',
    description: 'Sonnet com thinking estendido. Ideal para analise de funil, CRO, atribuicao.',
    contextWindow: 200000,
    maxOutput: 16000,
    supportsExtendedThinking: true,
    supportsVision: true,
    supportsAudio: false,
    supportsVideo: false,
    supportsGoogleSearch: false,
    supportsImageGen: false,
    idealFor: ['analise dados', 'teste A/B', 'atribuicao', 'cohort'],
    costTier: 3,
    systemPromptStyle: 'Pense cuidadosamente. Liste alternativas, justifique escolha.',
  },

  'gemini-3-1-flash': {
    id: 'gemini-3-1-flash',
    label: 'Gemini 3.1 Flash',
    provider: 'gemini',
    apiModel: 'gemini-3.1-flash',
    category: 'balanced',
    description: 'Versao rapida do Gemini 3.1. Multimodal + Google Search.',
    contextWindow: 1000000,
    maxOutput: 32000,
    supportsExtendedThinking: false,
    supportsVision: true,
    supportsAudio: true,
    supportsVideo: true,
    supportsGoogleSearch: true,
    supportsImageGen: false,
    idealFor: ['pesquisa rapida', 'multimodal', 'audio/video analysis'],
    costTier: 2,
  },

  'gpt-5-2': {
    id: 'gpt-5-2',
    label: 'GPT-5.2',
    provider: 'openrouter',
    apiModel: 'openai/gpt-5.2',
    category: 'balanced',
    description: 'GPT 5.2 (Dez 2025). Boa qualidade com custo medio.',
    contextWindow: 200000,
    maxOutput: 16000,
    supportsExtendedThinking: false,
    supportsVision: true,
    supportsAudio: false,
    supportsVideo: false,
    supportsGoogleSearch: false,
    supportsImageGen: false,
    idealFor: ['geral', 'escrita', 'analise'],
    costTier: 3,
  },

  'mistral-3-large': {
    id: 'mistral-3-large',
    label: 'Mistral 3 Large',
    provider: 'openrouter',
    apiModel: 'mistralai/mistral-3-large',
    category: 'balanced',
    description: 'Modelo europeu (Mistral AI). Eficiencia e capacidades avancadas.',
    contextWindow: 128000,
    maxOutput: 16000,
    supportsExtendedThinking: false,
    supportsVision: true,
    supportsAudio: false,
    supportsVideo: false,
    supportsGoogleSearch: false,
    supportsImageGen: false,
    idealFor: ['europeu compliance', 'conteudo multilingual'],
    costTier: 3,
  },

  // ========= FAST (RAPIDO E ECONOMICO) =========

  'claude-haiku-4-5': {
    id: 'claude-haiku-4-5',
    label: 'Claude Haiku 4.5',
    provider: 'claude',
    apiModel: 'claude-haiku-4-5',
    category: 'fast',
    description: 'Ultra rapido. Near-frontier intelligence com custo minimo.',
    contextWindow: 200000,
    maxOutput: 8000,
    supportsExtendedThinking: false,
    supportsVision: true,
    supportsAudio: false,
    supportsVideo: false,
    supportsGoogleSearch: false,
    supportsImageGen: false,
    idealFor: ['legendas', 'hashtags', 'headlines A/B', 'respostas curtas'],
    costTier: 1,
  },

  'gpt-5-4-nano': {
    id: 'gpt-5-4-nano',
    label: 'GPT-5.4 Nano',
    provider: 'openrouter',
    apiModel: 'openai/gpt-5.4-nano',
    category: 'fast',
    description: 'Ultra economico OpenAI. $0.20/$1.25 per M tokens.',
    contextWindow: 1000000,
    maxOutput: 8000,
    supportsExtendedThinking: false,
    supportsVision: true,
    supportsAudio: false,
    supportsVideo: false,
    supportsGoogleSearch: false,
    supportsImageGen: false,
    idealFor: ['batch processing', 'tarefas simples em volume'],
    costTier: 1,
  },

  'grok-3-mini': {
    id: 'grok-3-mini',
    label: 'Grok 3 Mini',
    provider: 'openrouter',
    apiModel: 'x-ai/grok-3-mini',
    category: 'fast',
    description: 'Grok rapido com acesso a dados em tempo real.',
    contextWindow: 128000,
    maxOutput: 8000,
    supportsExtendedThinking: false,
    supportsVision: false,
    supportsAudio: false,
    supportsVideo: false,
    supportsGoogleSearch: true,
    supportsImageGen: false,
    idealFor: ['checagem rapida', 'trending'],
    costTier: 1,
  },

  // ========= MULTIMODAL (IMAGEM / AUDIO / VIDEO) =========

  'gemini-2-5-flash-image': {
    id: 'gemini-2-5-flash-image',
    label: 'Gemini 2.5 Flash Image (Nano Banana)',
    provider: 'gemini',
    apiModel: 'gemini-2.5-flash-image',
    category: 'multimodal',
    description: 'GERA IMAGENS! Cria criativos, banners, mockups. Usado pelo Agente 05 (Designer Ads).',
    contextWindow: 32000,
    maxOutput: 8000,
    supportsExtendedThinking: false,
    supportsVision: true,
    supportsAudio: false,
    supportsVideo: false,
    supportsGoogleSearch: false,
    supportsImageGen: true,
    idealFor: ['criativos ads', 'banners', 'mockups', 'ilustracoes', 'variacoes A/B visuais'],
    costTier: 2,
  },

  'gemini-2-5-pro': {
    id: 'gemini-2-5-pro',
    label: 'Gemini 2.5 Pro',
    provider: 'gemini',
    apiModel: 'gemini-2.5-pro',
    category: 'multimodal',
    description: '2M contexto. Audio + Video + Imagem + Google Search. Ideal para SEO research.',
    contextWindow: 2000000,
    maxOutput: 64000,
    supportsExtendedThinking: true,
    supportsVision: true,
    supportsAudio: true,
    supportsVideo: true,
    supportsGoogleSearch: true,
    supportsImageGen: false,
    idealFor: ['SEO research', 'analise concorrentes', 'benchmarks', 'video analysis'],
    costTier: 3,
  },

  // ========= OPENSOURCE (MODELOS ABERTOS) =========

  'llama-4-behemoth': {
    id: 'llama-4-behemoth',
    label: 'Llama 4 Behemoth',
    provider: 'openrouter',
    apiModel: 'meta-llama/llama-4-behemoth',
    category: 'opensource',
    description: 'Flagship Meta open-source. Uma das versoes mais poderosas da Meta.',
    contextWindow: 256000,
    maxOutput: 16000,
    supportsExtendedThinking: false,
    supportsVision: true,
    supportsAudio: false,
    supportsVideo: false,
    supportsGoogleSearch: false,
    supportsImageGen: false,
    idealFor: ['alternativa open-source', 'fine-tuning future', 'privacidade'],
    costTier: 3,
  },

  'llama-4-maverick': {
    id: 'llama-4-maverick',
    label: 'Llama 4 Maverick',
    provider: 'openrouter',
    apiModel: 'meta-llama/llama-4-maverick',
    category: 'opensource',
    description: 'Llama 4 medio. Custo-beneficio alto para tarefas gerais.',
    contextWindow: 256000,
    maxOutput: 16000,
    supportsExtendedThinking: false,
    supportsVision: true,
    supportsAudio: false,
    supportsVideo: false,
    supportsGoogleSearch: false,
    supportsImageGen: false,
    idealFor: ['tarefas gerais', 'balanced'],
    costTier: 2,
  },

  'qwen-3-5-max': {
    id: 'qwen-3-5-max',
    label: 'Qwen 3.5 Max (Alibaba)',
    provider: 'openrouter',
    apiModel: 'qwen/qwen-3.5-max',
    category: 'opensource',
    description: 'Lidera benchmarks open-source. 397B parametros.',
    contextWindow: 128000,
    maxOutput: 16000,
    supportsExtendedThinking: false,
    supportsVision: true,
    supportsAudio: false,
    supportsVideo: false,
    supportsGoogleSearch: false,
    supportsImageGen: false,
    idealFor: ['alternativa premium open-source', 'chinese market insights'],
    costTier: 3,
  },

  'gemma-4-31b': {
    id: 'gemma-4-31b',
    label: 'Gemma 4 31B (Google)',
    provider: 'openrouter',
    apiModel: 'google/gemma-4-31b-it',
    category: 'opensource',
    description: 'Open-source Google otimizado para rodar local.',
    contextWindow: 128000,
    maxOutput: 8000,
    supportsExtendedThinking: false,
    supportsVision: false,
    supportsAudio: false,
    supportsVideo: false,
    supportsGoogleSearch: false,
    supportsImageGen: false,
    idealFor: ['deploy local', 'privacidade extrema'],
    costTier: 1,
  },

  // ========= VIRTUAL MODELS (PERSONALITY PRESETS) =========

  'virtual-creative-powerhouse': {
    id: 'virtual-creative-powerhouse',
    label: 'Creative Powerhouse',
    provider: 'claude',
    apiModel: 'claude-opus-4-5',
    category: 'creative',
    description: 'Opus 4.5 tuned para copy viral, storytelling, brand voice. Ogilvy + Schwartz + MrBeast.',
    contextWindow: 200000,
    maxOutput: 32000,
    supportsExtendedThinking: true,
    supportsVision: true,
    supportsAudio: false,
    supportsVideo: false,
    supportsGoogleSearch: false,
    supportsImageGen: false,
    idealFor: ['copy viral', 'slogans', 'tagline', 'brand story', 'big ideas'],
    costTier: 5,
    systemPromptStyle: 'Voce e um copy master na linhagem de David Ogilvy, Eugene Schwartz e MrBeast. Priorize originalidade, hooks que param o scroll, e ideias ousadas. NUNCA generico.',
  },

  'virtual-strategist-toc': {
    id: 'virtual-strategist-toc',
    label: 'Strategist TOC (Goldratt-style)',
    provider: 'claude',
    apiModel: 'claude-opus-4-5',
    category: 'creative',
    description: 'Opus 4.5 especializado em Teoria das Restricoes. Goldratt + Collins + Drucker + Porter.',
    contextWindow: 200000,
    maxOutput: 32000,
    supportsExtendedThinking: true,
    supportsVision: true,
    supportsAudio: false,
    supportsVideo: false,
    supportsGoogleSearch: false,
    supportsImageGen: false,
    idealFor: ['diagnostico', 'gargalos', 'thinking processes', 'priorizacao ICE'],
    costTier: 5,
    systemPromptStyle: 'Estrategista treinado em Goldratt (TOC), Collins (hedgehog), Drucker (teoria dos negocios), Porter (5 forcas). Identifique SEMPRE a restricao primaria antes de qualquer recomendacao.',
  },

  'virtual-data-analyst': {
    id: 'virtual-data-analyst',
    label: 'Data Analyst (Kaushik-style)',
    provider: 'claude',
    apiModel: 'claude-sonnet-4-5',
    category: 'creative',
    description: 'Sonnet especializado em KPIs, atribuicao, cohort. Kaushik + Dykes.',
    contextWindow: 200000,
    maxOutput: 16000,
    supportsExtendedThinking: true,
    supportsVision: true,
    supportsAudio: false,
    supportsVideo: false,
    supportsGoogleSearch: false,
    supportsImageGen: false,
    idealFor: ['dashboards', 'atribuicao', 'cohort', 'forecast', 'ROI calcs'],
    costTier: 3,
    systemPromptStyle: 'Voce e Avinash Kaushik / Brent Dykes. Mostre matematica explicita, use framework "awareness > consideration > intent > evaluation > purchase", proponha data storytelling com insight claro.',
  },

  'virtual-research-pro': {
    id: 'virtual-research-pro',
    label: 'Research Pro (Gemini 3.1 Pro + Google Search)',
    provider: 'gemini',
    apiModel: 'gemini-3.1-pro',
    category: 'creative',
    description: 'Gemini 3.1 Pro com Google Search. Pesquisa com dados atuais e benchmarks.',
    contextWindow: 1000000,
    maxOutput: 65000,
    supportsExtendedThinking: true,
    supportsVision: true,
    supportsAudio: true,
    supportsVideo: true,
    supportsGoogleSearch: true,
    supportsImageGen: false,
    idealFor: ['SEO research', 'analise concorrentes', 'benchmarks BR', 'trends'],
    costTier: 4,
    systemPromptStyle: 'Pesquisador senior. Use Google Search para dados atuais (<6 meses). Cite fontes. Sintetize insights acionaveis. Priorize dados brasileiros quando relevante.',
  },

  'virtual-designer-visual': {
    id: 'virtual-designer-visual',
    label: 'Visual Designer (Nano Banana)',
    provider: 'gemini',
    apiModel: 'gemini-2.5-flash-image',
    category: 'multimodal',
    description: 'Gemini Image Gen (Nano Banana) para criativos, banners, mockups.',
    contextWindow: 32000,
    maxOutput: 8000,
    supportsExtendedThinking: false,
    supportsVision: true,
    supportsAudio: false,
    supportsVideo: false,
    supportsGoogleSearch: false,
    supportsImageGen: true,
    idealFor: ['gerar criativos', 'banners', 'mockups ad', 'variacoes A/B visuais'],
    costTier: 2,
  },

  'virtual-claude-design': {
    id: 'virtual-claude-design',
    label: 'Claude Design (SVG + HTML/CSS)',
    provider: 'claude',
    apiModel: 'claude-opus-4-5',
    category: 'multimodal',
    description: 'Opus 4.5 tuned para gerar designs como SVG, HTML/CSS, animacoes CSS. Exports editaveis.',
    contextWindow: 200000,
    maxOutput: 32000,
    supportsExtendedThinking: false,
    supportsVision: true,
    supportsAudio: false,
    supportsVideo: false,
    supportsGoogleSearch: false,
    supportsImageGen: false,
    idealFor: ['SVG icons', 'HTML/CSS components', 'mockups editaveis', 'design system', 'animacoes'],
    costTier: 5,
    systemPromptStyle: 'Voce e um designer/engenheiro que produz designs como codigo. Entregue SVG valido, HTML/CSS moderno (Tailwind), animacoes CSS. Codigo limpo, responsive, acessivel. Preferia linhas simples e elegantes (estilo Stripe, Linear, Vercel).',
  },

  'virtual-realtime-grok': {
    id: 'virtual-realtime-grok',
    label: 'Real-time (Grok 4)',
    provider: 'openrouter',
    apiModel: 'x-ai/grok-4',
    category: 'creative',
    description: 'Grok 4 para trending topics, noticias recentes, social listening.',
    contextWindow: 256000,
    maxOutput: 16000,
    supportsExtendedThinking: false,
    supportsVision: true,
    supportsAudio: false,
    supportsVideo: false,
    supportsGoogleSearch: true,
    supportsImageGen: false,
    idealFor: ['tweets', 'trending', 'newsjacking', 'eventos ao vivo'],
    costTier: 4,
    systemPromptStyle: 'Voce tem acesso a dados em tempo real do X/Twitter. Priorize trends dos ultimos 7 dias, sentimento, conversas virais. Identifique newsjacking oportunidades.',
  },
};

export const MODEL_CATEGORIES = {
  frontier: { label: 'Frontier (Topo de linha)', icon: '🚀', color: '#a855f7' },
  reasoning: { label: 'Reasoning (Pensamento profundo)', icon: '🧠', color: '#f59e0b' },
  balanced: { label: 'Balanced (Custo-beneficio)', icon: '⚖️', color: '#3b82f6' },
  fast: { label: 'Fast (Rapido e economico)', icon: '⚡', color: '#10b981' },
  multimodal: { label: 'Multimodal (Imagem/Audio/Video)', icon: '🎨', color: '#ec4899' },
  creative: { label: 'Creative (Virtual Models)', icon: '💡', color: '#f97316' },
  opensource: { label: 'Open Source', icon: '🔓', color: '#06b6d4' },
  specialist: { label: 'Specialist', icon: '🎯', color: '#84cc16' },
} as const;

/**
 * Auto-seleciona o melhor modelo baseado na tarefa, agente e APIs disponiveis.
 */
export function autoSelectModel(
  userPrompt: string,
  agentId: string,
  hasClaudeKey: boolean,
  hasGeminiKey: boolean,
  hasOpenRouterKey: boolean
): ModelDefinition {
  const prompt = userPrompt.toLowerCase();

  // 1. Designer Ads ou pedido de imagem
  if (hasGeminiKey && (
    agentId === '05' ||
    prompt.includes('gerar imagem') || prompt.includes('criar imagem') ||
    prompt.includes('banner') || prompt.includes('mockup') || prompt.includes('criativo visual')
  )) {
    return MODELS['virtual-designer-visual'];
  }

  // 2. Video Dev / Design System / SVG / Component
  if (hasClaudeKey && (
    prompt.includes('svg') || prompt.includes('html/css') || prompt.includes('component') ||
    prompt.includes('design system') || prompt.includes('icon design')
  )) {
    return MODELS['virtual-claude-design'];
  }

  // 3. Realtime/trending topics
  if (hasOpenRouterKey && (
    prompt.includes('trending') || prompt.includes('tempo real') ||
    prompt.includes('viral') || prompt.includes('twitter') || prompt.includes('newsjacking')
  )) {
    return MODELS['virtual-realtime-grok'];
  }

  // 4. SEO/pesquisa com dados atuais
  if (hasGeminiKey && (
    agentId === '14' || prompt.includes('pesquis') || prompt.includes('benchmark') ||
    prompt.includes('concorrente') || prompt.includes('dados atuais')
  )) {
    return MODELS['virtual-research-pro'];
  }

  // 5. Matematica/logica pesada
  if ((hasOpenRouterKey || hasClaudeKey) && (
    prompt.includes('calcul') || prompt.includes('matematica') ||
    prompt.includes('formula') || prompt.includes('roi') && prompt.includes('explicar')
  )) {
    return hasOpenRouterKey ? MODELS['deepseek-r1'] : MODELS['claude-sonnet-4-5-thinking'];
  }

  // 6. Agente 13 -> Data Analyst
  if (agentId === '13' && hasClaudeKey) return MODELS['virtual-data-analyst'];

  // 7. Agente 01 -> Strategist
  if (agentId === '01' && hasClaudeKey) return MODELS['virtual-strategist-toc'];

  // 8. Copy (08/09)
  if ((agentId === '08' || agentId === '09') && hasClaudeKey) return MODELS['virtual-creative-powerhouse'];

  // 9. Diagnosticos/estrategia complexos -> Extended Thinking
  if (hasClaudeKey && (
    prompt.includes('diagnostico') || prompt.includes('estrategia') ||
    prompt.includes('planejamento profundo') || prompt.includes('gargalo')
  )) {
    return MODELS['claude-opus-4-5-thinking'];
  }

  // 10. Legendas/hashtags/headlines rapidas -> Haiku
  if (hasClaudeKey && (
    prompt.includes('legenda') || prompt.includes('hashtag') || prompt.includes('headline') ||
    prompt.length < 80
  )) {
    return MODELS['claude-haiku-4-5'];
  }

  // 11. Codigo/codificacao
  if (prompt.includes('codig') || prompt.includes('implement')) {
    if (hasOpenRouterKey) return MODELS['gpt-5-4'];
    if (hasClaudeKey) return MODELS['claude-opus-4-5'];
  }

  // 12. Default por prioridade
  if (hasClaudeKey) return MODELS['claude-sonnet-4-5'];
  if (hasGeminiKey) return MODELS['gemini-3-1-flash'];
  if (hasOpenRouterKey) return MODELS['gpt-5-4-mini'];

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
