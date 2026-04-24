/**
 * Intent Detection: analisa o que o usuario esta digitando em tempo real
 * e sugere a skill/view mais relevante (banner).
 *
 * Regex-based (rapido, determinstico). Pode ser substituido por classificador ML depois.
 */

export interface IntentSuggestion {
  skill: 'pauta' | 'checkin' | 'trafego' | 'clipping' | 'criativos' | 'ekyte' | 'tasks-quick' | 'docs';
  confidence: 'high' | 'medium' | 'low';
  slashCommand: string;
  reason: string;
}

interface Rule {
  pattern: RegExp;
  confidence: IntentSuggestion['confidence'];
  intent: IntentSuggestion['skill'];
  slashCommand: string;
  reason: string;
}

const RULES: Rule[] = [
  // PAUTA SOCIAL
  {
    pattern: /\b(aprovar|aprova[çc][aã]o|aprove|aprovacao) (de |da )?pauta\b/i,
    confidence: 'high',
    intent: 'pauta',
    slashCommand: '/pauta',
    reason: 'Voce mencionou "aprovacao de pauta"',
  },
  {
    pattern: /\b(enviar |mandar )?(pauta|calendario editorial|cronograma) (para|ao|pro) cliente\b/i,
    confidence: 'high',
    intent: 'pauta',
    slashCommand: '/pauta',
    reason: 'Vai enviar pauta para cliente? Use a ferramenta V4 Ruston',
  },

  // CHECK-IN
  {
    pattern: /\b(check[ -]?in|relatorio mensal|apresentacao mensal|review mensal|dashboard mensal)\b/i,
    confidence: 'high',
    intent: 'checkin',
    slashCommand: '/checkin',
    reason: 'Gerar check-in visual para cliente',
  },

  // TRAFEGO / RELATORIO
  {
    pattern: /\b(relatorio|report) (de |do |do )?(trafego|midia paga|ads|meta ads|google ads|meta \+ google)\b/i,
    confidence: 'high',
    intent: 'trafego',
    slashCommand: '/trafego',
    reason: 'Relatorio de trafego pago com CSV -> HTML',
  },
  {
    pattern: /\b(csv|planilha) (do |de )?(meta|google|ads)\b/i,
    confidence: 'medium',
    intent: 'trafego',
    slashCommand: '/trafego',
    reason: 'Tem CSV para analisar?',
  },

  // CLIPPING RAPPORT
  {
    pattern: /\b(clipping|rapport|curadoria|noticias) (para|do|pro) cliente\b/i,
    confidence: 'high',
    intent: 'clipping',
    slashCommand: '/clipping',
    reason: 'Gerar clipping de noticias do setor',
  },
  {
    pattern: /\b(clipping|rapport)\b/i,
    confidence: 'medium',
    intent: 'clipping',
    slashCommand: '/clipping',
    reason: 'Curadoria de mercado para rapport comercial',
  },

  // CRIATIVOS DOCX
  {
    pattern: /\b(criativos|copies|copys) (para|do) (ad|ads|anuncio|anuncios)\b/i,
    confidence: 'high',
    intent: 'criativos',
    slashCommand: '/criativos',
    reason: 'Gerar criativos em .docx padrao V4',
  },
  {
    pattern: /\b(docx|word|exportar para doc) (com |das |dos )?(copies|copys|criativos)\b/i,
    confidence: 'high',
    intent: 'criativos',
    slashCommand: '/criativos',
    reason: 'Exportar copies em .docx',
  },

  // EKYTE TASKS
  {
    pattern: /\b(criar|subir|gerar|jogar|enviar|lancar) (tasks|tarefas|atividades) (no|do|pro)?\s*(ekyte|mkt\.?lab)?\b/i,
    confidence: 'high',
    intent: 'ekyte',
    slashCommand: '/ekyte',
    reason: 'Criar tasks no mkt.lab via bookmarklet',
  },
  {
    pattern: /\b(tasks|tarefas) (do |da |para |pro )?(mes|mensal|abril|maio|junho|janeiro|fevereiro|marco)\b/i,
    confidence: 'medium',
    intent: 'ekyte',
    slashCommand: '/ekyte',
    reason: 'Tasks do mes -> gerar bookmarklet Ekyte',
  },

  // DOCUMENTOS
  {
    pattern: /\b(ver|abrir|mostrar|listar) (documentos|arquivos|anexos)\b/i,
    confidence: 'medium',
    intent: 'docs',
    slashCommand: '/documentos',
    reason: 'Abrir biblioteca de documentos',
  },
];

/**
 * Analisa o texto e retorna a sugestao de maior confianca (ou null).
 */
export function detectIntent(text: string): IntentSuggestion | null {
  if (!text || text.trim().length < 5) return null;

  for (const rule of RULES) {
    if (rule.pattern.test(text)) {
      return {
        skill: rule.intent,
        confidence: rule.confidence,
        slashCommand: rule.slashCommand,
        reason: rule.reason,
      };
    }
  }
  return null;
}

/**
 * Lista todas as possiveis detections para um texto (ordenadas por confianca).
 */
export function detectAllIntents(text: string): IntentSuggestion[] {
  if (!text || text.trim().length < 5) return [];
  const matches: IntentSuggestion[] = [];
  const seen = new Set<string>();
  for (const rule of RULES) {
    if (rule.pattern.test(text) && !seen.has(rule.intent)) {
      seen.add(rule.intent);
      matches.push({
        skill: rule.intent,
        confidence: rule.confidence,
        slashCommand: rule.slashCommand,
        reason: rule.reason,
      });
    }
  }
  const confOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
  return matches.sort((a, b) => confOrder[b.confidence] - confOrder[a.confidence]);
}
