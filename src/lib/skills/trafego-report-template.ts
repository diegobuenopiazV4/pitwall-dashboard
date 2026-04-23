/**
 * Template HTML do relatorio de trafego pago (skill V4 relatorio-trafego-pago).
 * Gera HTML standalone com dark theme vermelho/preto, Chart.js, Inter font.
 */

interface Analysis {
  insights: string[];
  budgetAnalysis: Array<{ title: string; value: string; change: string; reasoning: string }>;
  scenarios: Array<{ name: string; invest: string; projection: string; risk: string }>;
  nextSteps: string[];
  summary: string;
}

interface ChannelData {
  name: string;
  totalInvestment: number;
  totalResults: number;
  totalImpressions: number;
  totalReach: number;
  avgCpl: number;
}

interface Props {
  clientName: string;
  segment: string;
  period: string;
  agencyName: string;
  metaData: ChannelData | null;
  googleData: ChannelData | null;
  totalInvest: number;
  totalResults: number;
  avgCpl: number;
  analysis: Analysis;
}

const brl = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num = (n: number) => n.toLocaleString('pt-BR');

export function generateTrafegoReportHTML(p: Props): string {
  const { clientName, segment, period, agencyName, metaData, googleData, totalInvest, totalResults, avgCpl, analysis } = p;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Check-in ${clientName} - ${period}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700;800&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',sans-serif;background:linear-gradient(135deg,#0a0a0f 0%,#1a1a24 100%);color:#e2e8f0;line-height:1.6;min-height:100vh}
.container{max-width:1200px;margin:0 auto;padding:40px 24px}
.hero{position:relative;background:linear-gradient(135deg,#e4243d15 0%,#111118 50%,#1a1a24 100%);border:1px solid #e4243d30;border-radius:24px;padding:48px;margin-bottom:32px;overflow:hidden}
.hero::before{content:'V4';position:absolute;right:-40px;top:-80px;font-family:'Space Grotesk';font-size:320px;font-weight:900;color:#e4243d;opacity:.04;line-height:1}
.hero h1{font-family:'Space Grotesk';font-size:44px;font-weight:800;letter-spacing:-1px;background:linear-gradient(90deg,#e4243d,#ff4d5a);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:8px}
.hero .meta{display:flex;gap:24px;flex-wrap:wrap;margin-top:16px;font-size:14px;color:#94a3b8}
.hero .meta span{display:flex;align-items:center;gap:6px}
.hero .meta .dot{width:6px;height:6px;border-radius:50%;background:#e4243d}
.section{background:rgba(17,17,24,.6);border:1px solid rgba(148,163,184,.1);border-radius:16px;padding:32px;margin-bottom:24px;backdrop-filter:blur(10px)}
.section h2{font-family:'Space Grotesk';font-size:24px;font-weight:700;margin-bottom:24px;color:#f1f5f9;display:flex;align-items:center;gap:12px}
.section h2::before{content:'';width:4px;height:24px;background:linear-gradient(180deg,#e4243d,#ff4d5a);border-radius:2px}
.kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}
.kpi{background:linear-gradient(135deg,#1a1a24,#111118);border:1px solid rgba(228,36,61,.2);border-radius:12px;padding:20px;transition:all .3s}
.kpi:hover{border-color:rgba(228,36,61,.5);transform:translateY(-2px)}
.kpi .label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#64748b;margin-bottom:8px}
.kpi .value{font-family:'Space Grotesk';font-size:28px;font-weight:800;color:#f1f5f9}
.kpi .sub{font-size:12px;color:#94a3b8;margin-top:4px}
.chart-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
.chart-box{background:#0a0a0f;border:1px solid rgba(148,163,184,.1);border-radius:12px;padding:20px;min-height:300px}
.chart-box h3{font-size:13px;font-weight:600;color:#94a3b8;margin-bottom:16px;text-transform:uppercase;letter-spacing:1px}
.insights-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px}
.insight{background:linear-gradient(135deg,#1a1a24,#111118);border-left:3px solid #e4243d;border-radius:8px;padding:16px 20px;font-size:14px;line-height:1.6}
.budget-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}
.budget-card{background:#0a0a0f;border:1px solid rgba(148,163,184,.15);border-radius:12px;padding:20px}
.budget-card .title{font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;font-weight:600}
.budget-card .val{font-family:'Space Grotesk';font-size:24px;font-weight:700;color:#f1f5f9}
.budget-card .change{display:inline-block;margin-top:6px;padding:3px 8px;border-radius:4px;font-size:11px;font-weight:600}
.budget-card .change.pos{background:rgba(16,185,129,.15);color:#34d399}
.budget-card .change.neg{background:rgba(228,36,61,.15);color:#ff4d5a}
.budget-card .reason{font-size:12px;color:#64748b;margin-top:10px;line-height:1.5}
.scenarios{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}
.scenario{background:linear-gradient(135deg,#1a1a24,#111118);border:1px solid rgba(148,163,184,.15);border-radius:12px;padding:24px;position:relative}
.scenario.risk-baixo{border-color:rgba(16,185,129,.3)}
.scenario.risk-medio{border-color:rgba(251,191,36,.3)}
.scenario.risk-alto{border-color:rgba(228,36,61,.3)}
.scenario .name{font-family:'Space Grotesk';font-size:18px;font-weight:700;color:#f1f5f9;margin-bottom:12px}
.scenario .invest{font-size:22px;font-weight:800;color:#e4243d;margin-bottom:8px}
.scenario .proj{font-size:13px;color:#94a3b8;line-height:1.6;margin-bottom:12px}
.scenario .risk-badge{display:inline-block;padding:4px 10px;border-radius:4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px}
.scenario.risk-baixo .risk-badge{background:rgba(16,185,129,.15);color:#34d399}
.scenario.risk-medio .risk-badge{background:rgba(251,191,36,.15);color:#fbbf24}
.scenario.risk-alto .risk-badge{background:rgba(228,36,61,.15);color:#ff4d5a}
.steps-list{list-style:none}
.steps-list li{background:#0a0a0f;border:1px solid rgba(148,163,184,.1);border-radius:8px;padding:14px 18px;margin-bottom:10px;font-size:14px;display:flex;gap:12px;align-items:flex-start;transition:all .3s}
.steps-list li:hover{border-color:rgba(228,36,61,.3);transform:translateX(4px)}
.step-num{min-width:28px;height:28px;background:linear-gradient(135deg,#e4243d,#ff4d5a);color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px}
.summary-box{background:linear-gradient(135deg,rgba(228,36,61,.08),rgba(255,77,90,.03));border:1px solid rgba(228,36,61,.3);border-radius:16px;padding:28px;font-size:15px;line-height:1.8;color:#f1f5f9}
.footer{margin-top:48px;padding-top:32px;border-top:1px solid rgba(148,163,184,.1);text-align:center;color:#64748b;font-size:12px}
.footer .logo{font-family:'Space Grotesk';font-size:18px;font-weight:800;margin-bottom:8px;background:linear-gradient(90deg,#e4243d,#ff4d5a);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
@media(max-width:640px){.hero{padding:28px}.hero h1{font-size:32px}.section{padding:20px}}
</style>
</head>
<body>
<div class="container">

<div class="hero">
<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
<div style="width:48px;height:48px;background:linear-gradient(135deg,#e4243d,#ff4d5a);border-radius:10px;display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-family:'Space Grotesk';font-size:22px">V4</div>
<div><div style="font-size:12px;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;font-weight:600">V4 PIT WALL</div><div style="font-size:10px;color:#64748b;letter-spacing:1px">${agencyName}</div></div>
</div>
<h1>Check-in ${clientName}</h1>
<p style="color:#94a3b8;font-size:16px;margin-top:4px">Relatorio de Performance de Midia Paga</p>
<div class="meta">
<span><span class="dot"></span>${period}</span>
<span><span class="dot"></span>${segment || 'Segmento'}</span>
<span><span class="dot"></span>${metaData && googleData ? 'Meta + Google' : metaData ? 'Meta Ads' : 'Google Ads'}</span>
</div>
</div>

<div class="section">
<h2>Resumo Executivo</h2>
<div class="summary-box">${analysis.summary}</div>
</div>

<div class="section">
<h2>KPIs Consolidados</h2>
<div class="kpi-grid">
<div class="kpi"><div class="label">Investimento Total</div><div class="value">R$ ${brl(totalInvest)}</div><div class="sub">${period}</div></div>
<div class="kpi"><div class="label">Leads / Conversoes</div><div class="value">${num(totalResults)}</div><div class="sub">Total consolidado</div></div>
<div class="kpi"><div class="label">CPL Medio</div><div class="value">R$ ${brl(avgCpl)}</div><div class="sub">Ponderado</div></div>
<div class="kpi"><div class="label">Canais Ativos</div><div class="value">${(metaData ? 1 : 0) + (googleData ? 1 : 0)}</div><div class="sub">${metaData ? 'Meta' : ''}${metaData && googleData ? ' + ' : ''}${googleData ? 'Google' : ''}</div></div>
</div>
</div>

${metaData ? `
<div class="section">
<h2>Meta Ads - Detalhamento</h2>
<div class="kpi-grid">
<div class="kpi"><div class="label">Investimento</div><div class="value">R$ ${brl(metaData.totalInvestment)}</div></div>
<div class="kpi"><div class="label">Resultados</div><div class="value">${num(metaData.totalResults)}</div></div>
<div class="kpi"><div class="label">CPL</div><div class="value">R$ ${brl(metaData.avgCpl)}</div></div>
<div class="kpi"><div class="label">Impressoes</div><div class="value">${num(metaData.totalImpressions)}</div></div>
<div class="kpi"><div class="label">Alcance</div><div class="value">${num(metaData.totalReach)}</div></div>
</div>
</div>` : ''}

${googleData ? `
<div class="section">
<h2>Google Ads - Detalhamento</h2>
<div class="kpi-grid">
<div class="kpi"><div class="label">Investimento</div><div class="value">R$ ${brl(googleData.totalInvestment)}</div></div>
<div class="kpi"><div class="label">Conversoes</div><div class="value">${num(googleData.totalResults)}</div></div>
<div class="kpi"><div class="label">CPA</div><div class="value">R$ ${brl(googleData.avgCpl)}</div></div>
<div class="kpi"><div class="label">Impressoes</div><div class="value">${num(googleData.totalImpressions)}</div></div>
<div class="kpi"><div class="label">Cliques</div><div class="value">${num(googleData.totalReach)}</div></div>
</div>
</div>` : ''}

<div class="section">
<h2>Distribuicao de Investimento</h2>
<div class="chart-grid">
<div class="chart-box"><h3>Investimento por Canal</h3><canvas id="chartInvest"></canvas></div>
<div class="chart-box"><h3>Leads por Canal</h3><canvas id="chartLeads"></canvas></div>
</div>
</div>

<div class="section">
<h2>Insights Estrategicos</h2>
<div class="insights-list">
${analysis.insights.map((i) => `<div class="insight">${i}</div>`).join('')}
</div>
</div>

<div class="section">
<h2>Analise de Orcamento</h2>
<div class="budget-grid">
${analysis.budgetAnalysis.map((b) => {
  const isPositive = b.change.startsWith('+');
  return `<div class="budget-card">
<div class="title">${b.title}</div>
<div class="val">${b.value}</div>
<span class="change ${isPositive ? 'pos' : 'neg'}">${b.change}</span>
<div class="reason">${b.reasoning}</div>
</div>`;
}).join('')}
</div>
</div>

<div class="section">
<h2>Cenarios Projetados</h2>
<div class="scenarios">
${analysis.scenarios.map((s) => {
  const riskClass = (s.risk || 'medio').toLowerCase();
  return `<div class="scenario risk-${riskClass}">
<div class="name">${s.name}</div>
<div class="invest">${s.invest}</div>
<div class="proj">${s.projection}</div>
<span class="risk-badge">Risco ${s.risk}</span>
</div>`;
}).join('')}
</div>
</div>

<div class="section">
<h2>Proximos Passos</h2>
<ol class="steps-list">
${analysis.nextSteps.map((s, i) => `<li><span class="step-num">${i + 1}</span><span>${s}</span></li>`).join('')}
</ol>
</div>

<div class="footer">
<div class="logo">V4 PIT WALL</div>
<div>Gerado em ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })} - ${agencyName}</div>
<div style="margin-top:8px;opacity:.7">Relatorio gerado pelo V4 PIT WALL com Claude AI \u2022 pitwall-dashboard.vercel.app</div>
</div>

</div>

<script>
const colors = ['#e4243d','#448aff','#00e676','#ffd600','#a855f7','#ff9100'];
Chart.defaults.font.family="'Inter',sans-serif";
Chart.defaults.color='#94a3b8';
Chart.defaults.borderColor='rgba(148,163,184,.1)';

const investData = {
  labels: [${metaData ? "'Meta Ads'" : ''}${metaData && googleData ? ',' : ''}${googleData ? "'Google Ads'" : ''}],
  datasets: [{
    data: [${metaData ? metaData.totalInvestment.toFixed(2) : ''}${metaData && googleData ? ',' : ''}${googleData ? googleData.totalInvestment.toFixed(2) : ''}],
    backgroundColor: ['#1877f2','#4285f4'],
    borderColor: '#0a0a0f', borderWidth: 2
  }]
};
new Chart(document.getElementById('chartInvest'), {
  type: 'doughnut', data: investData,
  options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
});

const leadsData = {
  labels: [${metaData ? "'Meta Ads'" : ''}${metaData && googleData ? ',' : ''}${googleData ? "'Google Ads'" : ''}],
  datasets: [{
    label: 'Leads',
    data: [${metaData ? metaData.totalResults : ''}${metaData && googleData ? ',' : ''}${googleData ? googleData.totalResults : ''}],
    backgroundColor: ['rgba(24,119,242,0.6)','rgba(66,133,244,0.6)'],
    borderColor: ['#1877f2','#4285f4'], borderWidth: 2, borderRadius: 8
  }]
};
new Chart(document.getElementById('chartLeads'), {
  type: 'bar', data: leadsData,
  options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
});
</script>
</body>
</html>`;
}
