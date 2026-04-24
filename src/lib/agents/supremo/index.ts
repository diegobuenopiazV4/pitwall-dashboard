/**
 * SUPREMO - Sistema de Prompts de Elite para cada um dos 16 agentes V4 PIT WALL.
 *
 * Cada agente tem um prompt de 8.000-12.000 palavras seguindo a estrutura:
 * - Fase 1: Identidade com 5 mentores reais do dominio
 * - Fase 2: Sistema de contextualizacao
 * - Fase 3: Framework AIM
 * - Fase 4: Frameworks especializados
 * - Fase 5: Protocolo de 5 perguntas refinadas
 * - Fase 6: Analise de 8 pilares
 * - Fase 7: Framework de qualidade proprio
 * - Fase 8: Protocolo de iteracao
 * - Fase 9: Estilo e linguagem V4
 * - Fase 10: Estrutura de output obrigatoria
 * - Fase 11: Principios do dominio
 * - Fase 12: Benchmarks e cases BR
 *
 * Resposta minima: 6.000 palavras (simples), 10.000 (normal), 18.000 (complexo)
 */

import { generateSupremoPrompt, type SupremoAgentData } from './template';
import { AGENT_01_MESTRE } from './agents-data-part1';
import { AGENT_02_GESTOR, AGENT_03_GOOGLE } from './agents-data-part2';
import { AGENT_04_META, AGENT_05_DESIGNER_ADS } from './agents-data-part3';
import { AGENT_06_DESIGN_SOCIAL, AGENT_07_SOCIAL_MEDIA, AGENT_08_COPY_PERFORMANCE, AGENT_09_COPY_CONTEUDO } from './agents-data-part4';
import { AGENT_10_AUTOMACOES, AGENT_11_CRM, AGENT_12_WEB } from './agents-data-part5';
import { AGENT_13_DADOS, AGENT_14_SEO, AGENT_15_VIDEO, AGENT_16_CRO } from './agents-data-part6';

// =========================================================================
// CATALOGO COMPLETO DOS 16 AGENTES SUPREMO
// =========================================================================
export const SUPREMO_AGENTS: Record<string, SupremoAgentData> = {
  '01': AGENT_01_MESTRE,
  '02': AGENT_02_GESTOR,
  '03': AGENT_03_GOOGLE,
  '04': AGENT_04_META,
  '05': AGENT_05_DESIGNER_ADS,
  '06': AGENT_06_DESIGN_SOCIAL,
  '07': AGENT_07_SOCIAL_MEDIA,
  '08': AGENT_08_COPY_PERFORMANCE,
  '09': AGENT_09_COPY_CONTEUDO,
  '10': AGENT_10_AUTOMACOES,
  '11': AGENT_11_CRM,
  '12': AGENT_12_WEB,
  '13': AGENT_13_DADOS,
  '14': AGENT_14_SEO,
  '15': AGENT_15_VIDEO,
  '16': AGENT_16_CRO,
};

/**
 * Retorna o prompt SUPREMO completo (8.000-12.000 palavras) para um agente.
 * Usado pelo system-prompt-builder para injetar na request IA.
 */
export function getSupremoPrompt(agentId: string): string | null {
  const data = SUPREMO_AGENTS[agentId];
  if (!data) return null;
  return generateSupremoPrompt(data);
}

/**
 * Lista curta dos agentes disponiveis (para UI que mostra se SUPREMO esta ativo).
 */
export function getSupremoAgentInfo(agentId: string): { name: string; supremoName: string } | null {
  const data = SUPREMO_AGENTS[agentId];
  if (!data) return null;
  return { name: data.agentName, supremoName: data.supremoName };
}

export type { SupremoAgentData } from './template';
