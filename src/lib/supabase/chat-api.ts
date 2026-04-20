import { supabase } from './client';
import type { Agent, Client, Task, PromptParams } from '../agents/types';
import { buildSystemPrompt } from '../agents/system-prompt-builder';

interface ChatViaEdgeFunctionParams {
  agent: Agent;
  client: Client | null;
  userMessage: string;
  userName: string;
  ppFlags: PromptParams;
  tasks: Task[];
  sprintWeek: string;
  sprintGoals: string[];
  recentMessages: { role: 'user' | 'bot'; content: string }[];
}

/**
 * Call the chat Edge Function (server-side Gemini call).
 * This keeps the Gemini key secret on Supabase and also persists the conversation
 * and messages to the database in a single round-trip.
 *
 * To use: deploy the chat edge function via `supabase functions deploy chat`
 * and set GEMINI_API_KEY as a secret.
 *
 * Usage example in ChatArea:
 *   const { response, error } = await sendChatViaEdgeFunction({...});
 *   if (error) { // fallback to direct call or offline }
 */
export async function sendChatViaEdgeFunction(
  params: ChatViaEdgeFunctionParams
): Promise<{ response: string | null; error: string | null }> {
  const systemPrompt = buildSystemPrompt({
    agent: params.agent,
    client: params.client,
    userName: params.userName,
    ppFlags: params.ppFlags,
    tasks: params.tasks,
    sprintWeek: params.sprintWeek,
    sprintGoals: params.sprintGoals,
    recentMessages: params.recentMessages,
  });

  try {
    const { data, error } = await supabase.functions.invoke('chat', {
      body: {
        agentId: params.agent.id,
        clientId: params.client?.id ?? null,
        userMessage: params.userMessage,
        systemPrompt,
      },
    });

    if (error) return { response: null, error: error.message };
    if (!data?.response) return { response: null, error: 'Empty response' };
    return { response: data.response, error: null };
  } catch (err) {
    return { response: null, error: (err as Error).message };
  }
}

interface GenerateDocParams {
  prompt: string;
  documentType: 'artigo' | 'email' | 'landing-page' | 'campanha' | 'roteiro' | 'relatorio' | 'custom';
  agentId: string;
  clientName?: string;
}

/**
 * Generate a document via the generate-document Edge Function.
 */
export async function generateDocumentViaEdgeFunction(
  params: GenerateDocParams
): Promise<{ content: string | null; error: string | null }> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-document', {
      body: params,
    });

    if (error) return { content: null, error: error.message };
    if (!data?.content) return { content: null, error: 'Empty content' };
    return { content: data.content, error: null };
  } catch (err) {
    return { content: null, error: (err as Error).message };
  }
}
