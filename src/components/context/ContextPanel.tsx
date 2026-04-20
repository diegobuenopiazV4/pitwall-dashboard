import React from 'react';
import { useAppStore } from '../../stores/app-store';
import { AEMR_PILARES, STEP_PHASES, TOC_STEPS } from '../../lib/agents/frameworks';
import { QUALITY_RULES } from '../../lib/agents/quality-rules';
import type { PromptParams } from '../../lib/agents/types';

const PILAR_COLORS: Record<string, string> = {
  Aquisicao: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Engajamento: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Monetizacao: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Retencao: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const PP_LABELS: Record<keyof PromptParams, string> = {
  fca: 'FCA',
  hist: 'Historico',
  tasks: 'Tarefas',
  sprint: 'Sprint',
  report: 'Report',
};

export const ContextPanel: React.FC = () => {
  const { currentClient, currentAgent, ppFlags, togglePPFlag } = useAppStore();

  return (
    <aside className="w-[320px] min-w-[320px] flex flex-col bg-[#111118] border-l border-slate-800 overflow-y-auto">
      {/* AEMR Grid */}
      <div className="p-3 border-b border-slate-800">
        <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Metodo V4 (AEMR)</h3>
        <div className="grid grid-cols-2 gap-1.5">
          {AEMR_PILARES.map((p) => (
            <div
              key={p.name}
              className={`px-2.5 py-2 rounded-md border ${PILAR_COLORS[p.name]} ${
                currentAgent?.pilar === p.name || currentAgent?.pilar === 'Todos' ? 'ring-1 ring-white/10' : 'opacity-60'
              }`}
            >
              <span className="text-[10px] font-bold block">{p.name}</span>
              <span className="text-[9px] opacity-70 block mt-0.5">{p.metrics}</span>
            </div>
          ))}
        </div>
      </div>

      {/* STEP */}
      {currentClient && (
        <div className="p-3 border-b border-slate-800">
          <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Fase STEP</h3>
          <div className="space-y-1">
            {STEP_PHASES.map((s) => (
              <div
                key={s.phase}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[10px] ${
                  currentClient.step === s.phase
                    ? 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20'
                    : 'text-slate-600'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${currentClient.step === s.phase ? 'bg-red-400' : 'bg-slate-700'}`} />
                <span className="font-semibold">{s.phase}</span>
                <span className="opacity-60 truncate">— {s.strategy}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TOC */}
      <div className="p-3 border-b border-slate-800">
        <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">TOC - 5 Passos</h3>
        <ol className="space-y-0.5">
          {TOC_STEPS.map((step, i) => (
            <li key={i} className="text-[10px] text-slate-500 flex items-start gap-1.5">
              <span className="text-red-500 font-bold shrink-0">{i + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Client Info */}
      {currentClient && (
        <div className="p-3 border-b border-slate-800">
          <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Cliente Ativo</h3>
          <div className="space-y-1 text-[10px]">
            <div className="flex justify-between"><span className="text-slate-500">Nome</span><span className="text-slate-300 font-medium">{currentClient.name}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Segmento</span><span className="text-slate-300">{currentClient.segment}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">STEP</span><span className="text-slate-300">{currentClient.step}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Pilar</span><span className="text-slate-300">{currentClient.pilar}</span></div>
            <div className="flex justify-between">
              <span className="text-slate-500">Health</span>
              <span className={`font-medium ${
                currentClient.health === 'green' ? 'text-emerald-400' :
                currentClient.health === 'yellow' ? 'text-amber-400' : 'text-red-400'
              }`}>
                {currentClient.health}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Params */}
      <div className="p-3 border-b border-slate-800">
        <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Parametros do Prompt</h3>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(ppFlags) as (keyof PromptParams)[]).map((key) => (
            <button
              key={key}
              onClick={() => togglePPFlag(key)}
              className={`px-2 py-1 text-[10px] rounded-full border transition-colors ${
                ppFlags[key]
                  ? 'bg-red-500/10 text-red-400 border-red-500/30'
                  : 'bg-slate-800/50 text-slate-600 border-slate-700'
              }`}
            >
              {PP_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      {/* 12 Rules */}
      <div className="p-3">
        <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">12 Regras do Motor</h3>
        <ol className="space-y-0.5">
          {QUALITY_RULES.map((rule) => (
            <li key={rule.id} className="text-[9px] text-slate-600 flex items-start gap-1">
              <span className="text-red-500/60 font-bold shrink-0 w-3 text-right">{rule.id}.</span>
              <span>{rule.title}</span>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  );
};
