import React from 'react';
import { Sidebar } from '../sidebar/Sidebar';
import { ChatArea } from '../chat/ChatArea';
import { ContextPanel } from '../context/ContextPanel';
import { Header } from './Header';
import { ViewSwitcher } from './ViewSwitcher';
import { SearchModal } from '../modals/SearchModal';
import { OverviewModal } from '../modals/OverviewModal';
import { CommandPalette } from '../modals/CommandPalette';
import { PromptLibrary } from '../library/PromptLibrary';
import { KanbanView } from '../views/KanbanView';
import { AnalyticsView } from '../views/AnalyticsView';
import { DocumentsView } from '../views/DocumentsView';
import { useAppStore } from '../../stores/app-store';

export const AppLayout: React.FC = () => {
  const {
    searchOpen, overviewOpen, commandPaletteOpen, libraryOpen,
    viewMode, setLibraryOpen, setCommandPaletteOpen,
    setAnalyticsOpen, setSearchOpen, setOverviewOpen,
    setViewMode,
  } = useAppStore();

  const renderView = () => {
    switch (viewMode) {
      case 'kanban':
        return <KanbanView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'documents':
        return <DocumentsView />;
      default:
        return <ChatArea />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0f] text-slate-200">
      <Header />
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
          // Inject prompt into a text dispatch event
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
      <PromptLibrary
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onSelect={(prompt) => {
          const evt = new CustomEvent('pitwall:inject-prompt', { detail: { prompt } });
          window.dispatchEvent(evt);
          setViewMode('chat');
        }}
      />
    </div>
  );
};
