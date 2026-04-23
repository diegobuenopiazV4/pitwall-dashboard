import React from 'react';
import { ExternalLink, CheckSquare, Users, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const PAUTA_URL = 'https://v4ruston-aprova.vercel.app/';

interface Props {
  variant?: 'banner' | 'card' | 'inline' | 'button';
  context?: string; // ex: nome do cliente para passar como query param futuro
  className?: string;
}

/**
 * Link oficial para a ferramenta V4 Ruston de aprovacao de pauta de social media.
 * Cliente acessa, aprova ou pede alteracoes.
 */
export const SocialPautaLink: React.FC<Props> = ({ variant = 'card', context, className = '' }) => {
  const openPauta = () => {
    window.open(PAUTA_URL, '_blank', 'noopener');
    toast.success('Abrindo ferramenta de aprovacao...', { icon: '\uD83D\uDCF1' });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(PAUTA_URL);
    toast.success('Link copiado! Envie ao cliente');
  };

  if (variant === 'button') {
    return (
      <button
        onClick={openPauta}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#e4243d]/10 hover:bg-[#e4243d]/20 text-[#ff4d5a] text-xs rounded-md border border-[#e4243d]/30 transition-colors ${className}`}
        title="Abrir ferramenta de aprovacao de pauta"
      >
        <CheckSquare size={12} />
        Aprovacao de Pauta
        <ExternalLink size={10} />
      </button>
    );
  }

  if (variant === 'inline') {
    return (
      <a
        href={PAUTA_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1 text-[#ff4d5a] hover:text-[#e4243d] underline ${className}`}
      >
        v4ruston-aprova.vercel.app
        <ExternalLink size={10} />
      </a>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`flex items-center gap-3 p-3 bg-gradient-to-r from-[#e4243d]/10 via-[#e4243d]/5 to-transparent border border-[#e4243d]/30 rounded-lg ${className}`}>
        <div className="w-8 h-8 rounded-lg bg-[#e4243d]/20 flex items-center justify-center shrink-0">
          <CheckSquare size={14} className="text-[#ff4d5a]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-200">Precisa aprovar uma pauta com o cliente?</p>
          <p className="text-[10px] text-slate-400">Use a ferramenta V4 Ruston de aprovacao colaborativa</p>
        </div>
        <button
          onClick={openPauta}
          className="shrink-0 px-3 py-1.5 bg-[#e4243d] hover:bg-[#ff4d5a] text-white text-xs rounded-md flex items-center gap-1 font-medium"
        >
          Abrir
          <ExternalLink size={10} />
        </button>
      </div>
    );
  }

  // variant === 'card' (default, mais completo)
  return (
    <div className={`p-4 rounded-xl bg-gradient-to-br from-[#e4243d]/10 via-[#111118] to-[#1a1a24] border border-[#e4243d]/30 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-9 h-9 rounded-lg bg-[#e4243d]/20 flex items-center justify-center">
          <Users size={16} className="text-[#ff4d5a]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
            Aprovacao de Pauta Social
            <Sparkles size={12} className="text-[#ff4d5a]" />
          </h3>
          <p className="text-[10px] text-slate-500">Ferramenta oficial V4 Ruston{context ? ` · ${context}` : ''}</p>
        </div>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed mb-3">
        Envie a pauta mensal para o cliente aprovar ou solicitar alteracoes direto na plataforma V4 Ruston.
        Processo colaborativo, sem emails perdidos.
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={openPauta}
          className="flex-1 px-3 py-2 bg-gradient-to-r from-[#e4243d] to-[#ff4d5a] hover:opacity-90 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow-lg"
        >
          <ExternalLink size={12} />
          Abrir Ferramenta
        </button>
        <button
          onClick={copyLink}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700"
          title="Copiar link para compartilhar"
        >
          Copiar Link
        </button>
      </div>
    </div>
  );
};
