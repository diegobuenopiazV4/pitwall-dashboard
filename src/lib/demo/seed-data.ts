/**
 * Seed demo data para novos usuarios.
 * Gera tasks, mensagens exemplo e sprint goals ao primeiro login,
 * para que a app nao pareca vazia.
 */

import type { Task, Message } from '../agents/types';

const SEED_KEY_PREFIX = 'v4_pitwall_demo_seeded_';

export function hasBeenSeeded(userId: string = 'offline'): boolean {
  return localStorage.getItem(SEED_KEY_PREFIX + userId) === 'true';
}

export function markSeeded(userId: string = 'offline'): void {
  localStorage.setItem(SEED_KEY_PREFIX + userId, 'true');
}

export function generateSeedTasks(userId: string, clientId?: string): Task[] {
  const now = new Date().toISOString();
  const tasks: Omit<Task, 'id'>[] = [
    {
      userId,
      clientId,
      agentId: '01',
      text: 'Diagnostico STEP completo + analise TOC de gargalos',
      done: false,
      priority: 'P1',
      sprintWeek: 'Semana atual',
      createdAt: now,
      updatedAt: now,
    },
    {
      userId,
      clientId,
      agentId: '03',
      text: 'Audit Quality Score Google Ads e top 10 keywords problematicas',
      done: false,
      priority: 'P1',
      sprintWeek: 'Semana atual',
      createdAt: now,
      updatedAt: now,
    },
    {
      userId,
      clientId,
      agentId: '05',
      text: 'Pack 10 conceitos criativos para A/B test Meta Ads',
      done: false,
      priority: 'P2',
      createdAt: now,
      updatedAt: now,
    },
    {
      userId,
      clientId,
      agentId: '07',
      text: 'Calendario editorial mensal (30 posts 70/20/10)',
      done: false,
      priority: 'P2',
      createdAt: now,
      updatedAt: now,
    },
    {
      userId,
      clientId,
      agentId: '08',
      text: 'Copy completa LP com PAS framework (9 secoes)',
      done: false,
      priority: 'P2',
      createdAt: now,
      updatedAt: now,
    },
    {
      userId,
      clientId,
      agentId: '14',
      text: 'Keyword research 50+ keywords por intent',
      done: false,
      priority: 'P3',
      createdAt: now,
      updatedAt: now,
    },
    {
      userId,
      clientId,
      agentId: '13',
      text: 'Dashboard KPIs AEMR no Looker Studio',
      done: true,
      priority: 'P2',
      createdAt: now,
      updatedAt: now,
    },
  ];

  return tasks.map((t) => ({ ...t, id: crypto.randomUUID() }));
}

export function generateSeedSprintGoals(): { week: string; goals: string[] } {
  const today = new Date();
  const weekNum = Math.ceil(today.getDate() / 7);
  const monthName = today.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase();
  return {
    week: `Semana ${weekNum} - ${monthName} ${today.getFullYear()}`,
    goals: [
      'ROAS > 3x em campanhas ativas',
      '5 novos criativos em producao',
      'Calendario editorial aprovado',
      '3 testes A/B rodando',
      'NPS > 50 no mes',
    ],
  };
}

/**
 * Mensagem exemplo de boas-vindas (so para ilustrar o chat vazio).
 */
export function generateWelcomeMessage(agentId: string, agentName: string): Message {
  return {
    id: crypto.randomUUID(),
    conversationId: `${agentId}_general`,
    role: 'bot',
    content: `# Bem-vindo, sou o ${agentName}!

Estou pronto para ajudar com **${agentName === 'Mestre Estrategista' ? 'estrategia, diagnosticos e orquestracao' : 'minha area de especialidade'}**.

## Como comecar

1. **Selecione um cliente** na sidebar (aba Clientes)
2. **Use um comando rapido** acima (tem 100 por agente!) - ou pressione **Ctrl+L** para a biblioteca completa
3. **Ou digite sua pergunta** livremente abaixo

## Dicas poderosas

- **Ctrl+Shift+P** - Command palette para navegar por agentes/clientes/templates
- **Ctrl+Shift+F** - Buscar em TODAS as conversas antigas
- **Ctrl+Shift+I** - Gerar Check-in (15 ou 24 slides glassmorphism)
- **Icone Plug** no Header - Conectar Ekyte, Slack, Zapier

## Dados do cliente

Se voce selecionar um cliente e tiver documentos anexados (CSVs de trafego, briefings, relatorios), eu vou ler automaticamente e incluir no contexto.

Voce tambem pode me pedir para **gerar imagens** (se tiver Gemini key) ou **criar landing pages HTML live** (usando Claude Design - meu modelo e Opus 4.7).

Vamos la — qual seu desafio de hoje?`,
    agentId,
    createdAt: new Date().toISOString(),
    modelUsed: 'Welcome (offline)',
  };
}

/**
 * Aplica seed completo no primeiro login.
 */
export function applySeed(params: {
  userId: string;
  clientId?: string;
  setTasks: (tasks: Task[]) => void;
  setSprintWeek: (week: string) => void;
  setSprintGoals: (goals: string[]) => void;
  setMessages: (key: string, messages: Message[]) => void;
  hasExistingData: boolean;
}): void {
  // Seed por user - cada user tem seus propios dados demo
  if (hasBeenSeeded(params.userId) || params.hasExistingData) return;

  // Tasks demo
  const tasks = generateSeedTasks(params.userId, params.clientId);
  params.setTasks(tasks);

  // Sprint
  const sprint = generateSeedSprintGoals();
  params.setSprintWeek(sprint.week);
  params.setSprintGoals(sprint.goals);

  // Welcome message no Agente 01
  const welcome = generateWelcomeMessage('01', 'Mestre Estrategista');
  params.setMessages('01_general', [welcome]);

  markSeeded(params.userId);
}
