# Catálogo de 68 Funções

## Grupo 1: Core (3 funções)

### 1.1 `generateCheckin(clientSlug, period, type, data)`
- **O que faz:** Orquestra todo o processo de geração
- **Input:** slug do cliente, período {start, end}, tipo ('weekly'|'monthly'), dados raw
- **Output:** Arquivo HTML (ou PPTX buffer)
- **Fluxo:** loadClient → extractData → analyzeData → generateSlides → validate → save

### 1.2 `loadClient(slug)`
- **O que faz:** Carrega configuração completa do cliente (cores, fontes, tema, IDs)
- **Input:** slug string (ex: 'ring', 'box-acnt')
- **Output:** Objeto ClientConfig com primary, accent, secondary, olive, fonts, theme, elementosTematicos
- **Fonte:** `references/clients.md` → CLIENTS[slug]

### 1.3 `validateCheckin(data, type)`
- **O que faz:** Valida completude e consistência dos dados antes de gerar
- **Input:** PerformanceData, tipo
- **Output:** { valid: boolean, errors: string[], warnings: string[] }
- **Checks:** Todos slides presentes, nenhum NaN/undefined, variações calculadas, imposto META incluído

---

## Grupo 2: Backgrounds (5 funções)

### 2.1 `generateBgSVG(clientColors)`
- Gera SVG 1920×1080 com 5 camadas (gradient + orbs + grid + noise + vignette)

### 2.2 `generateLinearGradient(colors)`
- Camada 1: gradient 135deg com cores do sistema

### 2.3 `generateRadialOrbs(clientColors)`
- Camada 2: 3 orbs radiais com cores accent do cliente, 6-8% opacity

### 2.4 `generateNoiseFilter()`
- Camada 4: feTurbulence + feColorMatrix para textura sutil

### 2.5 `svgToPng(svgString, width, height)`
- Converte SVG para PNG via sharp (para PPTX). Resize → png → buffer → base64

---

## Grupo 3: Logos (10 funções — 1 por cliente)

### 3.1-3.10 `getLogo_[client](size)`
- Cada cliente tem função dedicada para gerar logo placeholder em SVG
- Clientes: ring, boxAcnt, dprint, inovus, maisConfeccoes, nossoRumo, randa, semperLaser, weBella, ashey
- **Nota:** Em produção, substituir por logos reais em base64

---

## Grupo 4: Elementos Visuais (8 funções)

### 4.1 `createGlassCard(level, options)`
- Gera HTML/PPTX de glass card com nível 1-5
- Options: { width, height, glow, borderColor, accentBar }

### 4.2 `createKpiCard(label, value, variation, invert)`
- Card de KPI com label uppercase, valor grande, variação colorida

### 4.3 `createInsightCard(type, emoji, title, desc)`
- Card de insight com barra lateral colorida (tipo: positive/warning/alert/info)

### 4.4 `createStepCard(num, title, desc, owner, deadline, ice)`
- Card de próximo passo com número circular, meta (owner + deadline + ICE)

### 4.5 `createFunnelBar(label, value, width, color)`
- Barra horizontal do funil com gradient e valor interno

### 4.6 `createRankBadge(rank)`
- Badge circular com gradiente ouro/prata/bronze

### 4.7 `createSectionBadge(text, type)`
- Badge de seção (primary/olive/danger/info)

### 4.8 `createVariationBadge(value, invert)`
- Badge inline com seta + cor + percentual

---

## Grupo 5: Layout (15 funções)

### 5.1 `slidesCapa(client, period, type)`
- Slide 1: Logo + badges + título + período + comparativo

### 5.2 `slidesContexto(data, previousActions)`
- Slide 2: 3 glass cards (Mercado, Ações, Metas) + badge conclusão

### 5.3 `slidesGargaloTOC(analysis)`
- Slide 3: Card vermelho com constraint + mini-cards + frase urgência

### 5.4 `slidesDivider(platform, subtitle)`
- Slide 4/10: Linha gradient + badge plataforma + título

### 5.5 `slidesKPIs(totals, previous)`
- Slide 5: Grid 7 KPI cards com variação WoW

### 5.6 `slidesCampanhas(campaigns)`
- Slide 6: Grid 2col, 1 card por campanha com 6 métricas

### 5.7 `slidesCriativos(creatives)`
- Slide 7: Top 3 com ranking visual ouro/prata/bronze

### 5.8 `slidesImpostoMeta(impostoData)`
- Slide 8: Explicação 12,15% + dados reais

### 5.9 `slidesFunil(impressoes, alcance, cliques, leads)`
- Slide 9: 4 barras horizontais proporcionais + taxas

### 5.10 `slidesTabela(current, previous)`
- Slide 10: 10 linhas comparativas com variação colorida

### 5.11 `slidesInsights(insights)`
- Slide 11: Grid 2×2 com 4 cards coloridos

### 5.12 `slidesProximosPassos(nextSteps)`
- Slide 12: 4 step cards com ICE scores

### 5.13 `slidesRanking(best, worst)`
- Slide 13: Card verde "ESCALAR" + card vermelho "MONITORAR"

### 5.14 `slidesAgenda(actions)`
- Slide 14: 7 linhas (SEG-DOM) com ações diárias

### 5.15 `slidesEncerramento(client, nextDate)`
- Slide 15: Logo + obrigado + próximo check-in + frase inspiracional

---

## Grupo 6: Formatação (10 funções)

### 6.1 `fmtRS(value)`
- Formata como Real: `R$ 1.234,56`

### 6.2 `fmtNum(value)`
- Formata número pt-BR: `18.074`

### 6.3 `fmtPct(value)`
- Formata percentual: `1,23%`

### 6.4 `fmtX(value)`
- Formata multiplicador: `2,34x`

### 6.5 `wow(current, previous)`
- Calcula variação WoW: `((current - previous) / previous) * 100`

### 6.6 `variationHTML(val, invert)`
- Gera HTML span com seta + cor + sign (respeitando invert)

### 6.7 `colorForVariation(val, invert)`
- Retorna cor CSS: success (verde), danger (vermelho), muted (cinza)

### 6.8 `formatCampaignName(name)`
- Encurta nomes longos de campanha para caber em cards

### 6.9 `formatPeriod(start, end)`
- Formata período: `22-28/Mar/2026`

### 6.10 `formatWeekNumber(date)`
- Retorna `S13 (22-28/Mar)` a partir de data

---

## Grupo 7: Dados & Análise (8 funções)

### 7.1 `identifyBottleneck(data)`
- Identifica gargalo TOC: traffic|conversion|sales|retention
- Analisa onde a taxa de conversão mais cai entre estágios do funil

### 7.2 `calcFunnel(impressoes, alcance, cliques, leads)`
- Calcula funil AARRR com taxas entre estágios

### 7.3 `calcICE(impact, confidence, ease)`
- Calcula score ICE: `I × C × E` (1-10 cada)

### 7.4 `calcImpostoMeta(spendBruto)`
- Calcula imposto 12,15%: `{ spendBruto, imposto, spendLiquido, cplAjustado }`

### 7.5 `generateInsights(data, previous)`
- Gera 4 insights automáticos (1 positive + 1 warning + 1 info + 1 alert)

### 7.6 `rankCreatives(creatives, metric)`
- Rankeia criativos por métrica (default: leads, tiebreak: CPL)

### 7.7 `calcTrend(weeks)`
- Determina tendência de 4 semanas: improving|declining|stable|volatile

### 7.8 `compareWithGoals(data, goals)`
- Compara dados atuais com metas do cliente: `{ metric, target, actual, pct, status }`

---

## Grupo 8: Factory (4 funções)

### 8.1 `mkShadow(blur, offset, color, opacity)`
- Factory para shadow object (PPTX). SEMPRE criar novo objeto, nunca reutilizar
- Default: `{ type: 'outer', blur: 3, offset: 2, color: '000000', opacity: 0.3 }`

### 8.2 `mkGradient(colors, angle)`
- Factory para gradient fill (PPTX)
- Input: array de { color, position }, angle em graus

### 8.3 `mkFont(family, size, bold, color)`
- Factory para font object (PPTX)
- Default Inter 12pt normal white

### 8.4 `mkPosition(x, y, w, h)`
- Factory para position object (PPTX) em inches

---

## Grupo 9: Integração (5 funções)

### 9.1 `extractMetaAds(accountId, period, accessToken)`
- Extrai dados via Meta Marketing API (facebook-nodejs-business-sdk)
- Campos: campaign_name, impressions, reach, clicks, spend, actions, cost_per_action_type, cpc, cpm, ctr, frequency
- Rate limit: 200/hora

### 9.2 `extractGoogleAds(customerId, period, refreshToken)`
- Extrai dados via Google Ads API (GAQL)
- Campos: campaign.name, metrics.impressions, clicks, cost_micros, conversions, ctr

### 9.3 `extractBrowser(platform, accountId)`
- Extrai via Chrome MCP (screenshots para Meta, text para Google)
- **CRITICAL:** Meta Ads → SEMPRE screenshots (virtual DOM → innerText vazio)

### 9.4 `extractCSV(filePath, platform)`
- Parse CSV/XLS exportado via PapaParse/SheetJS

### 9.5 `crossValidate(apiData, browserData, csvData)`
- Validação cruzada entre fontes: spend, leads, impressões
- Tolerância: ±2% entre fontes
- Alerta se divergência > 5%
