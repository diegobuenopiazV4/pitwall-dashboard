import React, { lazy, Suspense } from 'react';
import { Sidebar } from '../sidebar/Sidebar';
import { ChatArea } from '../chat/ChatArea';
import { ContextPanel } from '../context/ContextPanel';
import { Header } from './Header';
import { ViewSwitcher } from './ViewSwitcher';
import { SearchModal } from '../modals/SearchModal';
import { OverviewModal } from '../modals/OverviewModal';
import { CommandPalette } from '../modals/CommandPalette';
import { OnboardingBanner } from '../auth/OnboardingBanner';
import { ClientDocsModal } from '../modals/ClientDocsModal';
import { GlobalSearchModal } from '../modals/GlobalSearchModal';
import { AccountSwitcherModal } from '../modals/AccountSwitcher';
import { useAppStore } from '../../stores/app-store';

// Lazy load views pesadas (code splitting)
const KanbanView = lazy(() => import('../views/KanbanView').then((m) => ({ default: m.KanbanView })));
const AnalyticsView = lazy(() => import('../views/AnalyticsView').then((m) => ({ default: m.AnalyticsView })));
const DocumentsView = lazy(() => import('../views/DocumentsView').then((m) => ({ default: m.DocumentsView })));
const CheckinView = lazy(() => import('../views/CheckinView').then((m) => ({ default: m.CheckinView })));
const PromptLibrary = lazy(() => import('../library/PromptLibrary').then((m) => ({ default: m.PromptLibrary })));

const ViewLoader: React.FC = () => (
  <div className="flex-1 flex items-center justify-center bg-[#0a0a0f]">
    <div className="flex flex-col items-center gap-2">
      <div className="w-8 h-8 border-2 border-slate-700 border-t-red-500 rounded-full animate-spin" />
      <p className="text-[10px] text-slate-500">Carregando view...</p>
    </div>
  </div>
);

export const AppLayout: React.FC = () => {
  const {
    searchOpen, overviewOpen, commandPaletteOpen, libraryOpen, clientDocsOpen,
    globalSearchOpen, accountsOpen,
    viewMode, setLibraryOpen, setCommandPaletteOpen,
    setAnalyticsOpen, setSearchOpen, setOverviewOpen, setClientDocsOpen,
    setGlobalSearchOpen, setAccountsOpen,
    setViewMode,
  } = useAppStore();

  const renderView = () => {
    switch (viewMode) {
      case 'kanban':
        return (
          <Suspense fallback={<ViewLoader />}>
            <KanbanView />
          </Suspense>
        );
      case 'analytics':
        return (
          <Suspense fallback={<ViewLoader />}>
            <AnalyticsView />
          </Suspense>
        );
      case 'documents':
        return (
          <Suspense fallback={<ViewLoader />}>
            <DocumentsView />
          </Suspense>
        );
      case 'checkin':
        return (
          <Suspense fallback={<ViewLoader />}>
            <CheckinView />
          </Suspense>
        );
      default:
        return <ChatArea />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0f] text-slate-200">
      <Header />
      <OnboardingBanner />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <ViewSwitcher />
          {renderView()}
        </div>
        {viewMode === 'chat' && <ContextPanel />}
      </div>
      {searchOpen && <SearchModal />}
      {overviewOpen && <OverviewModal />}
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelectPrompt={(prompt) => {
          const evt = new CustomEvent('pitwall:inject-prompt', { detail: { prompt } });
          window.dispatchEvent(evt);
          setViewMode('chat');
        }}
        onOpenLibrary={() => setLibraryOpen(true)}
        onOpenSettings={() => {
          const evt = new CustomEvent('pitwall:open-settings');
          window.dispatchEvent(evt);
        }}
        onOpenAnalytics={() => {
          setAnalyticsOpen(true);
          setViewMode('analytics');
        }}
      />
      {libraryOpen && (
        <Suspense fallback={null}>
          <PromptLibrary
            open={libraryOpen}
            onClose={() => setLibraryOpen(false)}
            onSelect={(prompt) => {
              const evt = new CustomEvent('pitwall:inject-prompt', { detail: { prompt } });
              window.dispatchEvent(evt);
              setViewMode('chat');
            }}
          />
        </Suspense>
      )}
      <ClientDocsModal open={clientDocsOpen} onClose={() => setClientDocsOpen(false)} />
      <GlobalSearchModal open={globalSearchOpen} onClose={() => setGlobalSearchOpen(false)} />
      <AccountSwitcherModal open={accountsOpen} onClose={() => setAccountsOpen(false)} />
    </div>
  );
};
