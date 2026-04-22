/**
 * Sistema Multi-tenant (Accounts/Workspaces).
 * Um Account = empresa/agencia. Members = pessoas da equipe. Clientes = compartilhados entre members do account.
 *
 * Schema Supabase (migration 004):
 * - accounts (id, name, owner_id, plan)
 * - account_members (account_id, user_id, role: admin|editor|viewer)
 * - clients.account_id (FK) + clients.user_id (opcional, para ownership)
 */

import { supabase } from '../supabase/client';

export interface Account {
  id: string;
  name: string;
  ownerId: string;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: string;
}

export interface AccountMember {
  accountId: string;
  userId: string;
  role: 'admin' | 'editor' | 'viewer';
  email?: string;
  fullName?: string;
  joinedAt: string;
}

const LS_KEY = 'v4_pitwall_current_account';

export function getCurrentAccountId(): string | null {
  return localStorage.getItem(LS_KEY);
}

export function setCurrentAccountId(id: string | null): void {
  if (id) localStorage.setItem(LS_KEY, id);
  else localStorage.removeItem(LS_KEY);
}

/**
 * Lista accounts que o usuario tem acesso.
 */
export async function listMyAccounts(userId: string): Promise<Account[]> {
  try {
    const { data, error } = await supabase
      .from('account_members')
      .select('account_id, accounts (*)')
      .eq('user_id', userId);

    if (error || !data) return [];

    return data
      .map((row: any) => row.accounts)
      .filter(Boolean)
      .map((a: any) => ({
        id: a.id,
        name: a.name,
        ownerId: a.owner_id,
        plan: a.plan,
        createdAt: a.created_at,
      }));
  } catch {
    return [];
  }
}

/**
 * Criar novo account (o usuario vira owner automaticamente via trigger).
 */
export async function createAccount(name: string, userId: string, plan: 'free' | 'pro' = 'free'): Promise<Account | null> {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .insert({ name, owner_id: userId, plan })
      .select()
      .single();

    if (error || !data) return null;

    // Tambem adiciona como membro admin (trigger pode cuidar, mas redundancia nao machuca)
    await supabase.from('account_members').insert({
      account_id: data.id,
      user_id: userId,
      role: 'admin',
    });

    return {
      id: data.id,
      name: data.name,
      ownerId: data.owner_id,
      plan: data.plan,
      createdAt: data.created_at,
    };
  } catch {
    return null;
  }
}

/**
 * Listar members de um account.
 */
export async function listAccountMembers(accountId: string): Promise<AccountMember[]> {
  try {
    const { data, error } = await supabase
      .from('account_members')
      .select('*, profiles (full_name)')
      .eq('account_id', accountId);

    if (error || !data) return [];

    return data.map((row: any) => ({
      accountId: row.account_id,
      userId: row.user_id,
      role: row.role,
      email: row.email,
      fullName: row.profiles?.full_name,
      joinedAt: row.joined_at,
    }));
  } catch {
    return [];
  }
}

/**
 * Convida membro para o account (via email).
 * Requer que o user ja tenha conta Supabase - idealmente envia email magic link.
 */
export async function inviteMember(
  accountId: string,
  email: string,
  role: 'admin' | 'editor' | 'viewer' = 'editor'
): Promise<{ ok: boolean; message: string }> {
  try {
    // Busca user pelo email no auth.users (precisa de RPC ou supabase admin)
    // Simplificacao: insere pending invite com email
    const { error } = await supabase.from('account_invites').insert({
      account_id: accountId,
      email,
      role,
      status: 'pending',
    });

    if (error) {
      // Fallback: cria membership direto se user ja existe
      return { ok: false, message: error.message };
    }

    return { ok: true, message: `Convite para ${email} criado. Aceite na primeira login.` };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'erro' };
  }
}

export async function removeMember(accountId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('account_members')
      .delete()
      .eq('account_id', accountId)
      .eq('user_id', userId);

    return !error;
  } catch {
    return false;
  }
}

export async function updateMemberRole(
  accountId: string,
  userId: string,
  role: 'admin' | 'editor' | 'viewer'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('account_members')
      .update({ role })
      .eq('account_id', accountId)
      .eq('user_id', userId);

    return !error;
  } catch {
    return false;
  }
}
