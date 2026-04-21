/**
 * Tipos compartilhados entre providers de IA (Claude, Gemini).
 */

export type AIProvider = 'claude' | 'gemini' | 'offline';

export interface ChatRequest {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
}

// Legacy — mantido para compatibilidade com codigo antigo.
// Modelos modernos estao em models.ts
export const CLAUDE_MODELS = {
  'claude-opus-4-5': 'Claude Opus 4.5 (premium)',
  'claude-sonnet-4-5': 'Claude Sonnet 4.5 (balanced)',
  'claude-haiku-4-5': 'Claude Haiku 4.5 (fast)',
  'claude-opus-4-1': 'Claude Opus 4.1',
} as const;

export const GEMINI_MODELS = {
  'gemini-2.5-pro': 'Gemini 2.5 Pro',
  'gemini-2.5-flash': 'Gemini 2.5 Flash',
  'gemini-2.5-flash-image': 'Gemini 2.5 Flash Image (geracao)',
  'gemini-2.0-flash': 'Gemini 2.0 Flash',
} as const;

export type ClaudeModel = keyof typeof CLAUDE_MODELS;
export type GeminiModel = keyof typeof GEMINI_MODELS;
