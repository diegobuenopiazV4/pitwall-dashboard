/**
 * Cliente oficial Ekyte API.
 * Nao precisa de browser automation - Ekyte tem API REST + MCP via Zapier.
 *
 * Configuracao:
 * - apiKey em https://app.ekyte.com -> Minha Empresa -> aba ADVANCED
 * - companyId tambem na mesma tela
 */

export interface EkyteConfig {
  apiKey: string;
  companyId: string;
  baseUrl?: string;
}

export interface EkyteTask {
  id?: string;
  title: string;
  description?: string;
  status?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  assigneeId?: string;
  projectId?: string;
  clientId?: string;
  tags?: string[];
}

const DEFAULT_BASE = 'https://api.ekyte.com/v1';

function getConfig(): EkyteConfig | null {
  try {
    const raw = localStorage.getItem('v4_pitwall_ekyte_config');
    if (!raw) return null;
    const cfg = JSON.parse(raw);
    if (!cfg.apiKey || !cfg.companyId) return null;
    return cfg;
  } catch {
    return null;
  }
}

export function setEkyteConfig(config: EkyteConfig): void {
  localStorage.setItem('v4_pitwall_ekyte_config', JSON.stringify(config));
}

export function clearEkyteConfig(): void {
  localStorage.removeItem('v4_pitwall_ekyte_config');
}

export function isEkyteConfigured(): boolean {
  return getConfig() !== null;
}

/**
 * Listar tasks do Ekyte (suporta filtros).
 */
export async function listEkyteTasks(filters?: {
  projectId?: string;
  assigneeId?: string;
  status?: string;
}): Promise<EkyteTask[]> {
  const cfg = getConfig();
  if (!cfg) throw new Error('Ekyte nao configurado');

  const params = new URLSearchParams();
  params.set('companyId', cfg.companyId);
  if (filters?.projectId) params.set('projectId', filters.projectId);
  if (filters?.assigneeId) params.set('assigneeId', filters.assigneeId);
  if (filters?.status) params.set('status', filters.status);

  const res = await fetch(`${cfg.baseUrl ?? DEFAULT_BASE}/tasks?${params}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cfg.apiKey}`,
      'x-api-key': cfg.apiKey,
    },
  });

  if (!res.ok) {
    throw new Error(`Ekyte API ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : (data.tasks ?? data.items ?? []);
}

/**
 * Criar task no Ekyte.
 */
export async function createEkyteTask(task: EkyteTask): Promise<EkyteTask> {
  const cfg = getConfig();
  if (!cfg) throw new Error('Ekyte nao configurado');

  const res = await fetch(`${cfg.baseUrl ?? DEFAULT_BASE}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cfg.apiKey}`,
      'x-api-key': cfg.apiKey,
    },
    body: JSON.stringify({
      companyId: cfg.companyId,
      ...task,
    }),
  });

  if (!res.ok) {
    throw new Error(`Ekyte API ${res.status}: ${await res.text()}`);
  }

  return res.json();
}

/**
 * Bulk: cria varias tasks (usa Promise.allSettled para nao abortar em erro parcial).
 */
export async function bulkCreateEkyteTasks(tasks: EkyteTask[]): Promise<{
  success: EkyteTask[];
  failed: { task: EkyteTask; error: string }[];
}> {
  const results = await Promise.allSettled(tasks.map((t) => createEkyteTask(t)));

  const success: EkyteTask[] = [];
  const failed: { task: EkyteTask; error: string }[] = [];

  results.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      success.push(r.value);
    } else {
      failed.push({ task: tasks[i], error: r.reason?.message ?? 'erro desconhecido' });
    }
  });

  return { success, failed };
}

/**
 * Alternativa: gerar bookmarklet para inserir tasks via interface web do Ekyte
 * (uso se a API nao estiver acessivel ou o apiKey nao tiver permissao).
 */
export function generateEkyteBookmarklet(tasks: EkyteTask[]): string {
  const tasksJson = JSON.stringify(tasks).replace(/"/g, '&quot;');
  const code = `
(function() {
  const tasks = ${JSON.stringify(tasks)};
  const confirmMsg = 'Este bookmarklet vai criar ' + tasks.length + ' tasks no Ekyte. Confirma?';
  if (!confirm(confirmMsg)) return;

  // Abrir formulario de nova task e preencher
  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  async function createOne(task) {
    // Click no botao "Nova Task" (ajustar selector conforme Ekyte)
    const newBtn = document.querySelector('[data-testid="new-task"], .new-task, button[title*="Nova"]');
    if (newBtn) newBtn.click();
    await delay(500);

    const titleInput = document.querySelector('input[name="title"], [placeholder*="titulo"]');
    if (titleInput) {
      titleInput.value = task.title;
      titleInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (task.description) {
      const descInput = document.querySelector('textarea[name="description"], [placeholder*="descricao"]');
      if (descInput) {
        descInput.value = task.description;
        descInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }

    await delay(200);

    const submitBtn = document.querySelector('button[type="submit"], .btn-primary:contains("Criar")');
    if (submitBtn) submitBtn.click();
    await delay(1500);
  }

  (async () => {
    for (const t of tasks) {
      await createOne(t);
    }
    alert('Concluido: ' + tasks.length + ' tasks processadas');
  })();
})();
`.trim();

  return 'javascript:' + encodeURIComponent(code);
}

/**
 * Testar conexao Ekyte.
 */
export async function testEkyteConnection(): Promise<{ ok: boolean; message: string }> {
  try {
    const cfg = getConfig();
    if (!cfg) return { ok: false, message: 'Nao configurado' };

    await listEkyteTasks();
    return { ok: true, message: 'Conexao OK' };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'Erro desconhecido' };
  }
}
