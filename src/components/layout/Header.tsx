import React, { useState, useEffect } from 'react';
import { Search, BarChart3, Settings, LogOut, Command, Zap, Plug, DollarSign, Building2, FileSearch } from 'lucide-react';
import { useAppStore } from '../../stores/app-store';
import { supabase } from '../../lib/supabase/client';
import { SettingsModal } from '../modals/SettingsModal';
import { ChainModal } from '../modals/ChainModal';
import { IntegrationsModal } from '../modals/IntegrationsModal';
import { UsageDashboardModal } from '../modals/UsageDashboardModal';
import { ExportConversation } from '../chat/ExportConversation';

export const Header: React.FC = () => {
  const { userName, setSearchOpen, setOverviewOpen, setCommandPaletteOpen, setGlobalSearchOpen, setAccountsOpen, logout, viewMode } = useAppStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chainOpen, setChainOpen] = useState(false);
  const [integrationsOpen, setIntegrationsOpen] = useState(false);
  const [usageOpen, setUsageOpen] = useState(false);

  useEffect(() => {
    const handler = () => setSettingsOpen(true);
    window.addEventListener('pitwall:open-settings', handler);
    return () => window.removeEventListener('pitwall:open-settings', handler);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
  };

  return (
    <>
      <header className="flex items-center justify-between px-4 py-2 bg-[#111118] border-b border-slate-800">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold tracking-tight">
            <span className="text-red-500">V4</span>{' '}
            <span className="text-slate-300">PIT WALL</span>
          </h1>
          <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded">v5.2</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-slate-400 bg-slate-800/50 rounded-md hover:bg-slate-700 transition-colors"
            title="Command Palette (Ctrl+Shift+P)"
          >
            <Command size={12} />
            <span className="hidden sm:inline">Palette</span>
            <kbd className="hidden md:inline text-[9px] px-1 py-0.5 bg-slate-700 rounded">⌘⇧P</kbd>
          </button>

          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-slate-400 bg-slate-800/50 rounded-md hover:bg-slate-700 transition-colors"
            title="Buscar (Ctrl+K)"
          >
            <Search size={12} />
            <span className="hidden lg:inline">Buscar</span>
          </button>

          <button
            onClick={() => setGlobalSearchOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-amber-400 bg-amber-500/10 rounded-md hover:bg-amber-500/20 transition-colors"
            title="Buscar em mensagens (Ctrl+Shift+F)"
          >
            <FileSearch size={12} />
            <span className="hidden lg:inline">Msgs</span>
          </button>

          <button
            onClick={() => setAccountsOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-purple-400 bg-purple-500/10 rounded-md hover:bg-purple-500/20 transition-colors"
            title="Workspaces (Ctrl+Shift+W)"
          >
            <Building2 size={12} />
            <span className="hidden lg:inline">Workspace</span>
          </button>

          <button
            onClick={() => setChainOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-purple-400 bg-purple-500/10 rounded-md hover:bg-purple-500/20 transition-colors"
            title="Multi-Agent Chain"
          >
            <Zap size={12} />
            <span className="hidden lg:inline">Chain</span>
          </button>

          <button
            onClick={() => setOverviewOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-slate-400 bg-slate-800/50 rounded-md hover:bg-slate-700 transition-colors"
            title="Overview (Ctrl+O)"
          >
            <BarChart3 size={12} />
            <span className="hidden lg:inline">Overview</span>
          </button>

          {viewMode === 'chat' && <ExportConversation />}

          <button
            onClick={() => setUsageOpen(true)}
            className="p-1.5 text-slate-500 hover:text-emerald-400 transition-colors"
            title="Custos e uso de tokens"
          >
            <DollarSign size={14} />
          </button>

          <button
            onClick={() => setIntegrationsOpen(true)}
            className="p-1.5 text-slate-500 hover:text-purple-400 transition-colors"
            title="Integracoes (Ekyte, Slack, Zapier)"
          >
            <Plug size={14} />
          </button>

          <button
            onClick={() => setSettingsOpen(true)}
            className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors"
            title="Configuracoes"
          >
            <Settings size={14} />
          </button>

          <div className="w-px h-5 bg-slate-700 mx-1" />
          <span className="text-xs text-slate-500 max-w-[120px] truncate">{userName}</span>
          <button
            onClick={handleLogout}
            className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
            title="Sair"
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ChainModal open={chainOpen} onClose={() => setChainOpen(false)} />
      <IntegrationsModal open={integrationsOpen} onClose={() => setIntegrationsOpen(false)} />
      <UsageDashboardModal open={usageOpen} onClose={() => setUsageOpen(false)} />
    </>
  );
};
