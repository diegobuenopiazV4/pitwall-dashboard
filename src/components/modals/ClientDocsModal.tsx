import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, FileText, Trash2, FolderOpen, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../../stores/app-store';
import {
  listClientDocs,
  uploadClientDoc,
  deleteClientDoc,
  type ClientDoc,
} from '../../lib/clients/client-docs';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const ClientDocsModal: React.FC<Props> = ({ open, onClose }) => {
  const { currentClient, userId } = useAppStore();
  const [docs, setDocs] = useState<ClientDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && currentClient && userId) {
      loadDocs();
    }
  }, [open, currentClient, userId]);

  const loadDocs = async () => {
    if (!currentClient || !userId) return;
    setLoading(true);
    try {
      const list = await listClientDocs(userId, currentClient.id);
      setDocs(list);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (files: FileList) => {
    if (!currentClient || !userId) return;
    setUploading(true);
    try {
      const newDocs: ClientDoc[] = [];
      for (const file of Array.from(files)) {
        try {
          const doc = await uploadClientDoc(userId, currentClient.id, file);
          if (doc) newDocs.push(doc);
        } catch (err) {
          toast.error(err instanceof Error ? err.message : `Erro em ${file.name}`);
        }
      }
      if (newDocs.length > 0) {
        setDocs((prev) => [...prev, ...newDocs]);
        toast.success(`${newDocs.length} arquivo(s) adicionado(s)`);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc: ClientDoc) => {
    if (!confirm(`Remover ${doc.name}?`)) return;
    const ok = await deleteClientDoc(doc);
    if (ok) {
      setDocs((prev) => prev.filter((d) => d.id !== doc.id));
      toast.success('Removido');
    } else {
      toast.error('Erro ao remover');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[90vh] bg-[#1a1a24] border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <FolderOpen size={16} className="text-blue-400" />
            <h2 className="text-sm font-semibold text-slate-200">
              Documentos do Cliente {currentClient && `- ${currentClient.name}`}
            </h2>
            <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded">{docs.length}</span>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={16} />
          </button>
        </div>

        {!currentClient ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Selecione um cliente primeiro para gerenciar seus documentos.
          </div>
        ) : (
          <>
            {/* Upload area */}
            <div className="p-3">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files) handleUpload(e.dataTransfer.files);
                }}
                onClick={() => inputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  dragOver
                    ? 'border-red-500 bg-red-500/10 text-red-400'
                    : 'border-slate-700 hover:border-slate-600 text-slate-500 hover:text-slate-400'
                } ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
              >
                <Upload size={20} />
                <span className="text-xs font-medium">
                  {uploading ? 'Enviando...' : 'Arraste arquivos ou clique'}
                </span>
                <span className="text-[10px] text-slate-600">
                  PDF, DOCX, TXT, MD, CSV, JSON (max 5MB cada)
                </span>
              </div>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.md,.csv,.json,.xlsx"
                onChange={(e) => e.target.files && handleUpload(e.target.files)}
                className="hidden"
              />
            </div>

            {/* Docs list */}
            <div className="flex-1 overflow-y-auto px-3 pb-3">
              {loading ? (
                <div className="text-center py-8 text-xs text-slate-500">Carregando...</div>
              ) : docs.length === 0 ? (
                <div className="text-center py-8">
                  <FileText size={32} className="mx-auto text-slate-700 mb-2" />
                  <p className="text-xs text-slate-500">Nenhum documento ainda</p>
                  <p className="text-[10px] text-slate-600 mt-1">
                    Os documentos serao lidos automaticamente quando voce conversar com os agentes sobre {currentClient.name}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {docs.map((doc) => (
                    <div
                      key={doc.id}
                      className="group flex items-center gap-2 p-2 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-slate-700"
                    >
                      <FileText size={14} className="text-blue-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-200 truncate">{doc.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {doc.type} · {Math.round(doc.size / 1024)}KB ·{' '}
                          {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      {doc.url && (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-600 hover:text-blue-400"
                          title="Baixar"
                        >
                          <Download size={12} />
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(doc)}
                        className="p-1.5 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100"
                        title="Remover"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-4 py-2 border-t border-slate-800 bg-[#111118] text-[10px] text-slate-600">
              Os documentos do cliente selecionado sao injetados automaticamente no contexto dos agentes quando voce conversa sobre {currentClient.name}.
            </div>
          </>
        )}
      </div>
    </div>
  );
};
