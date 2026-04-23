import React, { useState } from 'react';
import { Briefcase, Plus, X, DollarSign, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../../stores/app-store';
import { updateClientRemote } from '../../hooks/useSupabaseSync';
import type { ServiceCategory, ServiceContract } from '../../lib/agents/types';

const SERVICE_CATALOG: { category: ServiceCategory; label: string; icon: string; shortAgents: string }[] = [
  { category: 'estrategia', label: 'Estrategia', icon: '\u2655', shortAgents: 'Mestre' },
  { category: 'trafego', label: 'Trafego Pago', icon: '\uD83D\uDE80', shortAgents: 'Google+Meta' },
  { category: 'design', label: 'Design Ads', icon: '\uD83C\uDFA8', shortAgents: 'Designer Ads' },
  { category: 'social', label: 'Social Media', icon: '\uD83D\uDCF1', shortAgents: 'Social+Design' },
  { category: 'conteudo', label: 'Copy/Conteudo', icon: '\u270D\uFE0F', shortAgents: 'Copy+Content' },
  { category: 'seo', label: 'SEO', icon: '\uD83D\uDD0D', shortAgents: 'SEO' },
  { category: 'crm', label: 'CRM', icon: '\uD83D\uDCE7', shortAgents: 'CRM' },
  { category: 'automacao', label: 'Automacao', icon: '\u2699\uFE0F', shortAgents: 'Autom.' },
  { category: 'web', label: 'Web/LPs', icon: '\uD83C\uDF10', shortAgents: 'Web' },
  { category: 'video', label: 'Video', icon: '\uD83C\uDFAC', shortAgents: 'Video' },
  { category: 'cro', label: 'CRO', icon: '\uD83E\uDDEA', shortAgents: 'CRO' },
  { category: 'dados', label: 'Dados/BI', icon: '\uD83D\uDCCA', shortAgents: 'Analytics' },
];

export const ClientServicesPanel: React.FC = () => {
  const { currentClient, updateClient } = useAppStore();
  const [editing, setEditing] = useState(false);

  if (!currentClient) return null;

  const services = (currentClient.contractedServices || []) as ServiceContract[];
  const totalBudget = services.reduce((sum, s) => sum + (s.monthlyBudget || 0), 0);
  const activeCount = services.filter((s) => s.active).length;

  const toggleService = (category: ServiceCategory) => {
    const existing = services.find((s) => s.category === category);
    const catalogItem = SERVICE_CATALOG.find((c) => c.category === category);
    if (!catalogItem) return;

    let newServices: ServiceContract[];
    if (existing) {
      newServices = services.filter((s) => s.category !== category);
    } else {
      newServices = [
        ...services,
        {
          id: crypto.randomUUID(),
          category,
          name: catalogItem.label,
          active: true,
          startDate: new Date().toISOString(),
        },
      ];
    }

    updateClient(currentClient.id, { contractedServices: newServices });
    updateClientRemote(currentClient.id, { contractedServices: newServices } as any);
  };

  const toggleActive = (id: string) => {
    const newServices = services.map((s) =>
      s.id === id ? { ...s, active: !s.active } : s
    );
    updateClient(currentClient.id, { contractedServices: newServices });
    updateClientRemote(currentClient.id, { contractedServices: newServices } as any);
  };

  const updateBudget = (id: string, budget: number | undefined) => {
    const newServices = services.map((s) =>
      s.id === id ? { ...s, monthlyBudget: budget } : s
    );
    updateClient(currentClient.id, { contractedServices: newServices });
    updateClientRemote(currentClient.id, { contractedServices: newServices } as any);
  };

  const removeService = (id: string) => {
    const newServices = services.filter((s) => s.id !== id);
    updateClient(currentClient.id, { contractedServices: newServices });
    updateClientRemote(currentClient.id, { contractedServices: newServices } as any);
    toast.success('Servico removido');
  };

  return (
    <div className="p-3 border-b border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <Briefcase size={10} />
          Servicos Contratados
        </h3>
        <button
          onClick={() => setEditing(!editing)}
          className="text-[10px] text-blue-400 hover:text-blue-300"
        >
          {editing ? 'Fechar' : services.length === 0 ? '+ Adicionar' : 'Editar'}
        </button>
      </div>

      {/* Resumo */}
      {services.length > 0 && !editing && (
        <>
          <div className="flex items-center gap-2 mb-2">
            <div className="text-[10px] text-slate-400">
              <span className="text-slate-200 font-semibold">{activeCount}</span>/{services.length} ativo(s)
            </div>
            {totalBudget > 0 && (
              <>
                <span className="text-slate-700">\u2022</span>
                <div className="text-[10px] text-slate-400">
                  Budget mensal: <span className="text-emerald-400 font-semibold">R$ {totalBudget.toLocaleString('pt-BR')}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-1">
            {services.map((svc) => {
              const cat = SERVICE_CATALOG.find((c) => c.category === svc.category);
              return (
                <div
                  key={svc.id}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] border ${
                    svc.active
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                      : 'bg-slate-800/50 border-slate-700 text-slate-500'
                  }`}
                  title={svc.monthlyBudget ? `R$ ${svc.monthlyBudget.toLocaleString('pt-BR')}/mes` : undefined}
                >
                  <span>{cat?.icon}</span>
                  <span>{cat?.label || svc.name}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {services.length === 0 && !editing && (
        <p className="text-[10px] text-slate-600 italic">
          Nenhum servico contratado. Clique em "Adicionar" para configurar.
        </p>
      )}

      {/* Modo editar: lista checkable + budgets */}
      {editing && (
        <div className="space-y-1.5 mt-2">
          {SERVICE_CATALOG.map((cat) => {
            const svc = services.find((s) => s.category === cat.category);
            const isOn = !!svc;
            return (
              <div
                key={cat.category}
                className={`p-2 rounded-md border ${
                  isOn
                    ? svc.active
                      ? 'bg-blue-500/5 border-blue-500/30'
                      : 'bg-slate-800/30 border-slate-700'
                    : 'bg-slate-900/50 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isOn}
                    onChange={() => toggleService(cat.category)}
                    className="w-3.5 h-3.5 rounded bg-slate-800 border-slate-600 text-blue-500"
                  />
                  <span className="text-xs">{cat.icon}</span>
                  <span className="text-[11px] text-slate-200 font-medium flex-1 truncate">
                    {cat.label}
                  </span>
                  {isOn && (
                    <>
                      <button
                        onClick={() => toggleActive(svc.id)}
                        className="p-0.5 text-slate-400 hover:text-slate-200"
                        title={svc.active ? 'Pausar' : 'Ativar'}
                      >
                        {svc.active ? <ToggleRight size={14} className="text-emerald-400" /> : <ToggleLeft size={14} />}
                      </button>
                      <button
                        onClick={() => removeService(svc.id)}
                        className="p-0.5 text-slate-600 hover:text-red-400"
                        title="Remover"
                      >
                        <X size={12} />
                      </button>
                    </>
                  )}
                </div>
                {isOn && (
                  <div className="mt-1.5 flex items-center gap-1 pl-5">
                    <DollarSign size={10} className="text-slate-500" />
                    <input
                      type="number"
                      placeholder="Budget mensal (R$)"
                      value={svc.monthlyBudget ?? ''}
                      onChange={(e) =>
                        updateBudget(svc.id, e.target.value ? Number(e.target.value) : undefined)
                      }
                      className="flex-1 px-2 py-1 text-[10px] bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                    />
                    <span className="text-[9px] text-slate-600">/mes</span>
                  </div>
                )}
              </div>
            );
          })}

          {services.length > 0 && (
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-md">
              <p className="text-[10px] text-emerald-300 font-medium">
                Total: {services.length} servico(s) \u2022 Budget R$ {totalBudget.toLocaleString('pt-BR')}/mes
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
