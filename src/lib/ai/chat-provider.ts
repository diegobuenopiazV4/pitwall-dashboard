/**
 * Abstracao de provider de IA.
 * Detecta automaticamente qual provider usar (Claude > Gemini > Offline)
 * baseado nas keys configuradas.
 */

import { callClaude, isValidClaudeKey } from './claude-client';
import { callGemini, isValidGeminiKey } from './gemini-client';
import type { AIProvider, ChatRequest, ClaudeModel, GeminiModel } from './types';

export const LS_KEYS = {
  provider: 'v4_pitwall_ai_provider',
  claudeKey: 'v4_pitwall_claude_key',
  claudeModel: 'v4_pitwall_claude_model',
  geminiKey: 'v4_pitwall_gemini_key',
  geminiModel: 'v4_pitwall_gemini_model',
} as const;

export interface ProviderStatus {
  provider: AIProvider;
  hasClaudeKey: boolean;
  hasGeminiKey: boolean;
  claudeModel: ClaudeModel;
  geminiModel: GeminiModel;
}

export function getProviderStatus(): ProviderStatus {
  const claudeKey = getClaudeKey();
  const geminiKey = getGeminiKey();
  const preferredProvider = (localStorage.getItem(LS_KEYS.provider) as AIProvider) || 'claude';

  let provider: AIProvider = 'offline';
  if (preferredProvider === 'claude' && claudeKey) provider = 'claude';
  else if (preferredProvider === 'gemini' && geminiKey) provider = 'gemini';
  else if (claudeKey) provider = 'claude';
  else if (geminiKey) provider = 'gemini';

  return {
    provider,
    hasClaudeKey: !!claudeKey,
    hasGeminiKey: !!geminiKey,
    claudeModel: (localStorage.getItem(LS_KEYS.claudeModel) as ClaudeModel) || 'claude-sonnet-4-5',
    geminiModel: (localStorage.getItem(LS_KEYS.geminiModel) as GeminiModel) || 'gemini-2.0-flash',
  };
}

export function getClaudeKey(): string {
  return (
    (window as any).__CLAUDE_KEY__ ||
    localStorage.getItem(LS_KEYS.claudeKey) ||
    import.meta.env.VITE_CLAUDE_API_KEY ||
    ''
  );
}

export function getGeminiKey(): string {
  return (
    (window as any).__GEMINI_KEY__ ||
    localStorage.getItem(LS_KEYS.geminiKey) ||
    import.meta.env.VITE_GEMINI_API_KEY ||
    ''
  );
}

export function setProvider(provider: AIProvider): void {
  localStorage.setItem(LS_KEYS.provider, provider);
}

export function setClaudeKey(key: string): void {
  if (key) {
    localStorage.setItem(LS_KEYS.claudeKey, key);
    (window as any).__CLAUDE_KEY__ = key;
  } else {
    localStorage.removeItem(LS_KEYS.claudeKey);
    delete (window as any).__CLAUDE_KEY__;
  }
}

export function setGeminiKey(key: string): void {
  if (key) {
    localStorage.setItem(LS_KEYS.geminiKey, key);
    (window as any).__GEMINI_KEY__ = key;
  } else {
    localStorage.removeItem(LS_KEYS.geminiKey);
    delete (window as any).__GEMINI_KEY__;
  }
}

export function setClaudeModel(model: ClaudeModel): void {
  localStorage.setItem(LS_KEYS.claudeModel, model);
}

export function setGeminiModel(model: GeminiModel): void {
  localStorage.setItem(LS_KEYS.geminiModel, model);
}

/**
 * Envia uma mensagem usando o provider configurado.
 * Retorna null se nenhuma key estiver configurada (caller deve usar offline fallback).
 */
export async function sendChat(req: ChatRequest): Promise<{ text: string; provider: AIProvider } | null> {
  const status = getProviderStatus();

  if (status.provider === 'claude') {
    const key = getClaudeKey();
    if (!isValidClaudeKey(key)) {
      throw new Error('Claude API key invalida. Deve comecar com "sk-ant-".');
    }
    const text = await callClaude(req, key, status.claudeModel);
    return { text, provider: 'claude' };
  }

  if (status.provider === 'gemini') {
    const key = getGeminiKey();
    if (!isValidGeminiKey(key)) {
      throw new Error('Gemini API key invalida. Deve comecar com "AIza".');
    }
    const text = await callGemini(req, key, status.geminiModel);
    return { text, provider: 'gemini' };
  }

  return null; // sem provider -> caller usa offline fallback
}
