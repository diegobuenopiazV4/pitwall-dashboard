import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Sparkles, Bot, Users, Zap, DollarSign, FileSearch, Plug, Building2, Check, Keyboard, Command } from 'lucide-react';

const TOUR_KEY = 'v4_pitwall_tour_completed';

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: string;
  color: string;
}

const STEPS: Step[] = [
  {
    icon: <Sparkles size={24} />,
    title: 'Bem-vindo ao V4 PIT WALL',
    description: 'Sistema de 16 agentes de IA especializados em marketing digital, alimentados por Claude Opus 4.7, Sonnet 4.6, Gemini 3.1 Pro e +400 modelos via OpenRouter.',
    color: 'red',
  },
  {
    icon: <Bot size={24} />,
    title: '16 Agentes Especializados',
    description: 'Cada agente tem mentores reais, frameworks validados e 100+ comandos rapidos. Do Mestre Estrategista ao CRO/UX, todos orquestrados por Agente 01.',
    highlight: 'Selecione um agente na sidebar esquerda · Ctrl+1..9 para atalhos',
    color: 'blue',
  },
  {
    icon: <Sparkles size={24} />,
    title: '1600 Comandos Prontos',
    description: 'Nao precisa escrever prompt do zero. Cada agente tem 100 comandos contextualizados para seu cliente, fase STEP e pilar V4.',
    highlight: 'Ctrl+L abre biblioteca completa · Filtros por agente, categoria, tags',
    color: 'amber',
  },
  {
    icon: <Building2 size={24} />,
    title: 'Workspaces para Equipe',
    description: 'Crie workspaces para diferentes empresas/equipes. Convide membros por email, defina roles (admin/editor/viewer) e compartilhe clientes.',
    highlight: 'Ctrl+Shift+W ou icone Building2 roxo no Header',
    color: 'purple',
  },
  {
    icon: <FileSearch size={24} />,
    title: 'Busca Global em Mensagens',
    description: 'Encontre qualquer resposta antiga em segundos. Busca em TODAS as conversas, ranqueado por relevancia.',
    highlight: 'Ctrl+Shift+F ou icone FileSearch amber',
    color: 'amber',
  },
  {
    icon: <DollarSign size={24} />,
    title: 'Controle de Custos',
    description: 'Dashboard automatico de uso: tokens por agente/cliente/modelo, custo em USD/BRL, timeline 30 dias. Zero configuracao necessaria.',
    highlight: 'Icone $ verde no Header',
    color: 'emerald',
  },
  {
    icon: <Plug size={24} />,
    title: 'Integracoes Profissionais',
    description: 'Conecte Ekyte (API oficial), Slack, Discord, Zapier, n8n. Webhooks disparam automaticamente em checkins e respostas dos agentes.',
    highlight: 'Icone Plug roxo no Header · Zero codigo necessario',
    color: 'purple',
  },
  {
    icon: <Check size={24} />,
    title: 'Tudo pronto para voce',
    description: 'Ja funciona 100% em modo offline. Para IA real, adicione sua Claude key em Configuracoes. Para multi-user cloud, adicione Supabase.',
    highlight: 'Comece explorando! Tudo pode ser desfeito.',
    color: 'red',
  },
];

interface Props {
  onComplete: () => void;
}

export const OnboardingTour: React.FC<Props> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      complete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const complete = () => {
    localStorage.setItem(TOUR_KEY, 'true');
    onComplete();
  };

  const skip = () => {
    complete();
  };

  const colors: Record<string, string> = {
    red: 'from-red-500 to-orange-500',
    blue: 'from-blue-500 to-cyan-500',
    amber: 'from-amber-500 to-yellow-500',
    purple: 'from-purple-500 to-pink-500',
    emerald: 'from-emerald-500 to-teal-500',
  };

  const iconBg: Record<string, string> = {
    red: 'bg-red-500/20 text-red-400',
    blue: 'bg-blue-500/20 text-blue-400',
    amber: 'bg-amber-500/20 text-amber-400',
    purple: 'bg-purple-500/20 text-purple-400',
    emerald: 'bg-emerald-500/20 text-emerald-400',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md bg-[#1a1a24] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${colors[step.color]}`} />

        <button
          onClick={skip}
          className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 p-1"
          title="Pular tour"
        >
          <X size={16} />
        </button>

        <div className="p-6 space-y-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${iconBg[step.color]}`}>
            {step.icon}
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-100 mb-2">{step.title}</h2>
            <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
          </div>

          {step.highlight && (
            <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
              <p className="text-[11px] text-slate-300 flex items-start gap-1.5">
                <Keyboard size={11} className="text-slate-500 mt-0.5 shrink-0" />
                <span>{step.highlight}</span>
              </p>
            </div>
          )}

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 pt-2">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentStep
                    ? `w-6 bg-gradient-to-r ${colors[step.color]}`
                    : i < currentStep
                      ? 'w-1.5 bg-slate-600'
                      : 'w-1.5 bg-slate-800'
                }`}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex gap-2 pt-2">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1 px-3 py-2 text-xs text-slate-400 bg-slate-800 rounded-lg hover:bg-slate-700"
              >
                <ArrowLeft size={12} />
                Voltar
              </button>
            )}
            <button
              onClick={handleNext}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white rounded-lg bg-gradient-to-r ${colors[step.color]} hover:brightness-110 transition-all`}
            >
              {isLast ? 'Comecar a usar' : 'Proximo'}
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

        <div className="px-6 py-2 border-t border-slate-800 text-[9px] text-slate-600 text-center">
          {currentStep + 1} de {STEPS.length} · Pressione Esc para pular
        </div>
      </div>
    </div>
  );
};

export function shouldShowTour(): boolean {
  return localStorage.getItem(TOUR_KEY) !== 'true';
}

export function markTourComplete(): void {
  localStorage.setItem(TOUR_KEY, 'true');
}
