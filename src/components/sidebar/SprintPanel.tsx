import React from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../../stores/app-store';
import { exportSprintCSV, exportKPITemplate } from '../../lib/documents/xlsx-export';

export const SprintPanel: React.FC = () => {
  const { sprintWeek, sprintGoals, tasks, currentClient, setSprintWeek, setSprintGoals } = useAppStore();

  const handleGoalsChange = (value: string) => {
    setSprintGoals(value.split('\n').filter(Boolean));
  };

  const handleExportSprint = () => {
    if (!sprintWeek) {
      toast.error('Configure a semana primeiro');
      return;
    }
    exportSprintCSV(sprintWeek, sprintGoals, tasks);
    toast.success('Sprint exportada em CSV');
  };

  const handleExportKPI = () => {
    exportKPITemplate(currentClient?.name || 'Cliente');
    toast.success('Template KPIs exportado');
  };

  return (
    <div className="p-3 space-y-4">
      <div>
        <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Semana
        </label>
        <input
          type="text"
          placeholder="Ex: Semana 14 - 31/03 a 04/04"
          value={sprintWeek}
          onChange={(e) => setSprintWeek(e.target.value)}
          className="w-full px-2.5 py-2 text-xs bg-slate-900 border border-slate-700 rounded-md text-slate-200 placeholder:text-slate-600"
        />
      </div>

      <div>
        <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Metas (uma por linha)
        </label>
        <textarea
          placeholder="ROAS > 3x&#10;5 criativos novos&#10;Calendario aprovado"
          value={sprintGoals.join('\n')}
          onChange={(e) => handleGoalsChange(e.target.value)}
          rows={6}
          className="w-full px-2.5 py-2 text-xs bg-slate-900 border border-slate-700 rounded-md text-slate-200 placeholder:text-slate-600 resize-none"
        />
      </div>

      <div className="pt-2 border-t border-slate-800 space-y-1.5">
        <button
          onClick={handleExportSprint}
          disabled={!sprintWeek}
          className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 disabled:opacity-40 rounded-md transition-colors"
        >
          <Download size={11} />
          Exportar Sprint (CSV)
        </button>
        <button
          onClick={handleExportKPI}
          className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-[10px] text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-md transition-colors"
        >
          <FileSpreadsheet size={11} />
          Template KPIs (CSV)
        </button>
      </div>

      <div className="pt-2 border-t border-slate-800">
        <p className="text-[10px] text-slate-600">
          Sprint ativa sera incluida no contexto dos agentes quando o flag "Sprint" estiver ativado no painel direito.
        </p>
      </div>
    </div>
  );
};
