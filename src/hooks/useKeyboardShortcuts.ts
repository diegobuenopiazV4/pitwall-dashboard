import { useEffect } from 'react';
import { useAppStore } from '../stores/app-store';
import { AGENTS } from '../lib/agents/agents-data';

export function useKeyboardShortcuts() {
  const {
    setSearchOpen, setOverviewOpen, selectAgent,
    setCommandPaletteOpen, setLibraryOpen, setViewMode,
  } = useAppStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+Shift+P : Command Palette
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }
      // Ctrl+L : Prompt Library
      if (e.ctrlKey && e.key.toLowerCase() === 'l' && !e.shiftKey) {
        e.preventDefault();
        setLibraryOpen(true);
        return;
      }
      // Ctrl+K : Search
      if (e.ctrlKey && e.key.toLowerCase() === 'k' && !e.shiftKey) {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }
      // Ctrl+O : Overview
      if (e.ctrlKey && e.key.toLowerCase() === 'o' && !e.shiftKey) {
        e.preventDefault();
        setOverviewOpen(true);
        return;
      }
      // Ctrl+Shift+K : Kanban view
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setViewMode('kanban');
        return;
      }
      // Ctrl+Shift+A : Analytics view
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setViewMode('analytics');
        return;
      }
      // Ctrl+Shift+D : Documents view
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setViewMode('documents');
        return;
      }
      // Ctrl+Shift+C : Chat view
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setViewMode('chat');
        return;
      }
      // Ctrl+1..9 : Select agent
      if (e.ctrlKey && !e.shiftKey && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const idx = parseInt(e.key) - 1;
        if (AGENTS[idx]) selectAgent(AGENTS[idx].id);
        return;
      }
      // Escape : close modals
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setOverviewOpen(false);
        setCommandPaletteOpen(false);
        setLibraryOpen(false);
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [setSearchOpen, setOverviewOpen, selectAgent, setCommandPaletteOpen, setLibraryOpen, setViewMode]);
}
