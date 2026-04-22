import { useEffect, useRef } from 'react';
import { recordUsage, estimateTokens } from '../lib/usage/tracker';
import { supabase } from '../lib/supabase/client';
import { emitEvent } from '../lib/integrations/webhooks';

/**
 * Hook: observa mensagens bot e registra uso automaticamente.
 * Tambem dispara webhooks configurados.
 */
export function trackMessageUsage(params: {
  userId: string;
  agentId: string;
  clientId?: string;
  modelId: string;
  modelProvider: 'claude' | 'gemini' | 'openrouter';
  inputText: string;
  outputText: string;
  thinkingTokens?: number;
}): void {
  const inputTokens = estimateTokens(params.inputText);
  const outputTokens = estimateTokens(params.outputText);

  const record = recordUsage({
    userId: params.userId,
    agentId: params.agentId,
    clientId: params.clientId,
    modelId: params.modelId,
    modelProvider: params.modelProvider,
    inputTokens,
    outputTokens,
    thinkingTokens: params.thinkingTokens,
  });

  // Persiste async no Supabase (nao bloqueia)
  if (params.userId !== 'offline') {
    supabase
      .from('usage_log')
      .insert({
        user_id: params.userId,
        agent_id: params.agentId,
        client_id: params.clientId,
        model_id: params.modelId,
        model_provider: params.modelProvider,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        thinking_tokens: params.thinkingTokens ?? 0,
        estimated_cost_usd: record.estimatedCostUSD,
      })
      .then(() => undefined)
      .then(undefined, () => undefined);
  }

  // Webhook: agent.response
  emitEvent('agent.response', {
    agentId: params.agentId,
    clientId: params.clientId,
    modelId: params.modelId,
    tokens: inputTokens + outputTokens,
    cost: record.estimatedCostUSD,
  }).catch(() => undefined);
}
