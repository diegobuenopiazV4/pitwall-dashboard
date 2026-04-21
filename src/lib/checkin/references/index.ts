/**
 * Referencias do sistema de Check-in V4 / Ruston.
 * Importadas como raw text para injecao no system prompt do gerador.
 */

import skillMd from '../SKILL.md?raw';
import clientDataDiscovery from './client-data-discovery.md?raw';
import clientsRuston from './clients-ruston.md?raw';
import designSystem from './design-system.md?raw';
import exampleData from './example-data.md?raw';
import frameworks from './frameworks.md?raw';
import functionsCatalog from './functions-catalog.md?raw';
import persuasion from './persuasion.md?raw';
import slidesStructure from './slides-structure.md?raw';
import technicalRules from './technical-rules.md?raw';

export const CHECKIN_REFS = {
  skillMd,
  clientDataDiscovery,
  clientsRuston,
  designSystem,
  exampleData,
  frameworks,
  functionsCatalog,
  persuasion,
  slidesStructure,
  technicalRules,
} as const;

/**
 * System prompt essencial para gerador de check-in.
 * Combina as referencias chave mantendo tokens razoaveis.
 */
export function buildCheckinSystemPrompt(type: 'weekly' | 'monthly'): string {
  const slidesCount = type === 'weekly' ? 15 : 24;
  const comparison = type === 'weekly' ? 'WoW (Week over Week)' : 'MoM (Month over Month)';

  return `Voce e o Sistema Check-in V4 Company / Ruston & CO. Gere check-in ${type} com ${slidesCount} slides em HTML interativo, auto-contido, glassmorphism premium.

## ESTRUTURA DOS SLIDES
${slidesStructure.slice(0, 4000)}

---

## DESIGN SYSTEM (aplicar)
${designSystem.slice(0, 3500)}

---

## FRAMEWORKS PARA ANALISE
${frameworks.slice(0, 2500)}

---

## PERSUASAO (Cialdini + Neuromarketing)
${persuasion.slice(0, 2500)}

---

## REGRAS TECNICAS
${technicalRules.slice(0, 3000)}

---

## INSTRUCOES FINAIS

1. Gere HTML UNICO auto-contido (sem deps externas alem de Google Fonts Inter+Space Grotesk)
2. CSS variables para cores do cliente (--primary, --accent, --secondary)
3. Glassmorphism dark: fundo gradiente escuro + glass cards
4. Navegacao: setas teclado (← →), swipe touch, botoes, dots
5. Animacoes fadeInUp escalonadas por slide
6. Responsivo (desktop + mobile)
7. Imposto META 12,15% calculado
8. Variacoes ${comparison} com setas ▲/▼ + cores (verde/vermelho) e invert para CPL/CPC/CPM/Freq
9. 4 insights: positivo + alerta + destaque + atencao
10. StoryBrand: cliente = heroi, nos = guia
11. ICE Score em toda recomendacao
12. Linguagem PERSUASIVA nao informativa (Cialdini + gatilhos mentais)

FORMATO: Entregue HTML completo dentro de \`\`\`html ... \`\`\` pronto para salvar e abrir.`;
}

export const CHECKIN_QUICK_COMMANDS = [
  {
    id: 'checkin-weekly',
    label: 'Check-in Semanal (15 slides)',
    description: 'Dashboard HTML glassmorphism - Comparacao WoW - tatico/operacional',
    prompt: 'Gere check-in SEMANAL HTML para {{cliente}} com 15 slides: capa, contexto rapido, KPIs principais (investimento, CPL, leads, alcance, ROAS), funil de conversao, top 3 criativos, gargalo TOC identificado, analise por campanha, insights (positivo/alerta/destaque/atencao), proximos passos com ICE scores, agradecimento. Design glassmorphism dark com cores da marca, navegacao teclado+touch, variacoes WoW com inversao (CPL/CPC/CPM sobe=ruim). Linguagem persuasiva Cialdini (StoryBrand: cliente heroi). Imposto META 12,15% calculado.',
    type: 'weekly' as const,
  },
  {
    id: 'checkin-monthly',
    label: 'Check-in Mensal (24 slides)',
    description: 'Dashboard HTML glassmorphism - Comparacao MoM - estrategico/analitico',
    prompt: 'Gere check-in MENSAL HTML para {{cliente}} com 24 slides: capa, contexto estrategico, resumo executivo mes, KPIs consolidados MoM, funil detalhado, top 5 criativos, analise por campanha multi-canal, cohort analysis, LTV projetado, gargalos TOC, throughput accounting, 3 frameworks aplicados (AARRR + AEMR + STEP), insights estrategicos, roadmap 90 dias, previsao M+1/M+2/M+3, ICE priorizado, compromissos, agradecimento. Design glassmorphism dark premium com animacoes suaves. Variacoes MoM com inversao.',
    type: 'monthly' as const,
  },
];
