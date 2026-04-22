import React, { useEffect } from 'react';
import { useAppStore } from './stores/app-store';
import { LoginForm } from './components/auth/LoginForm';
import { AppLayout } from './components/layout/AppLayout';
import { SharePage } from './components/views/SharePage';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useSupabaseSync } from './hooks/useSupabaseSync';
import { useSupabaseRealtime } from './hooks/useSupabaseRealtime';
import { supabase, isSupabaseConfigured } from './lib/supabase/client';
import { Toaster } from 'react-hot-toast';

const MainApp: React.FC = () => {
  const { isAuthenticated, isLoading, setAuth, setLoading } = useAppStore();

  useKeyboardShortcuts();
  useSupabaseSync();
  useSupabaseRealtime();

  useEffect(() => {
    // If Supabase is not configured, skip auth checks entirely and land on the login screen.
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Check existing session
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
