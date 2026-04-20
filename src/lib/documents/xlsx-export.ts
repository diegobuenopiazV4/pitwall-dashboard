/**
 * Export to CSV (opens in Excel/Google Sheets).
 * CSV is used instead of XLSX to avoid heavy xlsx library dependency.
 * Provides same core functionality for marketing tasks.
 */

import type { Task, Client } from '../agents/types';

function escapeCSV(v: any): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function rowsToCSV(rows: (string | number | boolean | null | undefined)[][]): string {
  return rows.map((row) => row.map(escapeCSV).join(',')).join('\n');
}

function downloadCSV(csv: string, filename: string): void {
  // BOM for Excel to recognize UTF-8
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export tasks to CSV.
 */
export function exportTasksCSV(tasks: Task[], clients: Client[], agents: { id: string; name: string }[]): void {
  const rows: any[][] = [
    ['Status', 'Prioridade', 'Tarefa', 'Cliente', 'Agente', 'Sprint', 'Criado em'],
  ];

  tasks.forEach((t) => {
    const client = clients.find((c) => c.id === t.clientId);
    const agent = agents.find((a) => a.id === t.agentId);
    rows.push([
      t.done ? 'Concluida' : 'Pendente',
      t.priority,
      t.text,
      client?.name ?? '',
      agent?.name ?? '',
      t.sprintWeek ?? '',
      new Date(t.createdAt).toLocaleString('pt-BR'),
    ]);
  });

  const csv = rowsToCSV(rows);
  downloadCSV(csv, `tasks-${new Date().toISOString().slice(0, 10)}`);
}

/**
 * Export clients to CSV.
 */
export function exportClientsCSV(clients: Client[]): void {
  const rows: any[][] = [
    ['Nome', 'Segmento', 'Fase STEP', 'Pilar V4', 'Health Score', 'Criado em'],
  ];

  clients.forEach((c) => {
    rows.push([
      c.name,
      c.segment,
      c.step,
      c.pilar,
      c.health,
      new Date(c.createdAt).toLocaleString('pt-BR'),
    ]);
  });

  const csv = rowsToCSV(rows);
  downloadCSV(csv, `clientes-${new Date().toISOString().slice(0, 10)}`);
}

/**
 * Export sprint with goals as CSV.
 */
export function exportSprintCSV(week: string, goals: string[], tasks: Task[]): void {
  const rows: any[][] = [
    ['Sprint', week],
    [],
    ['METAS DA SPRINT'],
    ['#', 'Meta', 'Status'],
  ];

  goals.forEach((g, i) => {
    rows.push([i + 1, g, 'Pendente']);
  });

  rows.push([]);
  rows.push(['TAREFAS DA SPRINT']);
  rows.push(['Status', 'Prioridade', 'Tarefa']);

  const sprintTasks = tasks.filter((t) => t.sprintWeek === week || !t.sprintWeek);
  sprintTasks.forEach((t) => {
    rows.push([t.done ? 'Concluida' : 'Pendente', t.priority, t.text]);
  });

  const csv = rowsToCSV(rows);
  downloadCSV(csv, `sprint-${week.replace(/[^a-zA-Z0-9]/g, '-')}`);
}

/**
 * Export KPIs template (empty to fill with real data).
 */
export function exportKPITemplate(clientName: string): void {
  const rows: any[][] = [
    [`KPIs - ${clientName}`, new Date().toLocaleDateString('pt-BR')],
    [],
    ['PILAR', 'METRICA', 'BASELINE', 'META 30d', 'META 60d', 'META 90d', 'ATUAL', 'STATUS'],
    ['Aquisicao', 'CPL Medio (R$)', '', '', '', '', '', ''],
    ['Aquisicao', 'Volume de Leads', '', '', '', '', '', ''],
    ['Aquisicao', 'ROAS', '', '', '', '', '', ''],
    ['Aquisicao', 'CTR Medio', '', '', '', '', '', ''],
    ['Engajamento', 'Engagement Rate', '', '', '', '', '', ''],
    ['Engajamento', 'Alcance Total', '', '', '', '', '', ''],
    ['Engajamento', 'Open Rate Email', '', '', '', '', '', ''],
    ['Monetizacao', 'Taxa de Conversao', '', '', '', '', '', ''],
    ['Monetizacao', 'Ticket Medio', '', '', '', '', '', ''],
    ['Monetizacao', 'LTV (R$)', '', '', '', '', '', ''],
    ['Monetizacao', 'MRR', '', '', '', '', '', ''],
    ['Retencao', 'Churn Rate', '', '', '', '', '', ''],
    ['Retencao', 'NPS', '', '', '', '', '', ''],
    ['Retencao', 'Taxa de Recompra', '', '', '', '', '', ''],
  ];

  const csv = rowsToCSV(rows);
  downloadCSV(csv, `kpis-${clientName.toLowerCase().replace(/\s+/g, '-')}`);
}
