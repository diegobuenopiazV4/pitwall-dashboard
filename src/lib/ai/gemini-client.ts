/**
 * Cliente Gemini API (Google).
 * Suporta modelos atuais: 2.5 Pro, 2.5 Flash, 2.5 Flash Image (geracao), 2.0 Flash.
 * Suporta Google Search grounding e geracao de imagens.
 */

import type { ChatRequest } from './types';

export type GeminiApiModel =
  | 'gemini-3.1-pro'
  | 'gemini-3.1-flash'
  | 'gemini-3.1-flash-image'
  | 'gemini-3.0-pro-image'
  | 'gemini-2.5-pro'
  | 'gemini-2.5-flash'
  | 'gemini-2.5-flash-image'
  | 'gemini-2.0-flash';

const DEFAULT_MODEL: GeminiApiModel = 'gemini-3.1-pro';

async function doGeminiCall(
  req: ChatRequest,
  apiKey: string,
  model: GeminiApiModel,
  useGoogleSearch: boolean
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
  const parts = data.candidates?.[0]?.content?.parts;
  if (parts && Array.isArray(parts) && parts.length > 0) {
    const text = parts.map((p: any) => p.text || '').join('').trim();
    if (text) return text;
  }
  // Check for explicit block reasons
  const finishReason = data.candidates?.[0]?.finishReason;
  const blockReason = data.promptFeedback?.blockReason;
  if (blockReason) {
    throw new Error(`Gemini bloqueado: ${blockReason}`);
  }
  if (finishReason && finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
    throw new Error(`Gemini finalizado com: ${finishReason}`);
  }
  throw new Error('Resposta vazia da Gemini API');
}

/**
 * Fallback automatico de modelo quando API retorna 404 (modelo nao disponivel nesta regiao/projeto).
 * Gemini 3.1 ainda nao esta disponivel em todos os projetos Google Cloud.
 */
const MODEL_FALLBACKS: Record<string, string> = {
  'gemini-3.1-pro': 'gemini-2.5-pro',
  'gemini-3.1-flash': 'gemini-2.5-flash',
  'gemini-3.1-flash-image': 'gemini-2.5-flash-image',
  'gemini-3.0-pro-image': 'gemini-2.5-flash-image',
};

export async function callGemini(
  req: ChatRequest,
  apiKey: string,
  model: GeminiApiModel = DEFAULT_MODEL,
  useGoogleSearch: boolean = true
): Promise<string> {
  try {
    return await doGeminiCall(req, apiKey, model, useGoogleSearch);
  } catch (err: any) {
    const msg = err?.message || '';

    // 1. Se modelo 3.x nao existe (404), fallback para 2.5
    if (msg.includes('404') || msg.includes('not found') || msg.includes('is not supported')) {
      const fallback = MODEL_FALLBACKS[model];
      if (fallback && fallback !== model) {
        console.warn(`[Gemini] ${model} indisponivel, fallback para ${fallback}`);
        try {
          return await doGeminiCall(req, apiKey, fallback as GeminiApiModel, useGoogleSearch);
        } catch (err2: any) {
          const msg2 = err2?.message || '';
          if (useGoogleSearch && (msg2.includes('vazia') || msg2.includes('finalizado'))) {
            return await doGeminiCall(req, apiKey, fallback as GeminiApiModel, false);
          }
          throw err2;
        }
      }
    }

    // 2. Se resposta vazia/finish reason inesperado E googleSearch estava ativo, retenta sem tools
    if (useGoogleSearch && (msg.includes('vazia') || msg.includes('finalizado'))) {
      return await doGeminiCall(req, apiKey, model, false);
    }
    throw err;
  }
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
