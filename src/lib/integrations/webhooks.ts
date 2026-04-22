/**
 * Sistema de webhooks para integracoes out (Slack, Discord, Zapier, n8n, Email).
 * Eventos: check-in gerado, task criada, sprint finalizado, insight relevante.
 */

export type WebhookEvent =
  | 'checkin.generated'
  | 'task.created'
  | 'task.completed'
  | 'sprint.started'
  | 'sprint.completed'
  | 'agent.response'
  | 'document.generated';

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  type: 'slack' | 'discord' | 'zapier' | 'n8n' | 'generic' | 'email';
  enabled: boolean;
  createdAt: string;
}

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, any>;
  source: 'v4-pitwall';
}

const LS_KEY = 'v4_pitwall_webhooks';

export function listWebhooks(): WebhookConfig[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveWebhook(webhook: Omit<WebhookConfig, 'id' | 'createdAt'>): WebhookConfig {
  const list = listWebhooks();
  const full: WebhookConfig = {
    ...webhook,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  list.push(full);
  localStorage.setItem(LS_KEY, JSON.stringify(list));
  return full;
}

export function deleteWebhook(id: string): void {
  const list = listWebhooks().filter((w) => w.id !== id);
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

export function updateWebhook(id: string, updates: Partial<WebhookConfig>): void {
  const list = listWebhooks().map((w) => (w.id === id ? { ...w, ...updates } : w));
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

/**
 * Formata payload para o servico especifico.
 */
function formatForService(webhook: WebhookConfig, payload: WebhookPayload): any {
  if (webhook.type === 'slack') {
    return {
      text: `*V4 PIT WALL* - ${payload.event}`,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: `📊 ${payload.event}` },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Dados:*\n\`\`\`${JSON.stringify(payload.data, null, 2).slice(0, 2000)}\`\`\``,
          },
        },
        {
          type: 'context',
          elements: [
            { type: 'mrkdwn', text: `_${payload.timestamp}_ · V4 PIT WALL` },
          ],
        },
      ],
    };
  }

  if (webhook.type === 'discord') {
    return {
      username: 'V4 PIT WALL',
      embeds: [
        {
          title: `📊 ${payload.event}`,
          description: `\`\`\`json\n${JSON.stringify(payload.data, null, 2).slice(0, 1500)}\n\`\`\``,
          color: 0xe63946,
          timestamp: payload.timestamp,
          footer: { text: 'V4 PIT WALL' },
        },
      ],
    };
  }

  // Zapier/n8n/generic: envia payload completo
  return payload;
}

/**
 * Dispara um evento para todos os webhooks inscritos nele.
 */
export async function emitEvent(event: WebhookEvent, data: Record<string, any>): Promise<{
  success: number;
  failed: { webhook: string; error: string }[];
}> {
  const webhooks = listWebhooks().filter((w) => w.enabled && w.events.includes(event));
  if (webhooks.length === 0) return { success: 0, failed: [] };

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
    source: 'v4-pitwall',
  };

  const results = await Promise.allSettled(
    webhooks.map(async (webhook) => {
      const body = formatForService(webhook, payload);

      if (webhook.type === 'email') {
        // Email via Resend/SendGrid/Mailgun - requer backend. Fallback para mailto
        const mailto = `mailto:${webhook.url}?subject=${encodeURIComponent(`[V4] ${event}`)}&body=${encodeURIComponent(JSON.stringify(payload.data, null, 2))}`;
        window.open(mailto, '_blank');
        return { ok: true };
      }

      const res = await fetch(webhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return { ok: true };
    })
  );

  let success = 0;
  const failed: { webhook: string; error: string }[] = [];

  results.forEach((r, i) => {
    if (r.status === 'fulfilled') success++;
    else failed.push({ webhook: webhooks[i].name, error: r.reason?.message ?? 'erro' });
  });

  return { success, failed };
}

/**
 * Testar webhook (envia payload de teste).
 */
export async function testWebhook(webhook: WebhookConfig): Promise<{ ok: boolean; message: string }> {
  try {
    const testData = {
      event: 'test.webhook' as WebhookEvent,
      timestamp: new Date().toISOString(),
      data: { message: 'Teste do V4 PIT WALL', test: true },
      source: 'v4-pitwall' as const,
    };

    const body = formatForService(webhook, testData);

    if (webhook.type === 'email') {
      return { ok: true, message: 'Email abre mailto (requer cliente padrao)' };
    }

    const res = await fetch(webhook.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    return { ok: res.ok, message: res.ok ? 'OK' : `HTTP ${res.status}` };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'erro' };
  }
}
