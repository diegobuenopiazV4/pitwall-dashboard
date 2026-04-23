interface Data {
  panorama: string;
  news: Array<{ title: string; source: string; url: string; summary: string; relevance: string }>;
  competitors: Array<{ name: string; movement: string; impact: string }>;
  trends: Array<{ topic: string; description: string; actionable: string }>;
  rapportMessages: Array<{ contactName: string; messageText: string }>;
}

interface Props {
  clientName: string;
  sector: string;
  region: string;
  date: string;
  data: Data;
}

export function generateClippingHTML(p: Props): string {
  const { clientName, sector, region, date, data } = p;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Clipping de Rapport - ${clientName}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',sans-serif;background:#fafaf7;color:#1a1a1a;line-height:1.7}
.container{max-width:900px;margin:0 auto;padding:60px 40px}
.hero{border-bottom:2px solid #e4243d;padding-bottom:32px;margin-bottom:40px}
.brand{display:flex;align-items:center;gap:12px;margin-bottom:20px}
.brand-mark{width:42px;height:42px;background:linear-gradient(135deg,#e4243d,#ff4d5a);border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:18px}
.brand-name{font-weight:700;font-size:14px;letter-spacing:2px;text-transform:uppercase}
.brand-sub{font-size:10px;color:#666;letter-spacing:1px;text-transform:uppercase}
h1{font-family:'Playfair Display',serif;font-size:44px;font-weight:800;letter-spacing:-1px;line-height:1.1;margin-bottom:12px;color:#1a1a1a}
.meta{color:#666;font-size:14px;display:flex;gap:24px;flex-wrap:wrap;margin-top:16px}
.meta strong{color:#e4243d}
section{margin-bottom:56px}
h2{font-family:'Playfair Display',serif;font-size:30px;font-weight:700;margin-bottom:20px;color:#1a1a1a;position:relative;padding-bottom:10px}
h2::after{content:'';position:absolute;bottom:0;left:0;width:60px;height:3px;background:#e4243d}
.panorama{font-size:16px;color:#333;line-height:1.9;white-space:pre-wrap}
.grid{display:grid;gap:20px}
.grid-news{grid-template-columns:1fr}
.grid-cards{grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
.news-card{background:white;border-left:4px solid #e4243d;border-radius:0 8px 8px 0;padding:24px 28px;box-shadow:0 2px 12px rgba(0,0,0,.04);transition:all .3s}
.news-card:hover{box-shadow:0 4px 20px rgba(0,0,0,.08);transform:translateX(4px)}
.news-card h3{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;margin-bottom:8px;color:#1a1a1a;line-height:1.3}
.news-card .source{font-size:12px;color:#666;margin-bottom:12px}
.news-card .source a{color:#e4243d;text-decoration:none;font-weight:500}
.news-card .source a:hover{text-decoration:underline}
.news-card .summary{color:#444;margin-bottom:14px;line-height:1.7}
.news-card .relevance{background:#fdf2f4;border-left:3px solid #e4243d;padding:10px 14px;border-radius:0 6px 6px 0;font-size:13px;color:#7a1520;font-style:italic}
.card{background:white;border-radius:10px;padding:24px;box-shadow:0 2px 12px rgba(0,0,0,.04);border-top:3px solid #e4243d}
.card h3{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;margin-bottom:10px;color:#1a1a1a}
.card p{color:#444;font-size:14px;margin-bottom:10px}
.card .tag{display:inline-block;padding:4px 10px;background:#e4243d;color:white;font-size:11px;border-radius:4px;text-transform:uppercase;letter-spacing:1px;font-weight:600;margin-bottom:10px}
.rapport-section{background:linear-gradient(135deg,#fff9fa,#fef2f4);border-radius:16px;padding:40px;margin-top:40px;border:1px solid #f0d4d8}
.rapport-section h2{color:#e4243d}
.message-box{background:white;border-radius:12px;padding:24px 28px;margin-bottom:16px;box-shadow:0 2px 10px rgba(0,0,0,.05);border-left:4px solid #25d366;position:relative}
.message-box::before{content:'💬';position:absolute;top:20px;right:20px;font-size:24px}
.message-box .to{font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#666;margin-bottom:12px;font-weight:600}
.message-box .to strong{color:#e4243d}
.message-box .text{color:#222;line-height:1.8;font-size:15px;white-space:pre-wrap}
.footer{margin-top:80px;padding-top:32px;border-top:1px solid #ddd;text-align:center;color:#666;font-size:13px}
.footer-brand{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:#e4243d;margin-bottom:8px}
@media print{body{background:white}.container{padding:20px}.news-card,.card,.message-box{box-shadow:none;border:1px solid #ddd}}
@media(max-width:640px){h1{font-size:32px}.container{padding:32px 20px}}
</style>
</head>
<body>
<div class="container">

<div class="hero">
<div class="brand">
<div class="brand-mark">V4</div>
<div><div class="brand-name">V4 Pit Wall</div><div class="brand-sub">Ruston &amp; Co · Intel</div></div>
</div>
<h1>Clipping de Rapport</h1>
<p style="color:#666;font-size:18px;margin-top:8px">${clientName} · ${sector}</p>
<div class="meta">
<span><strong>Data:</strong> ${date}</span>
<span><strong>Regiao:</strong> ${region}</span>
<span><strong>Total:</strong> ${data.news.length} noticias</span>
</div>
</div>

<section>
<h2>Panorama do Setor</h2>
<div class="panorama">${data.panorama}</div>
</section>

<section>
<h2>Noticias Relevantes</h2>
<div class="grid grid-news">
${data.news.map((n) => `
<div class="news-card">
<h3>${n.title}</h3>
<div class="source">
${n.url && n.url.startsWith('http') ? `<a href="${n.url}" target="_blank" rel="noopener">${n.source} \u2197</a>` : n.source}
</div>
<div class="summary">${n.summary}</div>
<div class="relevance"><strong>Por que importa:</strong> ${n.relevance}</div>
</div>
`).join('')}
</div>
</section>

<section>
<h2>Movimentos de Concorrentes</h2>
<div class="grid grid-cards">
${data.competitors.map((c) => `
<div class="card">
<span class="tag">Concorrente</span>
<h3>${c.name}</h3>
<p><strong>Movimento:</strong> ${c.movement}</p>
<p style="color:#7a1520;font-style:italic"><strong>Impacto:</strong> ${c.impact}</p>
</div>
`).join('')}
</div>
</section>

<section>
<h2>Tendencias do Mercado</h2>
<div class="grid grid-cards">
${data.trends.map((t) => `
<div class="card">
<span class="tag" style="background:#448aff">Tendencia</span>
<h3>${t.topic}</h3>
<p>${t.description}</p>
<p style="background:#eff6ff;border-left:3px solid #448aff;padding:10px 14px;margin-top:10px;border-radius:0 6px 6px 0;color:#1e3a8a;font-size:13px"><strong>Acao:</strong> ${t.actionable}</p>
</div>
`).join('')}
</div>
</section>

<section class="rapport-section">
<h2>Mensagens de Rapport Prontas</h2>
<p style="color:#666;margin-bottom:24px;font-size:14px">Copie e envie via WhatsApp para fortalecer o relacionamento.</p>
${data.rapportMessages.map((m) => `
<div class="message-box">
<div class="to">Para: <strong>${m.contactName}</strong></div>
<div class="text">${m.messageText}</div>
</div>
`).join('')}
</section>

<div class="footer">
<div class="footer-brand">V4 PIT WALL</div>
<div>Clipping gerado em ${date} · Ruston &amp; Co / V4 Company</div>
<div style="margin-top:8px;opacity:.7">Curadoria alimentada por Claude AI · pitwall-dashboard.vercel.app</div>
</div>

</div>
</body>
</html>`;
}
