import React, { useState, useEffect } from 'react';
import { X, Key, Eye, EyeOff, Info, Wand2, Download, Trash2, Sparkles, Bot, Zap, Brain, Palette, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../../stores/app-store';
import { exportClientsCSV } from '../../lib/documents/xlsx-export';
import {
  getStatus,
  setClaudeKey as saveClaudeKey,
  setGeminiKey as saveGeminiKey,
  setOpenRouterKey as saveOpenRouterKey,
  setSelectedModel,
  setAutoModelEnabled,
  getClaudeKey,
  getGeminiKey,
  getOpenRouterKey,
} from '../../lib/ai/chat-provider';
import { MODELS, MODEL_CATEGORIES, type ModelDefinition } from '../../lib/ai/models';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<Props> = ({ open, onClose }) => {
  const { autoRouterEnabled, setAutoRouter, clients, messages, tasks, bookmarks, logout } = useAppStore();
  const [claudeKey, setClaudeKeyLocal] = useState('');
  const [geminiKey, setGeminiKeyLocal] = useState('');
  const [openrouterKey, setOpenRouterKeyLocal] = useState('');
  const [showClaudeKey, setShowClaudeKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOpenRouterKey, setShowOpenRouterKey] = useState(false);
  const [autoModel, setAutoModel] = useState(true);
  const [selectedModelId, setSelectedModelIdLocal] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'keys' | 'models' | 'account' | 'shortcuts'>('keys');

  useEffect(() => {
    if (open) {
      const status = getStatus();
      setClaudeKeyLocal(getClaudeKey());
      setGeminiKeyLocal(getGeminiKey());
      setOpenRouterKeyLocal(getOpenRouterKey());
      setAutoModel(status.autoModelEnabled);
      setSelectedModelIdLocal(status.selectedModelId);
    }
  }, [open]);

  const handleSave = () => {
    saveClaudeKey(claudeKey.trim());
    saveGeminiKey(geminiKey.trim());
    saveOpenRouterKey(openrouterKey.trim());
    setAutoModelEnabled(autoModel);
    setSelectedModel(autoModel ? null : selectedModelId);
    toast.success('Configuracoes salvas');
    onClose();
  };

  const handleClearAll = () => {
    if (!confirm('Limpar TODOS os dados locais e sair? Esta acao nao pode ser desfeita.')) return;
    localStorage.clear();
    logout();
    toast.success('Dados limpos');
    onClose();
  };

  const totalMessages = Object.values(messages).flat().length;

  if (!open) return null;

  const hasClaude = !!claudeKey && claudeKey.startsWith('sk-ant-');
  const hasGemini = !!geminiKey && geminiKey.startsWith('AIza');
  const hasOpenRouter = !!openrouterKey && openrouterKey.startsWith('sk-or-');

  // Group models by category
  const modelsByCategory = Object.values(MODELS).reduce((acc, m) => {
    if (!acc[m.category]) acc[m.category] = [];
    acc[m.category].push(m);
    return acc;
  }, {} as Record<string, ModelDefinition[]>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[90vh] bg-[#1a1a24] border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <h2 className="text-sm font-semibold text-slate-200">Configuracoes</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-[#111118]">
          {[
            { id: 'keys' as const, label: 'API Keys', icon: Key },
            { id: 'models' as const, label: 'Modelos', icon: Sparkles },
            { id: 'account' as const, label: 'Conta', icon: Bot },
            { id: 'shortcuts' as const, label: 'Atalhos', icon: Zap },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-white bg-slate-800 border-b-2 border-red-500'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon size={12} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB: API KEYS */}
          {activeTab === 'keys' && (
            <>
              <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                <p className="text-[11px] text-purple-300 flex items-start gap-1.5">
                  <Info size={11} className="mt-0.5 shrink-0" />
                  <span>
                    <strong>Dual API simultanea:</strong> configure AMBAS para ter o melhor de cada modelo.
                    Claude para qualidade de escrita, Gemini para pesquisa + imagem + audio/video.
                    O sistema escolhe automaticamente o melhor para cada tarefa.
                  </span>
                </p>
              </div>

              {/* Claude Key */}
              <div className="p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-medium text-orange-400">
                  <Key size={12} />
                  Claude API Key (Anthropic)
                  {hasClaude && <Check size={12} className="text-emerald-400" />}
                </label>
                <div className="relative">
                  <input
                    type={showClaudeKey ? 'text' : 'password'}
                    value={claudeKey}
                    onChange={(e) => setClaudeKeyLocal(e.target.value)}
                    placeholder="sk-ant-api03-..."
                    className="w-full pl-3 pr-10 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-orange-500/50 font-mono"
                  />
                  <button onClick={() => setShowClaudeKey(!showClaudeKey)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showClaudeKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  Obter em{' '}
                  <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                    console.anthropic.com
                  </a>
                  . Modelos: Opus 4.5, Sonnet 4.5, Haiku 4.5. Inclui Extended Thinking.
                </p>
              </div>

              {/* Gemini Key */}
              <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-medium text-blue-400">
                  <Key size={12} />
                  Gemini API Key (Google)
                  {hasGemini && <Check size={12} className="text-emerald-400" />}
                </label>
                <div className="relative">
                  <input
                    type={showGeminiKey ? 'text' : 'password'}
                    value={geminiKey}
                    onChange={(e) => setGeminiKeyLocal(e.target.value)}
                    placeholder="AIza..."
                    className="w-full pl-3 pr-10 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 font-mono"
                  />
                  <button onClick={() => setShowGeminiKey(!showGeminiKey)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showGeminiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  Obter gratis em{' '}
                  <a href="https://ai.google.dev" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                    ai.google.dev
                  </a>
                  . Modelos: 3.1 Pro, 3.1 Flash, 2.5 Flash Image (gera imagens!), Google Search + Audio + Video.
                </p>
              </div>

              {/* OpenRouter Key - UM KEY, 400+ MODELOS */}
              <div className="p-3 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border border-purple-500/30 rounded-lg space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-medium text-purple-300">
                  <Key size={12} />
                  OpenRouter API Key (400+ modelos com 1 chave)
                  {hasOpenRouter && <Check size={12} className="text-emerald-400" />}
                  <span className="text-[9px] px-1.5 py-0.5 bg-purple-500/30 text-purple-200 rounded">MAX MODE</span>
                </label>
                <div className="relative">
                  <input
                    type={showOpenRouterKey ? 'text' : 'password'}
                    value={openrouterKey}
                    onChange={(e) => setOpenRouterKeyLocal(e.target.value)}
                    placeholder="sk-or-v1-..."
                    className="w-full pl-3 pr-10 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 font-mono"
                  />
                  <button onClick={() => setShowOpenRouterKey(!showOpenRouterKey)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showOpenRouterKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  Obter em{' '}
                  <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="text-purple-300 hover:underline">
                    openrouter.ai/keys
                  </a>
                  . Desbloqueia: <b>GPT-5.4</b>, <b>Grok 4</b>, <b>Llama 4 Behemoth</b>, <b>Qwen 3.5 Max</b>, <b>Mistral 3</b>, <b>DeepSeek-R1</b>, <b>Kimi K2</b>, OpenAI o3, e +400 modelos com uma unica chave. Pay-per-use.
                </p>
              </div>

              <div className="flex items-center gap-2 text-[11px] p-2 bg-slate-900/50 rounded-lg">
                <Wand2 size={11} className={autoRouterEnabled ? 'text-purple-400' : 'text-slate-500'} />
                <div className="flex-1">
                  <div className="text-slate-300">Auto-Router de Agentes</div>
                  <div className="text-[10px] text-slate-500">Roteia mensagens para o agente ideal</div>
                </div>
                <input type="checkbox" checked={autoRouterEnabled} onChange={(e) => setAutoRouter(e.target.checked)} className="w-4 h-4 accent-purple-500" />
              </div>
            </>
          )}

          {/* TAB: MODELS */}
          {activeTab === 'models' && (
            <>
              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoModel}
                    onChange={(e) => setAutoModel(e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-purple-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <Brain size={12} className="text-purple-400" />
                      <span className="text-xs font-semibold text-purple-300">Auto-Select Model (recomendado)</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Escolhe automaticamente o melhor modelo para cada tarefa (estilo Perplexity MAX).
                      Ex: SEO → Gemini Research, Copy → Claude Creative, Design → Gemini Image Gen.
                    </p>
                  </div>
                </label>
              </div>

              {!autoModel && (
                <div className="space-y-3">
                  <p className="text-[10px] text-slate-500">Escolha manualmente um modelo para todas as requisicoes:</p>

                  {Object.entries(modelsByCategory).map(([cat, models]) => {
                    const catInfo = MODEL_CATEGORIES[cat as keyof typeof MODEL_CATEGORIES];
                    return (
                      <div key={cat}>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span>{catInfo.icon}</span>
                          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: catInfo.color }}>
                            {catInfo.label}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {models.map((m) => {
                            const isSelected = selectedModelId === m.id;
                            const disabled =
                              (m.provider === 'claude' && !hasClaude) ||
                              (m.provider === 'gemini' && !hasGemini) ||
                              (m.provider === 'openrouter' && !hasOpenRouter);
                            return (
                              <button
                                key={m.id}
                                onClick={() => !disabled && setSelectedModelIdLocal(m.id)}
                                disabled={disabled}
                                className={`w-full text-left p-2 rounded-md border transition-all ${
                                  isSelected
                                    ? 'bg-red-500/10 border-red-500/40 ring-1 ring-red-500/30'
                                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                                } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                              >
                                <div className="flex items-start gap-2">
                                  <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${m.provider === 'claude' ? 'bg-orange-400' : 'bg-blue-400'}`} />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-xs font-medium text-slate-200">{m.label}</span>
                                      {m.supportsExtendedThinking && <Brain size={10} className="text-amber-400" />}
                                      {m.supportsImageGen && <Palette size={10} className="text-pink-400" />}
                                      <span className="text-[9px] text-slate-600">
                                        ${'$'.repeat(m.costTier)}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-0.5">{m.description}</p>
                                    <p className="text-[9px] text-slate-600 mt-0.5">Ideal: {m.idealFor.slice(0, 3).join(', ')}</p>
                                    {disabled && (
                                      <p className="text-[9px] text-amber-500 mt-0.5">
                                        Requer {m.provider === 'claude' ? 'Claude' : m.provider === 'gemini' ? 'Gemini' : 'OpenRouter'} key
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {autoModel && (
                <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
                  <p className="text-[11px] text-slate-400 mb-2">Logica Auto-Select:</p>
                  <ul className="text-[10px] text-slate-500 space-y-1">
                    <li>• <b>Agente 05 + "gerar imagem"</b> → Gemini 2.5 Flash Image</li>
                    <li>• <b>Agente 14 (SEO) ou pesquisa</b> → Gemini 2.5 Pro (Google Search)</li>
                    <li>• <b>Agente 13 (Dados & BI)</b> → Sonnet 4.5 Data Analyst</li>
                    <li>• <b>Agente 01 (Mestre)</b> → Opus 4.5 Strategist (TOC)</li>
                    <li>• <b>Copy (Agentes 08/09)</b> → Opus 4.5 Creative Powerhouse</li>
                    <li>• <b>Diagnosticos complexos</b> → Opus 4.5 + Extended Thinking</li>
                    <li>• <b>Legendas/hashtags</b> → Haiku 4.5 (rapido)</li>
                    <li>• <b>Default</b> → Claude Sonnet 4.5 (balanced)</li>
                  </ul>
                </div>
              )}
            </>
          )}

          {/* TAB: ACCOUNT */}
          {activeTab === 'account' && (
            <>
              <div className="grid grid-cols-2 gap-1.5">
                <Stat label="Clientes" value={clients.length} />
                <Stat label="Mensagens" value={totalMessages} />
                <Stat label="Tarefas" value={tasks.length} />
                <Stat label="Favoritos" value={bookmarks.size} />
              </div>

              <div className="pt-3 border-t border-slate-800">
                <h3 className="text-[11px] font-semibold text-slate-400 mb-2">Exportar Dados</h3>
                <button
                  onClick={() => { exportClientsCSV(clients); toast.success('Clientes exportados'); }}
                  disabled={clients.length === 0}
                  className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 disabled:opacity-40 rounded-md transition-colors"
                >
                  <Download size={11} />
                  Exportar Clientes (CSV)
                </button>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <h3 className="text-[11px] font-semibold text-red-400 mb-2">Zona Perigo</h3>
                <button
                  onClick={handleClearAll}
                  className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-md transition-colors"
                >
                  <Trash2 size={11} />
                  Limpar dados locais e sair
                </button>
              </div>
            </>
          )}

          {/* TAB: SHORTCUTS */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-1 text-[11px]">
              <Shortcut label="Command Palette" keys="Ctrl+Shift+P" />
              <Shortcut label="Biblioteca de Prompts" keys="Ctrl+L" />
              <Shortcut label="Buscar" keys="Ctrl+K" />
              <Shortcut label="Overview" keys="Ctrl+O" />
              <Shortcut label="View Chat" keys="Ctrl+Shift+C" />
              <Shortcut label="View Kanban" keys="Ctrl+Shift+K" />
              <Shortcut label="View Analytics" keys="Ctrl+Shift+A" />
              <Shortcut label="View Documents" keys="Ctrl+Shift+D" />
              <Shortcut label="Agente 1-9" keys="Ctrl+1..9" />
              <Shortcut label="Enviar" keys="Enter" />
              <Shortcut label="Nova linha" keys="Shift+Enter" />
              <Shortcut label="Fechar modal" keys="Esc" />
            </div>
          )}
        </div>

        <div className="flex gap-2 px-4 py-3 border-t border-slate-700 bg-[#111118]">
          <button onClick={onClose} className="flex-1 px-3 py-2 text-xs text-slate-400 bg-slate-800 rounded-lg hover:bg-slate-700">
            Cancelar
          </button>
          <button onClick={handleSave} className="flex-1 px-3 py-2 text-xs text-white bg-red-600 rounded-lg hover:bg-red-500">
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="p-2 bg-slate-900/50 rounded-md">
    <div className="text-[10px] text-slate-500">{label}</div>
    <div className="text-sm font-bold text-slate-200">{value}</div>
  </div>
);

const Shortcut: React.FC<{ label: string; keys: string }> = ({ label, keys }) => (
  <div className="flex justify-between py-0.5">
    <span className="text-slate-500">{label}</span>
    <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 font-mono text-[9px]">{keys}</kbd>
  </div>
);
