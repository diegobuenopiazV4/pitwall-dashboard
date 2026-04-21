/**
 * Sistema de Chat Provider com Dual API.
 * - Claude E Gemini podem ser usados SIMULTANEAMENTE
 * - Sistema escolhe o modelo ideal para cada tarefa (estilo Perplexity MAX)
 * - Virtual Models aplicam personalidade ao mesmo modelo API
 */

import { callClaude, callClaudeWithThinking } from './claude-client';
import { callGemini, callGeminiImage } from './gemini-client';
import { MODELS, autoSelectModel, type ModelDefinition, type APIProvider } from './models';
import type { ChatRequest } from './types';

export const LS_KEYS = {
  claudeKey: 'v4_pitwall_claude_key',
  geminiKey: 'v4_pitwall_gemini_key',
  selectedModel: 'v4_pitwall_selected_model',
  autoModelEnabled: 'v4_pitwall_auto_model_enabled',
} as const;

export interface AIStatus {
  hasClaudeKey: boolean;
  hasGeminiKey: boolean;
  selectedModelId: string | null;
  autoModelEnabled: boolean;
}

export interface ChatResult {
  text: string;
  model: ModelDefinition;
  thinkingTokens?: number;
  images?: string[]; // base64 data URLs
}

export function getStatus(): AIStatus {
  return {
    hasClaudeKey: !!getClaudeKey(),
    hasGeminiKey: !!getGeminiKey(),
    selectedModelId: localStorage.getItem(LS_KEYS.selectedModel),
    autoModelEnabled: localStorage.getItem(LS_KEYS.autoModelEnabled) !== 'false', // default true
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

export function setSelectedModel(modelId: string | null): void {
  if (modelId) localStorage.setItem(LS_KEYS.selectedModel, modelId);
  else localStorage.removeItem(LS_KEYS.selectedModel);
}

export function setAutoModelEnabled(enabled: boolean): void {
  localStorage.setItem(LS_KEYS.autoModelEnabled, String(enabled));
}

/**
 * Resolve o modelo que DEVE ser usado para esta chamada.
 * 1. Se Auto-Model habilitado: usa autoSelectModel()
 * 2. Se modelo manual selecionado: usa esse
 * 3. Fallback: claude-sonnet-4-5 ou gemini-2-5-flash
 */
export function resolveModel(userPrompt: string, agentId: string): ModelDefinition | null {
  const status = getStatus();

  if (status.autoModelEnabled) {
    return autoSelectModel(userPrompt, agentId, status.hasClaudeKey, status.hasGeminiKey);
  }

  if (status.selectedModelId) {
    const model = MODELS[status.selectedModelId];
    if (model) {
      // Verifica se tem a key para o provider escolhido
      if (model.provider === 'claude' && !status.hasClaudeKey) return null;
      if (model.provider === 'gemini' && !status.hasGeminiKey) return null;
      return model;
    }
  }

  // Default fallback
  if (status.hasClaudeKey) return MODELS['claude-sonnet-4-5'];
  if (status.hasGeminiKey) return MODELS['gemini-2-5-flash'];
  return null;
}

/**
 * Envia chat usando o modelo resolvido. Retorna null se nenhum provider configurado.
 */
export async function sendChat(req: ChatRequest & { agentId?: string }): Promise<ChatResult | null> {
  const model = resolveModel(req.userPrompt, req.agentId ?? '01');
  if (!model) return null;

  // Inject personality style if the virtual model has one
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
      const { text, thinkingTokens } = await callClaudeWithThinking(enhancedReq, key, model.apiModel as any);
      return { text, model, thinkingTokens };
    }
    const text = await callClaude(enhancedReq, key, model.apiModel as any);
    return { text, model };
  }

  if (model.provider === 'gemini') {
    const key = getGeminiKey();
    if (!key) throw new Error('Gemini key nao configurada');

    if (model.supportsImageGen) {
      const { text, images } = await callGeminiImage(enhancedReq, key, model.apiModel);
      return { text, model, images };
    }
    const text = await callGemini(enhancedReq, key, model.apiModel as any, model.supportsGoogleSearch);
    return { text, model };
  }

  return null;
}

// Legacy compatibility helpers (for SettingsModal etc)
export function getProviderStatus() {
  const s = getStatus();
  const selectedId = s.selectedModelId;
  const selectedModel = selectedId ? MODELS[selectedId] : null;
  return {
    provider: selectedModel?.provider ?? (s.hasClaudeKey ? 'claude' : s.hasGeminiKey ? 'gemini' : 'offline'),
    hasClaudeKey: s.hasClaudeKey,
    hasGeminiKey: s.hasGeminiKey,
    selectedModelId: s.selectedModelId,
    autoModelEnabled: s.autoModelEnabled,
    claudeModel: 'claude-sonnet-4-5' as const,
    geminiModel: 'gemini-2-5-flash' as const,
  };
}
