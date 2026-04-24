import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface Props {
  /** ID do container scrollavel. Default: 'chat-messages-container' */
  targetId?: string;
}

/**
 * Botoes flutuantes de navegacao rapida (topo/fim).
 * Aparecem sempre que ha pelo menos 50px para scrollar em cada direcao.
 * Tambem forca comportamento de smooth scroll + overscroll-contain.
 */
export const ScrollButtons: React.FC<Props> = ({ targetId = 'chat-messages-container' }) => {
  const [state, setState] = useState({ canScrollUp: false, canScrollDown: false });
  const containerRef = useRef<HTMLElement | null>(null);
  const retryCountRef = useRef(0);

  const updateState = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const maxScroll = scrollHeight - clientHeight;
    setState({
      canScrollUp: scrollTop > 50,
      canScrollDown: maxScroll - scrollTop > 50,
    });
  }, []);

  useEffect(() => {
    const findAndBind = () => {
      const container = document.getElementById(targetId);
      if (!container) {
        // Retry ate 10x em intervalos de 200ms (container pode nao estar no DOM ainda)
        if (retryCountRef.current < 10) {
          retryCountRef.current++;
          setTimeout(findAndBind, 200);
        }
        return;
      }
      containerRef.current = container;
      retryCountRef.current = 0;
      updateState();

      const onScroll = () => updateState();
      container.addEventListener('scroll', onScroll, { passive: true });

      const resizeObs = new ResizeObserver(updateState);
      resizeObs.observe(container);

      const mutObs = new MutationObserver(updateState);
      mutObs.observe(container, { childList: true, subtree: true });

      return () => {
        container.removeEventListener('scroll', onScroll);
        resizeObs.disconnect();
        mutObs.disconnect();
      };
    };

    const cleanup = findAndBind();
    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, [targetId, updateState]);

  const scrollToTop = () => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    const c = containerRef.current;
    if (!c) return;
    c.scrollTo({ top: c.scrollHeight, behavior: 'smooth' });
  };

  if (!state.canScrollUp && !state.canScrollDown) return null;

  return (
    <div className="absolute right-4 bottom-24 flex flex-col gap-1.5 z-50 pointer-events-auto">
      {state.canScrollUp && (
        <button
          onClick={scrollToTop}
          className="w-10 h-10 rounded-full bg-[#1a1a24] border border-[#e4243d]/50 text-[#ff4d5a] hover:bg-[#e4243d]/10 hover:border-[#e4243d] hover:scale-110 shadow-xl flex items-center justify-center transition-all"
          title="Ir para o topo (Home)"
        >
          <ChevronUp size={18} />
        </button>
      )}
      {state.canScrollDown && (
        <button
          onClick={scrollToBottom}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e4243d] to-[#ff4d5a] text-white hover:scale-110 shadow-xl flex items-center justify-center transition-all ring-2 ring-[#e4243d]/20"
          title="Ir para o fim (End)"
        >
          <ChevronDown size={18} />
        </button>
      )}
    </div>
  );
};
