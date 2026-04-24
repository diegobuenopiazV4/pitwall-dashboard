import { useEffect } from 'react';
import { useAppStore } from '../stores/app-store';
import { AGENTS } from '../lib/agents/agents-data';
import toast from 'react-hot-toast';

/**
 * Atalhos globais de teclado estilo Cursor/Linear/Notion.
 *
 * Cmd/Ctrl + N        Nova conversa
 * Cmd/Ctrl + K        Busca global (mensagens)
 * Cmd/Ctrl + /        Abrir slash commands
 * Cmd/Ctrl + .        Settings
 * Cmd/Ctrl + Shift+P  Command palette
 * Cmd/Ctrl + Shift+F  Busca em mensagens
 * Cmd/Ctrl + Shift+W  Workspaces
 * Cmd/Ctrl + Shift+L  Library
 * Cmd/Ctrl + 1..9     Selecionar agente 01-09
 * Cmd/Ctrl + Alt + 0  Agente 10
 *
 * Home/End            Scroll chat topo/fim (quando foco nao e input)
 */
export function useGlobalShortcuts() {
  const {
    createNewThread, setCommandPaletteOpen, setGlobalSearchOpen, setAccountsOpen,
    setLibraryOpen, selectAgent,
  } = useAppStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;
      const isTyping = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName);
      const key = e.key.toLowerCase();

      // Cmd+N nova conversa
      if (isMod && !e.shiftKey && !e.altKey && key === 'n') {
        e.preventDefault();
        createNewThread();
        toast.success('Nova conversa', { icon: '\u2728', duration: 1500 });
        return;
      }

      // Cmd+/ sinaliza para o ChatArea abrir slash menu
      if (isMod && !e.shiftKey && !e.altKey && (key === '/' || key === '\\')) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('pitwall:open-slash'));
        return;
      }

      // Cmd+. settings
      if (isMod && !e.shiftKey && !e.altKey && key === '.') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('pitwall:open-settings'));
        return;
      }

      // Cmd+K busca global
      if (isMod && !e.shiftKey && !e.altKey && key === 'k' && !isTyping) {
        e.preventDefault();
        setGlobalSearchOpen(true);
        return;
      }

      // Cmd+Shift+P palette
      if (isMod && e.shiftKey && key === 'p') {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      // Cmd+Shift+F busca mensagens
      if (isMod && e.shiftKey && key === 'f') {
        e.preventDefault();
        setGlobalSearchOpen(true);
        return;
      }

      // Cmd+Shift+W workspaces
      if (isMod && e.shiftKey && key === 'w') {
        e.preventDefault();
        setAccountsOpen(true);
        return;
      }

      // Cmd+Shift+L library
      if (isMod && e.shiftKey && key === 'l') {
        e.preventDefault();
        setLibraryOpen(true);
        return;
      }

      // Cmd+1..9 selecionar agente
      if (isMod && !e.shiftKey && !e.altKey && /^[1-9]$/.test(e.key)) {
        e.preventDefault();
        const agentId = `0${e.key}`;
        if (AGENTS.find((a) => a.id === agentId)) {
          selectAgent(agentId);
          const agent = AGENTS.find((a) => a.id === agentId);
          toast.success(`Agente ${agent?.name}`, { duration: 1200 });
        }
        return;
      }

      // Cmd+Alt+0..6 agentes 10-16
      if (isMod && e.altKey && /^[0-6]$/.test(e.key)) {
        e.preventDefault();
        const agentId = `1${e.key}`;
        if (AGENTS.find((a) => a.id === agentId)) {
          selectAgent(agentId);
          const agent = AGENTS.find((a) => a.id === agentId);
          toast.success(`Agente ${agent?.name}`, { duration: 1200 });
        }
        return;
      }

      // Home/End para scroll chat (so quando nao esta digitando)
      if (!isTyping) {
        if (key === 'home' && !e.shiftKey) {
          const c = document.getElementById('chat-messages-container');
          c?.scrollTo({ top: 0, behavior: 'smooth' });
        }
        if (key === 'end' && !e.shiftKey) {
          const c = document.getElementById('chat-messages-container');
          if (c) c.scrollTo({ top: c.scrollHeight, behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [createNewThread, setCommandPaletteOpen, setGlobalSearchOpen, setAccountsOpen, setLibraryOpen, selectAgent]);
}
