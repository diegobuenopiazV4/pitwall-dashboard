import React from 'react';
import { Sparkles, ArrowRight, ExternalLink } from 'lucide-react';
import type { IntentSuggestion } from '../../lib/intent/intent-detector';

interface Props {
  suggestion: IntentSuggestion | null;
  onActivate: () => void;
  onDismiss: () => void;
}

/**
 * Banner reativo: aparece logo acima do input quando detectamos intent
 * de skill especifica na mensagem que o usuario esta digitando.
 *
 * Exemplo: usuario digita "criar tasks para abril" -> banner sugere /ekyte
 */
export const IntentBanner: React.FC<Props> = ({ suggestion, onActivate, onDismiss }) => {
  if (!suggestion) return null;

  const confidenceColor = suggestion.confidence === 'high' ? 'emerald' : suggestion.confidence === 'medium' ? 'amber' : 'slate';
  const isExternal = suggestion.skill === 'pauta';

  return (
    <div
      className={`flex items-center gap-2 mx-4 mb-2 px-3 py-2 bg-gradient-to-r from-[#e4243d]/10 via-${confidenceColor}-500/5 to-transparent border border-[#e4243d]/30 rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-200`}
    >
      <Sparkles size={12} className="text-[#ff4d5a] shrink-0 animate-pulse" />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-slate-200 truncate">
          <span className="font-semibold">{suggestion.reason}.</span>{' '}
          <span className="text-slate-400">Quer usar </span>
          <kbd className="text-[10px] px-1.5 py-0.5 bg-[#e4243d]/20 text-[#ff4d5a] rounded font-mono">
            {suggestion.slashCommand}
          </kbd>
          <span className="text-slate-400">?</span>
        </p>
      </div>
      <button
        onClick={onActivate}
        className="shrink-0 flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold bg-[#e4243d] hover:bg-[#ff4d5a] text-white rounded-md transition-colors"
      >
        Usar
        {isExternal ? <ExternalLink size={10} /> : <ArrowRight size={10} />}
      </button>
      <button
        onClick={onDismiss}
        className="shrink-0 text-[10px] text-slate-500 hover:text-slate-300 px-2 py-1"
        title="Dispensar (Esc)"
      >
        ✕
      </button>
    </div>
  );
};
