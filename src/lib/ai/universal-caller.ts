/**
 * Universal AI Caller — tenta Claude primeiro, faz fallback para Gemini e OpenRouter.
 * Usado pelas skill views que precisam de resposta textual simples (sem streaming).
 */

import { callClaude } from './claude-client';
import { callGemini } from './gemini-client';
import { callOpenRouter } from './openrouter-client';
import { getClaudeKey, getGeminiKey, getOpenRouterKey } from './chat-provider';
import type { ChatRequest } from './types';

export type AIProvider = 'claude' | 'gemini' | 'openrouter';

export interface UniversalAIResult {
  text: string;
  provider: AIProvider;
  model: string;
  fallbackUsed?: boolean;
  attempts?: string[];
}

export interface UniversalAIOptions {
  /** Forcar uma ordem especifica de tentativas. Default: ['claude', 'gemini', 'openrouter'] */
  preferOrder?: AIProvider[];
  /** Modelo especifico por provider (override) */
  models?: Partial<Record<AIProvider, string>>;
  /** Se true, nao tenta fallback (so o primeiro da ordem) */
  noFallback?: boolean;
}

const DEFAULT_MODELS: Record<AIProvider, string> = {
  claude: 'claude-sonnet-4-6',
  gemini: 'gemini-3-1-flash',
  openrouter: 'openai/gpt-4o-mini',
};

/**
 * Chama IA tentando primeiro o provider preferido, depois fallback.
 * Lanca erro so se TODOS os providers falharem.
 */
export async function callAI(
  req: ChatRequest,
  options: UniversalAIOptions = {}
): Promise<UniversalAIResult> {
  const order = options.preferOrder || ['claude', 'gemini', 'openrouter'];
  const models = { ...DEFAULT_MODELS, ...(options.models || {}) };

  const attempts: string[] = [];
  const errors: string[] = [];

  for (const provider of order) {
    const key = provider === 'claude' ? getClaudeKey()
              : provider === 'gemini' ? getGeminiKey()
              : getOpenRouterKey();

    if (!key) {
      attempts.push(`${provider}: sem chave`);
      continue;
    }

    try {
      const model = models[provider];
      let text = '';

      if (provider === 'claude') {
        text = await callClaude(req, key, model as any);
      } else if (provider === 'gemini') {
        text = await callGemini(req, key, model as any, false);
      } else {
        text = await callOpenRouter(req, key, model as any);
      }

      return {
        text,
        provider,
        model,
        fallbackUsed: attempts.length > 0,
        attempts: [...attempts, `${provider}: OK`],
      };
    } catch (err: any) {
      const msg = err?.message || String(err);
      attempts.push(`${provider}: falhou (${msg.slice(0, 100)})`);
      errors.push(`${provider}: ${msg}`);

      if (options.noFallback) break;

      // Se o erro for "credit balance too low" ou similar, tentamos o proximo
      // Se for erro de rede, tambem tentamos
      // Se for erro 401/auth, tambem tentamos
      continue;
    }
  }

  throw new Error(
    `Nenhuma IA disponivel. Tentativas: ${attempts.join(' | ')}\n\nPara resolver:\n- Adicione creditos na Claude API (console.anthropic.com/billing)\n- Ou use sua chave Gemini (gratuita em aistudio.google.com/app/apikey)\n- Ou configure OpenRouter (openrouter.ai/keys)`
  );
}

/**
 * Helper para parsear JSON de resposta de IA (remove markdown fences, etc).
 */
export function parseAIJson<T = any>(text: string): T {
  // Remove markdown code fences
  let cleaned = text.trim()
    .replace(/^```(json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();

  // Tenta achar o primeiro { e ultimo } para extrair JSON de texto misturado
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start >= 0 && end > start) {
    cleaned = cleaned.slice(start, end + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`JSON invalido da IA: ${(err as Error).message}\nResposta: ${cleaned.slice(0, 200)}...`);
  }
}
