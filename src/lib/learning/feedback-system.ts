/**
 * Sistema de Aprendizado com Feedback.
 *
 * Objetivo: quando usuario reclama de uma resposta, o sistema:
 * 1. Detecta automaticamente que eh reclamacao (regex de keywords)
 * 2. Pergunta especificamente o que esta errado (se vago)
 * 3. Captura a correcao
 * 4. Injeta essa correcao GLOBALMENTE (todos os clientes, todos os usuarios)
 *    no system prompt de futuras requisicoes
 *
 * Storage: localStorage (por enquanto) com key 'v4_pitwall_corrections'.
 * Futuro: migrar para Supabase para sincronizar entre usuarios.
 */

export interface FeedbackCorrection {
  id: string;
  createdAt: string;
  agentId?: string;              // Se a correcao eh especifica de um agente
  clientId?: string;             // Se a correcao eh especifica de um cliente
  category: 'style' | 'framework' | 'tone' | 'format' | 'content' | 'language' | 'data' | 'other';

  // Contexto original
  originalPrompt: string;
  originalResponse: string;      // Primeiras 500 chars

  // Reclamacao
  userComplaint: string;

  // Correcao/Aprendizado
  correctionInstruction: string; // Instrucao clara do que fazer diferente

  // Metadata
  appliedCount: number;          // Quantas vezes foi injetada
  userId?: string;
  active: boolean;               // Pode ser desativado em vez de deletado
}

const STORAGE_KEY = 'v4_pitwall_corrections';
const MAX_CORRECTIONS = 200;     // Limite para nao inflar localStorage

/**
 * Palavras-chave que indicam reclamacao/feedback negativo.
 */
const COMPLAINT_PATTERNS = [
  /\b(nao|n[aã]o) (est[aá]|esta|foi|gostei|gosto|entendi|faz|fez|serve|eh|[eé])\b/i,
  /\b(ruim|mal|errad[oa]|p[eé]ssim[oa]|horr[ií]vel|esquisit[oa])\b/i,
  /\b(prefiro|preferiria|ao inv[eé]s|voce deveria|deve ser|precisa ser)\b/i,
  /\b(resposta (curta|curtas|gen[eé]rica|gen[eé]ricas|vaga|vagas|simplista|simplistas))\b/i,
  /\b(sem (sentido|logica|contexto))\b/i,
  /\b(o (correto|ideal|certo) [eé])\b/i,
  /\b(na verdade|mas na verdade|deveria ser)\b/i,
  /\b(refaz|refa[çc]a|refaz isso|refazer|tenta de novo|tenta novamente)\b/i,
  /\b(isso nao [eé])\b/i,
];

/**
 * Detecta se a mensagem do usuario eh uma reclamacao/feedback.
 */
export function isComplaint(message: string): boolean {
  if (!message || message.length < 10) return false;
  return COMPLAINT_PATTERNS.some((pattern) => pattern.test(message));
}

/**
 * Categoriza a reclamacao em style/framework/tone/etc.
 */
export function categorizeComplaint(message: string): FeedbackCorrection['category'] {
  const lower = message.toLowerCase();
  if (/\b(framework|formula|metodo|60\/20|70\/30|aarrr|aida|pas|toc)\b/i.test(lower)) return 'framework';
  if (/\b(tom|voz|formal|informal|tecnico|direto|regional)\b/i.test(lower)) return 'tone';
  if (/\b(formato|tabela|lista|paragrafo|markdown|estrutura|layout)\b/i.test(lower)) return 'format';
  if (/\b(portugu[eê]s|ingl[eê]s|traducao|regional|linguagem)\b/i.test(lower)) return 'language';
  if (/\b(benchmark|dado|numero|cpl|cpa|roas|metrica)\b/i.test(lower)) return 'data';
  if (/\b(estilo|jeito|maneira)\b/i.test(lower)) return 'style';
  if (/\b(conteudo|resposta|texto|parte|secao)\b/i.test(lower)) return 'content';
  return 'other';
}

/**
 * Carrega todas as correcoes do storage.
 */
export function loadCorrections(): FeedbackCorrection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as FeedbackCorrection[];
  } catch {
    return [];
  }
}

/**
 * Salva correcoes no storage (ordenadas por createdAt desc, limitadas a MAX).
 */
export function saveCorrections(corrections: FeedbackCorrection[]): void {
  const sorted = [...corrections].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const trimmed = sorted.slice(0, MAX_CORRECTIONS);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // storage full - ignore
  }
}

/**
 * Registra uma nova correcao.
 */
export function addCorrection(correction: Omit<FeedbackCorrection, 'id' | 'createdAt' | 'appliedCount' | 'active'>): FeedbackCorrection {
  const newCorrection: FeedbackCorrection = {
    ...correction,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    appliedCount: 0,
    active: true,
  };
  const current = loadCorrections();
  saveCorrections([newCorrection, ...current]);
  return newCorrection;
}

/**
 * Marca uma correcao como aplicada (incrementa appliedCount).
 */
export function markCorrectionApplied(id: string): void {
  const corrections = loadCorrections();
  const updated = corrections.map((c) => c.id === id ? { ...c, appliedCount: c.appliedCount + 1 } : c);
  saveCorrections(updated);
}

/**
 * Desativa uma correcao (mantem historico mas nao aplica mais).
 */
export function deactivateCorrection(id: string): void {
  const corrections = loadCorrections();
  saveCorrections(corrections.map((c) => c.id === id ? { ...c, active: false } : c));
}

/**
 * Busca correcoes relevantes para uma request especifica.
 * Filtra por:
 * - active === true
 * - agentId matching ou generico (sem agentId)
 * - clientId matching ou generico (sem clientId)
 */
export function getRelevantCorrections(params: {
  agentId: string;
  clientId?: string;
  limit?: number;
}): FeedbackCorrection[] {
  const all = loadCorrections();
  const limit = params.limit ?? 10;
  const relevant = all.filter((c) => {
    if (!c.active) return false;
    if (c.agentId && c.agentId !== params.agentId) return false;
    if (c.clientId && params.clientId && c.clientId !== params.clientId) return false;
    return true;
  });
  // Ordena: specific (both matching) > agent-specific > client-specific > generic
  relevant.sort((a, b) => {
    const score = (c: FeedbackCorrection) => (c.agentId ? 2 : 0) + (c.clientId ? 1 : 0);
    return score(b) - score(a);
  });
  return relevant.slice(0, limit);
}

/**
 * Formata as correcoes aplicaveis para injecao no system prompt.
 */
export function buildCorrectionsBlock(corrections: FeedbackCorrection[]): string {
  if (corrections.length === 0) return '';

  const byCategory: Record<string, FeedbackCorrection[]> = {};
  for (const c of corrections) {
    if (!byCategory[c.category]) byCategory[c.category] = [];
    byCategory[c.category].push(c);
  }

  let block = `\n\n## APRENDIZADOS DE FEEDBACK ANTERIOR (OBRIGATORIO SEGUIR)\n`;
  block += `As regras abaixo vieram de reclamacoes de usuarios anteriores. Voce DEVE seguir:\n\n`;

  for (const [category, items] of Object.entries(byCategory)) {
    block += `### ${category.toUpperCase()}\n`;
    for (const item of items) {
      block += `- ${item.correctionInstruction}\n`;
    }
    block += `\n`;
  }

  return block;
}

/**
 * Exporta correcoes para backup/sync externo.
 */
export function exportCorrections(): string {
  const corrections = loadCorrections();
  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), corrections }, null, 2);
}

/**
 * Importa correcoes (merge com existentes, evitando duplicatas por id).
 */
export function importCorrections(json: string): { added: number; skipped: number } {
  try {
    const data = JSON.parse(json);
    if (!Array.isArray(data.corrections)) return { added: 0, skipped: 0 };
    const existing = loadCorrections();
    const existingIds = new Set(existing.map((c) => c.id));
    let added = 0;
    let skipped = 0;
    const merged = [...existing];
    for (const c of data.corrections) {
      if (existingIds.has(c.id)) {
        skipped++;
      } else {
        merged.push(c);
        added++;
      }
    }
    saveCorrections(merged);
    return { added, skipped };
  } catch {
    return { added: 0, skipped: 0 };
  }
}
