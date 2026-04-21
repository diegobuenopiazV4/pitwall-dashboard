/**
 * Cliente Claude API (Anthropic).
 * Suporta modelos mais atuais: Opus 4.5, Sonnet 4.5, Haiku 4.5, Opus 4.1
 * Suporta Extended Thinking para raciocinio complexo.
 */

import type { ChatRequest } from './types';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export type ClaudeApiModel =
  | 'claude-opus-4-7'
  | 'claude-opus-4-5'
  | 'claude-opus-4-1'
  | 'claude-sonnet-4-6'
  | 'claude-sonnet-4-5'
  | 'claude-haiku-4-5';

const DEFAULT_MODEL: ClaudeApiModel = 'claude-sonnet-4-6';

export async function callClaude(
  req: ChatRequest,
  apiKey: string,
  model: ClaudeApiModel = DEFAULT_MODEL
): Promise<string> {
  const body: any = {
    model,
    max_tokens: req.maxTokens ?? 8192,
    temperature: req.temperature ?? 0.8,
    system: req.systemPrompt,
    messages: [
      {
        role: 'user',
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
        errMsg += ' (verifique sua API key em Settings)';
      }
    } catch {
      errMsg += `: ${errText.slice(0, 200)}`;
    }
    throw new Error(errMsg);
  }

  const data = await res.json();
  const textBlock = data.content?.find((b: any) => b.type === 'text');
  const text = textBlock?.text;
  if (!text) throw new Error('Resposta vazia da Claude API');
  return text;
}

/**
 * Chamada Claude com Extended Thinking habilitado.
 * O modelo pensa primeiro, depois responde. Retorna texto + tokens de thinking.
 */
export async function callClaudeWithThinking(
  req: ChatRequest,
  apiKey: string,
  model: ClaudeApiModel = 'claude-sonnet-4-5'
): Promise<{ text: string; thinkingTokens: number }> {
  const budget = Math.min(16000, Math.floor((req.maxTokens ?? 8192) * 0.5));

  const body: any = {
    model,
    max_tokens: (req.maxTokens ?? 8192) + budget,
    system: req.systemPrompt,
    messages: [
      {
        role: 'user',
        content: req.userPrompt,
      },
    ],
    thinking: {
      type: 'enabled',
      budget_tokens: budget,
    },
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
    try {
      const errJson = JSON.parse(errText);
      // If extended thinking not supported by this API key/tier, fallback to normal
      if (errJson.error?.message?.toLowerCase().includes('thinking')) {
        const text = await callClaude(req, apiKey, model);
        return { text, thinkingTokens: 0 };
      }
      throw new Error(`Claude ${res.status}: ${errJson.error?.message ?? errText.slice(0, 200)}`);
    } catch (e) {
      if (e instanceof Error && e.message.startsWith('Claude')) throw e;
      throw new Error(`Claude ${res.status}: ${errText.slice(0, 200)}`);
    }
  }

  const data = await res.json();
  const textBlock = data.content?.find((b: any) => b.type === 'text');
  const thinkingBlock = data.content?.find((b: any) => b.type === 'thinking');
  const text = textBlock?.text;
  if (!text) throw new Error('Resposta vazia da Claude API');

  const thinkingTokens = thinkingBlock?.thinking
    ? Math.ceil(thinkingBlock.thinking.length / 4)
    : 0;

  return { text, thinkingTokens };
}

export function isValidClaudeKey(key: string): boolean {
  return typeof key === 'string' && key.startsWith('sk-ant-') && key.length > 20;
}
