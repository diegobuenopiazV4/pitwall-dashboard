import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Brain, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Message } from '../../lib/agents/types';
import { MessageActions } from './MessageActions';

interface Props {
  message: Message;
  agentColor?: string;
  agentName?: string;
  clientName?: string;
}

export const MessageBubble: React.FC<Props> = ({ message, agentColor, agentName, clientName }) => {
  const isUser = message.role === 'user';
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const downloadImage = (dataUrl: string, index: number) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `pitwall-image-${Date.now()}-${index}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Imagem baixada');
  };

  return (
    <>
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div
          className={`max-w-[85%] px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-red-600/20 text-slate-200 rounded-br-sm'
              : 'bg-slate-800/60 text-slate-300 rounded-bl-sm'
          }`}
          style={!isUser && agentColor ? { borderLeft: `2px solid ${agentColor}33` } : undefined}
        >
          {/* Images (from Gemini Image Gen) */}
          {message.images && message.images.length > 0 && (
            <div className="grid grid-cols-2 gap-1.5 mb-2">
              {message.images.map((img, i) => (
                <div key={i} className="relative group">
                  <img
                    src={img}
                    alt={`Gerada ${i + 1}`}
                    onClick={() => setExpandedImage(img)}
                    className="w-full rounded-lg cursor-zoom-in border border-slate-700"
                  />
                  <button
                    onClick={() => downloadImage(img, i)}
                    className="absolute top-1 right-1 p-1 bg-slate-900/80 text-slate-300 opacity-0 group-hover:opacity-100 rounded transition-opacity"
                    title="Baixar"
                  >
                    <Download size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="prose prose-sm prose-invert max-w-none text-xs leading-relaxed [&_table]:text-[11px] [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1 [&_table]:border-collapse [&_th]:border [&_th]:border-slate-700 [&_td]:border [&_td]:border-slate-700 [&_th]:bg-slate-800 [&_code]:text-[11px] [&_code]:bg-slate-900 [&_code]:px-1 [&_code]:rounded [&_pre]:bg-slate-900 [&_pre]:rounded-lg [&_h2]:text-sm [&_h2]:mt-3 [&_h2]:mb-2 [&_h3]:text-xs [&_h3]:mt-2 [&_h3]:mb-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_blockquote]:border-l-red-500/50 [&_blockquote]:text-slate-400 [&_a]:text-blue-400">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>

          {/* Metadata footer (model, thinking, timestamp) */}
          <div className="flex items-center justify-between mt-1.5 flex-wrap gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] text-slate-600">
                {new Date(message.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
              {message.modelUsed && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                  message.modelProvider === 'claude'
                    ? 'bg-orange-500/10 text-orange-400'
                    : 'bg-blue-500/10 text-blue-400'
                }`}>
                  {message.modelUsed}
                </span>
              )}
              {message.thinkingTokens && message.thinkingTokens > 0 && (
                <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded-full">
                  <Brain size={9} />
                  {message.thinkingTokens}t
                </span>
              )}
            </div>
          </div>

          {!isUser && (
            <MessageActions content={message.content} messageId={message.id} agentName={agentName} clientName={clientName} />
          )}
        </div>
      </div>

      {/* Expanded image overlay */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setExpandedImage(null)}
        >
          <img src={expandedImage} alt="Expanded" className="max-w-full max-h-full rounded-lg" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              downloadImage(expandedImage, 0);
            }}
            className="absolute top-4 right-4 px-3 py-2 bg-white text-slate-900 rounded-lg font-medium text-sm flex items-center gap-1"
          >
            <Download size={14} />
            Baixar
          </button>
        </div>
      )}
    </>
  );
};
