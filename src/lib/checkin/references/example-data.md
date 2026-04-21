# Exemplo Completo de Dados — Referência para Geração

Este arquivo serve como modelo de como os dados devem ser estruturados e como o HTML deve ser gerado.

## Schema de Dados (PerformanceData)

```javascript
const EXAMPLE_DATA = {
  client: {
    name: 'Ring Tecnologia',
    slug: 'ring',
    niche: 'Tech B2B / Armários Inteligentes Hospitalares',
    location: 'Recife, PE',
    colors: {
      primary: '#094C79',    // Azul escuro institucional
      accent: '#3499EF',     // Azul médio vibrante
      olive: '#8ABD33',      // Verde oliva/lima
      darkBlue: '#204060',   // Azul escuro
      cta: '#1E88E5'         // Botão CTA
    },
    fonts: { heading: 'Space Grotesk', body: 'Inter' },
    metaAdsId: '898879182508305',
  },

  period: { start: '2026-03-29', end: '2026-04-04', type: 'weekly' },
  comparison: { start: '2026-03-22', end: '2026-03-28' },

  meta: {
    total: {
      leads: 8,
      cpl: 26.14,
      spend: 209.12,
      alcance: 8026,
      impressoes: 14042,
      freq: 1.75,
      cliques: 84,
      cpc: 2.49,
      ctr: 0.92,
      cpm: 14.89,
    },
    campaigns: [
      {
        name: '[LEADS] [FORM + PDF] [Criação Público]',
        status: 'active', objective: 'leads',
        leads: 8, cpl: 13.08, spend: 104.61,
        cliques: 48, ctr: 1.04, cpc: 2.18,
      },
      {
        name: 'V4 - Leads, Formulário',
        status: 'active', objective: 'leads',
        leads: 0, spend: 104.51,
        cliques: 36, ctr: 0.76, cpc: 2.90,
      },
    ],
    creatives: [
      {
        rank: 1, name: 'Fim do Mistério de Privativos',
        leads: 8, cpl: 12.99, spend: 103.88,
        cliques: 46, ctr: 0.97, cpc: 2.26, alcance: 4737,
      },
      {
        rank: 2, name: 'Reduza os Custos (main)',
        leads: 0, spend: 91.94,
        cliques: 31, ctr: 0.76, cpc: 2.97, alcance: 4085,
      },
      {
        rank: 3, name: 'Reduza os Custos (copy 2)',
        leads: 0, spend: 9.92,
        cliques: 4, ctr: 0.81, cpc: 2.48, alcance: 494,
      },
    ],
  },

  anterior: {
    meta: {
      total: {
        leads: 18, cpl: 43.84, spend: 788.99,
        alcance: 14561, impressoes: 18074, freq: 1.24,
        cliques: 310, cpc: 2.55, ctr: 1.71, cpm: 43.65,
      },
    },
  },

  impostoMeta: {
    aliquota: 0.1215,
    spendBruto: 209.12,
    imposto: 25.41,
    spendLiquido: 183.71,
    cplAjustado: 22.96,
  },
};
```

## Variações WoW com Inversão (referência)

| Métrica | Atual | Anterior | Variação | Invert | Cor |
|---------|-------|----------|----------|--------|-----|
| Leads | 8 | 18 | -55,6% | false | vermelho |
| CPL | R$ 26,14 | R$ 43,84 | -40,4% | **true** | verde (desceu = bom) |
| Investimento | R$ 209,12 | R$ 788,99 | -73,5% | **true** | verde (desceu = bom) |
| Alcance | 8.026 | 14.561 | -44,9% | false | vermelho |
| Impressões | 14.042 | 18.074 | -22,3% | false | vermelho |
| Cliques | 84 | 310 | -72,9% | false | vermelho |
| CPC | R$ 2,49 | R$ 2,55 | -2,4% | **true** | verde |
| CTR | 0,92% | 1,71% | -46,2% | false | vermelho |
| CPM | R$ 14,89 | R$ 43,65 | -65,9% | **true** | verde |
| Frequência | 1,75x | 1,24x | +41,1% | **true** | vermelho (subiu = ruim) |

## Funil Calculado

```
Impressões:  14.042  (100%)
    ↓ Alcance/Impressão: 57,2%
Alcance:     8.026   (57,2%)
    ↓ CTR: 1,05% (cliques/alcance)
Cliques:     84      (0,60% das impressões)
    ↓ Conversão: 9,52%
Leads:       8       (0,057% das impressões)
```

## Imposto META Calculado

```
Orçamento bruto:    R$ 209,12
Alíquota:           12,15%
Imposto estimado:   R$ 25,41
Investimento real:  R$ 183,71
CPL ajustado:       R$ 22,96 (vs R$ 26,14 bruto)
```

## Como mapear cores do cliente para CSS

```css
:root {
  /* Cores do cliente — substituir pelos valores reais */
  --primary: #094C79;
  --accent: #3499EF;
  --olive: #8ABD33;
  --dark-blue: #204060;
  --cta: #1E88E5;

  /* Sistema — FIXO para todos os clientes */
  --bg-ultra: #050208;
  --bg-dark: #0A0515;
  --bg-mid: #151028;
  --glass-bg: rgba(26,21,53,0.75);
  --glass-border: rgba(255,255,255,0.08);
  --success: #00C853;
  --danger: #FF1744;
  --warning: #FFB300;
  --info: #2196F3;
  --gold: #FFD700;
  --silver: #C0C0C0;
  --bronze: #CD7F32;
  --text-primary: #FFFFFF;
  --text-secondary: #B8C4D8;
  --text-muted: #6B7B8D;
}
```

## Orbs de Background (pseudo-elements)

Cada slide tem 2 orbs com as cores accent do cliente:

```css
.slide::before {
  /* Orb 1: accent do cliente, top-right */
  background: radial-gradient(circle, rgba(ACCENT_R,ACCENT_G,ACCENT_B,0.08) 0%, transparent 70%);
  width: 600px; height: 600px;
  top: -20%; right: -10%;
}

.slide::after {
  /* Orb 2: olive/secondary do cliente, bottom-left */
  background: radial-gradient(circle, rgba(OLIVE_R,OLIVE_G,OLIVE_B,0.06) 0%, transparent 70%);
  width: 500px; height: 500px;
  bottom: -15%; left: -5%;
}
```

## Funções JavaScript Obrigatórias

```javascript
// Formatação pt-BR
function fmtRS(v) { return 'R$ ' + v.toFixed(2).replace('.', ','); }
function fmtNum(v) { return v.toLocaleString('pt-BR'); }
function fmtPct(v) { return v.toFixed(2).replace('.', ',') + '%'; }
function fmtX(v) { return v.toFixed(2).replace('.', ',') + 'x'; }

// Variação com cores
function variationHTML(val, invert) {
  const isGood = invert ? val < 0 : val > 0;
  const color = val === 0 ? 'var(--text-muted)' : isGood ? 'var(--success)' : 'var(--danger)';
  const arrow = val > 0 ? '▲' : val < 0 ? '▼' : '–';
  const sign = val > 0 ? '+' : '';
  return `<span style="color:${color};font-weight:600;font-size:12px">${arrow} ${sign}${val.toFixed(1).replace('.',',')}%</span>`;
}

// Cálculo WoW
function wow(a, b) { return b === 0 ? 0 : ((a - b) / b * 100); }

// Navegação: teclado (← →, Home, End) + swipe touch + botões + dots
```
