import React, { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../../stores/app-store';
import { saveClient } from '../../hooks/useSupabaseSync';
import type { Pilar, StepPhase, HealthScore } from '../../lib/agents/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

const PILARES: Pilar[] = ['Aquisicao', 'Engajamento', 'Monetizacao', 'Retencao'];
const STEPS: StepPhase[] = ['Saber', 'Ter', 'Executar', 'Potencializar'];
const HEALTHS: { value: HealthScore; label: string; color: string }[] = [
  { value: 'green', label: 'Saudavel', color: 'bg-emerald-500' },
  { value: 'yellow', label: 'Atencao', color: 'bg-amber-400' },
  { value: 'red', label: 'Critico', color: 'bg-red-500' },
];

export const NewClientModal: React.FC<Props> = ({ open, onClose }) => {
  const { userId, addClient } = useAppStore();
  const [name, setName] = useState('');
  const [segment, setSegment] = useState('');
  const [step, setStep] = useState<StepPhase>('Saber');
  const [pilar, setPilar] = useState<Pilar>('Aquisicao');
  const [health, setHealth] = useState<HealthScore>('yellow');
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Informe o nome do cliente');
      return;
    }
    setSaving(true);
    const newClient = {
      userId: userId || 'offline',
      name: name.toUpperCase().trim(),
      segment: segment.trim(),
      step,
      pilar,
      health,
    };

    let saved = null;
    if (userId && userId !== 'offline') {
      saved = await saveClient(newClient);
    }

    const client = saved ?? {
      ...newClient,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addClient(client);
    toast.success(`Cliente ${client.name} adicionado`);
    setName('');
    setSegment('');
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-[#1a1a24] border border-slate-700 rounded-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <h2 className="text-sm font-semibold text-slate-200">Novo Cliente</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: CLIENTE EXEMPLO"
              autoFocus
              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500/50"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Segmento</label>
            <input
              type="text"
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              placeholder="Ex: Tecnologia, E-commerce, Saude..."
              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500/50"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Fase STEP</label>
            <div className="grid grid-cols-4 gap-1">
              {STEPS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStep(s)}
                  className={`py-1.5 text-[10px] rounded-md transition-colors ${
                    step === s
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Pilar V4</label>
            <div className="grid grid-cols-2 gap-1">
              {PILARES.map((p) => (
                <button
                  key={p}
                  onClick={() => setPilar(p)}
                  className={`py-1.5 text-[10px] rounded-md transition-colors ${
                    pilar === p
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Health Score</label>
            <div className="grid grid-cols-3 gap-1">
              {HEALTHS.map((h) => (
                <button
                  key={h.value}
                  onClick={() => setHealth(h.value)}
                  className={`flex items-center justify-center gap-1.5 py-1.5 text-[10px] rounded-md transition-colors ${
                    health === h.value
                      ? 'bg-slate-700 text-white ring-1 ring-slate-500'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${h.color}`} />
                  {h.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 px-4 py-3 border-t border-slate-700 bg-[#111118]">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-3 py-2 text-xs text-slate-400 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="flex-1 px-3 py-2 text-xs text-white bg-red-600 rounded-lg hover:bg-red-500 disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Adicionar'}
          </button>
        </div>
      </div>
    </div>
  );
};
