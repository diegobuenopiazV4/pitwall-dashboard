# Design System Premium V8 — Glassmorphism + Liquid Glass

## Filosofia
"Luxury isn't loud — it's intentional." Baseado em 3 tendências 2025-2026: Glassmorphism (vidro fosco), Liquid Glass (Apple WWDC 2025), Neumorphism sutil.

## Paleta Base do Sistema (fixo para todos os clientes)

```css
:root {
  /* Backgrounds Dark Premium */
  --bg-ultra: #050208;     /* Quase preto com toque roxo */
  --bg-dark: #0A0515;
  --bg-mid: #151028;
  --bg-gradient-end: #0D0820;

  /* Glass Effects */
  --glass-bg: rgba(26,21,53,0.75);
  --glass-border: rgba(255,255,255,0.08);
  --glass-highlight: rgba(255,255,255,0.05);

  /* Semantic */
  --success: #00C853;
  --danger: #FF1744;
  --warning: #FFB300;
  --info: #2196F3;
  --neutral: #78909C;

  /* Premium Metals */
  --gold: #FFD700;
  --silver: #C0C0C0;
  --bronze: #CD7F32;

  /* Typography */
  --text-primary: #FFFFFF;
  --text-secondary: #B8C4D8;
  --text-muted: #6B7B8D;
  --text-accent: #00E5FF;

  /* Platform Colors (oficiais) */
  --meta-blue: #0088FF;
  --google-blue: #4285F4;
  --google-red: #EA4335;
  --google-yellow: #FBBC04;
  --google-green: #34A853;
}
```

As cores do cliente (`--primary`, `--accent`, etc.) devem ser definidas conforme `references/clients.md`.

## Slide Base

```css
.slide {
  background: linear-gradient(135deg, var(--bg-ultra) 0%, var(--bg-dark) 25%, var(--bg-mid) 55%, #0D0820 100%);
}
/* + 2 radial-gradient orbs via pseudo-elements:
   ::before — accent do cliente, 8% opacity, top-right, 600px
   ::after — secundária do cliente, 6% opacity, bottom-left, 500px */
```

## Glass Card (componente principal)

```css
.glass {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
/* + ::before pseudo-element: highlight line no topo
   background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
   height: 1px; */
```

### 5 Níveis de Glamour

| Nível | Uso | Adicional |
|-------|-----|-----------|
| 1. Básico | Cards genéricos | BG 85% + border + shadow blur 8px + highlight topo |
| 2. Glow | Cards informativos | + outer glow cor primária 15% + border gradient + top accent bar 3px |
| 3. Premium | KPIs principais | + gradient overlay 10% + inner shadow + sparkline + badge variação |
| 4. Hero | Destaque especial | 2x tamanho + glow 20% blur 20px + ícone central |
| 5. Trophy | Criativos Ranking | Borda ouro/prata/bronze + badge posição + gradient dourado + spotlight |

## Tipografia

Google Fonts: `Inter` (body) + `Space Grotesk` (títulos)

| Uso | Font | CSS | Cor |
|-----|------|-----|-----|
| Título slide | Space Grotesk | `font-size: clamp(36px,5vw,56px); font-weight: 900` | `--text-primary` |
| Subtítulo | Inter | `font-size: clamp(14px,2vw,18px); font-weight: 400` | `--text-secondary` |
| Label KPI | Inter | `font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px` | `--primary` (cliente) |
| Valor KPI | Space Grotesk | `font-size: clamp(22px,3vw,44px); font-weight: 800` | `--text-primary` |
| Comparação | Inter | `font-size: 12px; font-weight: 600` | `--success` ou `--danger` |
| Badge | Inter | `font-size: 11px; font-weight: 700; text-transform: uppercase` | branco em bg primária |
| Body | Inter | `font-size: 13px; font-weight: 400; line-height: 1.6` | `--text-secondary` |

## Componentes HTML Obrigatórios

### 1. KPI Card
```html
<div class="glass kpi-card glass-glow">
  <div class="kpi-label label">LEADS</div>
  <div class="kpi-value value-lg">18</div>
  <span class="variation var-up">▲ +5,9%</span>
</div>
```

### 2. Section Badge
```html
<span class="badge badge-primary">KPIs</span>
<span class="badge badge-olive">Framework: Método V4</span>
```

### 3. Rank Badge
```html
<div class="creative-rank" style="background: linear-gradient(135deg, var(--gold), #FFA000); color: #111;">1</div>
```

### 4. Insight Card
```html
<div class="glass insight-card">
  <div class="insight-bar" style="background: var(--success);"></div>
  <div>
    <div class="insight-icon">🏆</div>
    <div class="insight-title">Título do Insight</div>
    <div class="insight-desc">Descrição detalhada...</div>
  </div>
</div>
```

### 5. Step Card (Próximos Passos)
```html
<div class="glass step-card">
  <div class="step-num">1</div>
  <div>
    <div class="step-title">Título da Ação</div>
    <div class="step-desc">Descrição...</div>
    <div class="step-meta">
      <span>👤 Tráfego</span>
      <span>📅 04/04</span>
      <span class="ice-badge">ICE: 648</span>
    </div>
  </div>
</div>
```

### 6. Funnel Bar
```html
<div class="funnel-bar-wrap">
  <div class="funnel-label">Impressões</div>
  <div class="funnel-bar-bg">
    <div class="funnel-bar-fill" style="width:100%; background: linear-gradient(90deg, #3499EF, #3499EF88);">18.074</div>
  </div>
  <div class="funnel-rate"></div>
</div>
```

### 7. Navigation Bar
```html
<nav class="nav">
  <button class="nav-btn" onclick="prevSlide()">← Anterior</button>
  <div class="nav-dots"></div>
  <span class="nav-counter">1 / 15</span>
  <button class="nav-btn" onclick="nextSlide()">Próximo →</button>
</nav>
```

## Animações

```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.slide.active .anim-1 { animation: fadeInUp 0.5s 0.1s both; }
.slide.active .anim-2 { animation: fadeInUp 0.5s 0.2s both; }
/* ... até anim-7 */

/* Transição entre slides */
.slide { opacity: 0; transform: translateX(60px); transition: all 0.5s cubic-bezier(0.4,0,0.2,1); }
.slide.active { opacity: 1; transform: translateX(0); }
.slide.prev { opacity: 0; transform: translateX(-60px); }
```

## JavaScript Obrigatório

```javascript
// Formatação pt-BR
function fmtRS(v) { return 'R$ ' + v.toFixed(2).replace('.', ','); }
function fmtNum(v) { return v.toLocaleString('pt-BR'); }
function fmtPct(v) { return v.toFixed(2).replace('.', ',') + '%'; }
function fmtX(v) { return v.toFixed(2).replace('.', ',') + 'x'; }
function wow(a, b) { return b === 0 ? 0 : ((a - b) / b * 100); }

function variationHTML(val, invert) {
  const isGood = invert ? val < 0 : val > 0;
  const color = val === 0 ? 'var(--text-muted)' : isGood ? 'var(--success)' : 'var(--danger)';
  const arrow = val > 0 ? '▲' : val < 0 ? '▼' : '–';
  const sign = val > 0 ? '+' : '';
  return `<span style="color:${color};font-weight:600;font-size:12px">${arrow} ${sign}${val.toFixed(1).replace('.',',')}%</span>`;
}

// Navegação: ← → teclado, swipe touch, botões, dots clicáveis, Home/End
```

## Backgrounds SVG (para PPTX) — 5 Camadas
1. Linear Gradient (cores base do cliente)
2. Radial Gradient Orbs (3x, profundidade)
3. Grid/Pattern sutil (textura geométrica)
4. Noise Filter (0.65 baseFrequency)
5. Vignette (escurecimento bordas)
