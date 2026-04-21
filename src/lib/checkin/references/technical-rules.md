# Regras Técnicas por Formato

## HTML Interativo (formato preferido)

### Estrutura Base
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Check-in [Tipo] — [Cliente] · [Período]</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Space+Grotesk:wght@700;800;900&display=swap" rel="stylesheet">
  <style>/* CSS embutido completo */</style>
</head>
<body>
  <!-- Slides como <section class="slide"> -->
  <nav class="nav"><!-- Navegação --></nav>
  <script>/* JS embutido completo */</script>
</body>
</html>
```

### Regras CSS
- **Zero CDN** externo (exceto Google Fonts)
- Todas variáveis CSS no `:root` (sistema + cliente)
- `backdrop-filter: blur(20px)` + `-webkit-backdrop-filter: blur(20px)` em todo glass card
- `box-sizing: border-box` global
- `font-family: 'Inter', sans-serif` body, `'Space Grotesk', sans-serif` títulos
- Responsivo via `clamp()` nos font-sizes
- Animações via `@keyframes fadeInUp` com delays escalonados (`.anim-1` a `.anim-7`)
- Transição entre slides: `translateX(60px)` → `translateX(0)` → `translateX(-60px)`

### Regras JavaScript
- Navegação: `ArrowLeft/Right`, `Home/End`, botões, dots clicáveis, touch swipe
- Swipe threshold: 50px mínimo
- Toda formatação pt-BR: `fmtRS()`, `fmtNum()`, `fmtPct()`, `fmtX()`
- Variação com `variationHTML(val, invert)` — arrow + cor + sign
- Dados em objeto JS no topo do `<script>` — nunca hardcoded nos slides
- Dots gerados dinamicamente via JS
- Counter atualizado em toda navegação

### Validação HTML
- Todos slides renderizam sem erro no console?
- Navegação funciona (← → Home End)?
- Touch swipe funciona em mobile?
- Fonts carregam (verificar fallback sans-serif)?
- Glass cards têm backdrop-filter?
- Animações rodam na troca de slide?

---

## PptxGenJS v4.0.1 (formato alternativo)

### Regras Críticas

1. **Cores SEM #** — `'FF0000'` não `'#FF0000'`. Todas funções de cor devem fazer `.replace('#','')`
2. **Shadow mutation bug** — NUNCA reutilizar objetos shadow. Criar novo objeto a cada uso:
   ```javascript
   // ERRADO — referência compartilhada
   const shadow = { type: 'outer', blur: 3 };
   shape1.shadow = shadow;
   shape2.shadow = shadow; // BUG: modifica shape1 também

   // CERTO — factory function
   function mkShadow(blur = 3) {
     return { type: 'outer', blur, offset: 2, color: '000000', opacity: 0.3 };
   }
   shape1.shadow = mkShadow();
   shape2.shadow = mkShadow();
   ```
3. **Base64 headers** obrigatórios para imagens:
   ```javascript
   // PNG
   `data:image/png;base64,${buffer.toString('base64')}`
   // SVG (converter para PNG via sharp antes)
   ```
4. **Posicionamento em polegadas** — x, y, w, h em inches (10×7.5 slide padrão)
5. **fontSize em points** — nunca pixels
6. **addText array** para texto rich (múltiplos estilos no mesmo textbox):
   ```javascript
   slide.addText([
     { text: 'Bold ', options: { bold: true, fontSize: 14 } },
     { text: 'normal', options: { fontSize: 12 } }
   ], { x: 0.5, y: 0.5, w: 9, h: 0.5 });
   ```
7. **masterSlide** — não usar, gerar backgrounds manualmente com SVG→PNG
8. **addShape** — retângulos como cards:
   ```javascript
   slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
     x: 0.3, y: 1.2, w: 4.2, h: 2.5,
     rectRadius: 0.15,
     fill: { color: '1A1535', transparency: 25 },
     line: { color: 'FFFFFF', width: 0.5, transparency: 92 },
     shadow: mkShadow(8)
   });
   ```

### Backgrounds SVG → PNG (sharp)

5 camadas compostas via SVG:
1. **Linear Gradient** — cores base do sistema
2. **Radial Gradient Orbs** — 3 orbs com cores do cliente, 6-8% opacity
3. **Grid/Pattern** — linhas geométricas sutis
4. **Noise Filter** — `<feTurbulence baseFrequency="0.65">`
5. **Vignette** — radial gradient escurecendo bordas

```javascript
// Conversão SVG → PNG via sharp
const sharp = require('sharp');
const svgBuffer = Buffer.from(svgString);
const pngBuffer = await sharp(svgBuffer)
  .resize(1920, 1080)
  .png()
  .toBuffer();
const base64 = `data:image/png;base64,${pngBuffer.toString('base64')}`;
slide.background = { data: base64 };
```

**REGRA SHARP:** Sempre `resize()` ANTES de `.png()`. Nunca usar `.metadata()` em SVG.

### SVG Rules
- `xmlns="http://www.w3.org/2000/svg"` obrigatório
- `viewBox="0 0 1920 1080"` (aspect ratio 16:9)
- Sem entidades XML (`&amp;` etc.) — usar valores diretos
- `<defs>` para gradients e filters
- Opacity em `stop-opacity` e `fill-opacity`, não CSS opacity

---

## Google Slides API (formato alternativo)

### Posicionamento EMU (English Metric Units)
- 1 inch = 914400 EMU
- 1 pt = 12700 EMU
- Slide padrão: 9144000 × 5143500 EMU (10" × 5.625")

### Cores RGB 0-1
```javascript
// Converter hex para Google Slides RGB
function hexToGSlidesRGB(hex) {
  const r = parseInt(hex.slice(1,3), 16) / 255;
  const g = parseInt(hex.slice(3,5), 16) / 255;
  const b = parseInt(hex.slice(5,7), 16) / 255;
  return { red: r, green: g, blue: b };
}
```

### Batch Requests
- Máximo 200 requests por batch
- Cada elemento precisa de `objectId` único (UUID ou prefixado)
- Ordem importa: criar shape ANTES de inserir texto nele

### Background
```javascript
{
  updatePageProperties: {
    objectId: slideId,
    pageProperties: {
      pageBackgroundFill: {
        solidFill: { color: { rgbColor: hexToGSlidesRGB('#050208') } }
      }
    },
    fields: 'pageBackgroundFill'
  }
}
```

---

## Problemas Conhecidos & Soluções

| Problema | Causa | Solução |
|----------|-------|---------|
| Glass cards sem blur | Safari/iOS antigo | Sempre incluir `-webkit-backdrop-filter` |
| Cores erradas PPTX | `#` no hex | `color.replace('#','')` em toda atribuição |
| Shadow corrompido PPTX | Objeto reutilizado | Factory `mkShadow()` |
| SVG não renderiza PPTX | SVG direto não suportado | Converter para PNG via sharp antes |
| Fonts não carregam HTML | CSP blocking Google Fonts | Fallback: `'Inter', -apple-system, sans-serif` |
| Touch swipe conflita scroll | preventDefault em touchmove | Só prevent se `deltaX > deltaY` |
| Meta innerText vazio | Virtual DOM do Ads Manager | OBRIGATÓRIO screenshots, nunca innerText |
| Google Ads dados atrasados | Lag de até 3h na API | Avisar cliente se dados de hoje |
| Frequência > 3.0 | Saturação de público | Alerta automático no insight |
| CTR < 0.5% | Criativo/segmentação fraco | Alerta + recomendação de teste A/B |
