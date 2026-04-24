import React from 'react';
import { Brain, Zap } from 'lucide-react';
import { useAppStore } from '../../stores/app-store';

export const DeepModeToggle: React.FC = () => {
  const { deepMode, setDeepMode } = useAppStore();

  return (
    <button
      onClick={() => setDeepMode(!deepMode)}
      className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-md transition-all border ${
        deepMode
          ? 'bg-gradient-to-r from-[#e4243d]/20 to-purple-500/20 text-slate-100 border-[#e4243d]/40 shadow-lg'
          : 'text-slate-500 border-slate-800 hover:border-slate-600 hover:text-slate-300'
      }`}
      title={deepMode
        ? 'DEEP MODE ativo: respostas 6k-20k palavras com 3 passes (Planejamento -> Expansao -> Enriquecimento)'
        : 'Modo normal: respostas em 1 passe (mais rapido, menos denso)'}
    >
      {deepMode ? <Brain size={11} className="text-[#ff4d5a]" /> : <Zap size={11} />}
      <span className="font-semibold">{deepMode ? 'DEEP' : 'Normal'}</span>
    </button>
  );
};
