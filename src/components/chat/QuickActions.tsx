import React from 'react';

interface Props {
  actions: string[];
  onAction: (action: string) => void;
}

export const QuickActions: React.FC<Props> = ({ actions, onAction }) => {
  return (
    <div className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto border-b border-slate-800/50 bg-[#0d0d14]">
      {actions.map((action) => (
        <button
          key={action}
          onClick={() => onAction(action)}
          className="shrink-0 px-2.5 py-1 text-[10px] text-slate-400 bg-slate-800/50 rounded-full hover:bg-slate-700 hover:text-slate-200 transition-colors"
        >
          {action}
        </button>
      ))}
    </div>
  );
};
