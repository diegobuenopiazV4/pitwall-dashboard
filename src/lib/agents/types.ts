export type Pilar = 'Todos' | 'Aquisicao' | 'Engajamento' | 'Monetizacao' | 'Retencao';
export type StepPhase = 'Saber' | 'Ter' | 'Executar' | 'Potencializar';
export type HealthScore = 'green' | 'yellow' | 'red';

export interface Agent {
  id: string;
  name: string;
  area: string;
  icon: string;
  color: string;
  pilar: Pilar;
  mentors: string;
  frameworks: string;
  kpis: string;
  tools: string;
  quickActions: string[];
}

export interface Client {
  id: string;
  userId: string;
  name: string;
  segment: string;
  step: StepPhase;
  pilar: Pilar;
  health: HealthScore;
  // Novos campos estilo mkt.lab
  slug?: string;
  brandColor?: string; // hex
  teamId?: string;
  logoUrl?: string; // data URL ou Supabase Storage URL
  notifyOnApproval?: boolean;
  // Servicos contratados pelo cliente
  contractedServices?: ServiceContract[];
  // Pasta associada (File System Access API handle id)
  folderHandle?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type ServiceCategory =
  | 'trafego'
  | 'conteudo'
  | 'design'
  | 'social'
  | 'seo'
  | 'crm'
  | 'automacao'
  | 'web'
  | 'video'
  | 'cro'
  | 'dados'
  | 'estrategia';

export interface ServiceContract {
  id: string;
  category: ServiceCategory;
  name: string;
  active: boolean;
  monthlyBudget?: number;
  startDate?: string;
  notes?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'bot';
  content: string;
  agentId?: string;
  createdAt: string;
  // Extended metadata (opcional)
  modelUsed?: string;
  modelProvider?: 'claude' | 'gemini' | 'openrouter';
  thinkingTokens?: number;
  images?: string[]; // base64 data URLs (de geracao Gemini Image)
  attachedFiles?: { name: string; type: string; size: number }[];
}

export interface Conversation {
  id: string;
  userId: string;
  agentId: string;
  clientId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  userId: string;
  clientId?: string | null;
  agentId?: string | null;
  text: string;
  done: boolean;
  priority: 'P1' | 'P2' | 'P3';
  sprintWeek?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sprint {
  id: string;
  userId: string;
  weekLabel: string;
  goals: string[];
  active: boolean;
  createdAt: string;
}

export interface Document {
  id: string;
  userId: string;
  clientId?: string | null;
  agentId?: string | null;
  fileName: string;
  fileType: string;
  storagePath: string;
  category?: string;
  sizeBytes?: number;
  createdAt: string;
}

export interface PromptParams {
  fca: boolean;
  hist: boolean;
  tasks: boolean;
  sprint: boolean;
  report: boolean;
}

export interface UserProfile {
  id: string;
  fullName: string;
  avatarUrl?: string;
  role: 'admin' | 'operator' | 'viewer';
  createdAt: string;
  updatedAt: string;
}
