import React, { useState } from 'react';
import { FileText, Zap, Loader2, Download, Eye, Upload, Sparkles, FolderOpen, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../../stores/app-store';
import { sendChat } from '../../lib/ai/chat-provider';
import { buildCheckinSystemPrompt, CHECKIN_QUICK_COMMANDS } from '../../lib/checkin/references';
import { listClientDocs, buildClientDocsContext } from '../../lib/clients/client-docs';
import { safeFilename, exportHTML } from '../../lib/documents/exporters';

type CheckinType = 'weekly' | 'monthly';

export const CheckinView: React.FC = () => {
  const { currentClient, userId, setClientDocsOpen } = useAppStore();
  const [type, setType] = useState<CheckinType>('weekly');
  const [period, setPeriod] = useState('');
  const [additionalData, setAdditionalData] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!currentClient) {
      toast.error('Selecione um cliente primeiro');
      return;
    }

    setGenerating(true);
    setGeneratedHtml(null);

    try {
      // Buscar docs do cliente (CSVs Meta/Google Ads, notas)
      const docs = await listClientDocs(userId || 'offline', currentClient.id);
      const docsContext = docs.length > 0 ? await buildClientDocsContext(docs) : '';

      // Construir prompt
      const cmd = CHECKIN_QUICK_COMMANDS.find((c) => c.type === type)!;
      const userPrompt = `${cmd.prompt
        .replace(/\{\{cliente\}\}/g, currentClient.name)
      }

## CONTEXTO DO CLIENTE
- Nome: ${currentClient.name}
- Segmento: ${currentClient.segment}
- Fase STEP: ${currentClient.step}
- Pilar V4: ${currentClient.pilar}
- Health: ${currentClient.health}
${period ? `- Periodo: ${period}` : ''}
${additionalData ? `\n## DADOS FORNECIDOS\n${additionalData}` : ''}
${docsContext ? `\n${docsContext}` : ''}

ENTREGUE: HTML completo em um unico bloco \`\`\`html ... \`\`\` com glassmorphism dark, navegacao completa, ${type === 'weekly' ? '15' : '24'} slides, todas as animacoes e dados realistas (se nao fornecidos, usar exemplos do nicho ${currentClient.segment}).`;

      const systemPrompt = buildCheckinSystemPrompt(type);

      const result = await sendChat({
        systemPrompt,
        userPrompt,
        maxTokens: 32000,
        temperature: 0.7,
        agentId: '01',
        overrideModelId: 'claude-design', // Usa Claude Design (Opus 4.7) para gerar HTML
      });

      if (!result) {
        toast.error('Configure API key em Settings');
        return;
      }

      // Extrair HTML do response (dentro de ```html ... ```)
      const match = result.text.match(/```html\s*([\s\S]*?)```/);
      const html = match ? match[1].trim() : result.text;

      if (!html.includes('<html') && !html.includes('<!DOCTYPE')) {
        // Se nao retornou HTML valido, embrulha
        setGeneratedHtml(`<!DOCTYPE html><html><head><title>Check-in ${currentClient.name}</title></head><body><pre>${html}</pre></body></html>`);
      } else {
        setGeneratedHtml(html);
      }

      setModelUsed(result.model.label);
      toast.success(`Check-in gerado com ${result.model.label}!`);
    } catch (err) {
      toast.error(`Erro: ${err instanceof Error ? err.message : 'Falha na geracao'}`);
    } finally {
      setGenerating(false);
    }
  };

  const handlePreview = () => {
    if (!generatedHtml) return;
    const win = window.open('', '_blank');
    if (!win) {
      toast.error('Permita popups para visualizar');
      return;
    }
    win.document.write(generatedHtml);
    win.document.close();
  };

  const handleDownload = () => {
    if (!generatedHtml || !currentClient) return;
    const title = `checkin-${type}-${currentClient.name}-${new Date().toISOString().slice(0, 10)}`;
    const filename = safeFilename(title);

    const blob = new Blob([generatedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Check-in baixado!');
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0f] overflow-y-auto">
      <div className="px-4 py-3 border-b border-slate-800 bg-[#111118] flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Sparkles size={14} className="text-amber-400" />
            Check-in Generator
          </h2>
          <p className="text-[10px] text-slate-500">
            Sistema V4 / Ruston - Dashboard HTML glassmorphism premium com frameworks e Cialdini
          </p>
        </div>
        <span className="text-[10px] px-2 py-1 bg-purple-500/10 text-purple-400 rounded">Powered by Claude Design (Opus 4.7)</span>
      </div>

      <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
        {!currentClient ? (
          <div className="p-8 text-center bg-slate-900/50 border border-slate-800 rounded-lg">
            <FolderOpen size={32} className="mx-auto text-slate-700 mb-2" />
            <p className="text-sm text-slate-400 mb-2">Selecione um cliente na sidebar</p>
            <p className="text-xs text-slate-600">O sistema vai buscar automaticamente CSVs, notas e check-ins anteriores na pasta do cliente</p>
          </div>
        ) : (
          <>
            {/* Cliente info */}
            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">{currentClient.name}</h3>
                  <p className="text-[11px] text-slate-500">
                    {currentClient.segment} · STEP: {currentClient.step} · Pilar: {currentClient.pilar} · Health: {currentClient.health}
                  </p>
                </div>
                <button
                  onClick={() => setClientDocsOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-md"
                >
                  <Upload size={12} />
                  Gerenciar docs
                </button>
              </div>
              <p className="text-[10px] text-slate-600">
                Upload CSVs de Meta/Google Ads, relatorios e notas na pasta do cliente. O sistema lera automaticamente e incluira no check-in.
              </p>
            </div>

            {/* Tipo de check-in */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Tipo de Check-in
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setType('weekly')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    type === 'weekly'
                      ? 'bg-red-500/10 border-red-500/40 ring-1 ring-red-500/30'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar size={14} className="text-red-400" />
                    <span className="text-xs font-semibold text-slate-200">Semanal (15 slides)</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Tatico/Operacional · Comparacao WoW</p>
                </button>
                <button
                  onClick={() => setType('monthly')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    type === 'monthly'
                      ? 'bg-red-500/10 border-red-500/40 ring-1 ring-red-500/30'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar size={14} className="text-red-400" />
                    <span className="text-xs font-semibold text-slate-200">Mensal (24 slides)</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Estrategico/Analitico · Comparacao MoM</p>
                </button>
              </div>
            </div>

            {/* Periodo */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Periodo (opcional)
              </label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder={type === 'weekly' ? 'Ex: Semana 14-20 Abril 2026' : 'Ex: Marco 2026'}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-600"
              />
            </div>

            {/* Dados adicionais */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Dados adicionais (opcional)
              </label>
              <textarea
                value={additionalData}
                onChange={(e) => setAdditionalData(e.target.value)}
                placeholder="Cole dados de performance (CSV texto, resumo, metricas-chave), ou deixe vazio para usar docs do cliente + exemplos realistas do nicho"
                rows={6}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-600 resize-none font-mono"
              />
              <p className="text-[10px] text-slate-600 mt-1">
                O sistema tambem le automaticamente os docs do cliente (Supabase Storage). Clique em "Gerenciar docs" para upload.
              </p>
            </div>

            {/* Botao gerar */}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white rounded-lg disabled:opacity-50 transition-all"
            >
              {generating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Gerando check-in {type === 'weekly' ? 'semanal' : 'mensal'}...
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Gerar Check-in {type === 'weekly' ? 'Semanal (15 slides)' : 'Mensal (24 slides)'}
                </>
              )}
            </button>

            {/* Resultado */}
            {generatedHtml && (
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-400">Check-in gerado com sucesso!</span>
                  {modelUsed && <span className="text-[10px] text-slate-500">via {modelUsed}</span>}
                </div>
                <div className="text-[11px] text-slate-400">
                  {generatedHtml.length.toLocaleString()} caracteres · {generatedHtml.match(/<section|<div class="slide/g)?.length ?? 0} slides detectados
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handlePreview}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-md"
                  >
                    <Eye size={12} />
                    Preview em nova aba
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-white bg-emerald-600 hover:bg-emerald-500 rounded-md"
                  >
                    <Download size={12} />
                    Baixar HTML
                  </button>
                </div>
              </div>
            )}

            {/* Info */}
            <div className="p-3 bg-slate-900/30 border border-slate-800 rounded-lg text-[10px] text-slate-500">
              <p className="font-semibold text-slate-400 mb-1">Como funciona:</p>
              <ol className="space-y-0.5 ml-3 list-decimal">
                <li>Le docs do cliente (CSVs Meta/Google, notas, check-ins anteriores)</li>
                <li>Usa Claude Design (Opus 4.7) para gerar HTML glassmorphism premium</li>
                <li>Aplica 20 frameworks estrategicos + 7 gatilhos Cialdini + Neuromarketing</li>
                <li>StoryBrand: cliente = heroi, nos = guia</li>
                <li>Variacoes WoW/MoM com inversao (CPL/CPC sobe=ruim)</li>
                <li>ICE Score em recomendacoes · Imposto META 12,15% calculado</li>
                <li>Download HTML auto-contido pronto para enviar ao cliente</li>
              </ol>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
