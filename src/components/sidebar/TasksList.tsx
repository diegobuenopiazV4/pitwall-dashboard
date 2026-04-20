import React, { useState } from 'react';
import { Plus, Check, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../../stores/app-store';
import { saveTask, toggleTaskDone } from '../../hooks/useSupabaseSync';
import { supabase } from '../../lib/supabase/client';

export const TasksList: React.FC = () => {
  const { tasks, userId, currentClient, currentAgent, addTask, toggleTask, setTasks } = useAppStore();
  const [newText, setNewText] = useState('');

  const handleAdd = async () => {
    if (!newText.trim()) return;

    const taskData = {
      userId: userId || 'offline',
      clientId: currentClient?.id,
      agentId: currentAgent?.id,
      text: newText.trim(),
      done: false,
      priority: 'P2' as const,
    };

    let saved = null;
    if (userId && userId !== 'offline') {
      saved = await saveTask(taskData);
    }

    addTask(saved ?? {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setNewText('');
  };

  const handleToggle = async (taskId: string) => {
    toggleTask(taskId);
    const task = tasks.find((t) => t.id === taskId);
    if (task && userId && userId !== 'offline') {
      await toggleTaskDone(taskId, !task.done);
    }
  };

  const handleDelete = async (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
    if (userId && userId !== 'offline') {
      try {
        await supabase.from('tasks').delete().eq('id', taskId);
      } catch {
        // silent
      }
    }
    toast.success('Tarefa removida');
  };

  return (
    <div className="p-2 space-y-1">
      {tasks.length === 0 && (
        <p className="text-center text-[10px] text-slate-600 py-4">
          Nenhuma tarefa. Adicione abaixo.
        </p>
      )}
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800/50 ${
            task.done ? 'opacity-50' : ''
          }`}
        >
          <button
            onClick={() => handleToggle(task.id)}
            className={`w-4 h-4 flex items-center justify-center rounded border shrink-0 transition-colors ${
              task.done ? 'bg-emerald-600 border-emerald-600' : 'border-slate-600 hover:border-slate-400'
            }`}
          >
            {task.done && <Check size={10} className="text-white" />}
          </button>
          <button
            onClick={() => handleToggle(task.id)}
            className={`flex-1 text-left text-xs ${task.done ? 'line-through text-slate-600' : 'text-slate-300'}`}
          >
            {task.text}
          </button>
          <button
            onClick={() => handleDelete(task.id)}
            className="p-0.5 text-slate-600 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
          >
            <Trash2 size={10} />
          </button>
        </div>
      ))}

      <div className="flex gap-1 mt-2">
        <input
          type="text"
          placeholder="Nova tarefa..."
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="flex-1 px-2 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500/50"
        />
        <button
          onClick={handleAdd}
          disabled={!newText.trim()}
          className="p-1.5 bg-slate-800 text-slate-400 rounded hover:bg-slate-700 hover:text-slate-200 disabled:opacity-40"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
};
