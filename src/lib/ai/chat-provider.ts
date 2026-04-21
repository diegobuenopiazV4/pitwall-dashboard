/**
 * Chat Provider com Triple API: Claude + Gemini + OpenRouter.
 * OpenRouter da acesso a 400+ modelos (GPT-5.4, Grok, Llama 4, Qwen, Mistral, DeepSeek, Kimi...).
 */

import { callClaude, callClaudeWithThinking, type ClaudeApiModel } from './claude-client';
import { callGemini, callGeminiImage, type GeminiApiModel } from './gemini-client';
import { callOpenRouter, type OpenRouterModel } from './openrouter-client';
import { MODELS, autoSelectModel, type ModelDefinition, type APIProvider } from './models';
import type { ChatRequest } from './types';

export const LS_KEYS = {
  claudeKey: 'v4_pitwall_claude_key',
  geminiKey: 'v4_pitwall_gemini_key',
  openrouterKey: 'v4_pitwall_openrouter_key',
  selectedModel: 'v4_pitwall_selected_model',
  autoModelEnabled: 'v4_pitwall_auto_model_enabled',
} as const;

export interface AIStatus {
  hasClaudeKey: boolean;
  hasGeminiKey: boolean;
  hasOpenRouterKey: boolean;
  selectedModelId: string | null;
  autoModelEnabled: boolean;
}

export interface ChatResult {
  text: string;
  model: ModelDefinition;
  thinkingTokens?: number;
  images?: string[];
}

export function getStatus(): AIStatus {
  return {
    hasClaudeKey: !!getClaudeKey(),
    hasGeminiKey: !!getGeminiKey(),
    hasOpenRouterKey: !!getOpenRouterKey(),
    selectedModelId: localStorage.getItem(LS_KEYS.selectedModel),
    autoModelEnabled: localStorage.getItem(LS_KEYS.autoModelEnabled) !== 'false',
  };
}

export function getClaudeKey(): string {
  return (window as any).__CLAUDE_KEY__ || localStorage.getItem(LS_KEYS.claudeKey) || import.meta.env.VITE_CLAUDE_API_KEY || '';
}
export function getGeminiKey(): string {
  return (window as any).__GEMINI_KEY__ || localStorage.getItem(LS_KEYS.geminiKey) || import.meta.env.VITE_GEMINI_API_KEY || '';
}
export function getOpenRouterKey(): string {
  return (window as any).__OPENROUTER_KEY__ || localStorage.getItem(LS_KEYS.openrouterKey) || (import.meta.env as any).VITE_OPENROUTER_API_KEY || '';
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
export function setOpenRouterKey(key: string): void {
  if (key) {
    localStorage.setItem(LS_KEYS.openrouterKey, key);
    (window as any).__OPENROUTER_KEY__ = key;
  } else {
    localStorage.removeItem(LS_KEYS.openrouterKey);
    delete (window as any).__OPENROUTER_KEY__;
  }
}

export function setSelectedModel(modelId: string | null): void {
  if (modelId) localStorage.setItem(LS_KEYS.selectedModel, modelId);
  else localStorage.removeItem(LS_KEYS.selectedModel);
}
export function setAutoModelEnabled(enabled: boolean): void {
  localStorage.setItem(LS_KEYS.autoModelEnabled, String(enabled));
}

export function resolveModel(userPrompt: string, agentId: string): ModelDefinition | null {
  const status = getStatus();

  if (status.autoModelEnabled) {
    return autoSelectModel(userPrompt, agentId, status.hasClaudeKey, status.hasGeminiKey, status.hasOpenRouterKey);
  }

  if (status.selectedModelId) {
    const model = MODELS[status.selectedModelId];
    if (model) {
      if (model.provider === 'claude' && !status.hasClaudeKey) return null;
      if (model.provider === 'gemini' && !status.hasGeminiKey) return null;
      if (model.provider === 'openrouter' && !status.hasOpenRouterKey) return null;
      return model;
    }
  }

  if (status.hasClaudeKey) return MODELS['claude-sonnet-4-5'];
  if (status.hasGeminiKey) return MODELS['gemini-3-1-flash'];
  if (status.hasOpenRouterKey) return MODELS['gpt-5-4-mini'];
  return null;
}

export async function sendChat(req: ChatRequest & { agentId?: string }): Promise<ChatResult | null> {
  const model = resolveModel(req.userPrompt, req.agentId ?? '01');
  if (!model) return null;

  let systemPrompt = req.systemPrompt;
  if (model.systemPromptStyle) {
    systemPrompt = `${model.systemPromptStyle}\n\n---\n\n${systemPrompt}`;
  }

  const enhancedReq: ChatRequest = {
    ...req,
    systemPrompt,
    maxTokens: Math.min(req.maxTokens ?? model.maxOutput, model.maxOutput),
  };

  if (model.provider === 'claude') {
    const key = getClaudeKey();
    if (!key) throw new Error('Claude key nao configurada');

    if (model.supportsExtendedThinking && model.category === 'reasoning') {
      const { text, thinkingTokens } = await callClaudeWithThinking(enhancedReq, key, model.apiModel as ClaudeApiModel);
      return { text, model, thinkingTokens };
    }
    const text = await callClaude(enhancedReq, key, model.apiModel as ClaudeApiModel);
    return { text, model };
  }

  if (model.provider === 'gemini') {
    const key = getGeminiKey();
    if (!key) throw new Error('Gemini key nao configurada');

    if (model.supportsImageGen) {
      const { text, images } = await callGeminiImage(enhancedReq, key, model.apiModel);
      return { text, model, images };
    }
    const text = await callGemini(enhancedReq, key, model.apiModel as GeminiApiModel, model.supportsGoogleSearch);
    return { text, model };
  }

  if (model.provider === 'openrouter') {
    const key = getOpenRouterKey();
    if (!key) throw new Error('OpenRouter key nao configurada');
    const text = await callOpenRouter(enhancedReq, key, model.apiModel as OpenRouterModel);
    return { text, model };
  }

  return null;
}

// Legacy compat
export function getProviderStatus() {
  const s = getStatus();
  return {
    provider: s.hasClaudeKey ? 'claude' : s.hasGeminiKey ? 'gemini' : s.hasOpenRouterKey ? 'openrouter' : 'offline',
    hasClaudeKey: s.hasClaudeKey,
    hasGeminiKey: s.hasGeminiKey,
    hasOpenRouterKey: s.hasOpenRouterKey,
    selectedModelId: s.selectedModelId,
    autoModelEnabled: s.autoModelEnabled,
    claudeModel: 'claude-sonnet-4-5' as const,
    geminiModel: 'gemini-3-1-flash' as const,
  };
}
