import React, { useState, useRef } from 'react';
import { Upload, Download, Eye, Sparkles, FileText, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../../stores/app-store';
import { V4Logo } from '../brand/V4Logo';
import { callClaude } from '../../lib/ai/claude-client';
import { generateTrafegoReportHTML } from '../../lib/skills/trafego-report-template';

interface CsvRow {
  [key: string]: string | number;
}

interface ChannelData {
  name: string;
  totalInvestment: number;
  totalResults: number;
  totalImpressions: number;
  totalReach: number;
  avgCpl: number;
  campaigns: CsvRow[];
  rawCsv: string;
}

function parseCSV(text: string): CsvRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(/[,;\t]/).map((h) => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map((line) => {
    const values = line.split(/[,;\t]/).map((v) => v.trim().replace(/^"|"$/g, ''));
    const row: CsvRow = {};
    headers.forEach((h, i) => {
      const raw = values[i] || '';
      const num = parseFloat(raw.replace(/\./g, '').replace(',', '.'));
      row[h] = !isNaN(num) && /^[-\d.,]+$/.test(raw) ? num : raw;
    });
    return row;
  });
}

function extractChannelStats(rows: CsvRow[], channel: 'meta' | 'google'): ChannelData {
  const investKey = channel === 'meta' ? ['Valor usado (BRL)', 'Amount spent (BRL)'] : ['Custo', 'Cost'];
  const resultsKey = channel === 'meta' ? ['Resultados', 'Results'] : ['Conversoes', 'Conversions', 'Conversions'];
  const impressKey = channel === 'meta' ? ['Impressoes', 'Impressions'] : ['Impressoes', 'Impressions'];
  const reachKey = channel === 'meta' ? ['Alcance', 'Reach'] : ['Cliques', 'Clicks'];

  const find = (row: CsvRow, keys: string[]) => {
    for (const k of keys) {
      const v = row[k];
      if (typeof v === 'number') return v;
      if (typeof v === 'string') {
        const n = parseFloat(v.replace(/[R$\s.]/g, '').replace(',', '.'));
        if (!isNaN(n)) return n;
      }
    }
    return 0;
  };

  let investment = 0, results = 0, impressions = 0, reach = 0;
  rows.forEach((row) => {
    investment += find(row, investKey);
    results += find(row, resultsKey);
    impressions += find(row, impressKey);
    reach += find(row, reachKey);
  });

  return {
    name: channel === 'meta' ? 'Meta Ads' : 'Google Ads',
    totalInvestment: investment,
    totalResults: results,
    totalImpressions: impressions,
    totalReach: reach,
    avgCpl: results > 0 ? investment / results : 0,
    campaigns: rows.slice(0, 20),
    rawCsv: '',
  };
}

export const TrafegoReportView: React.FC = () => {
  const { currentClient } = useAppStore();
  const [metaData, setMetaData] = useState<ChannelData | null>(null);
  const [googleData, setGoogleData] = useState<ChannelData | null>(null);
  const [clientName, setClientName] = useState(currentClient?.name || '');
  const [segment, setSegment] = useState(currentClient?.segment || '');
  const [period, setPeriod] = useState(new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }));
  const [agencyName, setAgencyName] = useState('V4 Company / Ruston & Co');
  const [generating, setGenerating] = useState(false);
  const [resultHtml, setResultHtml] = useState<string>('');
  const [error, setError] = useState('');
  const metaInputRef = useRef<HTMLInputElement>(null);
  const googleInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, channel: 'meta' | 'google') => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      if (rows.length === 0) {
        toast.error(`CSV ${channel} vazio ou invalido`);
        return;
      }
      const stats = extractChannelStats(rows, channel);
      stats.rawCsv = text.slice(0, 3000);
      if (channel === 'meta') setMetaData(stats);
      else setGoogleData(stats);
      toast.success(`${stats.name}: ${rows.length} linhas, R$ ${stats.totalInvestment.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} investidos`);
    } catch (err) {
      toast.error(`Erro ao ler CSV: ${String(err).slice(0, 80)}`);
    }
  };

  const generateReport = async () => {
    if (!clientName.trim()) {
      toast.error('Informe o nome do cliente');
      return;
    }
    if (!metaData && !googleData) {
      toast.error('Faca upload de pelo menos 1 CSV (Meta ou Google)');
      return;
    }

    const apiKey = localStorage.getItem('v4_pitwall_claude_key') || '';
    if (!apiKey || !apiKey.startsWith('sk-ant-')) {
      setError('Configure sua chave Claude em Settings primeiro.');
      toast.error('Chave Claude nao configurada');
      return;
    }

    setGenerating(true);
    setError('');

    const totalInvest = (metaData?.totalInvestment || 0) + (googleData?.totalInvestment || 0);
    const totalResults = (metaData?.totalResults || 0) + (googleData?.totalResults || 0);
    const avgCpl = totalResults > 0 ? totalInvest / totalResults : 0;

    const systemPrompt = `Voce e analista senior de midia paga da V4 Company / Ruston & Co.
Sua missao: gerar insights estrategicos, analise de orcamento e proximos passos para um relatorio mensal.
Estilo: direto, dados-concreto, tom confiante, sempre com numeros especificos.
Framework: AEMR (Aquisicao/Engajamento/Monetizacao/Retencao) + STEP V4.`;

    const userPrompt = `Cliente: ${clientName}
Segmento: ${segment}
Periodo: ${period}

PERFORMANCE CONSOLIDADA:
- Investimento total: R$ ${totalInvest.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
- Leads/Conversoes totais: ${totalResults}
- CPL medio ponderado: R$ ${avgCpl.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}

${metaData ? `
META ADS:
- Investimento: R$ ${metaData.totalInvestment.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
- Resultados: ${metaData.totalResults}
- CPL: R$ ${metaData.avgCpl.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
- Impressoes: ${metaData.totalImpressions.toLocaleString('pt-BR')}
- Alcance: ${metaData.totalReach.toLocaleString('pt-BR')}
` : 'Meta Ads: nao incluido'}

${googleData ? `
GOOGLE ADS:
- Investimento: R$ ${googleData.totalInvestment.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
- Conversoes: ${googleData.totalResults}
- CPL/CPA: R$ ${googleData.avgCpl.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
- Impressoes: ${googleData.totalImpressions.toLocaleString('pt-BR')}
` : 'Google Ads: nao incluido'}

Gere em JSON valido (e SO JSON, sem markdown):
{
  "insights": [6 strings curtas com insights estrategicos],
  "budgetAnalysis": [4 objetos { "title": "...", "value": "...", "change": "+X%" ou "-X%", "reasoning": "..." }],
  "scenarios": [3 objetos { "name": "Cenario A/B/C", "invest": "R$ X", "projection": "...", "risk": "baixo/medio/alto" }],
  "nextSteps": [5-7 strings acionaveis com prioridade P1/P2/P3 no inicio],
  "summary": "1 paragrafo executivo com veredito do mes"
}`;

    try {
      const response = await callClaude({
        systemPrompt,
        userPrompt,
        temperature: 0.7,
        maxTokens: 4096,
      }, apiKey, 'claude-sonnet-4-6');

      // Extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Claude nao retornou JSON valido');
      const analysis = JSON.parse(jsonMatch[0]);

      const html = generateTrafegoReportHTML({
        clientName: clientName.toUpperCase(),
        segment,
        period,
        agencyName,
        metaData,
        googleData,
        totalInvest,
        totalResults,
        avgCpl,
        analysis,
      });

      setResultHtml(html);
      toast.success('Relatorio gerado!');
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar relatorio');
      toast.error('Erro ao gerar relatorio');
    } finally {
      setGenerating(false);
    }
  };

  const downloadHtml = () => {
    if (!resultHtml) return;
    const blob = new Blob([resultHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Check-in ${clientName} ${period}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Baixado');
  };

  const previewHtml = () => {
    if (!resultHtml) return;
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(resultHtml);
      w.document.close();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0f] p-6">
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <div className="relative mb-6 p-6 rounded-2xl bg-gradient-to-br from-[#e4243d]/10 via-[#111118] to-[#1a1a24] border border-[#e4243d]/20 overflow-hidden">
          <div className="relative z-10">
            <V4Logo size="sm" showSubtitle={false} />
            <h1 className="text-2xl font-bold text-slate-100 mt-3 tracking-tight">
              Relatorio de Trafego Pago
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Upload dos CSVs do Meta Ads + Google Ads \u2192 Claude analisa \u2192 Relatorio HTML visual
            </p>
          </div>
          <div className="absolute top-0 right-0 opacity-5 text-[200px] font-black text-[#e4243d] leading-none">
            V4
          </div>
        </div>

        {/* Inputs basicos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Cliente</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="CLIENTE XYZ"
              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#e4243d]/50"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Segmento</label>
            <input
              type="text"
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              placeholder="Tecnologia, Saude..."
              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#e4243d]/50"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Periodo</label>
            <input
              type="text"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="Abril 2026"
              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#e4243d]/50"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Agencia</label>
            <input
              type="text"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#e4243d]/50"
            />
          </div>
        </div>

        {/* Upload CSVs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {/* Meta */}
          <div className={`p-4 rounded-xl border ${metaData ? 'bg-blue-500/5 border-blue-500/30' : 'bg-slate-900/50 border-slate-700'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-md bg-[#1877f2]/20 border border-[#1877f2]/40 flex items-center justify-center text-xs font-bold text-[#1877f2]">M</div>
              <span className="text-sm font-semibold text-slate-200">Meta Ads</span>
              {metaData && <CheckCircle2 size={14} className="text-emerald-400 ml-auto" />}
            </div>
            <input ref={metaInputRef} type="file" accept=".csv" onChange={(e) => handleUpload(e, 'meta')} className="hidden" />
            <button
              onClick={() => metaInputRef.current?.click()}
              className="w-full py-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center justify-center gap-1.5"
            >
              <Upload size={12} />
              {metaData ? 'Trocar CSV' : 'Upload CSV'}
            </button>
            {metaData && (
              <div className="mt-2 space-y-0.5 text-[10px] text-slate-400">
                <div>Invest: R$ {metaData.totalInvestment.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</div>
                <div>Leads: {metaData.totalResults} \u2022 CPL: R$ {metaData.avgCpl.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</div>
              </div>
            )}
          </div>

          {/* Google */}
          <div className={`p-4 rounded-xl border ${googleData ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-slate-900/50 border-slate-700'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-md bg-[#4285f4]/20 border border-[#4285f4]/40 flex items-center justify-center text-xs font-bold text-[#4285f4]">G</div>
              <span className="text-sm font-semibold text-slate-200">Google Ads</span>
              {googleData && <CheckCircle2 size={14} className="text-emerald-400 ml-auto" />}
            </div>
            <input ref={googleInputRef} type="file" accept=".csv" onChange={(e) => handleUpload(e, 'google')} className="hidden" />
            <button
              onClick={() => googleInputRef.current?.click()}
              className="w-full py-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center justify-center gap-1.5"
            >
              <Upload size={12} />
              {googleData ? 'Trocar CSV' : 'Upload CSV'}
            </button>
            {googleData && (
              <div className="mt-2 space-y-0.5 text-[10px] text-slate-400">
                <div>Invest: R$ {googleData.totalInvestment.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</div>
                <div>Conv: {googleData.totalResults} \u2022 CPA: R$ {googleData.avgCpl.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</div>
              </div>
            )}
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={generateReport}
          disabled={generating || (!metaData && !googleData)}
          className="w-full py-3 bg-gradient-to-r from-[#e4243d] to-[#ff4d5a] hover:opacity-90 disabled:opacity-40 text-white text-sm font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
        >
          {generating ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
          {generating ? 'Claude analisando dados...' : 'Gerar Relatorio (Claude API)'}
        </button>

        {error && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
            <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-300">{error}</p>
          </div>
        )}

        {/* Result */}
        {resultHtml && (
          <div className="mt-6 p-4 bg-slate-900 rounded-xl border border-emerald-500/30">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-100">Relatorio pronto</h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={previewHtml}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg flex items-center justify-center gap-1.5"
              >
                <Eye size={12} />
                Visualizar em nova aba
              </button>
              <button
                onClick={downloadHtml}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg flex items-center justify-center gap-1.5"
              >
                <Download size={12} />
                Download .html
              </button>
            </div>
            <div className="mt-3 text-[10px] text-slate-500 flex items-center gap-1">
              <FileText size={10} />
              {Math.round(resultHtml.length / 1024)} KB \u2022 11 secoes \u2022 Chart.js + Inter font
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
