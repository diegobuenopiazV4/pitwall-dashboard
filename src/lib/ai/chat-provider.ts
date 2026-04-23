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

  if (status.hasClaudeKey) return MODELS['claude-sonnet-4-6'];
  if (status.hasGeminiKey) return MODELS['gemini-3-1-flash'];
  if (status.hasOpenRouterKey) return MODELS['gpt-5-4-mini'];
  return null;
}

/**
 * Override: usar um modelo especifico (ex: vindo do preferredModelId de um comando).
 * Faz fallback se a key nao estiver disponivel.
 */
export function resolveModelWithOverride(modelId: string): ModelDefinition | null {
  const model = MODELS[modelId];
  if (!model) return null;

  const status = getStatus();
  if (model.provider === 'claude' && !status.hasClaudeKey) {
    // Fallback para primeiro disponivel
    return resolveModel('', '01');
  }
  if (model.provider === 'gemini' && !status.hasGeminiKey) {
    return resolveModel('', '01');
  }
  if (model.provider === 'openrouter' && !status.hasOpenRouterKey) {
    return resolveModel('', '01');
  }
  return model;
}

/**
 * Executa a chamada real para o provider correspondente ao modelo.
 */
async function executeModelCall(model: ModelDefinition, req: ChatRequest): Promise<ChatResult> {
  if (model.provider === 'claude') {
    const key = getClaudeKey();
    if (!key) throw new Error('Claude key nao configurada');

    if (model.supportsExtendedThinking && model.category === 'reasoning') {
      const { text, thinkingTokens } = await callClaudeWithThinking(req, key, model.apiModel as ClaudeApiModel);
      return { text, model, thinkingTokens };
    }
    const text = await callClaude(req, key, model.apiModel as ClaudeApiModel);
    return { text, model };
  }

  if (model.provider === 'gemini') {
    const key = getGeminiKey();
    if (!key) throw new Error('Gemini key nao configurada');

    if (model.supportsImageGen) {
      const { text, images } = await callGeminiImage(req, key, model.apiModel);
      return { text, model, images };
    }
    const text = await callGemini(req, key, model.apiModel as GeminiApiModel, model.supportsGoogleSearch);
    return { text, model };
  }

  if (model.provider === 'openrouter') {
    const key = getOpenRouterKey();
    if (!key) throw new Error('OpenRouter key nao configurada');
    const text = await callOpenRouter(req, key, model.apiModel as OpenRouterModel);
    return { text, model };
  }

  throw new Error(`Provider desconhecido: ${model.provider}`);
}

/**
 * Identifica se o erro justifica tentar outro provider (billing, auth, rate limit, rede).
 */
function isFallbackWorthy(err: any): boolean {
  const msg = (err?.message || String(err)).toLowerCase();
  return (
    msg.includes('credit') ||
    msg.includes('balance') ||
    msg.includes('insufficient') ||
    msg.includes('401') ||
    msg.includes('403') ||
    msg.includes('429') ||
    msg.includes('503') ||
    msg.includes('timeout') ||
    msg.includes('network') ||
    msg.includes('fetch')
  );
}

/**
 * Encontra o melhor modelo alternativo do provider oposto.
 */
function findFallbackModel(excludeProvider: APIProvider): ModelDefinition | null {
  const status = getStatus();
  const preferences: Record<APIProvider, string> = {
    claude: 'claude-sonnet-4-6',
    gemini: 'gemini-3-1-flash',
    openrouter: 'gpt-5-4-mini',
  };

  const order: APIProvider[] = ['claude', 'gemini', 'openrouter'].filter((p) => p !== excludeProvider) as APIProvider[];

  for (const prov of order) {
    const hasKey = prov === 'claude' ? status.hasClaudeKey
                 : prov === 'gemini' ? status.hasGeminiKey
                 : status.hasOpenRouterKey;
    if (hasKey && MODELS[preferences[prov]]) {
      return MODELS[preferences[prov]];
    }
  }
  return null;
}

export async function sendChat(req: ChatRequest & { agentId?: string; overrideModelId?: string }): Promise<ChatResult | null> {
  const model = req.overrideModelId
    ? resolveModelWithOverride(req.overrideModelId)
    : resolveModel(req.userPrompt, req.agentId ?? '01');
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

  try {
    return await executeModelCall(model, enhancedReq);
  } catch (err) {
    // Se o erro for de billing/auth/rede, tenta fallback automatico para outro provider
    if (!isFallbackWorthy(err)) throw err;

    const fallbackModel = findFallbackModel(model.provider);
    if (!fallbackModel) throw err;

    // Re-aplica systemPromptStyle do modelo fallback
    let fallbackSystemPrompt = req.systemPrompt;
    if (fallbackModel.systemPromptStyle) {
      fallbackSystemPrompt = `${fallbackModel.systemPromptStyle}\n\n---\n\n${fallbackSystemPrompt}`;
    }
    const fallbackReq: ChatRequest = {
      ...req,
      systemPrompt: fallbackSystemPrompt,
      maxTokens: Math.min(req.maxTokens ?? fallbackModel.maxOutput, fallbackModel.maxOutput),
    };

    try {
      const result = await executeModelCall(fallbackModel, fallbackReq);
      // Anexa indicacao de fallback no label
      return { ...result, model: { ...fallbackModel, label: `${fallbackModel.label} (fallback de ${model.label})` } };
    } catch (fbErr) {
      // Se o fallback tambem falhar, tenta o ultimo provider restante
      const secondFallback = findFallbackModel(fallbackModel.provider);
      if (!secondFallback || secondFallback.provider === model.provider) throw fbErr;

      let secSystemPrompt = req.systemPrompt;
      if (secondFallback.systemPromptStyle) {
        secSystemPrompt = `${secondFallback.systemPromptStyle}\n\n---\n\n${secSystemPrompt}`;
      }
      const secReq: ChatRequest = { ...req, systemPrompt: secSystemPrompt, maxTokens: Math.min(req.maxTokens ?? secondFallback.maxOutput, secondFallback.maxOutput) };
      const result = await executeModelCall(secondFallback, secReq);
      return { ...result, model: { ...secondFallback, label: `${secondFallback.label} (2x fallback)` } };
    }
  }
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
