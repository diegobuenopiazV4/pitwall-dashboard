import React from 'react';
import {
  Grid3x3, Users, Target, Rocket, LineChart, Zap, FileText, Sparkles,
  CheckSquare, Mail, Newspaper, Palette, Workflow, BarChart3, Search, ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore, type ViewMode } from '../../stores/app-store';
import { getAgentSkills, type SkillBinding } from '../../lib/agents/skill-bindings';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  Grid3x3, Users, Target, Rocket, LineChart, Zap, FileText, Sparkles,
  CheckSquare, Mail, Newspaper, Palette, Workflow, BarChart3, Search,
};

interface Props {
  onInjectPrompt?: (prompt: string) => void;
}

/**
 * Barra compacta que mostra as skills V4 relacionadas ao agente atual.
 * Aparece logo abaixo do QuickActions, oferecendo atalho direto para a view/link/prompt correspondente.
 */
export const AgentSkillsBar: React.FC<Props> = ({ onInjectPrompt }) => {
  const { currentAgent, setViewMode } = useAppStore();

  if (!currentAgent) return null;
  const skills = getAgentSkills(currentAgent.id);
  if (skills.length === 0) return null;

  const handleClick = (skill: SkillBinding) => {
    if (skill.type === 'view') {
      setViewMode(skill.target as ViewMode);
      toast(`\u2192 ${skill.label}`, { icon: '\u2728', duration: 1500 });
    } else if (skill.type === 'link') {
      window.open(skill.target, '_blank', 'noopener');
      toast.success(`Abrindo ${skill.label}...`);
    } else if (skill.type === 'prompt') {
      if (onInjectPrompt) {
        onInjectPrompt(skill.target);
      } else {
        // Fallback: dispara evento global
        const evt = new CustomEvent('pitwall:inject-prompt', { detail: { prompt: skill.target } });
        window.dispatchEvent(evt);
      }
    }
  };

  return (
    <div className="flex items-center gap-1.5 px-4 py-1.5 overflow-x-auto bg-[#0a0a0f] border-b border-slate-800/50">
      <span className="shrink-0 text-[9px] text-slate-600 uppercase tracking-wider font-semibold mr-1">
        Skills V4
      </span>
      {skills.map((skill, i) => {
        const Icon = ICON_MAP[skill.icon] || Sparkles;
        return (
          <button
            key={i}
            onClick={() => handleClick(skill)}
            title={skill.description || skill.label}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1 text-[10px] rounded-full border transition-all whitespace-nowrap"
            style={{
              color: skill.color,
              background: `${skill.color}12`,
              borderColor: `${skill.color}30`,
            }}
          >
            <Icon size={10} />
            {skill.label}
            {skill.type === 'link' && <ExternalLink size={8} className="opacity-70" />}
          </button>
        );
      })}
    </div>
  );
};
