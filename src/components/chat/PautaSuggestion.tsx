import React, { useMemo } from 'react';
import { CheckSquare, ExternalLink } from 'lucide-react';
import { useAppStore } from '../../stores/app-store';

const PAUTA_URL = 'https://v4ruston-aprova.vercel.app/';

// Palavras-chave que indicam que o usuario quer criar/enviar/aprovar uma pauta
const PAUTA_KEYWORDS = [
  'pauta', 'pautas', 'calendario editorial', 'cronograma de posts',
  'aprovar pauta', 'enviar pauta', 'aprovacao', 'aprovacoes',
  'calendar', 'posts do mes', 'posts da semana',
];

// Agentes que trabalham com social media / pautas
const SOCIAL_AGENTS = ['06', '07', '08']; // Designer Social, Social Media, Copy Performance

interface Props {
  userInput?: string;
}

/**
 * Sugere a ferramenta V4 Ruston de aprovacao de pauta quando:
 * - usuario esta em um agente de social media, OU
 * - usuario digitou palavras relacionadas a pauta
 */
export const PautaSuggestion: React.FC<Props> = ({ userInput = '' }) => {
  const { currentAgent } = useAppStore();

  const shouldShow = useMemo(() => {
    if (!currentAgent) return false;

    // Caso 1: Agente de social media selecionado
    const isSocialAgent = SOCIAL_AGENTS.includes(currentAgent.id);

    // Caso 2: Usuario digitou keywords de pauta
    const lower = userInput.toLowerCase();
    const mentionsPauta = PAUTA_KEYWORDS.some((kw) => lower.includes(kw));

    return isSocialAgent || mentionsPauta;
  }, [currentAgent, userInput]);

  if (!shouldShow) return null;

  const open = () => {
    window.open(PAUTA_URL, '_blank', 'noopener');
  };

  return (
    <div className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-[#e4243d]/5 via-[#e4243d]/10 to-[#e4243d]/5 border-b border-[#e4243d]/20">
      <CheckSquare size={11} className="text-[#ff4d5a] shrink-0" />
      <span className="text-[10px] text-slate-300 truncate">
        <strong className="text-[#ff4d5a]">Aprovacao de pauta:</strong> use a ferramenta V4 Ruston para que o cliente aprove/altere online
      </span>
      <button
        onClick={open}
        className="ml-auto shrink-0 flex items-center gap-1.5 px-2 py-0.5 bg-[#e4243d] hover:bg-[#ff4d5a] text-white rounded-full text-[10px] font-medium"
      >
        Abrir
        <ExternalLink size={9} />
      </button>
    </div>
  );
};
