import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Bell, Users, Palette, Tag, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../../stores/app-store';
import { saveClient } from '../../hooks/useSupabaseSync';
import type {
  Pilar,
  StepPhase,
  HealthScore,
  ServiceCategory,
  ServiceContract,
} from '../../lib/agents/types';

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

const BRAND_COLORS = [
  '#ff4444', '#448aff', '#00e676', '#ff9100', '#e040fb', '#00bcd4',
  '#ffeb3b', '#4caf50', '#f44336', '#9c27b0', '#2196f3', '#ff5722',
];

// 12 categorias de servicos oferecidos pelos 16 agentes
const SERVICE_CATALOG: { category: ServiceCategory; label: string; icon: string; agents: string }[] = [
  { category: 'estrategia', label: 'Estrategia / Consultoria', icon: '\u2655', agents: 'Mestre Estrategista, Gestor de Projetos' },
  { category: 'trafego', label: 'Trafego Pago', icon: '\uD83D\uDE80', agents: 'Google Ads, Meta Ads' },
  { category: 'design', label: 'Design de Criativos (Ads)', icon: '\uD83C\uDFA8', agents: 'Designer Ads' },
  { category: 'social', label: 'Social Media', icon: '\uD83D\uDCF1', agents: 'Designer Social, Social Media' },
  { category: 'conteudo', label: 'Copy / Conteudo', icon: '\u270D\uFE0F', agents: 'Copy Performance, Content Marketing' },
  { category: 'seo', label: 'SEO', icon: '\uD83D\uDD0D', agents: 'SEO Specialist' },
  { category: 'crm', label: 'CRM / Email Marketing', icon: '\uD83D\uDCE7', agents: 'CRM/Email' },
  { category: 'automacao', label: 'Automacao', icon: '\u2699\uFE0F', agents: 'Automacao Specialist' },
  { category: 'web', label: 'Web / Landing Pages', icon: '\uD83C\uDF10', agents: 'Web/UX Designer' },
  { category: 'video', label: 'Video / Motion', icon: '\uD83C\uDFAC', agents: 'Video Marketing' },
  { category: 'cro', label: 'CRO (A/B Testing)', icon: '\uD83E\uDDEA', agents: 'CRO Specialist' },
  { category: 'dados', label: 'Dados / Analytics', icon: '\uD83D\uDCCA', agents: 'Analytics / BI' },
];

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export const NewClientModal: React.FC<Props> = ({ open, onClose }) => {
  const { userId, addClient } = useAppStore();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [segment, setSegment] = useState('');
  const [step, setStep] = useState<StepPhase>('Saber');
  const [pilar, setPilar] = useState<Pilar>('Aquisicao');
  const [health, setHealth] = useState<HealthScore>('yellow');
  const [brandColor, setBrandColor] = useState<string>('#ff4444');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [notifyOnApproval, setNotifyOnApproval] = useState(true);
  const [teamId, setTeamId] = useState<string>('default');
  const [services, setServices] = useState<ServiceContract[]>([]);
  const [activeSection, setActiveSection] = useState<'basico' | 'marca' | 'servicos'>('basico');
  const [saving, setSaving] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Auto-gera slug ao digitar nome (se nao foi editado manualmente)
  useEffect(() => {
    if (!slugManual) setSlug(toSlug(name));
  }, [name, slugManual]);

  if (!open) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo deve ter menos de 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogoUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const toggleService = (category: ServiceCategory, label: string) => {
    setServices((prev) => {
      const existing = prev.find((s) => s.category === category);
      if (existing) {
        return prev.filter((s) => s.category !== category);
      }
      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          category,
          name: label,
          active: true,
          startDate: new Date().toISOString(),
        },
      ];
    });
  };

  const updateServiceBudget = (category: ServiceCategory, budget: number | undefined) => {
    setServices((prev) =>
      prev.map((s) => (s.category === category ? { ...s, monthlyBudget: budget } : s))
    );
  };

  const reset = () => {
    setName(''); setSlug(''); setSlugManual(false); setSegment('');
    setStep('Saber'); setPilar('Aquisicao'); setHealth('yellow');
    setBrandColor('#ff4444'); setLogoUrl(''); setNotifyOnApproval(true);
    setTeamId('default'); setServices([]); setActiveSection('basico');
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Informe o nome do cliente');
      setActiveSection('basico');
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
      slug: slug || toSlug(name),
      brandColor,
      logoUrl: logoUrl || undefined,
      notifyOnApproval,
      teamId,
      contractedServices: services,
    };

    let saved = null;
    if (userId && userId !== 'offline' && !userId.startsWith('offline-')) {
      saved = await saveClient(newClient as any);
    }

    const client = saved ?? {
      ...newClient,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addClient(client as any);
    toast.success(`Cliente ${client.name} adicionado com ${services.length} servico(s)`);
    reset();
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-3xl max-h-[90vh] bg-[#1a1a24] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header com preview */}
        <div
          className="relative px-6 py-5 border-b border-slate-700"
          style={{ background: `linear-gradient(135deg, ${brandColor}15 0%, #1a1a24 60%)` }}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg"
          >
            <X size={16} />
          </button>
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0 overflow-hidden"
              style={{ background: brandColor }}
            >
              {logoUrl ? (
                <img src={logoUrl} alt="logo" className="w-full h-full object-cover" />
              ) : (
                name ? name.trim().charAt(0).toUpperCase() : '?'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-slate-100">
                {name.trim().toUpperCase() || 'Novo Cliente'}
              </h2>
              <p className="text-xs text-slate-500 truncate">
                {slug ? `pitwall.app/${slug}` : 'Preencha os dados abaixo'} {segment && `\u2022 ${segment}`}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 bg-[#111118] px-6">
          <button
            onClick={() => setActiveSection('basico')}
            className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeSection === 'basico'
                ? 'border-red-500 text-slate-100'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <Tag size={12} className="inline mr-1.5" />
            Basico
          </button>
          <button
            onClick={() => setActiveSection('marca')}
            className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeSection === 'marca'
                ? 'border-red-500 text-slate-100'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <Palette size={12} className="inline mr-1.5" />
            Marca & Logo
          </button>
          <button
            onClick={() => setActiveSection('servicos')}
            className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeSection === 'servicos'
                ? 'border-red-500 text-slate-100'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <Briefcase size={12} className="inline mr-1.5" />
            Servicos Contratados
            {services.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-red-600/20 text-red-400 rounded text-[9px]">
                {services.length}
              </span>
            )}
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeSection === 'basico' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Nome do cliente *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: EMPRESA ACME"
                    autoFocus
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Slug (URL)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-600">
                      /{''}
                    </span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => {
                        setSlug(toSlug(e.target.value));
                        setSlugManual(true);
                      }}
                      placeholder="empresa-acme"
                      className="w-full pl-5 pr-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500/50"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Segmento / Nicho
                </label>
                <input
                  type="text"
                  value={segment}
                  onChange={(e) => setSegment(e.target.value)}
                  placeholder="Ex: Tecnologia, E-commerce, Saude, Educacao..."
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Fase STEP
                  </label>
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
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Pilar V4
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {PILARES.map((p) => (
                      <button
                        key={p}
                        onClick={() => setPilar(p)}
                        className={`py-1.5 text-[10px] rounded-md transition-colors ${
                          pilar === p
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                        title={p}
                      >
                        {p.substring(0, 4)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Health Score
                </label>
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

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  <Users size={10} className="inline mr-1" />
                  Responsavel / Time
                </label>
                <select
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500/50"
                >
                  <option value="default">Time Padrao (Conta atual)</option>
                  <option value="performance">Time Performance</option>
                  <option value="criativo">Time Criativo</option>
                  <option value="estrategia">Time Estrategia</option>
                </select>
              </div>

              <label className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-900">
                <input
                  type="checkbox"
                  checked={notifyOnApproval}
                  onChange={(e) => setNotifyOnApproval(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-red-500 focus:ring-red-500/30"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Bell size={12} className="text-amber-400" />
                    <span className="text-xs font-medium text-slate-200">
                      Notificar quando aprovar tarefa
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Voce recebera push/email quando este cliente aprovar uma entrega
                  </p>
                </div>
              </label>
            </div>
          )}

          {activeSection === 'marca' && (
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Cor da marca
                </label>
                <div className="grid grid-cols-12 gap-1.5 mb-3">
                  {BRAND_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setBrandColor(color)}
                      className={`aspect-square rounded-md transition-all ${
                        brandColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1a24]' : ''
                      }`}
                      style={{ background: color }}
                      title={color}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer bg-slate-900 border border-slate-700"
                  />
                  <input
                    type="text"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    placeholder="#ff4444"
                    className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-red-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Logo do cliente
                </label>
                <div className="flex items-start gap-3">
                  <div
                    className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden cursor-pointer hover:border-slate-500 transition-colors"
                    style={{ background: logoUrl ? 'transparent' : `${brandColor}15` }}
                    onClick={() => logoInputRef.current?.click()}
                  >
                    {logoUrl ? (
                      <img src={logoUrl} alt="logo" className="w-full h-full object-cover" />
                    ) : (
                      <Upload size={20} className="text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      className="w-full px-3 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center justify-center gap-1.5"
                    >
                      <Upload size={12} />
                      {logoUrl ? 'Trocar logo' : 'Selecionar imagem'}
                    </button>
                    <p className="text-[10px] text-slate-500 mt-1.5">
                      PNG, JPG ou SVG. Maximo 2MB. Recomendado: 512x512px
                    </p>
                    {logoUrl && (
                      <button
                        onClick={() => setLogoUrl('')}
                        className="text-[10px] text-red-400 hover:text-red-300 mt-1"
                      >
                        Remover logo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div
                className="p-4 rounded-xl border"
                style={{
                  background: `linear-gradient(135deg, ${brandColor}20 0%, transparent 100%)`,
                  borderColor: `${brandColor}40`,
                }}
              >
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Preview</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg overflow-hidden shrink-0"
                    style={{ background: brandColor }}
                  >
                    {logoUrl ? (
                      <img src={logoUrl} alt="logo" className="w-full h-full object-cover" />
                    ) : (
                      name.charAt(0).toUpperCase() || '?'
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-100">
                      {name.toUpperCase() || 'NOME DO CLIENTE'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {segment || 'Segmento'} \u2022 {pilar} \u2022 {step}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'servicos' && (
            <div>
              <p className="text-xs text-slate-400 mb-4">
                Selecione os servicos que este cliente tem contratados. Os agentes IA correspondentes
                ficarao em destaque ao atender este cliente.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {SERVICE_CATALOG.map((svc) => {
                  const isSelected = services.some((s) => s.category === svc.category);
                  const selectedService = services.find((s) => s.category === svc.category);
                  return (
                    <div
                      key={svc.category}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-red-500/10 border-red-500/50'
                          : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                      }`}
                      onClick={() => toggleService(svc.category, svc.label)}
                    >
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleService(svc.category, svc.label)}
                          className="mt-0.5 w-3.5 h-3.5 rounded bg-slate-800 border-slate-600 text-red-500 focus:ring-red-500/30"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{svc.icon}</span>
                            <span className="text-xs font-medium text-slate-200 truncate">
                              {svc.label}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                            {svc.agents}
                          </p>
                          {isSelected && (
                            <div className="mt-2 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <span className="text-[9px] text-slate-500">R$</span>
                              <input
                                type="number"
                                placeholder="Budget mensal"
                                value={selectedService?.monthlyBudget ?? ''}
                                onChange={(e) => updateServiceBudget(
                                  svc.category,
                                  e.target.value ? Number(e.target.value) : undefined
                                )}
                                className="flex-1 px-2 py-1 text-[10px] bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500/50"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {services.length > 0 && (
                <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <p className="text-xs text-emerald-300 font-medium">
                    {services.length} servico(s) selecionado(s)
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Budget total mensal: R$ {services.reduce((sum, s) => sum + (s.monthlyBudget || 0), 0).toLocaleString('pt-BR')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-6 py-4 border-t border-slate-700 bg-[#111118]">
          <button
            onClick={() => { reset(); onClose(); }}
            disabled={saving}
            className="flex-1 px-4 py-2.5 text-xs text-slate-400 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="flex-1 px-4 py-2.5 text-xs text-white bg-red-600 rounded-lg hover:bg-red-500 disabled:opacity-50 font-medium"
          >
            {saving ? 'Salvando...' : `Criar cliente${services.length ? ` (${services.length} servicos)` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};
