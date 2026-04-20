import React from 'react';
import { X } from 'lucide-react';
import { useAppStore } from '../../stores/app-store';

const STEP_COLORS: Record<string, string> = {
  Saber: 'bg-blue-500/20 text-blue-400',
  Ter: 'bg-amber-500/20 text-amber-400',
  Executar: 'bg-emerald-500/20 text-emerald-400',
  Potencializar: 'bg-purple-500/20 text-purple-400',
};

const HEALTH_DOTS: Record<string, string> = {
  green: 'bg-emerald-500',
  yellow: 'bg-amber-400',
  red: 'bg-red-500',
};

export const OverviewModal: React.FC = () => {
  const { clients, messages, setOverviewOpen } = useAppStore();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setOverviewOpen(false)}>
      <div className="w-full max-w-3xl bg-[#1a1a24] border border-slate-700 rounded-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <h2 className="text-sm font-semibold text-slate-200">Overview de Clientes</h2>
          <button onClick={() => setOverviewOpen(false)} className="text-slate-500 hover:text-slate-300">
            <X size={16} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-4 py-2 text-left text-slate-500 font-medium">Cliente</th>
                <th className="px-4 py-2 text-left text-slate-500 font-medium">Segmento</th>
                <th className="px-4 py-2 text-left text-slate-500 font-medium">STEP</th>
                <th className="px-4 py-2 text-left text-slate-500 font-medium">Pilar V4</th>
                <th className="px-4 py-2 text-left text-slate-500 font-medium">Health</th>
                <th className="px-4 py-2 text-right text-slate-500 font-medium">Mensagens</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => {
                const msgCount = Object.keys(messages)
                  .filter((k) => k.includes(c.id))
                  .reduce((sum, k) => sum + (messages[k]?.length ?? 0), 0);
                return (
                  <tr key={c.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                    <td className="px-4 py-2 font-medium text-slate-200">{c.name}</td>
                    <td className="px-4 py-2 text-slate-400">{c.segment}</td>
                    <td className="px-4 py-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${STEP_COLORS[c.step]}`}>{c.step}</span>
                    </td>
                    <td className="px-4 py-2 text-slate-400">{c.pilar}</td>
                    <td className="px-4 py-2">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${HEALTH_DOTS[c.health]}`} />
                        <span className="text-slate-400">{c.health}</span>
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-slate-500">{msgCount}</td>
                  </tr>
                );
              })}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-600">Nenhum cliente cadastrado</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
