import React from 'react';
import { ConversationsList } from './ConversationsList';

/**
 * Sidebar unica estilo Claude chat.
 * Apenas conversas/threads agrupadas por tempo.
 * Agentes, Clientes, Tarefas e Sprint foram movidos para dropdowns no header do chat
 * e para o menu "Ferramentas" (botao global).
 */
export const Sidebar: React.FC = () => {
  return (
    <aside className="w-[260px] min-w-[260px] flex flex-col bg-[#111118] border-r border-slate-800 overflow-hidden">
      <ConversationsList />
    </aside>
  );
};
