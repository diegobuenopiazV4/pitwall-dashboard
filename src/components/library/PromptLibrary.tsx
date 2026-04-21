import React, { useState, useMemo } from 'react';
import { X, Sparkles, Search, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../../stores/app-store';
import { getTemplatesByAgent, applyPlaceholders, PROMPT_TEMPLATES, type PromptTemplate } from '../../lib/prompts/templates';
import { QUICK_COMMANDS } from '../../lib/prompts/quick-commands';
import { AGENTS } from '../../lib/agents/agents-data';

// Merge templates + quick commands na biblioteca
const MERGED_LIBRARY: PromptTemplate[] = [
  ...PROMPT_TEMPLATES,
  ...QUICK_COMMANDS.map((c) => ({
    id: `qc-${c.id}`,
    agentId: c.agentId,
    category: c.category,
    title: c.label,
    description: c.description,
    prompt: c.prompt,
    tags: [c.category.toLowerCase()],
  })),
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (prompt: string) => void;
}

export const PromptLibrary: React.FC<Props> = ({ open, onClose, onSelect }) => {
  const { currentAgent, currentClient } = useAppStore();
  const [query, setQuery] = useState('');
  const [filterAgent, setFilterAgent] = useState<string>(currentAgent?.id ?? 'all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const all = new Set(MERGED_LIBRARY.map((t) => t.category));
    return ['all', ...Array.from(all)];
  }, []);

  const filtered = useMemo(() => {
    let list: PromptTemplate[] = filterAgent === 'all' ? MERGED_LIBRARY : MERGED_LIBRARY.filter((t) => t.agentId === filterAgent);
    if (filterCategory !== 'all') list = list.filter((t) => t.category === filterCategory);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.includes(q))
      );
    }
    return list;
  }, [filterAgent, filterCategory, query]);

  if (!open) return null;

  const handleUse = (template: PromptTemplate) => {
    const filled = applyPlaceholders(template.prompt, {
      cliente: currentClient?.name,
      segmento: currentClient?.segment,
      step: currentClient?.step,
      pilar: currentClient?.pilar,
      health: currentClient?.health,
    });
    onSelect(filled);
    toast.success(`Template "${template.title}" carregado`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-4xl h-[80vh] bg-[#1a1a24] border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            <h2 className="text-sm font-semibold text-slate-200">Biblioteca de Prompts</h2>
            <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded">{MERGED_LIBRARY.length} templates</span>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={16} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800">
          <div className="relative flex-1">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar templates..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-7 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-md text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500/50"
            />
          </div>
          <select
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            className="px-2 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-md text-slate-200 focus:outline-none"
          >
            <option value="all">Todos agentes</option>
            {AGENTS.map((a) => (
              <option key={a.id} value={a.id}>{a.id} - {a.name}</option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-md text-slate-200 focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c === 'all' ? 'Todas categorias' : c}</option>
            ))}
          </select>
        </div>

        {/* Templates List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filtered.map((template) => {
            const agent = AGENTS.find((a) => a.id === template.agentId);
            return (
              <button
                key={template.id}
                onClick={() => handleUse(template)}
                className="w-full flex items-start gap-3 p-3 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-left transition-all"
              >
                <span
                  className="w-8 h-8 flex items-center justify-center rounded-md text-sm shrink-0"
                  style={{ backgroundColor: (agent?.color ?? '#888') + '22', color: agent?.color ?? '#888' }}
                >
                  {agent?.icon ?? '?'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-xs font-semibold text-slate-200 truncate">{template.title}</h3>
                    <span className="text-[9px] px-1 py-0.5 bg-slate-700 text-slate-400 rounded shrink-0">
                      {template.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-1.5 line-clamp-2">{template.description}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-slate-600 flex items-center gap-0.5">
                      <Tag size={9} />
                    </span>
                    {template.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="text-[9px] px-1 py-0.5 bg-slate-800 text-slate-500 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-xs text-slate-600">
              Nenhum template encontrado. Ajuste os filtros.
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-slate-800 bg-[#111118] text-[10px] text-slate-500 flex items-center justify-between">
          <span>{filtered.length} template(s) disponivel(is)</span>
          <span>
            Variaveis: <code className="text-slate-400">{'{{cliente}}'}</code>{' '}
            <code className="text-slate-400">{'{{segmento}}'}</code>{' '}
            <code className="text-slate-400">{'{{step}}'}</code>{' '}
            <code className="text-slate-400">{'{{pilar}}'}</code>
          </span>
        </div>
      </div>
    </div>
  );
};
