import { useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { useAppStore } from '../stores/app-store';

/**
 * Hook: sync real-time via Supabase Realtime.
 * Escuta mudancas em clients, tasks, conversations do usuario e atualiza store.
 */
export function useSupabaseRealtime() {
  const { userId, addClient, updateClient, setClients, clients, addTask, setTasks, tasks } = useAppStore();

  useEffect(() => {
    if (!userId || userId === 'offline') return;

    // Clients subscription
    const clientsChannel = supabase
      .channel('clients-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients', filter: `user_id=eq.${userId}` }, (payload) => {
        if (payload.eventType === 'INSERT' && payload.new) {
          const c = payload.new as any;
          // Evita duplicatas se foi este user quem inseriu
          if (!clients.find((x) => x.id === c.id)) {
            addClient({
              id: c.id,
              userId: c.user_id,
              name: c.name,
              segment: c.segment,
              step: c.step,
              pilar: c.pilar,
              health: c.health,
              createdAt: c.created_at,
              updatedAt: c.updated_at,
            });
          }
        } else if (payload.eventType === 'UPDATE' && payload.new) {
          const c = payload.new as any;
          updateClient(c.id, {
            name: c.name,
            segment: c.segment,
            step: c.step,
            pilar: c.pilar,
            health: c.health,
          });
        } else if (payload.eventType === 'DELETE' && payload.old) {
          const c = payload.old as any;
          setClients(clients.filter((x) => x.id !== c.id));
        }
      })
      .subscribe();

    // Tasks subscription
    const tasksChannel = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` }, (payload) => {
        if (payload.eventType === 'INSERT' && payload.new) {
          const t = payload.new as any;
          if (!tasks.find((x) => x.id === t.id)) {
            addTask({
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
            });
          }
        } else if (payload.eventType === 'DELETE' && payload.old) {
          const t = payload.old as any;
          setTasks(tasks.filter((x) => x.id !== t.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(clientsChannel);
      supabase.removeChannel(tasksChannel);
    };
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps
}
