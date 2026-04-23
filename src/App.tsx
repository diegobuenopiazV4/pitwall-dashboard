import React, { useEffect } from 'react';
import { useAppStore } from './stores/app-store';
import { LoginForm } from './components/auth/LoginForm';
import { AppLayout } from './components/layout/AppLayout';
import { SharePage } from './components/views/SharePage';
import { OnboardingTour, shouldShowTour } from './components/auth/OnboardingTour';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useSupabaseSync } from './hooks/useSupabaseSync';
import { useSupabaseRealtime } from './hooks/useSupabaseRealtime';
import { supabase, isSupabaseConfigured } from './lib/supabase/client';
import { applySeed } from './lib/demo/seed-data';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';

const MainApp: React.FC = () => {
  const { isAuthenticated, isLoading, setAuth, setLoading, userId, tasks, messages, setTasks, setSprintWeek, setSprintGoals, setMessages } = useAppStore();
  const [showTour, setShowTour] = useState(false);

  useKeyboardShortcuts();
  useSupabaseSync();
  useSupabaseRealtime();

  // Detectar primeira visita apos login e mostrar tour + seed
  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    const hasExistingData = tasks.length > 0 || Object.keys(messages).length > 0;

    // Aplicar seed data se vazio
    applySeed({
      userId,
      setTasks,
      setSprintWeek,
      setSprintGoals,
      setMessages,
      hasExistingData,
    });

    // Mostrar tour na primeira visita
    if (shouldShowTour()) {
      setShowTour(true);
    }
  }, [isAuthenticated, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // 1. Tenta recuperar offline auth do localStorage (persistencia entre reloads)
    try {
      const offlineRaw = localStorage.getItem('v4_pitwall_offline_auth');
      if (offlineRaw) {
        const offline = JSON.parse(offlineRaw);
        if (offline.userId && offline.userName) {
          // Auto-login offline se menos de 30 dias
          const age = Date.now() - (offline.timestamp ?? 0);
          if (age < 30 * 24 * 3600 * 1000) {
            setAuth(offline.userId, offline.userName);
            return; // nao checa Supabase se ja logado offline
          }
        }
      }
    } catch {
      // silent
    }

    // 2. If Supabase is not configured, skip auth checks entirely and land on the login screen.
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // 3. Check existing Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuth(session.user.id, session.user.user_metadata?.full_name || session.user.email || '');
      } else {
        setLoading(false);
      }
    }).catch(() => {
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuth(session.user.id, session.user.user_metadata?.full_name || session.user.email || '');
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [setAuth, setLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-slate-700 border-t-red-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-500">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1a1a24', color: '#e2e8f0', border: '1px solid #334155', fontSize: '12px' },
          }}
        />
        <LoginForm />
      </>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1a1a24', color: '#e2e8f0', border: '1px solid #334155', fontSize: '12px' },
        }}
      />
      <AppLayout />
      {showTour && <OnboardingTour onComplete={() => setShowTour(false)} />}
    </>
  );
};

/**
 * App com simple routing:
 * - /share/:slug -> SharePage (publica, sem auth)
 * - outras rotas -> MainApp (com auth flow completo)
 */
const App: React.FC = () => {
  const sharePath = typeof window !== 'undefined'
    ? window.location.pathname.match(/^\/share\/([a-zA-Z0-9_-]+)/i)
    : null;

  if (sharePath) {
    return (
      <>
        <Toaster position="top-right" toastOptions={{ style: { background: '#1a1a24', color: '#e2e8f0', border: '1px solid #334155', fontSize: '12px' } }} />
        <SharePage slug={sharePath[1]} />
      </>
    );
  }

  return <MainApp />;
};

export default App;
