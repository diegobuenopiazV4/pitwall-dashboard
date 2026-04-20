import React, { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { Plus, Trash2, GripVertical, Calendar, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../../stores/app-store';
import { AGENTS } from '../../lib/agents/agents-data';
import type { Task } from '../../lib/agents/types';
import { saveTask } from '../../hooks/useSupabaseSync';
import { supabase } from '../../lib/supabase/client';
import { exportTasksCSV } from '../../lib/documents/xlsx-export';

type ColumnId = 'P1' | 'P2' | 'P3' | 'done';

const COLUMNS: { id: ColumnId; label: string; color: string; subtitle: string }[] = [
  { id: 'P1', label: 'P1 - Critico', color: 'border-red-500/50 bg-red-500/5', subtitle: 'Quick wins urgentes' },
  { id: 'P2', label: 'P2 - Importante', color: 'border-amber-500/50 bg-amber-500/5', subtitle: 'Alto impacto' },
  { id: 'P3', label: 'P3 - Baixo', color: 'border-blue-500/50 bg-blue-500/5', subtitle: 'Pode esperar' },
  { id: 'done', label: 'Concluidas', color: 'border-emerald-500/50 bg-emerald-500/5', subtitle: 'Feitas ✓' },
];

export const KanbanView: React.FC = () => {
  const { tasks, clients, userId, currentClient, currentAgent, addTask, updateTask, setTasks } = useAppStore();
  const [newTaskColumn, setNewTaskColumn] = useState<ColumnId | null>(null);
  const [newText, setNewText] = useState('');

  const filteredTasks = useMemo(() => {
    if (!currentClient) return tasks;
    return tasks.filter((t) => !t.clientId || t.clientId === currentClient.id);
  }, [tasks, currentClient]);

  const grouped = useMemo(() => {
    const groups: Record<ColumnId, Task[]> = { P1: [], P2: [], P3: [], done: [] };
    filteredTasks.forEach((t) => {
      if (t.done) groups.done.push(t);
      else groups[t.priority].push(t);
    });
    return groups;
  }, [filteredTasks]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const task = tasks.find((t) => t.id === draggableId);
    if (!task) return;

    const newCol = destination.droppableId as ColumnId;
    const updates: Partial<Task> = {};

    if (newCol === 'done') {
      updates.done = true;
    } else {
      updates.done = false;
      updates.priority = newCol;
    }

    updateTask(draggableId, updates);

    // Persist to Supabase
    if (userId && userId !== 'offline') {
      try {
        await supabase
          .from('tasks')
          .update({
            done: updates.done ?? task.done,
            priority: updates.priority ?? task.priority,
            updated_at: new Date().toISOString(),
          })
          .eq('id', draggableId);
      } catch {
        // silent
      }
    }

    toast.success('Tarefa movida');
  };

  const handleAdd = async (column: ColumnId) => {
    if (!newText.trim()) return;

    const taskData = {
      userId: userId || 'offline',
      clientId: currentClient?.id,
      agentId: currentAgent?.id,
      text: newText.trim(),
      done: column === 'done',
      priority: (column === 'done' ? 'P2' : column) as 'P1' | 'P2' | 'P3',
    };

    let saved: Task | null = null;
    if (userId && userId !== 'offline') {
      saved = await saveTask(taskData);
    }

    addTask(
      saved ?? {
        ...taskData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );

    setNewText('');
    setNewTaskColumn(null);
    toast.success('Tarefa adicionada');
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
    <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0f] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-[#111118]">
        <div>
          <h2 className="text-sm font-semibold text-slate-200">Kanban de Tarefas</h2>
          <p className="text-[10px] text-slate-500">
            {currentClient ? `Cliente: ${currentClient.name}` : 'Todas as tarefas'}
            {' · '}
            {filteredTasks.length} total · {grouped.done.length} concluidas
          </p>
        </div>
        <button
          onClick={() => {
            exportTasksCSV(filteredTasks, clients, AGENTS);
            toast.success('Tarefas exportadas em CSV');
          }}
          disabled={filteredTasks.length === 0}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 rounded-md hover:bg-emerald-500/20 disabled:opacity-40 transition-colors"
        >
          <Download size={12} />
          Exportar CSV
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
          <div className="flex gap-3 h-full min-w-max">
            {COLUMNS.map((col) => (
              <Droppable key={col.id} droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex flex-col w-[280px] shrink-0 rounded-lg border ${col.color} ${
                      snapshot.isDraggingOver ? 'ring-2 ring-red-500/50' : ''
                    }`}
                  >
                    <div className="px-3 py-2 border-b border-slate-800/50">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-slate-200">{col.label}</h3>
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded-full">
                          {grouped[col.id].length}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">{col.subtitle}</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                      {grouped[col.id].map((task, idx) => {
                        const agent = AGENTS.find((a) => a.id === task.agentId);
                        return (
                          <Draggable key={task.id} draggableId={task.id} index={idx}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`group bg-[#1a1a24] border border-slate-800 rounded-lg p-2.5 ${
                                  snapshot.isDragging ? 'ring-2 ring-red-500 shadow-lg' : 'hover:border-slate-700'
                                } ${task.done ? 'opacity-60' : ''}`}
                              >
                                <div className="flex items-start gap-1.5">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="mt-0.5 text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing"
                                  >
                                    <GripVertical size={12} />
                                  </div>
                                  <p className={`flex-1 text-xs leading-relaxed ${task.done ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                                    {task.text}
                                  </p>
                                  <button
                                    onClick={() => handleDelete(task.id)}
                                    className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                                {(agent || task.sprintWeek) && (
                                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800/50">
                                    {agent && (
                                      <span
                                        className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded"
                                        style={{ backgroundColor: agent.color + '22', color: agent.color }}
                                      >
                                        <span>{agent.icon}</span>
                                        {agent.id}
                                      </span>
                                    )}
                                    {task.sprintWeek && (
                                      <span className="flex items-center gap-1 text-[9px] text-slate-500">
                                        <Calendar size={9} />
                                        {task.sprintWeek}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}

                      {newTaskColumn === col.id ? (
                        <div className="p-2 space-y-1.5 bg-slate-900/50 border border-slate-700 rounded-lg">
                          <textarea
                            value={newText}
                            onChange={(e) => setNewText(e.target.value)}
                            placeholder="Descreva a tarefa..."
                            autoFocus
                            rows={2}
                            className="w-full px-2 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200 placeholder:text-slate-600 resize-none focus:outline-none focus:ring-1 focus:ring-red-500/50"
                          />
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleAdd(col.id)}
                              disabled={!newText.trim()}
                              className="flex-1 px-2 py-1 text-[10px] bg-red-600 text-white rounded hover:bg-red-500 disabled:opacity-40"
                            >
                              Adicionar
                            </button>
                            <button
                              onClick={() => {
                                setNewTaskColumn(null);
                                setNewText('');
                              }}
                              className="flex-1 px-2 py-1 text-[10px] bg-slate-700 text-slate-300 rounded hover:bg-slate-600"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setNewTaskColumn(col.id)}
                          className="w-full flex items-center justify-center gap-1 py-1.5 text-[10px] text-slate-500 hover:text-slate-300 border border-dashed border-slate-700 rounded-lg hover:border-slate-500 transition-colors"
                        >
                          <Plus size={10} />
                          Nova tarefa
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
};
