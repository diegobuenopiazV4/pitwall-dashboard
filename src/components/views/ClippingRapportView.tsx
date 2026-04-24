import React, { useState } from 'react';
import { Newspaper, Download, Eye, Sparkles, Loader2, AlertCircle, CheckCircle2, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../../stores/app-store';
import { V4Logo } from '../brand/V4Logo';
import { callAI, parseAIJson } from '../../lib/ai/universal-caller';
import { getClaudeKey, getGeminiKey, getOpenRouterKey } from '../../lib/ai/chat-provider';
import { generateClippingHTML } from '../../lib/skills/clipping-template';

export const ClippingRapportView: React.FC = () => {
  const { currentClient } = useAppStore();
  const [clientName, setClientName] = useState(currentClient?.name || '');
  const [sector, setSector] = useState(currentClient?.segment || '');
  const [briefing, setBriefing] = useState('');
  const [contacts, setContacts] = useState('');
  const [region, setRegion] = useState('Brasil');
  const [generating, setGenerating] = useState(false);
  const [resultHtml, setResultHtml] = useState('');
  const [error, setError] = useState('');
  const [stage, setStage] = useState<'idle' | 'researching' | 'composing'>('idle');

  const generate = async () => {
    if (!clientName.trim() || !sector.trim()) {
      toast.error('Informe cliente e setor');
      return;
    }

    const hasAnyKey = !!(getClaudeKey() || getGeminiKey() || getOpenRouterKey());
    if (!hasAnyKey) {
      setError('Configure ao menos 1 chave (Claude, Gemini ou OpenRouter) em Settings.');
      return;
    }

    setGenerating(true);
    setError('');
    setStage('researching');

    const systemPrompt = `Voce e analista de inteligencia de mercado senior.
Sua missao: gerar um clipping de rapport para o time comercial da V4 Company / Ruston SJC enviar a um cliente.
O objetivo e fortalecer o relacionamento mostrando curadoria de qualidade.

Para este clipping:
- Filtre SO noticias/tendencias relevantes para o setor do cliente
- Priorize fontes recentes (ultimos 30 dias)
- Cite fontes reais (mesmo que voce tenha que sintetizar baseado em seu conhecimento - DEIXE CLARO se nao tiver certeza)
- Gere mensagens de WhatsApp personalizadas para os contatos fornecidos

Estilo: profissional, curado, tom consultivo.`;

    const userPrompt = `Cliente: ${clientName}
Setor: ${sector}
Regiao: ${region}

Briefing/Contexto:
${briefing}

Contatos principais para personalizar mensagens:
${contacts || 'Nao informado'}

Gere em JSON valido (SO JSON, sem markdown):
{
  "panorama": "3-4 paragrafos curtos sobre o estado atual do setor (tendencias, desafios, oportunidades)",
  "news": [
    { "title": "...", "source": "Nome da fonte", "url": "https://...", "summary": "2-3 linhas", "relevance": "Por que importa para o cliente" }
    // 4-6 noticias
  ],
  "competitors": [
    { "name": "Concorrente X", "movement": "descricao do movimento estrategico recente", "impact": "impacto potencial no cliente" }
    // 3-4 concorrentes
  ],
  "trends": [
    { "topic": "...", "description": "...", "actionable": "o que o cliente pode fazer hoje" }
    // 3-4 tendencias
  ],
  "rapportMessages": [
    { "contactName": "primeiro nome do contato", "messageText": "mensagem de WhatsApp personalizada de 4-6 linhas referenciando uma das noticias/tendencias" }
    // 1 mensagem por contato listado, ou 2-3 genericas se nenhum contato foi fornecido
  ]
}`;

    try {
      setStage('composing');
      const result = await callAI({
        systemPrompt,
        userPrompt,
        temperature: 0.85,
        maxTokens: 6000,
      });

      const data = parseAIJson(result.text);

      const html = generateClippingHTML({
        clientName: clientName.toUpperCase(),
        sector,
        region,
        date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
        data,
      });

      setResultHtml(html);
      toast.success(`Clipping gerado via ${result.provider.toUpperCase()}${result.fallbackUsed ? ' (fallback)' : ''}`);
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar clipping');
    } finally {
      setGenerating(false);
      setStage('idle');
    }
  };

  const downloadHtml = () => {
    if (!resultHtml) return;
    const blob = new Blob([resultHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clipping-rapport-${clientName.toLowerCase().replace(/\s+/g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const previewHtml = () => {
    if (!resultHtml) return;
    const w = window.open('', '_blank');
    if (w) { w.document.write(resultHtml); w.document.close(); }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0f] p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-[#e4243d]/10 via-[#111118] to-[#1a1a24] border border-[#e4243d]/20 overflow-hidden relative">
          <div className="flex items-center gap-3 mb-3">
            <V4Logo size="sm" showSubtitle={false} />
            <div className="w-px h-6 bg-slate-700" />
            <Newspaper size={20} className="text-[#e4243d]" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Clipping de Rapport</h1>
          <p className="text-sm text-slate-400 mt-1">
            Curadoria de noticias + tendencias do setor + mensagens prontas para enviar ao cliente
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Cliente *</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="ACME S.A."
              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#e4243d]/50"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Setor *</label>
            <input
              type="text"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              placeholder="Fintech, Saude, Varejo..."
              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#e4243d]/50"
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Regiao/Mercado</label>
          <input
            type="text"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#e4243d]/50"
          />
        </div>

        <div className="mb-3">
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Briefing do cliente (produtos, concorrentes, momento estrategico)
          </label>
          <textarea
            value={briefing}
            onChange={(e) => setBriefing(e.target.value)}
            rows={5}
            placeholder="Ex: Acme e uma fintech B2B focada em pequenos negocios. Concorrentes diretos: Stone, Cora. Momento atual: buscando expansao no Nordeste. Principal desafio: aquisicao..."
            className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#e4243d]/50"
          />
        </div>

        <div className="mb-4">
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Contatos principais (1 por linha: Nome - Cargo)
          </label>
          <textarea
            value={contacts}
            onChange={(e) => setContacts(e.target.value)}
            rows={3}
            placeholder="Joao Silva - CEO&#10;Maria Souza - CMO&#10;..."
            className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#e4243d]/50 font-mono"
          />
        </div>

        <button
          onClick={generate}
          disabled={generating}
          className="w-full py-3 bg-gradient-to-r from-[#e4243d] to-[#ff4d5a] hover:opacity-90 disabled:opacity-40 text-white text-sm font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2"
        >
          {generating ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
          {stage === 'researching' ? 'Pesquisando mercado...' :
           stage === 'composing' ? 'Montando clipping...' :
           'Gerar Clipping (Claude API)'}
        </button>

        {error && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
            <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-300">{error}</p>
          </div>
        )}

        {resultHtml && (
          <div className="mt-6 p-4 bg-slate-900 rounded-xl border border-emerald-500/30">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-100">Clipping pronto</h3>
            </div>
            <div className="flex gap-2">
              <button onClick={previewHtml} className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg flex items-center justify-center gap-1.5">
                <Eye size={12} /> Visualizar
              </button>
              <button onClick={downloadHtml} className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg flex items-center justify-center gap-1.5">
                <Download size={12} /> Download .html
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
          <p className="text-[10px] text-amber-200/80 flex items-start gap-1.5">
            <Globe size={12} className="mt-0.5 shrink-0" />
            <span>Claude sintetiza panorama do setor baseado em conhecimento ate abril/2026. Para pesquisa web ao vivo, use a skill /clipping-rapport no Claude Code.</span>
          </p>
        </div>
      </div>
    </div>
  );
};
