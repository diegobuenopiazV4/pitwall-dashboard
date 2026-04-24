import React, { useEffect, useState, useRef } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface Props {
  containerSelector?: string; // CSS selector do container scrollavel
}

/**
 * Botoes flutuantes para ir ao topo ou rodape do container de mensagens.
 * Aparecem apenas quando ha espaco para scrollar.
 */
export const ScrollButtons: React.FC<Props> = ({ containerSelector }) => {
  const [showTop, setShowTop] = useState(false);
  const [showBottom, setShowBottom] = useState(false);
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Acha o container scrollavel. Se nao foi passado selector, procura o mais proximo div com overflow-y-auto
    const findContainer = (): HTMLElement | null => {
      if (containerSelector) {
        return document.querySelector(containerSelector) as HTMLElement | null;
      }
      // Procura o primeiro elemento com classe 'overflow-y-auto' dentro do chat
      const candidates = document.querySelectorAll('.overflow-y-auto');
      for (const el of Array.from(candidates)) {
        const rect = el.getBoundingClientRect();
        if (rect.height > 200) return el as HTMLElement;
      }
      return null;
    };

    const container = findContainer();
    if (!container) return;
    containerRef.current = container;

    const updateButtons = () => {
      if (!container) return;
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      const maxScroll = scrollHeight - clientHeight;

      setShowTop(scrollTop > 200);
      setShowBottom(maxScroll - scrollTop > 200);
    };

    updateButtons();
    container.addEventListener('scroll', updateButtons, { passive: true });

    // Observer para detectar mudancas de conteudo (ex: nova mensagem adicionada)
    const observer = new MutationObserver(updateButtons);
    observer.observe(container, { childList: true, subtree: true });

    return () => {
      container.removeEventListener('scroll', updateButtons);
      observer.disconnect();
    };
  }, [containerSelector]);

  const scrollToTop = () => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    if (!containerRef.current) return;
    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  if (!showTop && !showBottom) return null;

  return (
    <div className="absolute right-4 bottom-20 flex flex-col gap-1.5 z-30 pointer-events-auto">
      {showTop && (
        <button
          onClick={scrollToTop}
          className="w-10 h-10 rounded-full bg-[#1a1a24] border border-[#e4243d]/40 text-[#ff4d5a] hover:bg-[#e4243d]/10 hover:border-[#e4243d]/70 shadow-xl flex items-center justify-center transition-all"
          title="Ir para o topo"
        >
          <ChevronUp size={16} />
        </button>
      )}
      {showBottom && (
        <button
          onClick={scrollToBottom}
          className="w-10 h-10 rounded-full bg-[#e4243d] hover:bg-[#ff4d5a] text-white shadow-xl flex items-center justify-center transition-all"
          title="Ir para o rodape"
        >
          <ChevronDown size={16} />
        </button>
      )}
    </div>
  );
};
