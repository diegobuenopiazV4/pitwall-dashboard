import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-red-600/20 text-slate-200 rounded-br-sm'
            : 'bg-slate-800/60 text-slate-300 rounded-bl-sm'
        }`}
        style={!isUser && agentColor ? { borderLeft: `2px solid ${agentColor}33` } : undefined}
      >
        <div className="prose prose-sm prose-invert max-w-none text-xs leading-relaxed [&_table]:text-[11px] [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1 [&_table]:border-collapse [&_th]:border [&_th]:border-slate-700 [&_td]:border [&_td]:border-slate-700 [&_th]:bg-slate-800 [&_code]:text-[11px] [&_code]:bg-slate-900 [&_code]:px-1 [&_code]:rounded [&_pre]:bg-slate-900 [&_pre]:rounded-lg [&_h2]:text-sm [&_h2]:mt-3 [&_h2]:mb-2 [&_h3]:text-xs [&_h3]:mt-2 [&_h3]:mb-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_blockquote]:border-l-red-500/50 [&_blockquote]:text-slate-400 [&_a]:text-blue-400">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[9px] text-slate-600">
            {new Date(message.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        {!isUser && (
          <MessageActions content={message.content} messageId={message.id} agentName={agentName} clientName={clientName} />
        )}
      </div>
    </div>
  );
};
