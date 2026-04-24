/**
 * Memoria de Cliente - cada cliente tem um arquivo de contexto persistente.
 *
 * Armazena:
 * - Brief / positioning
 * - Decisoes estrategicas tomadas
 * - Preferencias (tom, formato, cores)
 * - Cases que funcionaram
 * - Pessoas-chave / contatos
 *
 * Auto-injetado no system prompt sempre que o cliente esta selecionado.
 * Localstorage + export JSON para sync futuro.
 */

export interface ClientMemory {
  clientId: string;
  updatedAt: string;
  brief: string;
  positioning: string;
  tone: string;
  decisions: Array<{ date: string; decision: string; rationale?: string }>;
  preferences: Array<{ topic: string; preference: string }>;
  wins: string[];
  contacts: Array<{ name: string; role?: string; email?: string; phone?: string; notes?: string }>;
  freeNotes: string;
}

const STORAGE_PREFIX = 'v4_pitwall_client_memory_';

export function loadClientMemory(clientId: string): ClientMemory | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + clientId);
    if (!raw) return null;
    return JSON.parse(raw) as ClientMemory;
  } catch {
    return null;
  }
}

export function saveClientMemory(memory: ClientMemory): void {
  try {
    localStorage.setItem(
      STORAGE_PREFIX + memory.clientId,
      JSON.stringify({ ...memory, updatedAt: new Date().toISOString() })
    );
  } catch {
    // quota exceeded - ignore
  }
}

export function initClientMemory(clientId: string): ClientMemory {
  return {
    clientId,
    updatedAt: new Date().toISOString(),
    brief: '',
    positioning: '',
    tone: '',
    decisions: [],
    preferences: [],
    wins: [],
    contacts: [],
    freeNotes: '',
  };
}

/**
 * Formata a memoria em markdown para injetar no system prompt.
 */
export function formatMemoryForPrompt(memory: ClientMemory | null): string {
  if (!memory) return '';

  const parts: string[] = [];
  parts.push(`\n## MEMORIA DO CLIENTE (PERSISTENTE - APLICAR SEMPRE)`);

  if (memory.brief) parts.push(`\n### Brief\n${memory.brief}`);
  if (memory.positioning) parts.push(`\n### Posicionamento\n${memory.positioning}`);
  if (memory.tone) parts.push(`\n### Tom de voz preferido\n${memory.tone}`);

  if (memory.decisions.length > 0) {
    parts.push(`\n### Decisoes estrategicas tomadas`);
    for (const d of memory.decisions.slice(-10)) {
      parts.push(`- [${d.date.substring(0, 10)}] ${d.decision}${d.rationale ? ` (motivo: ${d.rationale})` : ''}`);
    }
  }

  if (memory.preferences.length > 0) {
    parts.push(`\n### Preferencias observadas`);
    for (const p of memory.preferences) {
      parts.push(`- ${p.topic}: ${p.preference}`);
    }
  }

  if (memory.wins.length > 0) {
    parts.push(`\n### Wins / campanhas que funcionaram`);
    for (const w of memory.wins.slice(-5)) {
      parts.push(`- ${w}`);
    }
  }

  if (memory.contacts.length > 0) {
    parts.push(`\n### Contatos chave`);
    for (const c of memory.contacts) {
      parts.push(`- ${c.name}${c.role ? ` (${c.role})` : ''}${c.email ? ` - ${c.email}` : ''}`);
    }
  }

  if (memory.freeNotes.trim()) {
    parts.push(`\n### Notas livres\n${memory.freeNotes}`);
  }

  return parts.join('\n');
}

/**
 * Adiciona uma decisao automaticamente (chamado quando IA responde algo significativo).
 */
export function appendDecision(clientId: string, decision: string, rationale?: string): void {
  let mem = loadClientMemory(clientId);
  if (!mem) mem = initClientMemory(clientId);
  mem.decisions.push({
    date: new Date().toISOString(),
    decision,
    rationale,
  });
  // Mantem so ultimas 50 decisoes
  if (mem.decisions.length > 50) mem.decisions = mem.decisions.slice(-50);
  saveClientMemory(mem);
}

/**
 * Adiciona preferencia (capturada quando usuario da feedback).
 */
export function appendPreference(clientId: string, topic: string, preference: string): void {
  let mem = loadClientMemory(clientId);
  if (!mem) mem = initClientMemory(clientId);
  // Substitui se topico ja existe
  const existing = mem.preferences.findIndex((p) => p.topic.toLowerCase() === topic.toLowerCase());
  if (existing >= 0) mem.preferences[existing].preference = preference;
  else mem.preferences.push({ topic, preference });
  saveClientMemory(mem);
}
