import React, { useState, useEffect } from 'react';
import { Search, Settings, LogOut, Command, FileSearch } from 'lucide-react';
import { useAppStore } from '../../stores/app-store';
import { supabase } from '../../lib/supabase/client';
import { SettingsModal } from '../modals/SettingsModal';
import { ChainModal } from '../modals/ChainModal';
import { IntegrationsModal } from '../modals/IntegrationsModal';
import { UsageDashboardModal } from '../modals/UsageDashboardModal';
import { ExportConversation } from '../chat/ExportConversation';
import { V4Logo } from '../brand/V4Logo';
import { MoreMenu, Building2, Zap, BarChart3, Plug, DollarSign } from './MoreMenu';

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

  // Botoes menos usados consolidados no menu "Mais"
  const moreMenuItems = [
    { label: 'Workspaces', icon: Building2, onClick: () => setAccountsOpen(true), color: '#a855f7' },
    { label: 'Multi-Agent Chain', icon: Zap, onClick: () => setChainOpen(true), color: '#a855f7' },
    { label: 'Overview', icon: BarChart3, onClick: () => setOverviewOpen(true), shortcut: 'Ctrl+O' },
    { label: 'Custos e Tokens', icon: DollarSign, onClick: () => setUsageOpen(true), color: '#10b981' },
    { label: 'Integracoes', icon: Plug, onClick: () => setIntegrationsOpen(true), color: '#a855f7' },
  ];

  return (
    <>
      <header className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-[#0a0a0f] via-[#111118] to-[#0a0a0f] border-b border-[#e4243d]/20 shadow-lg">
        <div className="flex items-center gap-3">
          <V4Logo size="md" showSubtitle={true} showDots={false} />
          <span className="text-[9px] px-1.5 py-0.5 bg-[#e4243d]/10 text-[#e4243d] rounded font-semibold tracking-wider">v5.4</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Botoes primarios - sempre visiveis */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-slate-400 bg-slate-800/50 rounded-md hover:bg-slate-700 transition-colors"
            title="Comandos (Ctrl+Shift+P)"
          >
            <Command size={12} />
            <span className="hidden sm:inline">Comandos</span>
            <kbd className="hidden md:inline text-[9px] px-1 py-0.5 bg-slate-700 rounded">Ctrl+Shift+P</kbd>
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

          {viewMode === 'chat' && <ExportConversation />}

          {/* Menu "Mais" - consolida botoes menos usados */}
          <MoreMenu items={moreMenuItems} />

          {/* Separador */}
          <div className="w-px h-5 bg-slate-700 mx-1" />

          {/* Configuracoes */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors"
            title="Configuracoes"
          >
            <Settings size={14} />
          </button>

          {/* Usuario */}
          <span className="text-xs text-slate-500 max-w-[120px] truncate ml-1">{userName}</span>
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
