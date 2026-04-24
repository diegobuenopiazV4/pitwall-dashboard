/**
 * Geracao automatica de titulo para threads usando IA.
 * Acionado apos 3+ mensagens na thread.
 */

import { callAI } from '../ai/universal-caller';

export async function generateThreadTitle(
  firstUserMsg: string,
  firstBotMsg: string
): Promise<string | null> {
  try {
    const prompt = `Voce e um sumarizador. Gere um TITULO curto (max 6 palavras, sem emoji, em portugues) para esta conversa.

Formato: "Acao + Objeto + Contexto" (ex: "Legendas Instagram Fibra Jequie", "Plano Campanha Black Friday ACME", "Analise Trafego Meta Abril").

MENSAGEM USUARIO:
"""
${firstUserMsg.substring(0, 800)}
"""

RESPOSTA AGENTE (inicio):
"""
${firstBotMsg.substring(0, 400)}
"""

Retorne APENAS o titulo, sem aspas ou explicacao.`;

    const result = await callAI({
      systemPrompt: 'Voce gera titulos curtos e descritivos em portugues.',
      userPrompt: prompt,
      temperature: 0.3,
      maxTokens: 30,
    }, {
      preferOrder: ['gemini', 'openrouter', 'claude'], // Gemini Flash eh o mais rapido/barato para isso
    });

    let title = result.text.trim()
      .replace(/^["']|["']$/g, '')
      .replace(/[#*_`~]/g, '')
      .split('\n')[0]
      .trim();

    if (title.length > 60) title = title.substring(0, 57) + '...';
    return title || null;
  } catch {
    return null;
  }
}
