import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, X, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { addCorrection, categorizeComplaint } from '../../lib/learning/feedback-system';
import { appendPreference } from '../../lib/memory/client-memory';
import { useAppStore } from '../../stores/app-store';

interface Props {
  messageId: string;
  messageContent: string;
  prevUserPrompt?: string;
  agentId?: string;
}

/**
 * Botoes 👍👎 inline em cada resposta do bot.
 * Feedback positivo: registra como "preferencia" na memoria do cliente.
 * Feedback negativo: abre form rapido perguntando o que esta errado.
 *   Ao submeter, cria uma Correction no sistema de aprendizado.
 */
export const MessageFeedback: React.FC<Props> = ({ messageId, messageContent, prevUserPrompt = '', agentId }) => {
  const { currentClient, userId } = useAppStore();
  const [reaction, setReaction] = useState<'up' | 'down' | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleUp = () => {
    setReaction('up');
    if (currentClient) {
      appendPreference(currentClient.id, 'style', 'Respostas como esta (mensagem #' + messageId.slice(0, 8) + ') sao preferidas');
    }
    toast.success('Obrigado! Aprendi que voce gosta disso', { icon: '\uD83D\uDC4D', duration: 2000 });
  };

  const handleDown = () => {
    setReaction('down');
    setShowForm(true);
  };

  const submitFeedback = () => {
    if (!feedback.trim()) {
      toast.error('Descreva rapidamente o que poderia ser melhor');
      return;
    }
    addCorrection({
      agentId,
      clientId: currentClient?.id,
      category: categorizeComplaint(feedback),
      originalPrompt: prevUserPrompt.substring(0, 500),
      originalResponse: messageContent.substring(0, 500),
      userComplaint: feedback,
      correctionInstruction: feedback,
      userId: userId || 'offline',
    });
    toast.success('Feedback salvo. Vou aplicar em respostas futuras.', { icon: '\uD83E\uDDE0' });
    setShowForm(false);
  };

  return (
    <>
      <div className="flex items-center gap-1 mt-1">
        <button
          onClick={handleUp}
          className={`p-1 rounded transition-colors ${
            reaction === 'up' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-600 hover:text-emerald-400 hover:bg-slate-800'
          }`}
          title="Gostei desta resposta"
        >
          <ThumbsUp size={11} />
        </button>
        <button
          onClick={handleDown}
          className={`p-1 rounded transition-colors ${
            reaction === 'down' ? 'text-red-400 bg-red-500/10' : 'text-slate-600 hover:text-red-400 hover:bg-slate-800'
          }`}
          title="Nao gostei / melhorar"
        >
          <ThumbsDown size={11} />
        </button>
      </div>

      {showForm && (
        <div className="mt-2 p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] text-red-300 font-medium">O que poderia ser melhor?</p>
            <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-300">
              <X size={11} />
            </button>
          </div>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Ex: Muito curta, prefiro mais exemplos. / Use framework 60/20/20. / Tom mais formal..."
            rows={2}
            className="w-full px-2 py-1.5 text-[11px] bg-slate-950 border border-slate-800 rounded text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500/30"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[9px] text-slate-500">
              Isso vai ser aplicado em todas as futuras respostas
            </span>
            <button
              onClick={submitFeedback}
              disabled={!feedback.trim()}
              className="flex items-center gap-1 px-2.5 py-1 text-[10px] bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white rounded font-semibold"
            >
              <Send size={10} />
              Enviar
            </button>
          </div>
        </div>
      )}
    </>
  );
};
