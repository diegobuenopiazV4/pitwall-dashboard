/**
 * Cliente Gemini API (Google).
 */

import type { ChatRequest, GeminiModel } from './types';

const DEFAULT_MODEL: GeminiModel = 'gemini-2.0-flash';

export async function callGemini(
  req: ChatRequest,
  apiKey: string,
  model: GeminiModel = DEFAULT_MODEL
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ role: 'user', parts: [{ text: req.userPrompt }] }],
    systemInstruction: { parts: [{ text: req.systemPrompt }] },
    generationConfig: {
      maxOutputTokens: req.maxTokens ?? 8192,
      temperature: req.temperature ?? 0.8,
    },
    tools: [{ googleSearch: {} }],
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API ${res.status}: ${err.slice(0, 300)}`);
  }

  const data = await res.json();
  if (data.candidates?.[0]?.content) {
    return data.candidates[0].content.parts.map((p: any) => p.text || '').join('');
  }
  throw new Error('Resposta vazia da Gemini API');
}

export function isValidGeminiKey(key: string): boolean {
  return typeof key === 'string' && key.startsWith('AIza') && key.length > 20;
}
