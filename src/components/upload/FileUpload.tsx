import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, Image as ImageIcon, FileSpreadsheet, Paperclip } from 'lucide-react';
import toast from 'react-hot-toast';

export interface AttachedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl?: string;
  text?: string;
}

interface Props {
  attachedFiles: AttachedFile[];
  onAttach: (files: AttachedFile[]) => void;
  onRemove: (id: string) => void;
  compact?: boolean;
}

const MAX_SIZE_MB = 5;
const ACCEPTED_TYPES = ['image/*', '.pdf', '.csv', '.txt', '.md', '.json'];

export const FileUpload: React.FC<Props> = ({ attachedFiles, onAttach, onRemove, compact = false }) => {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    async (files: FileList) => {
      const accepted: AttachedFile[] = [];

      for (const file of Array.from(files)) {
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          toast.error(`${file.name} excede ${MAX_SIZE_MB}MB`);
          continue;
        }

        const id = crypto.randomUUID();
        const base: AttachedFile = {
          id,
          name: file.name,
          type: file.type,
          size: file.size,
        };

        if (file.type.startsWith('image/')) {
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          accepted.push({ ...base, dataUrl });
        } else if (
          file.type === 'text/plain' ||
          file.type === 'text/csv' ||
          file.type === 'application/json' ||
          file.name.endsWith('.md') ||
          file.name.endsWith('.csv') ||
          file.name.endsWith('.txt')
        ) {
          const text = await file.text();
          accepted.push({ ...base, text });
        } else {
          accepted.push(base);
        }
      }

      if (accepted.length > 0) {
        onAttach(accepted);
        toast.success(`${accepted.length} arquivo(s) anexado(s)`);
      }
    },
    [onAttach]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
    if (inputRef.current) inputRef.current.value = '';
  };

  const iconFor = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon size={11} className="text-blue-400" />;
    if (type.includes('csv') || type.includes('spreadsheet')) return <FileSpreadsheet size={11} className="text-emerald-400" />;
    return <FileText size={11} className="text-slate-400" />;
  };

  if (compact) {
    return (
      <>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
          title="Anexar arquivo"
        >
          <Paperclip size={16} />
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleChange}
          className="hidden"
        />
      </>
    );
  }

  return (
    <div>
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {attachedFiles.map((file) => (
            <div key={file.id} className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-300 max-w-[200px]">
              {iconFor(file.type)}
              <span className="truncate">{file.name}</span>
              <button
                onClick={() => onRemove(file.id)}
                className="text-slate-500 hover:text-red-400"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex items-center justify-center gap-2 py-1.5 border border-dashed rounded-lg cursor-pointer transition-colors text-[10px] ${
          dragOver
            ? 'border-red-500 bg-red-500/10 text-red-400'
            : 'border-slate-700 hover:border-slate-600 text-slate-500 hover:text-slate-400'
        }`}
      >
        <Upload size={11} />
        <span>Arraste arquivos ou clique (max {MAX_SIZE_MB}MB)</span>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
};
