/**
 * Cliente Claude API (Anthropic).
 * Chama direto do browser usando anthropic-dangerous-direct-browser-access.
 * Para producao com multi-usuarios, mover para Supabase Edge Function.
 */

import type { ChatRequest, ClaudeModel } from './types';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL: ClaudeModel = 'claude-sonnet-4-5';

export async function callClaude(
  req: ChatRequest,
  apiKey: string,
  model: ClaudeModel = DEFAULT_MODEL
): Promise<string> {
  const body = {
    model,
    max_tokens: req.maxTokens ?? 8192,
    temperature: req.temperature ?? 0.8,
    system: req.systemPrompt,
    messages: [
      {
        role: 'user' as const,
        content: req.userPrompt,
      },
    ],
  };

  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    let errMsg = `Claude API ${res.status}`;
    try {
      const errJson = JSON.parse(errText);
      if (errJson.error?.message) errMsg += `: ${errJson.error.message}`;
      if (errJson.error?.type === 'authentication_error') {
        errMsg += ' (verifique sua API key)';
      }
    } catch {
      errMsg += `: ${errText.slice(0, 200)}`;
    }
    throw new Error(errMsg);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text;
  if (!text) throw new Error('Resposta vazia da Claude API');
  return text;
}

/**
 * Valida se a API key Claude esta no formato correto.
 */
export function isValidClaudeKey(key: string): boolean {
  return typeof key === 'string' && key.startsWith('sk-ant-') && key.length > 20;
}
