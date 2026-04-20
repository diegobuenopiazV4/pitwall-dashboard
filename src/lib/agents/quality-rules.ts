export interface QualityRule {
  id: number;
  title: string;
  description: string;
}

export const QUALITY_RULES: QualityRule[] = [
  { id: 1, title: 'Diagnostico primeiro', description: 'Diagnostico antes de prescricao (STEP + V4 + Maturidade + Restricoes)' },
  { id: 2, title: 'Mostre a matematica', description: 'Formulas, cenarios, projecoes, ROI' },
  { id: 3, title: 'Playbook de falhas', description: 'Top 3-5 motivos + sinais + recuperacao' },
  { id: 4, title: 'Red flags', description: 'Quando NAO usar, pre-requisitos' },
  { id: 5, title: 'Criterios de sucesso', description: 'Metrica-chave, baseline, meta 30/60/90d' },
  { id: 6, title: 'Cadeia inter-agentes', description: 'Sequencia, dependencias, prazo' },
  { id: 7, title: 'Priorizacao ROI', description: 'P1/P2/P3, esforco, impacto. P1 = quick wins' },
  { id: 8, title: 'Benchmarks BR', description: 'Mercado brasileiro, gap para top' },
  { id: 9, title: 'Ferramentas reais', description: 'Nome exato, menu/caminho, config' },
  { id: 10, title: 'Templates prontos', description: 'Planilhas, checklists, scripts, roteiros' },
  { id: 11, title: 'Formatacao rica', description: 'Headers, tabelas, codigo, checkboxes' },
  { id: 12, title: 'Respostas densas', description: '2.000-4.000 tokens' },
];
