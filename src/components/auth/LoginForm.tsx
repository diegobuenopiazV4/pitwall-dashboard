import React, { useState } from 'react';
import { supabase } from '../../lib/supabase/client';
import { useAppStore } from '../../stores/app-store';

export const LoginForm: React.FC = () => {
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

  // Quick offline mode
  const handleOffline = () => {
    setAuth('offline', name || 'Operador');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            <span className="text-red-500">V4</span>{' '}
            <span className="text-slate-200">PIT WALL</span>
          </h1>
          <p className="text-xs text-slate-500">Sistema de 16 Agentes de IA para Marketing Digital</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
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
            className="w-full px-3 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500/50"
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500/50"
          />

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-500 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Carregando...' : isRegister ? 'Criar Conta' : 'Entrar'}
          </button>
        </form>

        <div className="mt-4 space-y-2">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            {isRegister ? 'Ja tem conta? Entrar' : 'Nao tem conta? Criar'}
          </button>

          <div className="flex items-center gap-2 my-3">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[10px] text-slate-600">ou</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          <div className="space-y-2">
            <input
              type="text"
              placeholder="Seu nome (modo offline)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-600"
            />
            <button
              onClick={handleOffline}
              className="w-full py-2 text-xs text-slate-500 border border-slate-700 rounded-lg hover:bg-slate-800 hover:text-slate-300 transition-colors"
            >
              Entrar sem conta (modo offline)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
