import React, { useState } from 'react';
import { Download, FileCode, FileText, FileDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../../stores/app-store';
import { exportMarkdown, exportHTML, exportPDF, safeFilename } from '../../lib/documents/exporters';

export const ExportConversation: React.FC = () => {
  const { currentAgent, currentClient, messages, getConvKey } = useAppStore();
  const [open, setOpen] = useState(false);

  const convKey = getConvKey();
  const currentMessages = messages[convKey] ?? [];

  if (currentMessages.length === 0) return null;

  const buildMarkdown = (): string => {
    const header = [
      `# Conversa - ${currentAgent?.name ?? 'Agente'}`,
      currentClient ? `**Cliente:** ${currentClient.name}` : '',
      `**Data:** ${new Date().toLocaleString('pt-BR')}`,
      `**Total:** ${currentMessages.length} mensagens`,
      '',
      '---',
      '',
    ].filter(Boolean).join('\n');

    const body = currentMessages
      .map((m) => {
        const role = m.role === 'user' ? `## Usuario` : `## ${currentAgent?.name ?? 'Agente'}`;
        const time = new Date(m.createdAt).toLocaleTimeString('pt-BR');
        return `${role}\n*${time}*\n\n${m.content}\n`;
      })
      .join('\n---\n\n');

    return `${header}\n${body}`;
  };

  const title = `conversa-${currentAgent?.name ?? 'agente'}-${currentClient?.name ?? 'geral'}-${new Date().toISOString().slice(0, 10)}`;
  const filename = safeFilename(title);

  const handleExport = (format: 'md' | 'html' | 'pdf') => {
    const md = buildMarkdown();
    try {
      if (format === 'md') {
        exportMarkdown(md, filename);
        toast.success('Conversa exportada!');
      } else if (format === 'html') {
        exportHTML(md, title, filename);
        toast.success('Conversa em HTML!');
      } else {
        exportPDF(md, title);
        toast.success('Abrindo PDF...');
      }
    } catch {
      toast.error('Erro ao exportar');
    } finally {
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 text-[10px] text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-md transition-colors"
        title="Exportar toda a conversa"
      >
        <Download size={11} />
        Exportar conversa
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 bg-[#1a1a24] border border-slate-700 rounded-lg shadow-lg overflow-hidden min-w-[180px]">
            <div className="px-3 py-1.5 text-[9px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-800">
              {currentMessages.length} mensagens
            </div>
            <button
              onClick={() => handleExport('md')}
              className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-slate-300 hover:bg-slate-800 text-left"
            >
              <FileCode size={12} className="text-blue-400" />
              Markdown (.md)
            </button>
            <button
              onClick={() => handleExport('html')}
              className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-slate-300 hover:bg-slate-800 text-left"
            >
              <FileText size={12} className="text-orange-400" />
              HTML (.html)
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-slate-300 hover:bg-slate-800 text-left"
            >
              <FileDown size={12} className="text-red-400" />
              PDF (imprimir)
            </button>
          </div>
        </>
      )}
    </div>
  );
};
