/**
 * DEEP MODE - Geracao de resposta em 3 passes para garantir 6k-20k+ palavras de qualidade.
 *
 * Fase 1: PLANEJAMENTO (Gemini Flash rapido, ~3k palavras de outline estruturado)
 * Fase 2: EXPANSAO (modelo forte com thinking, expande cada secao ao maximo)
 * Fase 3: ENRIQUECIMENTO (adiciona benchmarks, cases, templates, FAQ)
 *
 * Estrategia anti-concisao:
 * - Template rigid de 25 secoes obrigatorias
 * - Volume minimo explicito por secao
 * - Re-query automatico se resposta veio abaixo do minimo
 * - maxTokens maximo do modelo (nao o default 8k)
 */

import { callClaude, callClaudeWithThinking } from './claude-client';
import { callGemini } from './gemini-client';
import { getClaudeKey, getGeminiKey, getOpenRouterKey, getGroqKey } from './chat-provider';
import { callOpenRouter } from './openrouter-client';
import { callGroq } from './groq-client';
import {
  DEEP_MODE_DIRECTIVE,
  DEEP_PLAN_DIRECTIVE,
  DEEP_EXPAND_DIRECTIVE,
  DEEP_ENRICH_DIRECTIVE,
} from '../prompts/deep-system-prompt';
import type { ChatRequest } from './types';

export interface DeepProgressEvent {
  phase: 1 | 2 | 3;
  phaseName: string;
  status: 'starting' | 'in-progress' | 'complete' | 'error';
  partialText?: string;
  error?: string;
  wordCount?: number;
}

export type ProgressCallback = (event: DeepProgressEvent) => void;

const MIN_WORDS_TARGET = 6000;

function countWords(text: string): number {
  return text.trim().split(/\s+/).length;
}

/**
 * Decide qual modelo usar para cada fase.
 * Fase 1 (planejamento): rapido - Gemini Flash ou Sonnet
 * Fase 2 (expansao): poderoso com thinking - Gemini 3.1 Pro ou Claude Opus 4.7
 * Fase 3 (enriquecimento): mesmo poderoso
 */
async function callModelForDeep(
  req: ChatRequest,
  phase: 1 | 2 | 3
): Promise<string> {
  const claudeKey = getClaudeKey();
  const geminiKey = getGeminiKey();
  const openrouterKey = getOpenRouterKey();
  const groqKey = getGroqKey();

  // Fase 1: prioriza velocidade (modelos rapidos)
  if (phase === 1) {
    if (groqKey) {
      try {
        return await callGroq(req, groqKey, 'llama-3.1-8b-instant');
      } catch { /* fallback */ }
    }
    if (geminiKey) {
      try {
        return await callGemini(req, geminiKey, 'gemini-3.1-flash', false);
      } catch {
        // fallback
      }
    }
    if (claudeKey) {
      try {
        return await callClaude(req, claudeKey, 'claude-haiku-4-5');
      } catch { /* fallback */ }
    }
    if (openrouterKey) {
      return await callOpenRouter(req, openrouterKey, 'openai/gpt-5.4-mini');
    }
  }

  // Fase 2 e 3: prioriza qualidade (Pro/Opus com thinking)
  if (geminiKey) {
    try {
      return await callGemini(req, geminiKey, 'gemini-3.1-pro', false);
    } catch { /* fallback */ }
  }
  if (claudeKey) {
    try {
      const { text } = await callClaudeWithThinking(req, claudeKey, 'claude-opus-4-7');
      return text;
    } catch {
      try {
        return await callClaude(req, claudeKey, 'claude-sonnet-4-6');
      } catch { /* fallback */ }
    }
  }
  if (groqKey) {
    try {
      return await callGroq(req, groqKey, 'llama-3.3-70b-versatile');
    } catch { /* fallback */ }
  }
  if (openrouterKey) {
    return await callOpenRouter(req, openrouterKey, 'openai/gpt-5.4');
  }

  throw new Error('Nenhum provider disponivel para DEEP MODE');
}

/**
 * Gera resposta em modo DEEP (3 passes).
 */
export async function generateDeepResponse(
  userPrompt: string,
  baseSystemPrompt: string,
  progressCb?: ProgressCallback
): Promise<string> {
  // ========================
  // FASE 1: PLANEJAMENTO
  // ========================
  progressCb?.({ phase: 1, phaseName: 'Planejamento estrutural', status: 'starting' });

  const planSystemPrompt = `${baseSystemPrompt}\n\n${DEEP_PLAN_DIRECTIVE}`;
  let planText = '';
  try {
    planText = await callModelForDeep({
      systemPrompt: planSystemPrompt,
      userPrompt: `Solicitacao do usuario:\n\n"""\n${userPrompt}\n"""\n\nRetorne o plano em JSON valido conforme instrucao.`,
      temperature: 0.5,
      maxTokens: 12000,
    }, 1);
    progressCb?.({
      phase: 1,
      phaseName: 'Planejamento estrutural',
      status: 'complete',
      wordCount: countWords(planText),
    });
  } catch (err: any) {
    progressCb?.({ phase: 1, phaseName: 'Planejamento', status: 'error', error: err.message });
    throw err;
  }

  // ========================
  // FASE 2: EXPANSAO
  // ========================
  progressCb?.({ phase: 2, phaseName: 'Expansao detalhada (secoes)', status: 'starting' });

  const expandSystemPrompt = `${baseSystemPrompt}\n\n${DEEP_MODE_DIRECTIVE}`;
  let expansion = '';
  try {
    expansion = await callModelForDeep({
      systemPrompt: expandSystemPrompt,
      userPrompt: DEEP_EXPAND_DIRECTIVE(planText) + `\n\nSOLICITACAO ORIGINAL DO USUARIO:\n${userPrompt}`,
      temperature: 0.75,
      maxTokens: 65000,
    }, 2);

    // RETRY se resposta veio curta demais
    if (countWords(expansion) < MIN_WORDS_TARGET) {
      progressCb?.({
        phase: 2,
        phaseName: 'Expansao (re-pedindo mais volume)',
        status: 'in-progress',
        wordCount: countWords(expansion),
      });
      const expandMore = await callModelForDeep({
        systemPrompt: expandSystemPrompt,
        userPrompt: `A resposta abaixo esta MUITO CURTA (${countWords(expansion)} palavras).\n\nVoce DEVE expandi-la para no minimo 8.000 palavras adicionando:\n- Mais exemplos\n- Mais cases reais brasileiros\n- Mais numeros e benchmarks\n- Mais variacoes A/B\n- Mais detalhe tecnico\n- Mais templates prontos\n\nREESCREVA o documento COMPLETO com essa expansao:\n\n${expansion}\n\nSolicitacao original: ${userPrompt}`,
        temperature: 0.8,
        maxTokens: 65000,
      }, 2);
      if (countWords(expandMore) > countWords(expansion)) {
        expansion = expandMore;
      }
    }

    progressCb?.({
      phase: 2,
      phaseName: 'Expansao detalhada',
      status: 'complete',
      wordCount: countWords(expansion),
    });
  } catch (err: any) {
    progressCb?.({ phase: 2, phaseName: 'Expansao', status: 'error', error: err.message });
    throw err;
  }

  // Se ja temos muito conteudo, fase 3 pode ser opcional
  // Mas vamos fazer ela pra garantir enriquecimento
  const needsEnrichment = countWords(expansion) < 12000;

  if (!needsEnrichment) {
    progressCb?.({
      phase: 3,
      phaseName: 'Enriquecimento (skipped - ja denso suficiente)',
      status: 'complete',
      wordCount: countWords(expansion),
    });
    return expansion;
  }

  // ========================
  // FASE 3: ENRIQUECIMENTO
  // ========================
  progressCb?.({ phase: 3, phaseName: 'Enriquecimento com benchmarks', status: 'starting' });

  try {
    const enriched = await callModelForDeep({
      systemPrompt: expandSystemPrompt,
      userPrompt: DEEP_ENRICH_DIRECTIVE(expansion) + `\n\nSolicitacao original do usuario: ${userPrompt}`,
      temperature: 0.7,
      maxTokens: 65000,
    }, 3);
    progressCb?.({
      phase: 3,
      phaseName: 'Enriquecimento',
      status: 'complete',
      wordCount: countWords(enriched),
    });
    return enriched;
  } catch (err: any) {
    progressCb?.({ phase: 3, phaseName: 'Enriquecimento (falhou, usando expansao)', status: 'error', error: err.message });
    // Se fase 3 falhou, retorna fase 2 que ja e extensa
    return expansion;
  }
}
