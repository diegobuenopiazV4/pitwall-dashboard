import React, { useState } from 'react';
import { Copy, Download, Check, FileText, FileCode, FileDown, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { exportMarkdown, exportHTML, exportPDF, safeFilename } from '../../lib/documents/exporters';
import { useAppStore } from '../../stores/app-store';

interface Props {
  content: string;
  messageId?: string;
  agentName?: string;
  clientName?: string;
}

export const MessageActions: React.FC<Props> = ({ content, messageId, agentName, clientName }) => {
  const { bookmarks, toggleBookmark } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isBookmarked = messageId ? bookmarks.has(messageId) : false;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('Copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const title = [agentName, clientName, new Date().toISOString().slice(0, 10)].filter(Boolean).join(' - ');
  const filename = safeFilename(title || 'documento');

  const handleExport = (format: 'md' | 'html' | 'pdf') => {
    try {
      if (format === 'md') {
        exportMarkdown(content, filename);
        toast.success('Markdown exportado!');
      } else if (format === 'html') {
        exportHTML(content, title || 'Documento', filename);
        toast.success('HTML exportado!');
      } else if (format === 'pdf') {
        exportPDF(content, title || 'Documento');
        toast.success('Abrindo janela de impressao...');
      }
    } catch {
      toast.error('Erro ao exportar');
    } finally {
      setMenuOpen(false);
    }
  };

  const handleBookmark = () => {
    if (!messageId) return;
    toggleBookmark(messageId);
    toast.success(isBookmarked ? 'Removido dos favoritos' : 'Favoritado!');
  };

  return (
    <div className="flex items-center gap-1 mt-2">
      <button
        onClick={handleCopy}
        className="flex items-center gap-1 px-2 py-1 text-[10px] text-slate-500 hover:text-slate-200 hover:bg-slate-700/50 rounded transition-colors"
        title="Copiar"
      >
        {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
        {copied ? 'Copiado' : 'Copiar'}
      </button>

      {messageId && (
        <button
          onClick={handleBookmark}
          className={`flex items-center gap-1 px-2 py-1 text-[10px] rounded transition-colors ${
            isBookmarked
              ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
              : 'text-slate-500 hover:text-amber-400 hover:bg-slate-700/50'
          }`}
          title={isBookmarked ? 'Desfavoritar' : 'Favoritar'}
        >
          <Star size={11} fill={isBookmarked ? 'currentColor' : 'none'} />
          {isBookmarked ? 'Favorito' : 'Favoritar'}
        </button>
      )}

      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-1 px-2 py-1 text-[10px] text-slate-500 hover:text-slate-200 hover:bg-slate-700/50 rounded transition-colors"
          title="Exportar"
        >
          <Download size={11} />
          Salvar como
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute left-0 top-full mt-1 z-20 bg-[#1a1a24] border border-slate-700 rounded-lg shadow-lg overflow-hidden min-w-[160px]">
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
    </div>
  );
};
