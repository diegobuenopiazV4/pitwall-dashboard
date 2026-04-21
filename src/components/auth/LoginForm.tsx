import React, { useState } from 'react';
import { Sparkles, Users, Zap, Rocket, ArrowRight, Info } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import { useAppStore } from '../../stores/app-store';

const supabaseConfigured = !!(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  import.meta.env.VITE_SUPABASE_URL !== 'https://SEU-PROJETO.supabase.co'
);

export const LoginForm: React.FC = () => {
  const [mode, setMode] = useState<'offline' | 'cloud'>(supabaseConfigured ? 'cloud' : 'offline');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAppStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (signUpError) throw signUpError;
        if (data.user) {
          setAuth(data.user.id, name || email);
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        if (data.user) {
          setAuth(data.user.id, data.user.user_metadata?.full_name || email);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro de autenticacao');
    } finally {
      setLoading(false);
    }
  };

  const handleOffline = () => {
    if (!name.trim()) {
      setError('Digite seu nome para comecar');
      return;
    }
    setAuth('offline', name.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(239,68,68,0.08),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(139,92,246,0.05),_transparent_50%)]" />

      <div className="relative w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-[10px] text-red-400 mb-4">
            <Sparkles size={10} />
            16 Agentes de IA · Marketing Digital
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            <span className="text-red-500">V4</span>{' '}
            <span className="text-slate-200">PIT WALL</span>
          </h1>
          <p className="text-xs text-slate-500">
            Dashboard com Agente Mestre + 15 especialistas para operacao completa
          </p>
        </div>

        {/* Features preview */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <Feature icon={<Users size={12} />} label="Multi-usuario" />
          <Feature icon={<Zap size={12} />} label="400+ modelos IA" />
          <Feature icon={<Rocket size={12} />} label="112 comandos" />
        </div>

        {/* Mode Selector */}
        <div className="flex bg-slate-900/60 border border-slate-800 rounded-lg p-1 mb-4">
          <button
            onClick={() => setMode('offline')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
              mode === 'offline'
                ? 'bg-red-600 text-white shadow-lg shadow-red-500/20'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Acesso rapido
          </button>
          <button
            onClick={() => setMode('cloud')}
            disabled={!supabaseConfigured}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
              mode === 'cloud'
                ? 'bg-red-600 text-white shadow-lg shadow-red-500/20'
                : 'text-slate-500 hover:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
            title={!supabaseConfigured ? 'Requer Supabase configurado' : ''}
          >
            Login na nuvem {!supabaseConfigured && '🔒'}
          </button>
        </div>

        {/* Offline Mode */}
        {mode === 'offline' && (
          <div className="space-y-3">
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Info size={12} className="text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] text-emerald-400 font-medium mb-0.5">
                    Modo recomendado
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Dados salvos localmente no seu browser. Sem necessidade de conta.
                    Adicione sua Claude key em Configuracoes para respostas com IA real.
                  </p>
                </div>
              </div>
            </div>

            <input
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleOffline()}
              autoFocus
              className="w-full px-3 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500/50"
            />

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              onClick={handleOffline}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
            >
              Entrar
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Cloud Mode */}
        {mode === 'cloud' && (
          <form onSubmit={handleSubmit} className="space-y-3">
            {!supabaseConfigured && (
              <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                <p className="text-[11px] text-amber-400">
                  Supabase nao configurado. Use "Acesso rapido" enquanto isso.
                </p>
              </div>
            )}

            {isRegister && (
              <input
                type="text"
                placeholder="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500/50"
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!supabaseConfigured}
              className="w-full px-3 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500/50 disabled:opacity-40"
            />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={!supabaseConfigured}
              className="w-full px-3 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500/50 disabled:opacity-40"
            />

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !supabaseConfigured}
              className="w-full py-2.5 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Carregando...' : isRegister ? 'Criar Conta' : 'Entrar'}
            </button>

            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              disabled={!supabaseConfigured}
              className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-40"
            >
              {isRegister ? 'Ja tem conta? Entrar' : 'Nao tem conta? Criar'}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-[10px] text-slate-600">
            V4 Company · Ruston Assessoria · v5.2
          </p>
        </div>
      </div>
    </div>
  );
};

const Feature: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <div className="flex flex-col items-center gap-0.5 py-2 bg-slate-900/40 border border-slate-800 rounded-md">
    <span className="text-slate-500">{icon}</span>
    <span className="text-[9px] text-slate-600">{label}</span>
  </div>
);
