/**
 * Cliente Gemini API (Google).
 * Suporta modelos atuais: 2.5 Pro, 2.5 Flash, 2.5 Flash Image (geracao), 2.0 Flash.
 * Suporta Google Search grounding e geracao de imagens.
 */

import type { ChatRequest } from './types';

export type GeminiApiModel =
  | 'gemini-2.5-pro'
  | 'gemini-2.5-flash'
  | 'gemini-2.5-flash-image'
  | 'gemini-2.0-flash';

const DEFAULT_MODEL: GeminiApiModel = 'gemini-2.5-flash';

export async function callGemini(
  req: ChatRequest,
  apiKey: string,
  model: GeminiApiModel = DEFAULT_MODEL,
  useGoogleSearch: boolean = true
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body: any = {
    contents: [{ role: 'user', parts: [{ text: req.userPrompt }] }],
    systemInstruction: { parts: [{ text: req.systemPrompt }] },
    generationConfig: {
      maxOutputTokens: req.maxTokens ?? 8192,
      temperature: req.temperature ?? 0.8,
    },
  };

  if (useGoogleSearch) {
    body.tools = [{ googleSearch: {} }];
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    let errMsg = `Gemini API ${res.status}`;
    try {
      const errJson = JSON.parse(errText);
      if (errJson.error?.message) errMsg += `: ${errJson.error.message}`;
    } catch {
      errMsg += `: ${errText.slice(0, 200)}`;
    }
    throw new Error(errMsg);
  }

  const data = await res.json();
  if (data.candidates?.[0]?.content?.parts) {
    return data.candidates[0].content.parts.map((p: any) => p.text || '').join('');
  }
  throw new Error('Resposta vazia da Gemini API');
}

/**
 * Geracao de imagem via Gemini 2.5 Flash Image (Nano Banana).
 * Retorna texto + array de imagens em base64 data URLs.
 */
export async function callGeminiImage(
  req: ChatRequest,
  apiKey: string,
  model: string = 'gemini-2.5-flash-image'
): Promise<{ text: string; images: string[] }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: `${req.systemPrompt}\n\n---\n\nGere imagem conforme solicitado:\n\n${req.userPrompt}` },
        ],
      },
    ],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
      maxOutputTokens: req.maxTokens ?? 4000,
      temperature: req.temperature ?? 0.9,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini Image API ${res.status}: ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  let text = '';
  const images: string[] = [];

  for (const part of parts) {
    if (part.text) text += part.text;
    if (part.inlineData?.data) {
      const mime = part.inlineData.mimeType || 'image/png';
      images.push(`data:${mime};base64,${part.inlineData.data}`);
    }
  }

  if (images.length === 0 && !text) {
    throw new Error('Gemini nao retornou imagem nem texto');
  }

  return { text: text || 'Imagem gerada:', images };
}

export function isValidGeminiKey(key: string): boolean {
  return typeof key === 'string' && key.startsWith('AIza') && key.length > 20;
}
