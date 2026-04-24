/**
 * Sistema de Threads de Conversa (estilo Claude chat / Cursor / Cowork).
 *
 * Arquitetura:
 * - Cada CONVERSA e uma thread com id unico (UUID)
 * - Threads sao agrupadas por CLIENT_ID (null = geral)
 * - Uma thread tem AGENT_ID preferido mas pode receber outros agentes no meio
 * - Mensagens pertencem a uma thread (nao mais ao par agent_client)
 * - Titulo auto-gerado a partir da primeira mensagem
 */

export interface ConversationThread {
  id: string;                    // UUID unico
  userId: string;
  clientId: string | null;       // null = thread geral (sem cliente especifico)
  primaryAgentId: string;        // Agente com que a thread foi iniciada
  title: string;                 // Auto-gerado da 1a mensagem, editavel
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp da ultima atividade
  messageCount: number;          // Contagem rapida sem ler messages array
  starred?: boolean;             // Favoritar thread
  archived?: boolean;            // Arquivar (esconder sem apagar)
  tags?: string[];               // Ex: ["campanha-abril", "pauta"]
  lastMessagePreview?: string;   // Preview da ultima msg para listar na sidebar
  lastMessageRole?: 'user' | 'bot';
}

/**
 * Gera UUID v4 simples (compatible browser) para thread IDs.
 */
export function newThreadId(): string {
  return crypto.randomUUID();
}

/**
 * Gera titulo automatico a partir da primeira mensagem do usuario.
 * Remove markdown/emoji, truncado em 60 chars.
 */
export function autoGenerateTitle(firstUserMessage: string): string {
  let title = firstUserMessage
    .replace(/[#*_`~>]/g, '') // markdown
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // emojis
    .replace(/\s+/g, ' ')
    .trim();

  if (title.length > 60) {
    title = title.substring(0, 57) + '...';
  }
  return title || 'Nova conversa';
}

/**
 * Cria uma thread nova.
 */
export function createThread(params: {
  userId: string;
  clientId: string | null;
  agentId: string;
  firstMessage?: string;
}): ConversationThread {
  const now = new Date().toISOString();
  const title = params.firstMessage ? autoGenerateTitle(params.firstMessage) : 'Nova conversa';

  return {
    id: newThreadId(),
    userId: params.userId,
    clientId: params.clientId,
    primaryAgentId: params.agentId,
    title,
    createdAt: now,
    updatedAt: now,
    messageCount: 0,
  };
}

/**
 * Agrupa threads por cliente para exibir na sidebar.
 */
export interface ThreadGroup {
  clientId: string | null;
  clientName: string;
  threads: ConversationThread[];
}

export function groupThreadsByClient(
  threads: ConversationThread[],
  clientNames: Record<string, string>
): ThreadGroup[] {
  const groups: Record<string, ThreadGroup> = {};

  for (const thread of threads) {
    if (thread.archived) continue;
    const key = thread.clientId ?? '__general__';
    if (!groups[key]) {
      groups[key] = {
        clientId: thread.clientId,
        clientName: thread.clientId ? (clientNames[thread.clientId] || 'Cliente removido') : 'Geral / Sem cliente',
        threads: [],
      };
    }
    groups[key].threads.push(thread);
  }

  // Ordena threads dentro de cada grupo pelo updatedAt (mais recente primeiro)
  for (const group of Object.values(groups)) {
    group.threads.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  // Ordena grupos: Geral primeiro, depois alfabetico por clientName
  return Object.values(groups).sort((a, b) => {
    if (a.clientId === null) return -1;
    if (b.clientId === null) return 1;
    return a.clientName.localeCompare(b.clientName);
  });
}

/**
 * Filtra threads por termo de busca (titulo + tags + preview).
 */
export function searchThreads(threads: ConversationThread[], query: string): ConversationThread[] {
  if (!query.trim()) return threads;
  const q = query.toLowerCase();
  return threads.filter((t) =>
    t.title.toLowerCase().includes(q) ||
    (t.lastMessagePreview || '').toLowerCase().includes(q) ||
    (t.tags || []).some((tag) => tag.toLowerCase().includes(q))
  );
}

/**
 * Atualiza metadados da thread apos nova mensagem.
 */
export function applyMessageToThread(
  thread: ConversationThread,
  message: { content: string; role: 'user' | 'bot' }
): ConversationThread {
  return {
    ...thread,
    updatedAt: new Date().toISOString(),
    messageCount: thread.messageCount + 1,
    lastMessagePreview: message.content.substring(0, 100).replace(/\s+/g, ' '),
    lastMessageRole: message.role,
  };
}
