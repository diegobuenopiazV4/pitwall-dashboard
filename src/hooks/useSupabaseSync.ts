import { useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { useAppStore } from '../stores/app-store';
import type { Client, Task, Message } from '../lib/agents/types';
import { DEFAULT_CLIENTS } from '../lib/agents/agents-data';

/**
 * Syncs store data with Supabase when user authenticates.
 * Loads clients, tasks, and conversations/messages for the current user.
 * Falls back to in-memory mode if Supabase is not configured.
 */
export function useSupabaseSync() {
  const { userId, isAuthenticated, setClients, setTasks, setMessages } = useAppStore();

  useEffect(() => {
    if (!isAuthenticated || !userId || userId === 'offline') return;

    const load = async () => {
      try {
        // 1. Load clients (seed defaults if empty)
        const { data: clientsData } = await supabase
          .from('clients')
          .select('*')
          .eq('user_id', userId)
          .order('name');

        if (clientsData && clientsData.length > 0) {
          const mapped: Client[] = clientsData.map((c) => ({
            id: c.id,
            userId: c.user_id,
            name: c.name,
            segment: c.segment,
            step: c.step,
            pilar: c.pilar,
            health: c.health,
            metadata: c.metadata,
            createdAt: c.created_at,
            updatedAt: c.updated_at,
          }));
          setClients(mapped);
        } else {
          // Seed default clients for new users
          const toInsert = DEFAULT_CLIENTS.map((c) => ({
            user_id: userId,
            name: c.name,
            segment: c.segment,
            step: c.step,
            pilar: c.pilar,
            health: c.health,
          }));
          const { data: seeded } = await supabase
            .from('clients')
            .insert(toInsert)
            .select();

          if (seeded) {
            const mapped: Client[] = seeded.map((c) => ({
              id: c.id,
              userId: c.user_id,
              name: c.name,
              segment: c.segment,
              step: c.step,
              pilar: c.pilar,
              health: c.health,
              metadata: c.metadata,
              createdAt: c.created_at,
              updatedAt: c.updated_at,
            }));
            setClients(mapped);
          }
        }

        // 2. Load tasks
        const { data: tasksData } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (tasksData) {
          const mapped: Task[] = tasksData.map((t) => ({
            id: t.id,
            userId: t.user_id,
            clientId: t.client_id,
            agentId: t.agent_id,
            text: t.text,
            done: t.done,
            priority: t.priority,
            sprintWeek: t.sprint_week,
            createdAt: t.created_at,
            updatedAt: t.updated_at,
          }));
          setTasks(mapped);
        }

        // 3. Load conversations + messages
        const { data: convsData } = await supabase
          .from('conversations')
          .select('*, messages(*)')
          .eq('user_id', userId);

        if (convsData) {
          convsData.forEach((conv: any) => {
            const key = `${conv.agent_id}_${conv.client_id ?? 'general'}`;
            const msgs: Message[] = (conv.messages || [])
              .sort((a: any, b: any) => a.created_at.localeCompare(b.created_at))
              .map((m: any) => ({
                id: m.id,
                conversationId: conv.id,
                role: m.role,
                content: m.content,
                agentId: m.agent_id,
                createdAt: m.created_at,
              }));
            setMessages(key, msgs);
          });
        }
      } catch (err) {
        console.warn('[SupabaseSync] Running in offline mode:', err);
        // Offline mode: seed default clients in memory
        const mem = DEFAULT_CLIENTS.map((c) => ({
          id: crypto.randomUUID(),
          userId,
          name: c.name,
          segment: c.segment,
          step: c.step,
          pilar: c.pilar,
          health: c.health,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        setClients(mem);
      }
    };

    load();
  }, [userId, isAuthenticated, setClients, setTasks, setMessages]);
}

/**
 * Persists a new client to Supabase and returns the saved record.
 */
export async function saveClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client | null> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .insert({
        user_id: client.userId,
        name: client.name,
        segment: client.segment,
        step: client.step,
        pilar: client.pilar,
        health: client.health,
      })
      .select()
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      segment: data.segment,
      step: data.step,
      pilar: data.pilar,
      health: data.health,
      metadata: data.metadata,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch {
    return null;
  }
}

/**
 * Persists a new task to Supabase.
 */
export async function saveTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task | null> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: task.userId,
        client_id: task.clientId,
        agent_id: task.agentId,
        text: task.text,
        done: task.done,
        priority: task.priority,
        sprint_week: task.sprintWeek,
      })
      .select()
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      clientId: data.client_id,
      agentId: data.agent_id,
      text: data.text,
      done: data.done,
      priority: data.priority,
      sprintWeek: data.sprint_week,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch {
    return null;
  }
}

export async function toggleTaskDone(taskId: string, done: boolean): Promise<void> {
  try {
    await supabase.from('tasks').update({ done, updated_at: new Date().toISOString() }).eq('id', taskId);
  } catch {
    // silent fail in offline mode
  }
}

export async function deleteClientRemote(clientId: string): Promise<void> {
  try {
    await supabase.from('clients').delete().eq('id', clientId);
  } catch {
    // silent fail
  }
}

export async function updateClientRemote(clientId: string, updates: Partial<Client>): Promise<void> {
  try {
    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.segment !== undefined) payload.segment = updates.segment;
    if (updates.step !== undefined) payload.step = updates.step;
    if (updates.pilar !== undefined) payload.pilar = updates.pilar;
    if (updates.health !== undefined) payload.health = updates.health;
    await supabase.from('clients').update(payload).eq('id', clientId);
  } catch {
    // silent fail
  }
}
