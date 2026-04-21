import React, { useState, useEffect } from 'react';
import { X, Sparkles, ExternalLink, Key, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../stores/app-store';
import { getProviderStatus } from '../../lib/ai/chat-provider';

const DISMISSED_KEY = 'v4_pitwall_onboarding_dismissed';

export const OnboardingBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISSED_KEY) === 'true');
  const [providerStatus, setProviderStatus] = useState(() => getProviderStatus());

  useEffect(() => {
    // Refresh provider status every time settings may have changed
    const interval = setInterval(() => {
      setProviderStatus(getProviderStatus());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISSED_KEY, 'true');
  };

  const handleOpenSettings = () => {
    const evt = new CustomEvent('pitwall:open-settings');
    window.dispatchEvent(evt);
  };

  // Hide if dismissed OR if user already has Claude/Gemini configured
  if (dismissed || providerStatus.provider !== 'offline') return null;

  return (
    <div className="relative bg-gradient-to-r from-orange-500/10 via-red-500/10 to-purple-500/10 border-b border-orange-500/20 px-4 py-2.5">
      <div className="flex items-center gap-3 max-w-5xl mx-auto">
        <Sparkles size={16} className="text-orange-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-200">
            <span className="font-semibold">Modo offline ativo.</span>{' '}
            <span className="text-slate-400">
              Para respostas com IA real, adicione sua Claude API key em Configuracoes.
            </span>
          </p>
        </div>
        <a
          href="https://console.anthropic.com/settings/keys"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 px-2 py-1 text-[11px] text-blue-400 hover:text-blue-300 hidden sm:flex"
        >
          Criar Claude key
          <ExternalLink size={10} />
        </a>
        <button
          onClick={handleOpenSettings}
          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-white bg-orange-500/80 hover:bg-orange-500 rounded-md transition-colors shrink-0"
        >
          <Key size={11} />
          Configurar
          <ArrowRight size={11} />
        </button>
        <button
          onClick={handleDismiss}
          className="p-1 text-slate-500 hover:text-slate-300 shrink-0"
          title="Dispensar"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
