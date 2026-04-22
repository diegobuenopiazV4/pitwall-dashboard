import React, { useState, useEffect } from 'react';
import { ExternalLink, Eye, Calendar, Download } from 'lucide-react';
import { getPublicShare, type PublicShare } from '../../lib/integrations/sharing';

/**
 * Pagina publica de shares (/share/:slug).
 * Nao requer auth - qualquer um com o link pode ver.
 * Para checkin: renderiza iframe com o HTML.
 * Para conversa/documento: renderiza markdown.
 */
export const SharePage: React.FC<{ slug: string }> = ({ slug }) => {
  const [share, setShare] = useState<PublicShare | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const data = await getPublicShare(slug);
      if (!data) {
        setError('Share nao encontrado, expirado ou removido');
      } else {
        setShare(data);
      }
      setLoading(false);
    })();
  }, [slug]);

  const handleDownload = () => {
    if (!share) return;
    const ext = share.contentType === 'html' ? 'html' : 'md';
    const blob = new Blob([share.content], { type: share.contentType === 'html' ? 'text/html' : 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${share.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 border-2 border-slate-700 border-t-red-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-500">Carregando share...</p>
        </div>
      </div>
    );
  }

  if (error || !share) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
        <div className="max-w-md text-center">
          <div className="text-5xl mb-3">🔒</div>
          <h1 className="text-lg font-bold text-slate-200 mb-1">Share indisponivel</h1>
          <p className="text-xs text-slate-500 mb-4">{error ?? 'Link invalido'}</p>
          <a
            href="/"
            className="inline-flex items-center gap-1 px-3 py-2 text-xs text-white bg-red-600 rounded-lg hover:bg-red-500"
          >
            <ExternalLink size={12} />
            Ir para o V4 PIT WALL
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header publico */}
      <header className="bg-[#111118] border-b border-slate-800 px-4 py-2 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold">
            <span className="text-red-500">V4</span>{' '}
            <span className="text-slate-300">PIT WALL</span>
          </h1>
          <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-500 rounded">share publico</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <Eye size={10} />
            {share.views} views
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={10} />
            {new Date(share.createdAt).toLocaleDateString('pt-BR')}
          </span>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-2 py-1 text-[10px] text-slate-400 hover:text-white"
          >
            <Download size={10} />
            Baixar
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="p-4">
        <h2 className="text-lg font-semibold text-slate-200 mb-3">{share.title}</h2>

        {share.contentType === 'html' ? (
          <iframe
            srcDoc={share.content}
            className="w-full h-[calc(100vh-120px)] rounded-lg border border-slate-800"
            sandbox="allow-scripts allow-same-origin"
            title={share.title}
          />
        ) : (
          <div className="max-w-4xl mx-auto bg-[#1a1a24] p-6 rounded-lg">
            <pre className="whitespace-pre-wrap text-xs text-slate-300 font-sans leading-relaxed">
              {share.content}
            </pre>
          </div>
        )}
      </div>

      <footer className="text-center py-4 text-[10px] text-slate-600 border-t border-slate-800">
        Gerado via{' '}
        <a href="/" className="text-red-500 hover:underline">
          V4 PIT WALL
        </a>
        {' '}· V4 Company / Ruston Assessoria
      </footer>
    </div>
  );
};
