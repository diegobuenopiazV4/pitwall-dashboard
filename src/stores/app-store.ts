import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Agent, Client, Message, Task, PromptParams } from '../lib/agents/types';
import { AGENTS } from '../lib/agents/agents-data';
import type { ConversationThread } from '../lib/conversations/threads';
import { createThread as createThreadObj, applyMessageToThread, autoGenerateTitle } from '../lib/conversations/threads';

// 'analytics' foi removido da UI mas type mantido para compat com localStorage legacy
export type ViewMode = 'chat' | 'kanban' | 'analytics' | 'documents' | 'checkin' | 'trafego' | 'clipping' | 'criativos' | 'ekyte' | 'skills';

interface AppState {
  // Auth
  userId: string | null;
  userName: string;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Selection
  currentAgent: Agent | null;
  currentClient: Client | null;
  sidebarTab: 'conversas' | 'agents' | 'clients' | 'tasks' | 'sprint';
  viewMode: ViewMode;

  // Data
  agents: Agent[];
  clients: Client[];
  messages: Record<string, Message[]>;
  tasks: Task[];
  bookmarks: Set<string>;

  // Conversation Threads (multiplas conversas por cliente)
  threads: ConversationThread[];
  currentThreadId: string | null;

  // Sprint
  sprintWeek: string;
  sprintGoals: string[];

  // Prompt params
  ppFlags: PromptParams;

  // Power features
  autoRouterEnabled: boolean;
  chainMode: boolean;
  deepMode: boolean;            // DEEP MODE: 3-pass generation para respostas 6k-20k palavras

  // UI
  streaming: boolean;
  searchOpen: boolean;
  overviewOpen: boolean;
  commandPaletteOpen: boolean;
  libraryOpen: boolean;
  analyticsOpen: boolean;
  documentsLibraryOpen: boolean;
  clientDocsOpen: boolean;
  globalSearchOpen: boolean;
  accountsOpen: boolean;

  // Client docs cache (per client)
  clientDocs: Record<string, any[]>;

  // Actions
  setAuth: (userId: string, userName: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  selectAgent: (agentId: string) => void;
  selectClient: (client: Client | null) => void;
  setSidebarTab: (tab: 'agents' | 'clients' | 'tasks' | 'sprint') => void;
  setViewMode: (mode: ViewMode) => void;
  setClients: (clients: Client[]) => void;
  addClient: (client: Client) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  addMessage: (key: string, message: Message) => void;
  setMessages: (key: string, messages: Message[]) => void;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  toggleTask: (taskId: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  setSprintWeek: (week: string) => void;
  setSprintGoals: (goals: string[]) => void;
  togglePPFlag: (flag: keyof PromptParams) => void;
  toggleBookmark: (messageId: string) => void;
  setAutoRouter: (enabled: boolean) => void;
  setChainMode: (enabled: boolean) => void;
  setDeepMode: (enabled: boolean) => void;
  setStreaming: (streaming: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setOverviewOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setLibraryOpen: (open: boolean) => void;
  setAnalyticsOpen: (open: boolean) => void;
  setDocumentsLibraryOpen: (open: boolean) => void;
  setClientDocsOpen: (open: boolean) => void;
  setClientDocs: (clientId: string, docs: any[]) => void;
  setGlobalSearchOpen: (open: boolean) => void;
  setAccountsOpen: (open: boolean) => void;
  getConvKey: () => string;
  getAllMessages: () => Message[];

  // Thread actions
  createNewThread: (firstMessage?: string) => ConversationThread;
  selectThread: (threadId: string | null) => void;
  renameThread: (threadId: string, newTitle: string) => void;
  deleteThread: (threadId: string) => void;
  toggleThreadStar: (threadId: string) => void;
  toggleThreadArchive: (threadId: string) => void;
  updateThreadAfterMessage: (threadId: string, msg: { content: string; role: 'user' | 'bot' }) => void;
}

export const useAppStore = create<AppState>()(persist((set, get) => ({
  userId: null,
  userName: '',
  isAuthenticated: false,
  isLoading: true,

  currentAgent: AGENTS[0],
  currentClient: null,
  sidebarTab: 'agents',
  viewMode: 'chat',

  agents: AGENTS,
  clients: [],
  messages: {},
  tasks: [],
  bookmarks: new Set(),

  threads: [],
  currentThreadId: null,

  sprintWeek: '',
  sprintGoals: [],

  ppFlags: { fca: true, hist: true, tasks: true, sprint: false, report: false },

  autoRouterEnabled: false,
  chainMode: false,
  deepMode: false, // Default OFF - evita excess de tokens em Groq free tier. User liga DEEP manualmente quando quer resposta 6k-20k palavras

  streaming: false,
  searchOpen: false,
  overviewOpen: false,
  commandPaletteOpen: false,
  libraryOpen: false,
  analyticsOpen: false,
  documentsLibraryOpen: false,
  clientDocsOpen: false,
  globalSearchOpen: false,
  accountsOpen: false,
  clientDocs: {},

  setAuth: (userId, userName) => set({ userId, userName, isAuthenticated: true, isLoading: false }),
  logout: () => {
    // Limpa offline auth persistente para nao re-logar sozinho
    try { localStorage.removeItem('v4_pitwall_offline_auth'); } catch {}
    set({
      userId: null, userName: '', isAuthenticated: false,
      clients: [], messages: {}, tasks: [], bookmarks: new Set(),
    });
  },
  setLoading: (isLoading) => set({ isLoading }),

  selectAgent: (agentId) => {
    const agent = AGENTS.find((a) => a.id === agentId) ?? null;
    set({ currentAgent: agent });
  },
  selectClient: (client) => set({ currentClient: client }),
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
  setViewMode: (mode) => set({ viewMode: mode }),

  setClients: (clients) => set({ clients }),
  addClient: (client) => set((s) => ({ clients: [...s.clients, client] })),
  updateClient: (id, updates) =>
    set((s) => ({
      clients: s.clients.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),

  addMessage: (key, message) =>
    set((s) => ({
      messages: { ...s.messages, [key]: [...(s.messages[key] ?? []), message] },
    })),
  setMessages: (key, messages) =>
    set((s) => ({ messages: { ...s.messages, [key]: messages } })),

  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((s) => ({ tasks: [...s.tasks, task] })),
  toggleTask: (taskId) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
    })),
  updateTask: (id, updates) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t)),
    })),

  setSprintWeek: (sprintWeek) => set({ sprintWeek }),
  setSprintGoals: (sprintGoals) => set({ sprintGoals }),

  togglePPFlag: (flag) =>
    set((s) => ({ ppFlags: { ...s.ppFlags, [flag]: !s.ppFlags[flag] } })),

  toggleBookmark: (messageId) =>
    set((s) => {
      const next = new Set(s.bookmarks);
      if (next.has(messageId)) next.delete(messageId);
      else next.add(messageId);
      return { bookmarks: next };
    }),

  setAutoRouter: (autoRouterEnabled) => set({ autoRouterEnabled }),
  setChainMode: (chainMode) => set({ chainMode }),
  setDeepMode: (deepMode) => set({ deepMode }),

  setStreaming: (streaming) => set({ streaming }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setOverviewOpen: (overviewOpen) => set({ overviewOpen }),
  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
  setLibraryOpen: (libraryOpen) => set({ libraryOpen }),
  setAnalyticsOpen: (analyticsOpen) => set({ analyticsOpen }),
  setDocumentsLibraryOpen: (documentsLibraryOpen) => set({ documentsLibraryOpen }),
  setClientDocsOpen: (clientDocsOpen) => set({ clientDocsOpen }),
  setClientDocs: (clientId, docs) => set((s) => ({ clientDocs: { ...s.clientDocs, [clientId]: docs } })),
  setGlobalSearchOpen: (globalSearchOpen) => set({ globalSearchOpen }),
  setAccountsOpen: (accountsOpen) => set({ accountsOpen }),

  getConvKey: () => {
    const { currentAgent, currentClient, currentThreadId } = get();
    // Se ha thread ativa, usa o threadId como chave da conversa
    if (currentThreadId) return `thread_${currentThreadId}`;
    // Caso contrario, legacy: agent+client
    return `${currentAgent?.id ?? '01'}_${currentClient?.id ?? 'general'}`;
  },

  getAllMessages: () => {
    const { messages } = get();
    return Object.values(messages).flat();
  },

  // THREAD ACTIONS
  createNewThread: (firstMessage) => {
    const { userId, currentClient, currentAgent } = get();
    const thread = createThreadObj({
      userId: userId || 'offline',
      clientId: currentClient?.id ?? null,
      agentId: currentAgent?.id ?? '01',
      firstMessage,
    });
    set((s) => ({
      threads: [thread, ...s.threads],
      currentThreadId: thread.id,
    }));
    return thread;
  },

  selectThread: (threadId) => {
    if (!threadId) {
      set({ currentThreadId: null });
      return;
    }
    const { threads, selectAgent, selectClient, clients } = get();
    const thread = threads.find((t) => t.id === threadId);
    if (!thread) return;
    // Ao selecionar thread, tambem muda o agente e cliente atuais para contexto correto
    selectAgent(thread.primaryAgentId);
    if (thread.clientId) {
      const client = clients.find((c) => c.id === thread.clientId);
      if (client) selectClient(client);
    } else {
      selectClient(null);
    }
    set({ currentThreadId: threadId });
  },

  renameThread: (threadId, newTitle) => {
    set((s) => ({
      threads: s.threads.map((t) =>
        t.id === threadId ? { ...t, title: newTitle || autoGenerateTitle(t.title), updatedAt: new Date().toISOString() } : t
      ),
    }));
  },

  deleteThread: (threadId) => {
    set((s) => {
      const messagesCopy = { ...s.messages };
      delete messagesCopy[`thread_${threadId}`];
      return {
        threads: s.threads.filter((t) => t.id !== threadId),
        messages: messagesCopy,
        currentThreadId: s.currentThreadId === threadId ? null : s.currentThreadId,
      };
    });
  },

  toggleThreadStar: (threadId) => {
    set((s) => ({
      threads: s.threads.map((t) => t.id === threadId ? { ...t, starred: !t.starred } : t),
    }));
  },

  toggleThreadArchive: (threadId) => {
    set((s) => ({
      threads: s.threads.map((t) => t.id === threadId ? { ...t, archived: !t.archived } : t),
      currentThreadId: s.currentThreadId === threadId ? null : s.currentThreadId,
    }));
  },

  updateThreadAfterMessage: (threadId, msg) => {
    set((s) => ({
      threads: s.threads.map((t) => t.id === threadId ? applyMessageToThread(t, msg) : t),
    }));
  },
}), {
  name: 'v4-pitwall-store',
  storage: createJSONStorage(() => localStorage),
  // Persiste apenas dados de conteudo; UI state (modals, loading) nao persiste
  partialize: (state) => ({
    clients: state.clients,
    messages: state.messages,
    tasks: state.tasks,
    sprintWeek: state.sprintWeek,
    sprintGoals: state.sprintGoals,
    ppFlags: state.ppFlags,
    autoRouterEnabled: state.autoRouterEnabled,
    chainMode: state.chainMode,
    deepMode: state.deepMode,
    bookmarks: Array.from(state.bookmarks), // Set nao serializa
    threads: state.threads,
    currentThreadId: state.currentThreadId,
    currentAgent: state.currentAgent,
    currentClient: state.currentClient,
    sidebarTab: state.sidebarTab,
    viewMode: state.viewMode,
  }),
  // Restaura bookmarks de array para Set
  onRehydrateStorage: () => (state) => {
    if (state && Array.isArray(state.bookmarks)) {
      state.bookmarks = new Set(state.bookmarks);
    }
  },
}));
