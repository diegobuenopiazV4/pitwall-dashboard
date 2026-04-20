import React, { useState, useEffect } from 'react';
import { X, Key, Eye, EyeOff, Info, Wand2, Download, Trash2, Sparkles, Bot } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../../stores/app-store';
import { exportClientsCSV } from '../../lib/documents/xlsx-export';
import {
  getProviderStatus,
  setProvider,
  setClaudeKey as saveClaudeKey,
  setGeminiKey as saveGeminiKey,
  setClaudeModel as saveClaudeModel,
  setGeminiModel as saveGeminiModel,
  getClaudeKey,
  getGeminiKey,
} from '../../lib/ai/chat-provider';
import { CLAUDE_MODELS, GEMINI_MODELS, type AIProvider, type ClaudeModel, type GeminiModel } from '../../lib/ai/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<Props> = ({ open, onClose }) => {
  const { autoRouterEnabled, setAutoRouter, clients, messages, tasks, bookmarks, logout } = useAppStore();
  const [provider, setProviderLocal] = useState<AIProvider>('claude');
  const [claudeKey, setClaudeKeyLocal] = useState('');
  const [claudeModel, setClaudeModelLocal] = useState<ClaudeModel>('claude-sonnet-4-5');
  const [geminiKey, setGeminiKeyLocal] = useState('');
  const [geminiModel, setGeminiModelLocal] = useState<GeminiModel>('gemini-2.0-flash');
  const [showClaudeKey, setShowClaudeKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);

  useEffect(() => {
    if (open) {
      const status = getProviderStatus();
      setProviderLocal(status.provider === 'offline' ? 'claude' : status.provider);
      setClaudeKeyLocal(getClaudeKey());
      setGeminiKeyLocal(getGeminiKey());
      setClaudeModelLocal(status.claudeModel);
      setGeminiModelLocal(status.geminiModel);
    }
  }, [open]);

  const handleSave = () => {
    saveClaudeKey(claudeKey.trim());
    saveGeminiKey(geminiKey.trim());
    saveClaudeModel(claudeModel);
    saveGeminiModel(geminiModel);
    setProvider(provider);
    toast.success('Configuracoes salvas');
    onClose();
  };

  const handleClearAll = () => {
    if (!confirm('Tem certeza? Isso vai sair da conta e limpar todos os dados locais (mensagens em memoria serao perdidas).')) return;
    localStorage.clear();
    logout();
    toast.success('Dados limpos');
    onClose();
  };

  const totalMessages = Object.values(messages).flat().length;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg max-h-[90vh] bg-[#1a1a24] border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <h2 className="text-sm font-semibold text-slate-200">Configuracoes</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Provider Selector */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-2">
              <Bot size={12} />
              Provider de IA
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setProviderLocal('claude')}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs rounded-lg transition-all ${
                  provider === 'claude'
                    ? 'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/40'
                    : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                }`}
              >
                <Sparkles size={12} />
                Claude (Anthropic)
              </button>
              <button
                onClick={() => setProviderLocal('gemini')}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs rounded-lg transition-all ${
                  provider === 'gemini'
                    ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/40'
                    : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                }`}
              >
                <Sparkles size={12} />
                Gemini (Google)
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5">
              Escolha qual IA usar para as respostas dos agentes.
            </p>
          </div>

          {/* Claude Config */}
          {provider === 'claude' && (
            <div className="p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg space-y-2.5">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-orange-400 mb-1.5">
                  <Key size={12} />
                  Claude API Key
                </label>
                <div className="relative">
                  <input
                    type={showClaudeKey ? 'text' : 'password'}
                    value={claudeKey}
                    onChange={(e) => setClaudeKeyLocal(e.target.value)}
                    placeholder="sk-ant-api03-..."
                    className="w-full pl-3 pr-10 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-orange-500/50 font-mono"
                  />
                  <button
                    onClick={() => setShowClaudeKey(!showClaudeKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showClaudeKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <p className="flex items-start gap-1 mt-1.5 text-[10px] text-slate-500">
                  <Info size={10} className="mt-0.5 shrink-0" />
                  <span>
                    Obtenha em{' '}
                    <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                      console.anthropic.com
                    </a>
                    {' '}(Settings → API Keys → Create Key).
                  </span>
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 mb-1 block">Modelo Claude</label>
                <select
                  value={claudeModel}
                  onChange={(e) => setClaudeModelLocal(e.target.value as ClaudeModel)}
                  className="w-full px-2 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-md text-slate-200"
                >
                  {Object.entries(CLAUDE_MODELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Gemini Config */}
          {provider === 'gemini' && (
            <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg space-y-2.5">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-blue-400 mb-1.5">
                  <Key size={12} />
                  Gemini API Key
                </label>
                <div className="relative">
                  <input
                    type={showGeminiKey ? 'text' : 'password'}
                    value={geminiKey}
                    onChange={(e) => setGeminiKeyLocal(e.target.value)}
                    placeholder="AIza..."
                    className="w-full pl-3 pr-10 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 font-mono"
                  />
                  <button
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showGeminiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <p className="flex items-start gap-1 mt-1.5 text-[10px] text-slate-500">
                  <Info size={10} className="mt-0.5 shrink-0" />
                  <span>
                    Obtenha em{' '}
                    <a href="https://ai.google.dev" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                      ai.google.dev
                    </a>
                    {' '}(gratis).
                  </span>
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 mb-1 block">Modelo Gemini</label>
                <select
                  value={geminiModel}
                  onChange={(e) => setGeminiModelLocal(e.target.value as GeminiModel)}
                  className="w-full px-2 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-md text-slate-200"
                >
                  {Object.entries(GEMINI_MODELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Feature Toggles */}
          <div className="pt-3 border-t border-slate-800">
            <h3 className="text-[11px] font-semibold text-slate-400 mb-2">Features</h3>
            <div className="space-y-2">
              <label className="flex items-center justify-between gap-2 p-2 bg-slate-900/50 rounded-lg cursor-pointer hover:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <Wand2 size={14} className="text-purple-400" />
                  <div>
                    <div className="text-xs text-slate-300">Auto-Router</div>
                    <div className="text-[10px] text-slate-500">Roteia mensagens para o agente ideal automaticamente</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoRouterEnabled}
                  onChange={(e) => setAutoRouter(e.target.checked)}
                  className="w-4 h-4 accent-purple-500"
                />
              </label>
            </div>
          </div>

          {/* Stats */}
          <div className="pt-3 border-t border-slate-800">
            <h3 className="text-[11px] font-semibold text-slate-400 mb-2">Sua Conta</h3>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <div className="p-2 bg-slate-900/50 rounded-md">
                <div className="text-slate-500">Clientes</div>
                <div className="text-sm font-bold text-slate-200">{clients.length}</div>
              </div>
              <div className="p-2 bg-slate-900/50 rounded-md">
                <div className="text-slate-500">Mensagens</div>
                <div className="text-sm font-bold text-slate-200">{totalMessages}</div>
              </div>
              <div className="p-2 bg-slate-900/50 rounded-md">
                <div className="text-slate-500">Tarefas</div>
                <div className="text-sm font-bold text-slate-200">{tasks.length}</div>
              </div>
              <div className="p-2 bg-slate-900/50 rounded-md">
                <div className="text-slate-500">Favoritos</div>
                <div className="text-sm font-bold text-slate-200">{bookmarks.size}</div>
              </div>
            </div>
          </div>

          {/* Exports */}
          <div className="pt-3 border-t border-slate-800">
            <h3 className="text-[11px] font-semibold text-slate-400 mb-2">Exportar Dados</h3>
            <button
              onClick={() => {
                exportClientsCSV(clients);
                toast.success('Clientes exportados');
              }}
              disabled={clients.length === 0}
              className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 disabled:opacity-40 rounded-md transition-colors"
            >
              <Download size={11} />
              Exportar Clientes (CSV)
            </button>
          </div>

          {/* Shortcuts */}
          <div className="pt-3 border-t border-slate-800">
            <h3 className="text-[11px] font-semibold text-slate-400 mb-2">Atalhos de Teclado</h3>
            <div className="space-y-1 text-[10px]">
              <Shortcut label="Command Palette" keys="Ctrl+Shift+P" />
              <Shortcut label="Biblioteca de Prompts" keys="Ctrl+L" />
              <Shortcut label="Buscar" keys="Ctrl+K" />
              <Shortcut label="Overview" keys="Ctrl+O" />
              <Shortcut label="View Kanban" keys="Ctrl+Shift+K" />
              <Shortcut label="View Analytics" keys="Ctrl+Shift+A" />
              <Shortcut label="View Documents" keys="Ctrl+Shift+D" />
              <Shortcut label="Agente 1-9" keys="Ctrl+1..9" />
            </div>
          </div>

          {/* Danger Zone */}
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
        </div>

        <div className="flex gap-2 px-4 py-3 border-t border-slate-700 bg-[#111118]">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 text-xs text-slate-400 bg-slate-800 rounded-lg hover:bg-slate-700"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-3 py-2 text-xs text-white bg-red-600 rounded-lg hover:bg-red-500"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

const Shortcut: React.FC<{ label: string; keys: string }> = ({ label, keys }) => (
  <div className="flex justify-between">
    <span className="text-slate-500">{label}</span>
    <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 font-mono text-[9px]">{keys}</kbd>
  </div>
);
