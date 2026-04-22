/**
 * Token usage tracker - contabiliza tokens usados por agente/cliente/modelo.
 * Persiste em localStorage (fallback) e Supabase (sync).
 */

export interface UsageRecord {
  id: string;
  timestamp: string;
  userId: string;
  agentId: string;
  clientId?: string;
  modelId: string;
  modelProvider: 'claude' | 'gemini' | 'openrouter';
  inputTokens: number;
  outputTokens: number;
  thinkingTokens?: number;
  estimatedCostUSD: number;
}

const LS_KEY = 'v4_pitwall_usage_log';
const MAX_RECORDS = 1000; // limit local storage

// Pricing por modelo (USD per 1M tokens) - Abril 2026
const PRICING: Record<string, { input: number; output: number }> = {
  // Claude
  'claude-opus-4-7': { input: 5, output: 25 },
  'claude-opus-4-5': { input: 5, output: 25 },
  'claude-opus-4-1': { input: 5, output: 25 },
  'claude-sonnet-4-6': { input: 3, output: 15 },
  'claude-sonnet-4-5': { input: 3, output: 15 },
  'claude-haiku-4-5': { input: 1, output: 5 },
  // Gemini
  'gemini-3.1-pro': { input: 2, output: 12 },
  'gemini-3.1-flash': { input: 0.25, output: 1.5 },
  'gemini-2.5-pro': { input: 1.25, output: 10 },
  'gemini-2.5-flash': { input: 0.3, output: 2.5 },
  'gemini-2.5-flash-image': { input: 0.3, output: 2.5 },
  'gemini-2.0-flash': { input: 0.1, output: 0.4 },
  // OpenAI via OpenRouter
  'openai/gpt-5.4': { input: 2.5, output: 15 },
  'openai/gpt-5.4-mini': { input: 0.5, output: 2.5 },
  'openai/gpt-5.4-nano': { input: 0.2, output: 1.25 },
  'openai/o3': { input: 10, output: 40 },
  'openai/o3-mini': { input: 1.1, output: 4.4 },
  // Other
  'x-ai/grok-4': { input: 3, output: 15 },
  'deepseek/deepseek-r1': { input: 0.55, output: 2.19 },
};

/**
 * Estima tokens a partir do texto (4 chars = 1 token aprox).
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Calcula custo estimado em USD.
 */
export function estimateCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number
): number {
  const price = PRICING[modelId];
  if (!price) return 0;
  return (inputTokens / 1_000_000) * price.input + (outputTokens / 1_000_000) * price.output;
}

/**
 * Registra um uso.
 */
export function recordUsage(record: Omit<UsageRecord, 'id' | 'timestamp' | 'estimatedCostUSD'>): UsageRecord {
  const full: UsageRecord = {
    ...record,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    estimatedCostUSD: estimateCost(record.modelId, record.inputTokens, record.outputTokens),
  };

  try {
    const raw = localStorage.getItem(LS_KEY);
    const list: UsageRecord[] = raw ? JSON.parse(raw) : [];
    list.push(full);
    // Keep apenas ultimos MAX_RECORDS
    if (list.length > MAX_RECORDS) list.splice(0, list.length - MAX_RECORDS);
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  } catch {
    // silent
  }

  return full;
}

/**
 * Busca historico.
 */
export function getUsageHistory(): UsageRecord[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Agregados para dashboard.
 */
export interface UsageStats {
  totalTokens: number;
  totalCostUSD: number;
  totalCostBRL: number;
  byAgent: Record<string, { tokens: number; cost: number; count: number }>;
  byClient: Record<string, { tokens: number; cost: number; count: number }>;
  byModel: Record<string, { tokens: number; cost: number; count: number }>;
  byDay: Record<string, { tokens: number; cost: number; count: number }>;
  last30Days: { date: string; cost: number; tokens: number }[];
}

export function computeUsageStats(usdToBrl: number = 5.2): UsageStats {
  const records = getUsageHistory();
  const stats: UsageStats = {
    totalTokens: 0,
    totalCostUSD: 0,
    totalCostBRL: 0,
    byAgent: {},
    byClient: {},
    byModel: {},
    byDay: {},
    last30Days: [],
  };

  for (const r of records) {
    const tokens = r.inputTokens + r.outputTokens + (r.thinkingTokens ?? 0);
    stats.totalTokens += tokens;
    stats.totalCostUSD += r.estimatedCostUSD;

    const agentKey = r.agentId;
    if (!stats.byAgent[agentKey]) stats.byAgent[agentKey] = { tokens: 0, cost: 0, count: 0 };
    stats.byAgent[agentKey].tokens += tokens;
    stats.byAgent[agentKey].cost += r.estimatedCostUSD;
    stats.byAgent[agentKey].count++;

    if (r.clientId) {
      const ck = r.clientId;
      if (!stats.byClient[ck]) stats.byClient[ck] = { tokens: 0, cost: 0, count: 0 };
      stats.byClient[ck].tokens += tokens;
      stats.byClient[ck].cost += r.estimatedCostUSD;
      stats.byClient[ck].count++;
    }

    const mk = r.modelId;
    if (!stats.byModel[mk]) stats.byModel[mk] = { tokens: 0, cost: 0, count: 0 };
    stats.byModel[mk].tokens += tokens;
    stats.byModel[mk].cost += r.estimatedCostUSD;
    stats.byModel[mk].count++;

    const day = r.timestamp.slice(0, 10);
    if (!stats.byDay[day]) stats.byDay[day] = { tokens: 0, cost: 0, count: 0 };
    stats.byDay[day].tokens += tokens;
    stats.byDay[day].cost += r.estimatedCostUSD;
    stats.byDay[day].count++;
  }

  stats.totalCostBRL = stats.totalCostUSD * usdToBrl;

  // Last 30 days timeline
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const rec = stats.byDay[key] ?? { tokens: 0, cost: 0 };
    stats.last30Days.push({ date: key, cost: rec.cost, tokens: rec.tokens });
  }

  return stats;
}

/**
 * Limpa historico (para testes/reset).
 */
export function clearUsageHistory(): void {
  localStorage.removeItem(LS_KEY);
}
