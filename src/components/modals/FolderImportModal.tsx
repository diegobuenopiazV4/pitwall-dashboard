import React, { useState, useRef } from 'react';
import { X, FolderOpen, Check, AlertCircle, FolderTree, Upload, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../../stores/app-store';
import { saveClient } from '../../hooks/useSupabaseSync';
import type { Pilar, StepPhase, HealthScore } from '../../lib/agents/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface DetectedFolder {
  name: string;
  path: string;
  fileCount: number;
  selected: boolean;
  clientName: string;
  segment: string;
}

const BRAND_PALETTE = [
  '#ff4444', '#448aff', '#00e676', '#ff9100', '#e040fb', '#00bcd4',
  '#ffeb3b', '#4caf50', '#f44336', '#9c27b0', '#2196f3', '#ff5722',
];

function supportsFileSystemAccess(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

function cleanName(folderName: string): string {
  // Remove prefixos comuns, underscores, datas
  return folderName
    .replace(/^(_|-|\d{4}-\d{2}-\d{2}[\s_-]?)/, '')
    .replace(/[-_]/g, ' ')
    .trim()
    .toUpperCase();
}

export const FolderImportModal: React.FC<Props> = ({ open, onClose }) => {
  const { userId, addClient } = useAppStore();
  const [step, setStep] = useState<'select' | 'review' | 'importing'>('select');
  const [rootFolder, setRootFolder] = useState<string>('');
  const [detected, setDetected] = useState<DetectedFolder[]>([]);
  const [scanning, setScanning] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [defaultPilar, setDefaultPilar] = useState<Pilar>('Aquisicao');
  const [defaultStep, setDefaultStep] = useState<StepPhase>('Saber');
  const [defaultHealth] = useState<HealthScore>('yellow');
  const fallbackInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  // Caminho A: File System Access API (Chrome, Edge)
  const handlePickDirectory = async () => {
    if (!supportsFileSystemAccess()) {
      toast.error('Seu navegador nao suporta selecao de pasta. Use Chrome ou Edge.');
      fallbackInputRef.current?.click();
      return;
    }

    setScanning(true);
    try {
      // @ts-ignore - File System Access API
      const dirHandle = await window.showDirectoryPicker({
        mode: 'read',
        startIn: 'documents',
      });

      setRootFolder(dirHandle.name);
      const folders: DetectedFolder[] = [];

      // @ts-ignore - iterate entries
      for await (const [name, handle] of dirHandle.entries()) {
        if (handle.kind !== 'directory') continue;
        if (name.startsWith('.')) continue; // ignora .git, .vscode, etc.

        // Conta arquivos recursivamente (limitado a 100 para performance)
        let fileCount = 0;
        try {
          // @ts-ignore
          for await (const entry of handle.values()) {
            if (entry.kind === 'file') fileCount++;
            if (fileCount >= 100) break;
          }
        } catch { /* silent */ }

        folders.push({
          name,
          path: `${dirHandle.name}/${name}`,
          fileCount,
          selected: true,
          clientName: cleanName(name),
          segment: '',
        });
      }

      if (folders.length === 0) {
        toast.error('Nenhuma subpasta encontrada');
        setScanning(false);
        return;
      }

      setDetected(folders);
      setStep('review');
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        toast.error('Erro ao ler pasta');
      }
    } finally {
      setScanning(false);
    }
  };

  // Caminho B: Fallback <input webkitdirectory> (Firefox, Safari)
  const handleFallbackFolder = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setScanning(true);
    const map = new Map<string, { count: number }>();
    let rootName = '';

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // @ts-ignore webkitRelativePath
      const path: string = file.webkitRelativePath || file.name;
      const parts = path.split('/');
      if (parts.length < 2) continue;

      if (!rootName) rootName = parts[0];

      // parts[1] = nome da subpasta direta (ou arquivo se na raiz)
      if (parts.length >= 3) {
        const subfolder = parts[1];
        if (subfolder.startsWith('.')) continue;
        const current = map.get(subfolder) || { count: 0 };
        current.count++;
        map.set(subfolder, current);
      }
    }

    const folders: DetectedFolder[] = Array.from(map.entries()).map(([name, info]) => ({
      name,
      path: `${rootName}/${name}`,
      fileCount: info.count,
      selected: true,
      clientName: cleanName(name),
      segment: '',
    }));

    if (folders.length === 0) {
      toast.error('Nenhuma subpasta encontrada');
      setScanning(false);
      return;
    }

    setRootFolder(rootName);
    setDetected(folders);
    setStep('review');
    setScanning(false);
  };

  const toggleFolder = (index: number) => {
    setDetected((prev) => prev.map((f, i) => i === index ? { ...f, selected: !f.selected } : f));
  };

  const updateField = (index: number, field: 'clientName' | 'segment', value: string) => {
    setDetected((prev) => prev.map((f, i) => i === index ? { ...f, [field]: value } : f));
  };

  const selectAll = (on: boolean) => {
    setDetected((prev) => prev.map((f) => ({ ...f, selected: on })));
  };

  const handleImport = async () => {
    const selected = detected.filter((f) => f.selected);
    if (selected.length === 0) {
      toast.error('Selecione ao menos 1 pasta');
      return;
    }

    setStep('importing');
    setImporting(true);
    let created = 0;

    for (let i = 0; i < selected.length; i++) {
      const folder = selected[i];
      const color = BRAND_PALETTE[i % BRAND_PALETTE.length];
      const newClient = {
        userId: userId || 'offline',
        name: folder.clientName.toUpperCase().trim(),
        segment: folder.segment.trim() || 'Importado de pasta',
        step: defaultStep,
        pilar: defaultPilar,
        health: defaultHealth,
        slug: folder.clientName.toLowerCase().replace(/\s+/g, '-'),
        brandColor: color,
        folderHandle: folder.path,
        notifyOnApproval: true,
      };

      let saved = null;
      if (userId && userId !== 'offline' && !userId.startsWith('offline-')) {
        try {
          saved = await saveClient(newClient as any);
        } catch { /* silent */ }
      }

      const client = saved ?? {
        ...newClient,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addClient(client as any);
      created++;
      setProgress(Math.round((i + 1) / selected.length * 100));
      // Pequena pausa para UI atualizar
      await new Promise((r) => setTimeout(r, 30));
    }

    setImporting(false);
    toast.success(`${created} cliente(s) importados de ${rootFolder}/`);
    reset();
    onClose();
  };

  const reset = () => {
    setStep('select');
    setRootFolder('');
    setDetected([]);
    setProgress(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={step !== 'importing' ? onClose : undefined}>
      <div
        className="w-full max-w-3xl max-h-[90vh] bg-[#1a1a24] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderTree size={16} className="text-blue-400" />
            <h2 className="text-sm font-semibold text-slate-200">
              {step === 'select' && 'Importar clientes de pasta'}
              {step === 'review' && `Revisar ${detected.filter(d => d.selected).length}/${detected.length} pastas detectadas`}
              {step === 'importing' && `Importando ${progress}%`}
            </h2>
          </div>
          {step !== 'importing' && (
            <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1">
              <X size={16} />
            </button>
          )}
        </div>

        {/* SELECT STEP */}
        {step === 'select' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="text-center space-y-4 py-8">
              <div className="mx-auto w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                <FolderOpen size={32} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-100 mb-2">
                  Selecione a pasta que contem todos os clientes
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Cada subpasta dentro dela sera transformada em um cliente. O nome da subpasta
                  vira o nome do cliente automaticamente.
                </p>
              </div>

              <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg text-left max-w-md mx-auto">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Estrutura esperada:
                </p>
                <pre className="text-[11px] text-slate-300 font-mono leading-relaxed">
{`Clientes/             <-- voce seleciona esta
  Empresa-A/          <-- vira cliente "EMPRESA A"
  Empresa-B/          <-- vira cliente "EMPRESA B"
  Startup-XYZ/        <-- vira cliente "STARTUP XYZ"
  ...`}
                </pre>
              </div>

              <div className="flex flex-col gap-2 max-w-xs mx-auto">
                <button
                  onClick={handlePickDirectory}
                  disabled={scanning}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-2"
                >
                  <FolderOpen size={14} />
                  {scanning ? 'Escaneando...' : 'Selecionar pasta'}
                </button>

                <input
                  ref={fallbackInputRef}
                  type="file"
                  // @ts-ignore - Atributos nao-padrao para seletor de pasta
                  webkitdirectory=""
                  directory=""
                  multiple
                  onChange={handleFallbackFolder}
                  className="hidden"
                />

                {!supportsFileSystemAccess() && (
                  <button
                    onClick={() => fallbackInputRef.current?.click()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg flex items-center justify-center gap-2"
                  >
                    <Upload size={12} />
                    Usar seletor compativel
                  </button>
                )}

                <p className="text-[10px] text-slate-500 mt-2">
                  Use Chrome ou Edge para melhor experiencia.<br />
                  Nenhum arquivo e enviado, tudo processado localmente.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* REVIEW STEP */}
        {step === 'review' && (
          <>
            <div className="px-6 py-3 border-b border-slate-700 bg-[#111118] flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <FolderOpen size={12} />
                <span className="font-mono">{rootFolder}/</span>
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-slate-500">Pilar default:</label>
                <select
                  value={defaultPilar}
                  onChange={(e) => setDefaultPilar(e.target.value as Pilar)}
                  className="px-2 py-1 text-[11px] bg-slate-900 border border-slate-700 rounded text-slate-200"
                >
                  <option value="Aquisicao">Aquisicao</option>
                  <option value="Engajamento">Engajamento</option>
                  <option value="Monetizacao">Monetizacao</option>
                  <option value="Retencao">Retencao</option>
                </select>
                <label className="text-[10px] text-slate-500 ml-2">STEP:</label>
                <select
                  value={defaultStep}
                  onChange={(e) => setDefaultStep(e.target.value as StepPhase)}
                  className="px-2 py-1 text-[11px] bg-slate-900 border border-slate-700 rounded text-slate-200"
                >
                  <option value="Saber">Saber</option>
                  <option value="Ter">Ter</option>
                  <option value="Executar">Executar</option>
                  <option value="Potencializar">Potencializar</option>
                </select>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => selectAll(true)}
                  className="text-[11px] text-blue-400 hover:text-blue-300"
                >
                  Todas
                </button>
                <span className="text-slate-700">/</span>
                <button
                  onClick={() => selectAll(false)}
                  className="text-[11px] text-slate-500 hover:text-slate-300"
                >
                  Nenhuma
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
              {detected.map((folder, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border transition-colors ${
                    folder.selected
                      ? 'bg-blue-500/5 border-blue-500/30'
                      : 'bg-slate-900/50 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={folder.selected}
                      onChange={() => toggleFolder(idx)}
                      className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-blue-500 focus:ring-blue-500/30 shrink-0"
                    />
                    <FolderOpen size={14} className="text-amber-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-mono text-slate-500 truncate">
                        {folder.name}/
                      </div>
                    </div>
                    <ChevronRight size={12} className="text-slate-600 shrink-0" />
                    <div className="grid grid-cols-2 gap-2 flex-[2]">
                      <input
                        type="text"
                        value={folder.clientName}
                        onChange={(e) => updateField(idx, 'clientName', e.target.value)}
                        placeholder="Nome do cliente"
                        disabled={!folder.selected}
                        className="px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                      />
                      <input
                        type="text"
                        value={folder.segment}
                        onChange={(e) => updateField(idx, 'segment', e.target.value)}
                        placeholder="Segmento (opcional)"
                        disabled={!folder.selected}
                        className="px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0 w-16 text-right">
                      {folder.fileCount} arq.
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 px-6 py-4 border-t border-slate-700 bg-[#111118]">
              <button
                onClick={() => { setStep('select'); setDetected([]); }}
                className="flex-1 px-4 py-2.5 text-xs text-slate-400 bg-slate-800 rounded-lg hover:bg-slate-700"
              >
                Voltar
              </button>
              <button
                onClick={handleImport}
                disabled={detected.filter((d) => d.selected).length === 0}
                className="flex-1 px-4 py-2.5 text-xs text-white bg-blue-600 rounded-lg hover:bg-blue-500 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
              >
                <Check size={12} />
                Importar {detected.filter((d) => d.selected).length} cliente(s)
              </button>
            </div>
          </>
        )}

        {/* IMPORTING STEP */}
        {step === 'importing' && (
          <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-sm text-slate-300">Importando clientes...</p>
            <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">{progress}% concluido</p>
            {!importing && progress >= 100 && (
              <div className="flex items-center gap-2 text-emerald-400">
                <Check size={14} />
                <span className="text-xs">Importacao concluida!</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
