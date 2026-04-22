/**
 * Sistema de sharing publico.
 * Gera URLs read-only para check-ins, conversas ou documentos.
 * Supabase Storage + public_shares table.
 */

import { supabase } from '../supabase/client';

export interface PublicShare {
  id: string;
  slug: string;
  userId: string;
  accountId?: string;
  kind: 'checkin' | 'conversation' | 'document';
  title: string;
  content: string;
  contentType: string;
  expiresAt?: string;
  views: number;
  createdAt: string;
}

/**
 * Cria um share publico.
 */
export async function createPublicShare(params: {
  userId: string;
  accountId?: string;
  kind: PublicShare['kind'];
  title: string;
  content: string;
  contentType?: string;
  expiresInDays?: number;
}): Promise<PublicShare | null> {
  try {
    const expiresAt = params.expiresInDays
      ? new Date(Date.now() + params.expiresInDays * 86400000).toISOString()
      : null;

    const { data, error } = await supabase
      .from('public_shares')
      .insert({
        user_id: params.userId,
        account_id: params.accountId,
        kind: params.kind,
        title: params.title,
        content: params.content,
        content_type: params.contentType ?? 'html',
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (error || !data) {
      console.warn('[sharing] erro ao criar share:', error?.message);
      return null;
    }

    return {
      id: data.id,
      slug: data.slug,
      userId: data.user_id,
      accountId: data.account_id,
      kind: data.kind,
      title: data.title,
      content: data.content,
      contentType: data.content_type,
      expiresAt: data.expires_at,
      views: data.views,
      createdAt: data.created_at,
    };
  } catch {
    return null;
  }
}

/**
 * Gera URL publica.
 */
export function buildShareUrl(slug: string): string {
  const base = typeof window !== 'undefined' ? window.location.origin : 'https://pitwall-dashboard.vercel.app';
  return `${base}/share/${slug}`;
}

/**
 * Recupera share pelo slug (sem auth - acesso publico).
 */
export async function getPublicShare(slug: string): Promise<PublicShare | null> {
  try {
    const { data, error } = await supabase
      .from('public_shares')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) return null;

    // Check expiracao
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return null;
    }

    // Increment view count
    await supabase
      .from('public_shares')
      .update({ views: (data.views ?? 0) + 1 })
      .eq('id', data.id);

    return {
      id: data.id,
      slug: data.slug,
      userId: data.user_id,
      accountId: data.account_id,
      kind: data.kind,
      title: data.title,
      content: data.content,
      contentType: data.content_type,
      expiresAt: data.expires_at,
      views: data.views + 1,
      createdAt: data.created_at,
    };
  } catch {
    return null;
  }
}

/**
 * Lista shares do usuario.
 */
export async function listMyShares(userId: string): Promise<PublicShare[]> {
  try {
    const { data } = await supabase
      .from('public_shares')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return (data ?? []).map((d: any) => ({
      id: d.id,
      slug: d.slug,
      userId: d.user_id,
      accountId: d.account_id,
      kind: d.kind,
      title: d.title,
      content: d.content,
      contentType: d.content_type,
      expiresAt: d.expires_at,
      views: d.views,
      createdAt: d.created_at,
    }));
  } catch {
    return [];
  }
}

export async function deleteShare(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('public_shares').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Fallback: share em memoria (quando Supabase nao configurado).
 * Usa data URL encoded.
 */
export function createInMemoryShare(html: string, title: string): string {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) {
    win.document.title = title;
  }
  return url;
}
