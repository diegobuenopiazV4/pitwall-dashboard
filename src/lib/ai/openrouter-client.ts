/**
 * Cliente OpenRouter - acesso unificado a 400+ modelos via 1 API.
 * Inclui: GPT-5.4, Gemini 3.1 Pro, Grok, Llama 4, Qwen 3.5, Mistral, DeepSeek, Kimi K2, etc.
 * Nenhuma key adicional necessaria alem da OpenRouter.
 */

import type { ChatRequest } from './types';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export type OpenRouterModel =
  // OpenAI
  | 'openai/gpt-5.4'
  | 'openai/gpt-5.4-mini'
  | 'openai/gpt-5.4-nano'
  | 'openai/gpt-5.2'
  | 'openai/o3'
  | 'openai/o3-mini'
  // Google (via OpenRouter)
  | 'google/gemini-3.1-pro'
  | 'google/gemini-3.1-flash'
  | 'google/gemini-2.5-pro'
  // xAI
  | 'x-ai/grok-3'
  | 'x-ai/grok-3-mini'
  | 'x-ai/grok-4'
  // Meta
  | 'meta-llama/llama-4-behemoth'
  | 'meta-llama/llama-4-maverick'
  | 'meta-llama/llama-4-scout'
  // Alibaba
  | 'qwen/qwen-3.5-max'
  | 'qwen/qwen3.5-397b-instruct'
  // Mistral
  | 'mistralai/mistral-3-large'
  | 'mistralai/mistral-3-medium'
  // DeepSeek
  | 'deepseek/deepseek-r1'
  | 'deepseek/deepseek-v3.2'
  // Moonshot (Kimi)
  | 'moonshotai/kimi-k2-thinking'
  | 'moonshotai/kimi-k2'
  // Google Gemma
  | 'google/gemma-4-31b-it'
  // Anthropic (via OpenRouter)
  | 'anthropic/claude-opus-4.5'
  | 'anthropic/claude-sonnet-4.5'
  | 'anthropic/claude-haiku-4.5';

export async function callOpenRouter(
  req: ChatRequest,
  apiKey: string,
  model: OpenRouterModel
): Promise<string> {
  const body = {
    model,
    max_tokens: req.maxTokens ?? 8192,
    temperature: req.temperature ?? 0.8,
    messages: [
      { role: 'system', content: req.systemPrompt },
      { role: 'user', content: req.userPrompt },
    ],
  };

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://pitwall-dashboard.vercel.app',
      'X-Title': 'V4 PIT WALL',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    let errMsg = `OpenRouter ${res.status}`;
    try {
      const errJson = JSON.parse(errText);
      if (errJson.error?.message) errMsg += `: ${errJson.error.message}`;
    } catch {
      errMsg += `: ${errText.slice(0, 200)}`;
    }
    throw new Error(errMsg);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Resposta vazia do OpenRouter');
  return text;
}

export function isValidOpenRouterKey(key: string): boolean {
  return typeof key === 'string' && key.startsWith('sk-or-') && key.length > 20;
}
