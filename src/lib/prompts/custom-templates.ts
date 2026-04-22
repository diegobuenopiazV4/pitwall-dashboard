/**
 * Templates customizados do usuario.
 * User pode salvar qualquer prompt refinado como template reutilizavel.
 * Persistido em localStorage + Supabase (se configurado).
 */

export interface CustomTemplate {
  id: string;
  userId: string;
  title: string;
  description?: string;
  prompt: string;
  agentId?: string;
  category: string;
  preferredModelId?: string;
  tags: string[];
  createdAt: string;
  useCount: number;
}

const LS_KEY = 'v4_pitwall_custom_templates';

export function listCustomTemplates(userId?: string): CustomTemplate[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const all: CustomTemplate[] = raw ? JSON.parse(raw) : [];
    return userId ? all.filter((t) => t.userId === userId || t.userId === 'offline') : all;
  } catch {
    return [];
  }
}

export function saveCustomTemplate(template: Omit<CustomTemplate, 'id' | 'createdAt' | 'useCount'>): CustomTemplate {
  const list = listCustomTemplates();
  const full: CustomTemplate = {
    ...template,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    useCount: 0,
  };
  list.push(full);
  localStorage.setItem(LS_KEY, JSON.stringify(list));
  return full;
}

export function deleteCustomTemplate(id: string): void {
  const list = listCustomTemplates().filter((t) => t.id !== id);
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

export function updateCustomTemplate(id: string, updates: Partial<CustomTemplate>): void {
  const list = listCustomTemplates().map((t) => (t.id === id ? { ...t, ...updates } : t));
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

export function incrementUseCount(id: string): void {
  const list = listCustomTemplates();
  const t = list.find((x) => x.id === id);
  if (t) {
    t.useCount++;
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  }
}

/**
 * Export/Import para backup ou share entre users.
 */
export function exportTemplatesAsJSON(): string {
  return JSON.stringify(listCustomTemplates(), null, 2);
}

export function importTemplatesFromJSON(json: string): { imported: number; errors: string[] } {
  try {
    const data = JSON.parse(json);
    if (!Array.isArray(data)) return { imported: 0, errors: ['JSON deve ser array'] };

    const list = listCustomTemplates();
    let imported = 0;
    const errors: string[] = [];

    for (const item of data) {
      if (!item.title || !item.prompt) {
        errors.push(`Template sem title ou prompt: ${item.title ?? 'sem nome'}`);
        continue;
      }
      list.push({
        ...item,
        id: item.id ?? crypto.randomUUID(),
        createdAt: item.createdAt ?? new Date().toISOString(),
        useCount: item.useCount ?? 0,
      });
      imported++;
    }

    localStorage.setItem(LS_KEY, JSON.stringify(list));
    return { imported, errors };
  } catch (err) {
    return { imported: 0, errors: [err instanceof Error ? err.message : 'JSON invalido'] };
  }
}
