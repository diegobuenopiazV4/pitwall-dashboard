/**
 * Cliente Groq API - inference ultrarapido para modelos open-source.
 *
 * Por que Groq:
 * - Free tier generoso (~30 req/min por modelo, sem cartao obrigatorio)
 * - Latencia < 1s (200-500 tokens/s - 10x mais rapido que OpenAI)
 * - Modelos Llama 3.3 70B (quality quase GPT-4) e modelos open-source
 * - Perfeito para fallback quando Claude sem creditos + Gemini em quota
 *
 * API: OpenAI-compatible (Bearer token)
 * Docs: https://console.groq.com/docs/api-reference
 */

import type { ChatRequest } from './types';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export type GroqApiModel =
  | 'llama-3.3-70b-versatile'       // Flagship Groq - quality alto, 131k ctx
  | 'llama-3.1-70b-versatile'       // Previous flagship
  | 'llama-3.1-8b-instant'          // Ultra fast (500+ tok/s)
  | 'mixtral-8x7b-32768'            // MoE classico, 32k ctx
  | 'gemma2-9b-it'                  // Google small
  | 'deepseek-r1-distill-llama-70b' // Reasoning model
  | 'qwen-2.5-72b-instruct';        // Chinese model, bom em portugues

const DEFAULT_MODEL: GroqApiModel = 'llama-3.3-70b-versatile';

// Mapa de TPM (tokens per minute) de cada modelo no free tier
// Se request excede TPM do modelo, tenta modelo com TPM maior
const TPM_FALLBACK: Record<string, GroqApiModel> = {
  'llama-3.3-70b-versatile': 'llama-3.1-8b-instant',  // 12k -> 30k TPM
  'deepseek-r1-distill-llama-70b': 'llama-3.1-8b-instant',
  'mixtral-8x7b-32768': 'llama-3.1-8b-instant',
  'qwen-2.5-72b-instruct': 'llama-3.1-8b-instant',
};

async function doGroqCall(
  req: ChatRequest,
  apiKey: string,
  model: GroqApiModel
): Promise<string> {
  const body = {
    model,
    messages: [
      { role: 'system', content: req.systemPrompt },
      { role: 'user', content: req.userPrompt },
    ],
    temperature: req.temperature ?? 0.8,
    max_tokens: Math.min(req.maxTokens ?? 8192, 32768),
    stream: false,
  };

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    let errMsg = `Groq API ${res.status}`;
    try {
      const errJson = JSON.parse(errText);
      if (errJson.error?.message) errMsg += `: ${errJson.error.message}`;
      if (errJson.error?.type === 'authentication_error') {
        errMsg += ' (verifique sua API key Groq em Settings)';
      }
      if (errJson.error?.code === 'rate_limit_exceeded') {
        errMsg += ' (rate limit - aguarde ou use outro modelo)';
      }
    } catch {
      errMsg += `: ${errText.slice(0, 200)}`;
    }
    throw new Error(errMsg);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Resposta vazia da Groq API');
  return text;
}

export async function callGroq(
  req: ChatRequest,
  apiKey: string,
  model: GroqApiModel = DEFAULT_MODEL
): Promise<string> {
  try {
    return await doGroqCall(req, apiKey, model);
  } catch (err: any) {
    const msg = err?.message || '';
    // Se erro 413 (Request too large) ou 429 (rate limit) + existe fallback: tenta modelo menor
    if ((msg.includes('413') || msg.includes('Request too large') || msg.includes('tokens per minute')) && TPM_FALLBACK[model]) {
      console.warn(`[Groq] ${model} excedeu TPM, fallback para ${TPM_FALLBACK[model]}`);
      // Trunca user prompt se ainda estiver muito grande (free tier 8b tem 30k TPM)
      const truncatedReq: ChatRequest = {
        ...req,
        // Reduz system prompt para 8000 chars se for muito grande (assumindo 8b tem ctx menor)
        systemPrompt: req.systemPrompt.length > 30000
          ? req.systemPrompt.substring(0, 30000) + '\n\n[Prompt truncado para caber no limite Groq Free Tier]'
          : req.systemPrompt,
      };
      return await doGroqCall(truncatedReq, apiKey, TPM_FALLBACK[model]);
    }
    throw err;
  }
}

export function isValidGroqKey(key: string): boolean {
  return typeof key === 'string' && key.startsWith('gsk_') && key.length > 30;
}
