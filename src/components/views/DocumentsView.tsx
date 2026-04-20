import React, { useMemo, useState } from 'react';
import { FileText, Search, Download, Star, Copy, FileCode, FileDown, Filter, Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../../stores/app-store';
import { AGENTS } from '../../lib/agents/agents-data';
import { exportMarkdown, exportHTML, exportPDF, safeFilename } from '../../lib/documents/exporters';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const DocumentsView: React.FC = () => {
  const { messages, clients, bookmarks, toggleBookmark } = useAppStore();
  const [query, setQuery] = useState('');
  const [filterAgent, setFilterAgent] = useState<string>('all');
  const [filterClient, setFilterClient] = useState<string>('all');
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const documents = useMemo(() => {
    const all: Array<{
      id: string;
      content: string;
      agentId: string;
      clientId: string;
      createdAt: string;
      preview: string;
      title: string;
    }> = [];

    Object.entries(messages).forEach(([key, msgs]) => {
      const [agentId, clientId] = key.split('_');
      msgs.forEach((m) => {
        if (m.role === 'bot' && m.content.length > 200) {
          const titleMatch = m.content.match(/^#+\s*(.+?)(?:\n|$)/m);
          const title = titleMatch ? titleMatch[1].trim() : m.content.split('\n')[0].slice(0, 60);
          all.push({
            id: m.id,
            content: m.content,
            agentId: m.agentId ?? agentId,
            clientId,
            createdAt: m.createdAt,
            preview: m.content.slice(0, 200).replace(/^#+\s*/gm, '').replace(/\n+/g, ' '),
            title,
          });
        }
      });
    });

    let filtered = all;

    if (onlyBookmarks) filtered = filtered.filter((d) => bookmarks.has(d.id));
    if (filterAgent !== 'all') filtered = filtered.filter((d) => d.agentId === filterAgent);
    if (filterClient !== 'all') filtered = filtered.filter((d) => d.clientId === filterClient);
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (d) => d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q)
      );
    }

    return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [messages, bookmarks, filterAgent, filterClient, query, onlyBookmarks]);

  const selectedDoc = documents.find((d) => d.id === selected);

  const handleExport = (format: 'md' | 'html' | 'pdf', content: string, title: string) => {
    const filename = safeFilename(title || 'documento');
    try {
      if (format === 'md') {
        exportMarkdown(content, filename);
        toast.success('Markdown exportado!');
      } else if (format === 'html') {
        exportHTML(content, title, filename);
        toast.success('HTML exportado!');
      } else {
        exportPDF(content, title);
        toast.success('Imprimindo PDF...');
      }
    } catch {
      toast.error('Erro ao exportar');
    }
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Copiado!');
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0f] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-[#111118]">
        <div>
          <h2 className="text-sm font-semibold text-slate-200">Biblioteca de Documentos</h2>
          <p className="text-[10px] text-slate-500">
            {documents.length} documento(s) · {bookmarks.size} favorito(s)
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800 bg-[#0d0d14]">
        <div className="relative flex-1 max-w-sm">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar em documentos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-md text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500/50"
          />
        </div>
        <select
          value={filterAgent}
          onChange={(e) => setFilterAgent(e.target.value)}
          className="px-2 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-md text-slate-200"
        >
          <option value="all">Todos agentes</option>
          {AGENTS.map((a) => (
            <option key={a.id} value={a.id}>{a.id} - {a.name}</option>
          ))}
        </select>
        <select
          value={filterClient}
          onChange={(e) => setFilterClient(e.target.value)}
          className="px-2 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-md text-slate-200"
        >
          <option value="all">Todos clientes</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button
          onClick={() => setOnlyBookmarks(!onlyBookmarks)}
          className={`flex items-center gap-1 px-2 py-1.5 text-xs rounded-md transition-colors ${
            onlyBookmarks
              ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30'
              : 'bg-slate-900 border border-slate-700 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Bookmark size={12} />
          Favoritos
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* List */}
        <div className="w-[380px] border-r border-slate-800 overflow-y-auto">
          {documents.length === 0 ? (
            <div className="p-8 text-center">
              <FileText size={32} className="mx-auto text-slate-700 mb-2" />
              <p className="text-xs text-slate-500">Nenhum documento ainda</p>
              <p className="text-[10px] text-slate-600 mt-1">Documentos sao criados a partir das respostas dos agentes</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {documents.map((doc) => {
                const agent = AGENTS.find((a) => a.id === doc.agentId);
                const client = clients.find((c) => c.id === doc.clientId);
                const isBookmarked = bookmarks.has(doc.id);
                return (
                  <button
                    key={doc.id}
                    onClick={() => setSelected(doc.id)}
                    className={`w-full text-left p-3 transition-colors ${
                      selected === doc.id ? 'bg-slate-800/60' : 'hover:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className="w-6 h-6 flex items-center justify-center rounded text-xs shrink-0"
                        style={{ backgroundColor: (agent?.color ?? '#888') + '22', color: agent?.color ?? '#888' }}
                      >
                        {agent?.icon ?? '?'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <h4 className="text-xs font-semibold text-slate-200 truncate flex-1">{doc.title}</h4>
                          {isBookmarked && <Star size={10} fill="currentColor" className="text-amber-400 shrink-0" />}
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{doc.preview}</p>
                        <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-600">
                          {client && <span>{client.name}</span>}
                          <span>{new Date(doc.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-y-auto bg-[#0a0a0f]">
          {selectedDoc ? (
            <div className="p-6 max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex-1 min-w-0">
                  <h1 className="text-base font-bold text-slate-200 truncate">{selectedDoc.title}</h1>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {AGENTS.find((a) => a.id === selectedDoc.agentId)?.name} ·{' '}
                    {clients.find((c) => c.id === selectedDoc.clientId)?.name ?? 'Geral'} ·{' '}
                    {new Date(selectedDoc.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center gap-1 ml-3">
                  <button
                    onClick={() => toggleBookmark(selectedDoc.id)}
                    className={`p-1.5 rounded transition-colors ${
                      bookmarks.has(selectedDoc.id)
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'text-slate-500 hover:text-amber-400'
                    }`}
                    title="Favoritar"
                  >
                    <Star size={14} fill={bookmarks.has(selectedDoc.id) ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={() => handleCopy(selectedDoc.content)}
                    className="p-1.5 text-slate-500 hover:text-slate-300 rounded"
                    title="Copiar"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={() => handleExport('md', selectedDoc.content, selectedDoc.title)}
                    className="p-1.5 text-slate-500 hover:text-blue-400 rounded"
                    title="Exportar Markdown"
                  >
                    <FileCode size={14} />
                  </button>
                  <button
                    onClick={() => handleExport('html', selectedDoc.content, selectedDoc.title)}
                    className="p-1.5 text-slate-500 hover:text-orange-400 rounded"
                    title="Exportar HTML"
                  >
                    <FileText size={14} />
                  </button>
                  <button
                    onClick={() => handleExport('pdf', selectedDoc.content, selectedDoc.title)}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded"
                    title="Exportar PDF"
                  >
                    <FileDown size={14} />
                  </button>
                </div>
              </div>
              <div className="prose prose-sm prose-invert max-w-none text-sm text-slate-300 leading-relaxed [&_table]:text-xs [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-slate-700 [&_td]:border [&_td]:border-slate-700 [&_th]:bg-slate-800 [&_h1]:text-xl [&_h2]:text-base [&_h3]:text-sm [&_blockquote]:border-l-red-500/50 [&_code]:bg-slate-900 [&_code]:px-1 [&_code]:rounded">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedDoc.content}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <FileText size={40} className="mx-auto text-slate-700 mb-3" />
                <p className="text-xs text-slate-500">Selecione um documento para visualizar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
