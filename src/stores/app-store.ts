import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Agent, Client, Message, Task, PromptParams } from '../lib/agents/types';
import { AGENTS } from '../lib/agents/agents-data';

export type ViewMode = 'chat' | 'kanban' | 'analytics' | 'documents' | 'checkin';

interface AppState {
  // Auth
  userId: string | null;
  userName: string;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Selection
  currentAgent: Agent | null;
  currentClient: Client | null;
  sidebarTab: 'agents' | 'clients' | 'tasks' | 'sprint';
  viewMode: ViewMode;

  // Data
  agents: Agent[];
  clients: Client[];
  messages: Record<string, Message[]>;
  tasks: Task[];
  bookmarks: Set<string>;

  // Sprint
  sprintWeek: string;
  sprintGoals: string[];

  // Prompt params
  ppFlags: PromptParams;

  // Power features
  autoRouterEnabled: boolean;
  chainMode: boolean;

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

  sprintWeek: '',
  sprintGoals: [],

  ppFlags: { fca: true, hist: true, tasks: true, sprint: false, report: false },

  autoRouterEnabled: false,
  chainMode: false,

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
    const { currentAgent, currentClient } = get();
    return `${currentAgent?.id ?? '01'}_${currentClient?.id ?? 'general'}`;
  },

  getAllMessages: () => {
    const { messages } = get();
    return Object.values(messages).flat();
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
    bookmarks: Array.from(state.bookmarks), // Set nao serializa
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
