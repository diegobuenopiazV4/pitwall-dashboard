import React, { useState } from 'react';
import { FileText, Download, Plus, X, Sparkles, Loader2, AlertCircle, CheckCircle2, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../../stores/app-store';
import { V4Logo } from '../brand/V4Logo';
import { callClaude } from '../../lib/ai/claude-client';
import { generateCriativosDocx } from '../../lib/skills/criativos-docx-generator';

interface Criativo {
  id: string;
  num: number;
  headline: string;
  subheadline: string;
  texto: string;
  cta: string;
  titulo: string;
}

const emptyCriativo = (num: number): Criativo => ({
  id: crypto.randomUUID(),
  num,
  headline: '',
  subheadline: '',
  texto: '',
  cta: '',
  titulo: '',
});

export const CriativosDocxView: React.FC = () => {
  const { currentClient } = useAppStore();
  const [clientName, setClientName] = useState(currentClient?.name || '');
  const [criativos, setCriativos] = useState<Criativo[]>([emptyCriativo(1)]);
  const [bulkText, setBulkText] = useState('');
  const [mode, setMode] = useState<'manual' | 'bulk'>('manual');
  const [generating, setGenerating] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState('');

  const addCriativo = () => {
    setCriativos([...criativos, emptyCriativo(criativos.length + 1)]);
  };

  const removeCriativo = (id: string) => {
    setCriativos(criativos.filter((c) => c.id !== id).map((c, i) => ({ ...c, num: i + 1 })));
  };

  const updateCriativo = (id: string, field: keyof Omit<Criativo, 'id' | 'num'>, value: string) => {
    setCriativos(criativos.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const parseBulkWithClaude = async () => {
    if (!bulkText.trim()) {
      toast.error('Cole suas copies no campo primeiro');
      return;
    }
    const apiKey = localStorage.getItem('v4_pitwall_claude_key') || '';
    if (!apiKey || !apiKey.startsWith('sk-ant-')) {
      setError('Configure sua chave Claude em Settings.');
      return;
    }

    setParsing(true);
    setError('');

    const systemPrompt = `Voce extrai criativos de anuncio de texto livre e retorna JSON.
Para cada criativo, identifique: headline (principal chamada), subheadline (apoio), texto (corpo completo), cta (call-to-action), titulo (titulo do anuncio).
Se algum campo faltar, inferir do contexto de forma coerente.`;

    const userPrompt = `Texto das copies:
"""
${bulkText}
"""

Retorne APENAS JSON valido, sem markdown, neste formato:
{
  "criativos": [
    { "num": 1, "headline": "...", "subheadline": "...", "texto": "...", "cta": "...", "titulo": "..." }
  ]
}`;

    try {
      const response = await callClaude({
        systemPrompt,
        userPrompt,
        temperature: 0.3,
        maxTokens: 4096,
      }, apiKey, 'claude-sonnet-4-6');

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Resposta invalida');
      const data = JSON.parse(jsonMatch[0]);

      if (data.criativos && Array.isArray(data.criativos)) {
        const parsed = data.criativos.map((c: any, i: number) => ({
          id: crypto.randomUUID(),
          num: i + 1,
          headline: c.headline || '',
          subheadline: c.subheadline || '',
          texto: c.texto || '',
          cta: c.cta || '',
          titulo: c.titulo || '',
        }));
        setCriativos(parsed);
        setMode('manual');
        toast.success(`${parsed.length} criativos extraidos`);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao parsear');
    } finally {
      setParsing(false);
    }
  };

  const download = async () => {
    if (!clientName.trim()) {
      toast.error('Informe o nome do cliente');
      return;
    }
    const validos = criativos.filter((c) => c.headline.trim() || c.texto.trim());
    if (validos.length === 0) {
      toast.error('Adicione pelo menos 1 criativo');
      return;
    }

    setGenerating(true);
    setError('');
    try {
      const blob = await generateCriativosDocx({
        clientName: clientName.toUpperCase(),
        criativos: validos,
        agencyName: 'V4 Company / Ruston & Co',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Criativos ${clientName.toUpperCase()} ${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${validos.length} criativos exportados`);
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar DOCX');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0f] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-[#e4243d]/10 via-[#111118] to-[#1a1a24] border border-[#e4243d]/20">
          <div className="flex items-center gap-3 mb-3">
            <V4Logo size="sm" showSubtitle={false} />
            <div className="w-px h-6 bg-slate-700" />
            <FileText size={20} className="text-[#e4243d]" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Criativos Ads \u2192 DOCX</h1>
          <p className="text-sm text-slate-400 mt-1">
            Monte suas copies e exporte para o template V4 Company em .docx
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Cliente</label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="CLIENTE XYZ"
            className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#e4243d]/50"
          />
        </div>

        <div className="flex gap-1 mb-4 p-1 bg-slate-900 rounded-lg border border-slate-800 w-fit">
          <button
            onClick={() => setMode('manual')}
            className={`px-3 py-1.5 text-xs rounded-md ${mode === 'manual' ? 'bg-[#e4243d] text-white' : 'text-slate-400'}`}
          >
            Preencher manual
          </button>
          <button
            onClick={() => setMode('bulk')}
            className={`px-3 py-1.5 text-xs rounded-md ${mode === 'bulk' ? 'bg-[#e4243d] text-white' : 'text-slate-400'}`}
          >
            Colar copies (Claude extrai)
          </button>
        </div>

        {mode === 'bulk' && (
          <div className="mb-4">
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={10}
              placeholder="Cole aqui suas copies em qualquer formato...&#10;&#10;Exemplo:&#10;&#10;Criativo 1&#10;Headline: O segredo que 10 mil lojistas descobriram&#10;Subheadline: E voce ainda nao sabe&#10;Texto: ...&#10;CTA: Quero saber&#10;&#10;Criativo 2&#10;..."
              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#e4243d]/50 font-mono"
            />
            <button
              onClick={parseBulkWithClaude}
              disabled={parsing || !bulkText.trim()}
              className="mt-2 w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-90 disabled:opacity-40 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2"
            >
              {parsing ? <Loader2 className="animate-spin" size={14} /> : <Wand2 size={14} />}
              {parsing ? 'Claude extraindo...' : 'Extrair criativos com Claude'}
            </button>
          </div>
        )}

        {mode === 'manual' && (
          <div className="space-y-3 mb-4">
            {criativos.map((c) => (
              <div key={c.id} className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-[#e4243d]">Criativo {String(c.num).padStart(2, '0')}</h3>
                  {criativos.length > 1 && (
                    <button
                      onClick={() => removeCriativo(c.id)}
                      className="text-slate-500 hover:text-red-400"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    placeholder="Headline"
                    value={c.headline}
                    onChange={(e) => updateCriativo(c.id, 'headline', e.target.value)}
                    className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#e4243d]/50"
                  />
                  <input
                    placeholder="Subheadline"
                    value={c.subheadline}
                    onChange={(e) => updateCriativo(c.id, 'subheadline', e.target.value)}
                    className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#e4243d]/50"
                  />
                  <textarea
                    placeholder="Texto principal"
                    value={c.texto}
                    onChange={(e) => updateCriativo(c.id, 'texto', e.target.value)}
                    rows={3}
                    className="md:col-span-2 px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#e4243d]/50"
                  />
                  <input
                    placeholder="CTA (ex: Saiba mais)"
                    value={c.cta}
                    onChange={(e) => updateCriativo(c.id, 'cta', e.target.value)}
                    className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#e4243d]/50"
                  />
                  <input
                    placeholder="Titulo do anuncio"
                    value={c.titulo}
                    onChange={(e) => updateCriativo(c.id, 'titulo', e.target.value)}
                    className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#e4243d]/50"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={addCriativo}
              className="w-full py-2 text-xs text-slate-400 border border-dashed border-slate-700 rounded-lg hover:border-slate-500 flex items-center justify-center gap-1.5"
            >
              <Plus size={12} /> Adicionar criativo
            </button>
          </div>
        )}

        <button
          onClick={download}
          disabled={generating}
          className="w-full py-3 bg-gradient-to-r from-[#e4243d] to-[#ff4d5a] hover:opacity-90 disabled:opacity-40 text-white text-sm font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2"
        >
          {generating ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
          {generating ? 'Gerando DOCX...' : 'Exportar para .docx (Template V4)'}
        </button>

        {error && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
            <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-300">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};
