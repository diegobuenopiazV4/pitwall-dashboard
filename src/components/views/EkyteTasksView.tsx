import React, { useState } from 'react';
import { Rocket, Download, Sparkles, Loader2, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../../stores/app-store';
import { V4Logo } from '../brand/V4Logo';
import { callAI, parseAIJson } from '../../lib/ai/universal-caller';
import { getClaudeKey, getGeminiKey, getOpenRouterKey } from '../../lib/ai/chat-provider';
import { generateEkyteBookmarkletHTML } from '../../lib/skills/ekyte-bookmarklet';

interface EkyteTask {
  titulo: string;
  briefing: string;
  prioridade: 'P1' | 'P2' | 'P3';
  tipo: string;
}

export const EkyteTasksView: React.FC = () => {
  const { currentClient } = useAppStore();
  const [clientName, setClientName] = useState(currentClient?.name || '');
  const [clientSlug, setClientSlug] = useState('');
  const [month, setMonth] = useState(new Date().toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase());
  const [freeText, setFreeText] = useState('');
  const [mode, setMode] = useState<'A' | 'B'>('B'); // A = briefing verbatim, B = Claude gera briefing
  const [generating, setGenerating] = useState(false);
  const [tasks, setTasks] = useState<EkyteTask[]>([]);
  const [bookmarkletHtml, setBookmarkletHtml] = useState('');
  const [error, setError] = useState('');

  const processWithClaude = async () => {
    if (!freeText.trim()) {
      toast.error('Descreva as tasks no campo de texto');
      return;
    }
    if (!clientName.trim()) {
      toast.error('Informe o nome do cliente');
      return;
    }

    const hasAnyKey = !!(getClaudeKey() || getGeminiKey() || getOpenRouterKey());
    if (!hasAnyKey) {
      setError('Configure ao menos 1 chave (Claude, Gemini ou OpenRouter) em Settings.');
      return;
    }

    setGenerating(true);
    setError('');

    const systemPrompt = `Voce identifica tasks de marketing digital em texto livre e formata para o Ekyte (mkt.lab V4 Company).

Mapeamento de tipos (prefixo do titulo):
- Email/Email MKT -> [Email]
- Estaticos/Banners/Posts -> [Estaticos]
- Google Ads/SEM -> [Google ADS]
- Video/Reels/TikTok -> [Video]
- Landing Page/Site -> [LP]
- Copies/Copywriting -> [Copies]
- Stories -> [Stories]
- Carrossel -> [Carrossel]
- Social Media/Posts organicos -> [Social Media]

Formato do titulo: "[QTD][Tipo] (SIGLA_CLIENTE) | Descricao [MES]"
Ex: "[3][Estaticos] (ACME) | Banners Black Friday ABR"

Regras:
1. So identifique entregas CONCRETAS (descarte reunioes, alinhamentos, estrategia pura)
2. Se o texto tem briefing/copy completo, use verbatim como briefing
3. Se nao tem, gere um briefing estruturado (Contexto/Objetivo/Copy/KPIs)
4. Prioridade: P1 (urgente), P2 (esta semana), P3 (no mes)`;

    const userPrompt = `Cliente: ${clientName}
Sigla: ${clientSlug || clientName.replace(/[^A-Z]/gi, '').slice(0, 5).toUpperCase()}
Mes: ${month}
Modo: ${mode === 'A' ? 'Copiar briefing verbatim' : 'Gerar briefing estruturado'}

Texto das tasks:
"""
${freeText}
"""

Retorne APENAS JSON valido:
{
  "tasks": [
    { "titulo": "[3][Estaticos] (ACME) | Banners ABR", "briefing": "texto completo do briefing...", "prioridade": "P1", "tipo": "Estaticos" }
  ]
}`;

    try {
      const result = await callAI({
        systemPrompt,
        userPrompt,
        temperature: 0.5,
        maxTokens: 4096,
      });

      const data = parseAIJson(result.text);

      if (data.tasks && Array.isArray(data.tasks)) {
        setTasks(data.tasks);
        const html = generateEkyteBookmarkletHTML({
          clientName,
          month,
          tasks: data.tasks,
        });
        setBookmarkletHtml(html);
        toast.success(`${data.tasks.length} tasks identificadas via ${result.provider.toUpperCase()}`);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar');
    } finally {
      setGenerating(false);
    }
  };

  const download = () => {
    if (!bookmarkletHtml) return;
    const blob = new Blob([bookmarkletHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ekyte-tasks-${clientName.toLowerCase().replace(/\s+/g, '-')}-${month.toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('HTML baixado — abra no navegador para pegar o bookmarklet');
  };

  const preview = () => {
    if (!bookmarkletHtml) return;
    const w = window.open('', '_blank');
    if (w) { w.document.write(bookmarkletHtml); w.document.close(); }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0f] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-[#e4243d]/10 via-[#111118] to-[#1a1a24] border border-[#e4243d]/20">
          <div className="flex items-center gap-3 mb-3">
            <V4Logo size="sm" showSubtitle={false} />
            <div className="w-px h-6 bg-slate-700" />
            <Rocket size={20} className="text-[#e4243d]" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Ekyte Tasks \u2192 Bookmarklet</h1>
          <p className="text-sm text-slate-400 mt-1">
            Descreva suas tasks e gere um bookmarklet para criar automaticamente no mkt.lab (Ekyte)
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Cliente</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Empresa ACME"
              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#e4243d]/50"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Sigla</label>
            <input
              type="text"
              value={clientSlug}
              onChange={(e) => setClientSlug(e.target.value.toUpperCase())}
              placeholder="ACME"
              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#e4243d]/50"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Mes</label>
            <input
              type="text"
              value={month}
              onChange={(e) => setMonth(e.target.value.toUpperCase())}
              placeholder="ABR"
              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#e4243d]/50"
            />
          </div>
        </div>

        <div className="flex gap-1 mb-4 p-1 bg-slate-900 rounded-lg border border-slate-800 w-fit">
          <button
            onClick={() => setMode('A')}
            className={`px-3 py-1.5 text-xs rounded-md ${mode === 'A' ? 'bg-[#e4243d] text-white' : 'text-slate-400'}`}
            title="Copia o briefing exatamente como voce escreveu"
          >
            Modo A: Verbatim
          </button>
          <button
            onClick={() => setMode('B')}
            className={`px-3 py-1.5 text-xs rounded-md ${mode === 'B' ? 'bg-[#e4243d] text-white' : 'text-slate-400'}`}
            title="Claude estrutura o briefing com Contexto/Objetivo/Copy/KPIs"
          >
            Modo B: Claude estrutura
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Descreva as tasks do mes
          </label>
          <textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            rows={10}
            placeholder="Ex:&#10;- 3 banners estaticos para Black Friday (tamanhos feed + stories)&#10;- Campanha Google Ads de conversao com R$ 5k de budget&#10;- Pacote 10 stories semanais com CTA&#10;- Video reels institucional de 60s&#10;..."
            className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#e4243d]/50"
          />
        </div>

        <button
          onClick={processWithClaude}
          disabled={generating}
          className="w-full py-3 bg-gradient-to-r from-[#e4243d] to-[#ff4d5a] hover:opacity-90 disabled:opacity-40 text-white text-sm font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2"
        >
          {generating ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
          {generating ? 'Claude identificando tasks...' : 'Gerar Bookmarklet (Claude API)'}
        </button>

        {error && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
            <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-300">{error}</p>
          </div>
        )}

        {tasks.length > 0 && (
          <div className="mt-6 p-4 bg-slate-900/50 rounded-xl border border-emerald-500/30">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-100">{tasks.length} tasks identificadas</h3>
            </div>
            <div className="space-y-1.5 mb-4 max-h-60 overflow-y-auto">
              {tasks.map((t, i) => (
                <div key={i} className="p-2 bg-slate-950 rounded border border-slate-800 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      t.prioridade === 'P1' ? 'bg-red-500/20 text-red-400' :
                      t.prioridade === 'P2' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-slate-700 text-slate-400'
                    }`}>{t.prioridade}</span>
                    <span className="text-slate-200 font-medium">{t.titulo}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={preview} className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg flex items-center justify-center gap-1.5">
                <ExternalLink size={12} /> Abrir bookmarklet
              </button>
              <button onClick={download} className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg flex items-center justify-center gap-1.5">
                <Download size={12} /> Download HTML
              </button>
            </div>
            <p className="mt-3 text-[10px] text-slate-500">
              No HTML aberto, arraste o botao vermelho para a barra de favoritos. Depois entre no mkt.lab, selecione o projeto do cliente, e clique no bookmarklet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
