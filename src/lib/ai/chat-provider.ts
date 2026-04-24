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

/**
 * Cache de erros recentes por provider. Se um provider falha com erro de billing/auth
 * recentemente (< 5 min), pulamos ele automaticamente na proxima request.
 * Isso evita gastar tempo tentando Claude quando ja sabemos que saldo esta zerado.
 */
interface ProviderErrorCache {
  timestamp: number;
  reason: string; // 'billing' | 'auth' | 'rate-limit' | 'network' | 'unknown'
}

const providerErrorCache: Record<string, ProviderErrorCache> = {};
const ERROR_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

function categorizeError(err: any): string {
  const msg = (err?.message || String(err)).toLowerCase();
  if (msg.includes('credit') || msg.includes('balance') || msg.includes('insufficient')) return 'billing';
  if (msg.includes('401') || msg.includes('403') || msg.includes('unauthorized') || msg.includes('authentication')) return 'auth';
  if (msg.includes('429') || msg.includes('rate') || msg.includes('quota')) return 'rate-limit';
  if (msg.includes('timeout') || msg.includes('network') || msg.includes('fetch')) return 'network';
  return 'unknown';
}

function markProviderError(provider: string, err: any): void {
  providerErrorCache[provider] = { timestamp: Date.now(), reason: categorizeError(err) };
}

function isProviderBlocked(provider: string): boolean {
  const cached = providerErrorCache[provider];
  if (!cached) return false;
  const age = Date.now() - cached.timestamp;
  if (age > ERROR_CACHE_TTL_MS) {
    delete providerErrorCache[provider];
    return false;
  }
  // Bloqueia para billing, auth E rate-limit (quota) - todos erros que demoram pra resolver
  return cached.reason === 'billing' || cached.reason === 'auth' || cached.reason === 'rate-limit';
}

export function clearProviderErrors(): void {
  for (const key of Object.keys(providerErrorCache)) {
    delete providerErrorCache[key];
  }
}

export function getProviderErrors(): Record<string, ProviderErrorCache> {
  return { ...providerErrorCache };
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

  // Providers bloqueados (billing/auth conhecidos recentes) - pula automaticamente
  const claudeBlocked = isProviderBlocked('claude');
  const geminiBlocked = isProviderBlocked('gemini');
  const openrouterBlocked = isProviderBlocked('openrouter');

  const claudeUsable = status.hasClaudeKey && !claudeBlocked;
  const geminiUsable = status.hasGeminiKey && !geminiBlocked;
  const openrouterUsable = status.hasOpenRouterKey && !openrouterBlocked;

  if (status.autoModelEnabled) {
    const selected = autoSelectModel(userPrompt, agentId, claudeUsable, geminiUsable, openrouterUsable);
    if (selected) return selected;
  }

  if (status.selectedModelId) {
    const model = MODELS[status.selectedModelId];
    if (model) {
      if (model.provider === 'claude' && !claudeUsable) {
        // Modelo preferido indisponivel - fallback silencioso para Gemini
        if (geminiUsable) return MODELS['gemini-3-1-flash'];
        if (openrouterUsable) return MODELS['gpt-5-4-mini'];
        return null;
      }
      if (model.provider === 'gemini' && !geminiUsable) {
        if (claudeUsable) return MODELS['claude-sonnet-4-6'];
        if (openrouterUsable) return MODELS['gpt-5-4-mini'];
        return null;
      }
      if (model.provider === 'openrouter' && !openrouterUsable) {
        if (claudeUsable) return MODELS['claude-sonnet-4-6'];
        if (geminiUsable) return MODELS['gemini-3-1-flash'];
        return null;
      }
      return model;
    }
  }

  // Ordem de preferencia default considerando providers nao bloqueados
  if (claudeUsable) return MODELS['claude-sonnet-4-6'];
  if (geminiUsable) return MODELS['gemini-3-1-flash'];
  if (openrouterUsable) return MODELS['gpt-5-4-mini'];
  // Se todos bloqueados mas com chaves, tenta mesmo assim (pode ter liberado)
  if (status.hasClaudeKey) return MODELS['claude-sonnet-4-6'];
  if (status.hasGeminiKey) return MODELS['gemini-3-1-pro'];
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

    // Usa Extended Thinking para qualquer modelo que suporta (nao so reasoning)
    // Isso ativa o "pensamento profundo" antes da resposta, resultando em respostas
    // muito mais densas e fundamentadas
    if (model.supportsExtendedThinking) {
      try {
        const { text, thinkingTokens } = await callClaudeWithThinking(req, key, model.apiModel as ClaudeApiModel);
        return { text, model, thinkingTokens };
      } catch (err) {
        // Se thinking falhou (nao suportado ainda ou erro), fallback para chamada normal
        const text = await callClaude(req, key, model.apiModel as ClaudeApiModel);
        return { text, model };
      }
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
 * Considera providers bloqueados (que falharam recentemente) por ultimo.
 */
function findFallbackModel(excludeProvider: APIProvider): ModelDefinition | null {
  const status = getStatus();
  const preferences: Record<APIProvider, string> = {
    claude: 'claude-sonnet-4-6',
    gemini: 'gemini-3-1-pro', // Pro com reasoning - prefere qualidade em vez de velocidade
    openrouter: 'gpt-5-4-mini',
  };

  const candidates: APIProvider[] = (['claude', 'gemini', 'openrouter'] as APIProvider[]).filter((p) => p !== excludeProvider);
  // Prioriza providers que tem chave E nao estao bloqueados
  const usable: APIProvider[] = [];
  const blocked: APIProvider[] = [];
  for (const prov of candidates) {
    const hasKey = prov === 'claude' ? status.hasClaudeKey
                 : prov === 'gemini' ? status.hasGeminiKey
                 : status.hasOpenRouterKey;
    if (!hasKey) continue;
    if (isProviderBlocked(prov)) blocked.push(prov);
    else usable.push(prov);
  }

  const order = [...usable, ...blocked];
  for (const prov of order) {
    if (MODELS[preferences[prov]]) {
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

  // Sempre usa o MAXIMO que o modelo suporta para respostas densas
  const enhancedReq: ChatRequest = {
    ...req,
    systemPrompt,
    maxTokens: req.maxTokens ? Math.min(req.maxTokens, model.maxOutput) : model.maxOutput,
  };

  try {
    return await executeModelCall(model, enhancedReq);
  } catch (err) {
    // Marca erro no cache para proximas requests pularem esse provider
    markProviderError(model.provider, err);

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
      markProviderError(fallbackModel.provider, fbErr);

      // Se o fallback tambem falhar, tenta o ultimo provider restante
      const secondFallback = findFallbackModel(fallbackModel.provider);
      if (!secondFallback || secondFallback.provider === model.provider) throw fbErr;

      let secSystemPrompt = req.systemPrompt;
      if (secondFallback.systemPromptStyle) {
        secSystemPrompt = `${secondFallback.systemPromptStyle}\n\n---\n\n${secSystemPrompt}`;
      }
      const secReq: ChatRequest = { ...req, systemPrompt: secSystemPrompt, maxTokens: Math.min(req.maxTokens ?? secondFallback.maxOutput, secondFallback.maxOutput) };
      try {
        const result = await executeModelCall(secondFallback, secReq);
        return { ...result, model: { ...secondFallback, label: `${secondFallback.label} (2x fallback)` } };
      } catch (err3) {
        markProviderError(secondFallback.provider, err3);
        throw err3;
      }
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
