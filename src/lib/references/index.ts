/**
 * Referencias completas do V4 PIT WALL.
 * Importadas como raw text (via Vite `?raw`).
 * Injetadas no system prompt quando relevantes para o agente/tarefa.
 */

import agentesCompleto from './agentes-completo.md?raw';
import clientesRuston from './clientes-ruston.md?raw';
import dashboardArchitecture from './dashboard-architecture.md?raw';
import mentoresPlaybooks from './mentores-playbooks.md?raw';
import protocolosOperacionais from './protocolos-operacionais.md?raw';
import v4PortfolioProdutos from './v4-portfolio-produtos.md?raw';
import v4SistemasOperacionais from './v4-sistemas-operacionais.md?raw';

export const REFERENCES = {
  agentesCompleto,
  clientesRuston,
  dashboardArchitecture,
  mentoresPlaybooks,
  protocolosOperacionais,
  v4PortfolioProdutos,
  v4SistemasOperacionais,
} as const;

/**
 * Retorna a fatia relevante de uma referencia grande, para economizar tokens.
 */
export function extractAgentSection(agentId: string): string {
  // Find the section in agentes-completo.md
  const regex = new RegExp(`## ${agentId}\\.[^#]*?(?=## \\d{2}\\.|## INTER-AGENT|## COMPLIANCE|$)`, 's');
  const match = agentesCompleto.match(regex);
  return match ? match[0].trim() : '';
}

export function extractMentorPlaybook(agentId: string): string {
  const regex = new RegExp(`## ${agentId}\\b[^#]*?(?=## \\d{2}\\b|$)`, 's');
  const match = mentoresPlaybooks.match(regex);
  return match ? match[0].trim() : '';
}

/**
 * Detecta qual(is) referencia(s) e util para uma query.
 */
export function getRelevantReferences(userPrompt: string, agentId: string): string[] {
  const p = userPrompt.toLowerCase();
  const refs: string[] = [];

  // Sempre incluir secao do agente e playbook
  const agentSection = extractAgentSection(agentId);
  const mentorPlaybook = extractMentorPlaybook(agentId);
  if (agentSection) refs.push(`# AGENTE ${agentId} - REFERENCIA COMPLETA\n\n${agentSection}`);
  if (mentorPlaybook) refs.push(`# MENTORES E PLAYBOOKS\n\n${mentorPlaybook}`);

  // Incluir produtos V4 se fizer diagnostico/gap
  if (p.includes('gap') || p.includes('diagnostico') || p.includes('nbo') || p.includes('produto v4') || p.includes('recomend')) {
    refs.push(`# PRODUTOS V4\n\n${v4PortfolioProdutos.slice(0, 4000)}`);
  }

  // Incluir sistemas operacionais se forecast/relatorio
  if (p.includes('forecast') || p.includes('relatorio') || p.includes('projecao') || p.includes('expansao')) {
    refs.push(`# SISTEMAS OPERACIONAIS V4\n\n${v4SistemasOperacionais.slice(0, 4000)}`);
  }

  // Incluir clientes ruston se mencionar nome de cliente
  const rustonClients = ['ashey', 'box acnt', 'dprint', 'inovus', 'mais confeccoes', 'nosso rumo', 'randa', 'ring', 'semper', 'we bella'];
  if (rustonClients.some((c) => p.includes(c))) {
    refs.push(`# CLIENTES RUSTON\n\n${clientesRuston.slice(0, 5000)}`);
  }

  // Protocolos sao sempre uteis mas longos - incluir resumo
  refs.push(`# PROTOCOLOS OPERACIONAIS (resumo)\n\n${protocolosOperacionais.slice(0, 3000)}`);

  return refs;
}
