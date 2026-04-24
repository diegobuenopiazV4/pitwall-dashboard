import React from 'react';
import { Brain, FileText, Sparkles, Check, Loader2 } from 'lucide-react';
import type { DeepProgressEvent } from '../../lib/ai/deep-response';

interface Props {
  events: DeepProgressEvent[];
  active: boolean;
}

const PHASES = [
  { num: 1, label: 'Planejando estrutura', icon: Brain },
  { num: 2, label: 'Expandindo conteudo', icon: FileText },
  { num: 3, label: 'Enriquecendo dados', icon: Sparkles },
] as const;

/**
 * Progress visual do DEEP MODE com 3 fases.
 * Mostra qual fase esta rodando + contagem de palavras acumulada.
 */
export const DeepProgressIndicator: React.FC<Props> = ({ events, active }) => {
  if (!active) return null;

  const getPhaseStatus = (phase: number): 'pending' | 'active' | 'done' | 'error' => {
    const phaseEvents = events.filter((e) => e.phase === phase);
    if (phaseEvents.length === 0) return 'pending';
    const last = phaseEvents[phaseEvents.length - 1];
    if (last.status === 'complete') return 'done';
    if (last.status === 'error') return 'error';
    return 'active';
  };

  const getPhaseWordCount = (phase: number): number | undefined => {
    const phaseEvents = events.filter((e) => e.phase === phase && e.wordCount);
    return phaseEvents[phaseEvents.length - 1]?.wordCount;
  };

  const totalWords = getPhaseWordCount(3) ?? getPhaseWordCount(2) ?? getPhaseWordCount(1) ?? 0;

  return (
    <div className="mb-3 p-4 bg-gradient-to-br from-[#e4243d]/10 via-[#111118] to-purple-500/10 border border-[#e4243d]/30 rounded-xl">
      <div className="flex items-center gap-2 mb-3">
        <Brain size={14} className="text-[#ff4d5a] animate-pulse" />
        <span className="text-sm font-semibold text-slate-100">DEEP MODE em execucao</span>
        {totalWords > 0 && (
          <span className="ml-auto text-[10px] px-2 py-0.5 bg-emerald-500/15 text-emerald-400 rounded-full font-semibold">
            {totalWords.toLocaleString('pt-BR')} palavras geradas
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {PHASES.map((phase, i) => {
          const status = getPhaseStatus(phase.num);
          const wc = getPhaseWordCount(phase.num);
          const Icon = phase.icon;

          return (
            <React.Fragment key={phase.num}>
              <div className={`flex-1 flex items-center gap-2 p-2 rounded-lg transition-all ${
                status === 'active' ? 'bg-[#e4243d]/15 ring-1 ring-[#e4243d]/40' :
                status === 'done' ? 'bg-emerald-500/10 ring-1 ring-emerald-500/30' :
                status === 'error' ? 'bg-red-500/10 ring-1 ring-red-500/30' :
                'bg-slate-800/50'
              }`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  status === 'active' ? 'bg-[#e4243d]/20' :
                  status === 'done' ? 'bg-emerald-500/20' :
                  status === 'error' ? 'bg-red-500/20' :
                  'bg-slate-800'
                }`}>
                  {status === 'active' && <Loader2 size={11} className="text-[#ff4d5a] animate-spin" />}
                  {status === 'done' && <Check size={11} className="text-emerald-400" />}
                  {status === 'pending' && <Icon size={11} className="text-slate-500" />}
                  {status === 'error' && <Icon size={11} className="text-red-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] font-semibold ${
                    status === 'active' ? 'text-slate-100' :
                    status === 'done' ? 'text-emerald-300' :
                    'text-slate-500'
                  }`}>
                    Fase {phase.num}/3
                  </p>
                  <p className="text-[9px] text-slate-400 truncate">{phase.label}</p>
                  {wc && <p className="text-[9px] text-slate-500 mt-0.5">{wc.toLocaleString('pt-BR')}w</p>}
                </div>
              </div>
              {i < PHASES.length - 1 && (
                <div className={`w-3 h-0.5 ${status === 'done' ? 'bg-emerald-400' : 'bg-slate-700'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <p className="text-[10px] text-slate-500 mt-3 text-center">
        Tempo estimado: 60-120s para respostas de 10k-20k palavras com qualidade profissional
      </p>
    </div>
  );
};
