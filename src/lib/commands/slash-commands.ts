/**
 * Sistema de Slash Commands (/) estilo Linear/Cursor/Discord.
 *
 * Ativacao: usuario digita "/" no input do chat -> popup com lista filtravel.
 * Comandos executam acoes imediatas:
 * - Abrir views (check-in, trafego, clipping, criativos, ekyte, skills)
 * - Abrir links externos (pauta social)
 * - Navegar (nova conversa, trocar agente, trocar cliente)
 * - Abrir modais (ferramentas, settings)
 */

import type { ViewMode } from '../../stores/app-store';

export type SlashAction =
  | { kind: 'view'; target: ViewMode }
  | { kind: 'link'; url: string }
  | { kind: 'event'; name: string }
  | { kind: 'agent'; agentId: string }
  | { kind: 'client'; clientId: string | null }
  | { kind: 'new-thread' }
  | { kind: 'prompt'; prompt: string };

export interface SlashCommand {
  id: string;
  keyword: string;        // /<keyword>
  aliases?: string[];     // sinonimos (/tasks = /ekyte)
  label: string;          // Titulo exibido
  description: string;    // Linha secundaria
  icon: string;           // nome lucide (ex: 'Rocket')
  color: string;          // hex
  category: 'Skill' | 'Navegacao' | 'Agente' | 'Cliente' | 'Sistema';
  action: SlashAction;
  shortcut?: string;      // Ex: 'Cmd+N'
}

// =========================================================================
// CATALOGO DE COMANDOS (fixos + dinamicos gerados de agentes/clientes)
// =========================================================================

export const STATIC_COMMANDS: SlashCommand[] = [
  // SKILLS
  {
    id: 'slash-pauta-social',
    keyword: 'pauta',
    aliases: ['aprovacao', 'pauta-social', 'aprovar'],
    label: 'Aprovacao de Pauta Social',
    description: 'Abre a ferramenta V4 Ruston para cliente aprovar pauta de social media',
    icon: 'CheckSquare',
    color: '#e4243d',
    category: 'Skill',
    action: { kind: 'link', url: 'https://v4ruston-aprova.vercel.app/' },
  },
  {
    id: 'slash-checkin',
    keyword: 'checkin',
    aliases: ['check-in', 'dashboard', 'relatorio-mensal'],
    label: 'Check-in Mensal',
    description: 'Gerar dashboard HTML glassmorphism para cliente (20 frameworks)',
    icon: 'Sparkles',
    color: '#a855f7',
    category: 'Skill',
    action: { kind: 'view', target: 'checkin' },
  },
  {
    id: 'slash-trafego',
    keyword: 'trafego',
    aliases: ['relatorio', 'relatorio-trafego', 'meta-ads', 'google-ads', 'ads'],
    label: 'Relatorio de Trafego Pago',
    description: 'Upload de CSV Meta/Google Ads + IA gera relatorio HTML interativo',
    icon: 'Zap',
    color: '#f59420',
    category: 'Skill',
    action: { kind: 'view', target: 'trafego' },
  },
  {
    id: 'slash-clipping',
    keyword: 'clipping',
    aliases: ['rapport', 'clipping-rapport', 'noticias'],
    label: 'Clipping de Rapport',
    description: 'Curadoria de noticias + mensagens WhatsApp prontas pro cliente',
    icon: 'Newspaper',
    color: '#3b82f6',
    category: 'Skill',
    action: { kind: 'view', target: 'clipping' },
  },
  {
    id: 'slash-criativos',
    keyword: 'criativos',
    aliases: ['docx', 'copies', 'ads-copies', 'criativos-docx'],
    label: 'Criativos Ads -> DOCX',
    description: 'Monte copies de ads e exporte para .docx no template V4',
    icon: 'FileText',
    color: '#10b981',
    category: 'Skill',
    action: { kind: 'view', target: 'criativos' },
  },
  {
    id: 'slash-ekyte',
    keyword: 'ekyte',
    aliases: ['tasks', 'tarefas', 'mkt-lab', 'bookmarklet'],
    label: 'Criar Tasks no Ekyte',
    description: 'Gera bookmarklet arrastavel para criar tasks direto no mkt.lab',
    icon: 'Rocket',
    color: '#e4243d',
    category: 'Skill',
    action: { kind: 'view', target: 'ekyte' },
  },
  {
    id: 'slash-skills',
    keyword: 'skills',
    aliases: ['catalogo', 'tudo'],
    label: 'Catalogo de Skills',
    description: 'Ver todas as 16 skills + quick actions disponiveis',
    icon: 'Grid3x3',
    color: '#94a3b8',
    category: 'Skill',
    action: { kind: 'view', target: 'skills' },
  },

  // NAVEGACAO
  {
    id: 'slash-nova',
    keyword: 'nova',
    aliases: ['new', 'new-thread', 'novo-chat'],
    label: 'Nova conversa',
    description: 'Cria uma nova thread de chat',
    icon: 'Plus',
    color: '#e4243d',
    category: 'Navegacao',
    action: { kind: 'new-thread' },
    shortcut: 'Ctrl+N',
  },
  {
    id: 'slash-chat',
    keyword: 'chat',
    label: 'Voltar para Chat',
    description: 'Retorna a view principal de conversa',
    icon: 'MessageSquare',
    color: '#94a3b8',
    category: 'Navegacao',
    action: { kind: 'view', target: 'chat' },
  },
  {
    id: 'slash-kanban',
    keyword: 'kanban',
    aliases: ['board'],
    label: 'Kanban de Tarefas',
    description: 'Ver tarefas em formato kanban',
    icon: 'Kanban',
    color: '#3b82f6',
    category: 'Navegacao',
    action: { kind: 'view', target: 'kanban' },
  },
  {
    id: 'slash-documentos',
    keyword: 'documentos',
    aliases: ['docs', 'arquivos'],
    label: 'Documentos',
    description: 'Biblioteca de arquivos gerados e uploads',
    icon: 'FolderOpen',
    color: '#64748b',
    category: 'Navegacao',
    action: { kind: 'view', target: 'documents' },
  },

  // SISTEMA
  {
    id: 'slash-clientes',
    keyword: 'clientes',
    aliases: ['gerenciar-clientes'],
    label: 'Gerenciar Clientes',
    description: 'Abre modal com todos os clientes (criar/editar/arquivar)',
    icon: 'Briefcase',
    color: '#64748b',
    category: 'Sistema',
    action: { kind: 'event', name: 'pitwall:open-clients-modal' },
  },
  {
    id: 'slash-tarefas',
    keyword: 'tarefas',
    aliases: ['todos', 'tarefa'],
    label: 'Lista de Tarefas',
    description: 'Abre modal com lista de tarefas',
    icon: 'CheckSquare',
    color: '#f59420',
    category: 'Sistema',
    action: { kind: 'event', name: 'pitwall:open-tasks-modal' },
  },
  {
    id: 'slash-sprint',
    keyword: 'sprint',
    aliases: ['sprint-atual'],
    label: 'Sprint Atual',
    description: 'Abre modal com metas e progresso da sprint',
    icon: 'Zap',
    color: '#a855f7',
    category: 'Sistema',
    action: { kind: 'event', name: 'pitwall:open-sprint-modal' },
  },
  {
    id: 'slash-settings',
    keyword: 'settings',
    aliases: ['configuracoes', 'config', 'api'],
    label: 'Configuracoes',
    description: 'Chaves API, modelos, atalhos, conta',
    icon: 'Settings',
    color: '#94a3b8',
    category: 'Sistema',
    action: { kind: 'event', name: 'pitwall:open-settings' },
  },
  {
    id: 'slash-palette',
    keyword: 'palette',
    aliases: ['cmd', 'comando'],
    label: 'Command Palette',
    description: 'Busca universal de agentes, clientes, templates, comandos',
    icon: 'Command',
    color: '#a855f7',
    category: 'Sistema',
    action: { kind: 'event', name: 'pitwall:open-palette' },
    shortcut: 'Ctrl+Shift+P',
  },
  {
    id: 'slash-library',
    keyword: 'biblioteca',
    aliases: ['library', 'prompts', 'comandos-prontos'],
    label: 'Biblioteca de Prompts',
    description: '1600 comandos rapidos por agente',
    icon: 'Sparkles',
    color: '#f59420',
    category: 'Sistema',
    action: { kind: 'event', name: 'pitwall:open-library' },
  },
];

/**
 * Filtra comandos por query (fuzzy match: keyword + aliases + label).
 */
export function filterSlashCommands(commands: SlashCommand[], query: string): SlashCommand[] {
  if (!query.trim()) return commands;
  const q = query.toLowerCase().trim();

  const scored = commands.map((cmd) => {
    const kw = cmd.keyword.toLowerCase();
    const aliases = (cmd.aliases || []).map((a) => a.toLowerCase());
    const label = cmd.label.toLowerCase();
    const desc = cmd.description.toLowerCase();

    let score = 0;
    if (kw === q) score += 1000;
    else if (kw.startsWith(q)) score += 500;
    else if (kw.includes(q)) score += 200;
    for (const a of aliases) {
      if (a === q) score += 800;
      else if (a.startsWith(q)) score += 400;
      else if (a.includes(q)) score += 150;
    }
    if (label.toLowerCase().includes(q)) score += 100;
    if (desc.toLowerCase().includes(q)) score += 50;
    return { cmd, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.cmd);
}

/**
 * Gera comandos dinamicos para troca de agente/cliente.
 * Ex: /agente mestre, /cliente ACME
 */
export function generateDynamicCommands(params: {
  agents: { id: string; name: string; icon: string; color: string; area: string }[];
  clients: { id: string; name: string; segment?: string }[];
}): SlashCommand[] {
  const cmds: SlashCommand[] = [];

  // Agentes
  for (const agent of params.agents) {
    cmds.push({
      id: `slash-agent-${agent.id}`,
      keyword: `agente-${agent.name.toLowerCase().split(' ')[0]}`,
      aliases: [`${agent.id}`, agent.name.toLowerCase()],
      label: `Agente ${agent.id}: ${agent.name}`,
      description: agent.area,
      icon: 'Bot',
      color: agent.color,
      category: 'Agente',
      action: { kind: 'agent', agentId: agent.id },
    });
  }

  // Clientes
  for (const client of params.clients) {
    cmds.push({
      id: `slash-client-${client.id}`,
      keyword: `cliente-${client.name.toLowerCase().split(' ')[0]}`,
      aliases: [client.name.toLowerCase()],
      label: `Cliente: ${client.name}`,
      description: client.segment || 'Trocar contexto para este cliente',
      icon: 'Briefcase',
      color: '#64748b',
      category: 'Cliente',
      action: { kind: 'client', clientId: client.id },
    });
  }

  return cmds;
}
