/**
 * Tipos compartilhados entre providers de IA (Claude, Gemini, etc.)
 */

export type AIProvider = 'claude' | 'gemini' | 'offline';

export interface AIConfig {
  provider: AIProvider;
  claudeKey?: string;
  claudeModel?: string;
  geminiKey?: string;
  geminiModel?: string;
}

export interface ChatRequest {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
}

export const CLAUDE_MODELS = {
  'claude-sonnet-4-5': 'Claude Sonnet 4.5 (premium, melhor qualidade)',
  'claude-opus-4-1': 'Claude Opus 4.1 (top tier)',
  'claude-haiku-4-5': 'Claude Haiku 4.5 (rapido, economico)',
  'claude-3-5-sonnet-latest': 'Claude 3.5 Sonnet (estavel)',
  'claude-3-5-haiku-latest': 'Claude 3.5 Haiku (ultra rapido)',
} as const;

export const GEMINI_MODELS = {
  'gemini-2.0-flash': 'Gemini 2.0 Flash (rapido)',
  'gemini-2.0-flash-exp': 'Gemini 2.0 Flash (experimental)',
  'gemini-1.5-pro': 'Gemini 1.5 Pro (qualidade)',
} as const;

export type ClaudeModel = keyof typeof CLAUDE_MODELS;
export type GeminiModel = keyof typeof GEMINI_MODELS;
