import React, { useState, useEffect } from 'react';
import { Building2, Plus, Users, Check, ChevronDown, X, Mail, Trash2, Crown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../../stores/app-store';
import {
  listMyAccounts,
  createAccount,
  getCurrentAccountId,
  setCurrentAccountId,
  listAccountMembers,
  inviteMember,
  removeMember,
  updateMemberRole,
  type Account,
  type AccountMember,
} from '../../lib/accounts/workspace';

/**
 * AccountSwitcher - permite alternar entre workspaces e gerenciar membros.
 * Funciona em modo offline (localStorage) e cloud (Supabase).
 */

const OFFLINE_ACCOUNTS_KEY = 'v4_pitwall_offline_accounts';

interface OfflineAccount extends Account {
  members?: AccountMember[];
}

function getOfflineAccounts(): OfflineAccount[] {
  try {
    const raw = localStorage.getItem(OFFLINE_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOfflineAccount(account: OfflineAccount): void {
  const list = getOfflineAccounts();
  const existing = list.findIndex((a) => a.id === account.id);
  if (existing >= 0) list[existing] = account;
  else list.push(account);
  localStorage.setItem(OFFLINE_ACCOUNTS_KEY, JSON.stringify(list));
}

function removeOfflineAccount(id: string): void {
  const list = getOfflineAccounts().filter((a) => a.id !== id);
  localStorage.setItem(OFFLINE_ACCOUNTS_KEY, JSON.stringify(list));
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export const AccountSwitcherModal: React.FC<Props> = ({ open, onClose }) => {
  const { userId, userName } = useAppStore();
  const [accounts, setAccounts] = useState<OfflineAccount[]>([]);
  const [currentAccountId, setCurrentAccountIdLocal] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [expandedAccount, setExpandedAccount] = useState<string | null>(null);
  const [members, setMembers] = useState<Record<string, AccountMember[]>>({});
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('editor');

  const isOffline = !userId || userId === 'offline';

  useEffect(() => {
    if (open) loadAccounts();
  }, [open, userId]);

  const loadAccounts = async () => {
    setCurrentAccountIdLocal(getCurrentAccountId());
    if (isOffline) {
      let list = getOfflineAccounts();
      // Criar account default se nao existe
      if (list.length === 0 && userName) {
        const defaultAccount: OfflineAccount = {
          id: crypto.randomUUID(),
          name: `Minha Equipe`,
          ownerId: userId || 'offline',
          plan: 'free',
          createdAt: new Date().toISOString(),
          members: [{
            accountId: '',
            userId: userId || 'offline',
            role: 'admin',
            fullName: userName,
            email: 'voce@offline',
            joinedAt: new Date().toISOString(),
          }],
        };
        saveOfflineAccount(defaultAccount);
        list = [defaultAccount];
        setCurrentAccountId(defaultAccount.id);
        setCurrentAccountIdLocal(defaultAccount.id);
      }
      setAccounts(list);
    } else {
      const cloudAccounts = await listMyAccounts(userId);
      setAccounts(cloudAccounts);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;

    if (isOffline) {
      const newAccount: OfflineAccount = {
        id: crypto.randomUUID(),
        name: newName.trim(),
        ownerId: userId || 'offline',
        plan: 'free',
        createdAt: new Date().toISOString(),
        members: [{
          accountId: '',
          userId: userId || 'offline',
          role: 'admin',
          fullName: userName,
          email: 'voce@offline',
          joinedAt: new Date().toISOString(),
        }],
      };
      saveOfflineAccount(newAccount);
      setAccounts([...accounts, newAccount]);
      toast.success(`Account "${newAccount.name}" criado`);
    } else {
      const created = await createAccount(newName.trim(), userId);
      if (created) {
        setAccounts([...accounts, created]);
        toast.success(`Account "${created.name}" criado no Supabase`);
      } else {
        toast.error('Erro ao criar account');
      }
    }

    setNewName('');
    setShowNew(false);
  };

  const handleSwitch = (accountId: string) => {
    setCurrentAccountId(accountId);
    setCurrentAccountIdLocal(accountId);
    const acc = accounts.find((a) => a.id === accountId);
    toast.success(`Workspace ativo: ${acc?.name}`);
  };

  const handleDelete = async (accountId: string) => {
    if (!confirm('Tem certeza? Todos os dados do workspace serao removidos.')) return;
    if (isOffline) removeOfflineAccount(accountId);
    setAccounts(accounts.filter((a) => a.id !== accountId));
    if (currentAccountId === accountId) {
      setCurrentAccountId(null);
      setCurrentAccountIdLocal(null);
    }
    toast.success('Workspace removido');
  };

  const handleExpandAccount = async (accountId: string) => {
    if (expandedAccount === accountId) {
      setExpandedAccount(null);
      return;
    }
    setExpandedAccount(accountId);

    if (!isOffline) {
      const m = await listAccountMembers(accountId);
      setMembers({ ...members, [accountId]: m });
    } else {
      const acc = accounts.find((a) => a.id === accountId);
      if (acc?.members) setMembers({ ...members, [accountId]: acc.members });
    }
  };

  const handleInvite = async (accountId: string) => {
    if (!inviteEmail.trim()) {
      toast.error('Email obrigatorio');
      return;
    }

    if (isOffline) {
      const acc = accounts.find((a) => a.id === accountId);
      if (acc) {
        const newMember: AccountMember = {
          accountId,
          userId: `offline-${crypto.randomUUID().slice(0, 8)}`,
          role: inviteRole,
          email: inviteEmail,
          fullName: inviteEmail.split('@')[0],
          joinedAt: new Date().toISOString(),
        };
        acc.members = [...(acc.members || []), newMember];
        saveOfflineAccount(acc);
        setMembers({ ...members, [accountId]: acc.members });
        toast.success(`${inviteEmail} adicionado (modo offline demo)`);
      }
    } else {
      const result = await inviteMember(accountId, inviteEmail.trim(), inviteRole);
      if (result.ok) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    }

    setInviteEmail('');
  };

  const handleRemoveMember = async (accountId: string, memberId: string) => {
    if (!confirm('Remover membro?')) return;

    if (isOffline) {
      const acc = accounts.find((a) => a.id === accountId);
      if (acc && acc.members) {
        acc.members = acc.members.filter((m) => m.userId !== memberId);
        saveOfflineAccount(acc);
        setMembers({ ...members, [accountId]: acc.members });
      }
    } else {
      await removeMember(accountId, memberId);
      const m = await listAccountMembers(accountId);
      setMembers({ ...members, [accountId]: m });
    }
    toast.success('Membro removido');
  };

  const handleChangeRole = async (accountId: string, memberId: string, role: 'admin' | 'editor' | 'viewer') => {
    if (isOffline) {
      const acc = accounts.find((a) => a.id === accountId);
      if (acc && acc.members) {
        acc.members = acc.members.map((m) => (m.userId === memberId ? { ...m, role } : m));
        saveOfflineAccount(acc);
        setMembers({ ...members, [accountId]: acc.members });
      }
    } else {
      await updateMemberRole(accountId, memberId, role);
      const m = await listAccountMembers(accountId);
      setMembers({ ...members, [accountId]: m });
    }
    toast.success('Role atualizado');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg max-h-[90vh] bg-[#1a1a24] border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-purple-400" />
            <h2 className="text-sm font-semibold text-slate-200">Workspaces</h2>
            {isOffline && <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded">Modo Offline</span>}
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {accounts.map((acc) => {
            const isActive = acc.id === currentAccountId;
            const isExpanded = acc.id === expandedAccount;
            const accMembers = members[acc.id] ?? acc.members ?? [];
            const isOwner = acc.ownerId === (userId || 'offline');

            return (
              <div
                key={acc.id}
                className={`rounded-lg border transition-all ${
                  isActive ? 'bg-purple-500/10 border-purple-500/40' : 'bg-slate-900/50 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 p-3">
                  <button
                    onClick={() => handleSwitch(acc.id)}
                    className="flex items-center gap-2 flex-1 min-w-0"
                  >
                    {isActive && <Check size={14} className="text-purple-400 shrink-0" />}
                    <Building2 size={14} className="text-slate-400 shrink-0" />
                    <div className="text-left min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold text-slate-200 truncate">{acc.name}</span>
                        {isOwner && <Crown size={10} className="text-amber-400 shrink-0" />}
                      </div>
                      <div className="text-[9px] text-slate-500">
                        {acc.plan.toUpperCase()} · {accMembers.length} membro{accMembers.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleExpandAccount(acc.id)}
                    className="p-1 text-slate-500 hover:text-slate-300"
                  >
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isOwner && accounts.length > 1 && (
                    <button
                      onClick={() => handleDelete(acc.id)}
                      className="p-1 text-slate-500 hover:text-red-400"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-800 p-3 space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                      <Users size={10} />
                      <span className="uppercase tracking-wider">Membros</span>
                    </div>

                    {accMembers.length === 0 ? (
                      <p className="text-[10px] text-slate-600 py-2">Nenhum membro</p>
                    ) : (
                      <div className="space-y-1">
                        {accMembers.map((m) => (
                          <div key={m.userId} className="flex items-center gap-2 p-1.5 bg-slate-900 rounded">
                            <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-[10px] text-slate-300 shrink-0">
                              {(m.fullName || m.email || '?').charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] text-slate-300 truncate">{m.fullName || 'Sem nome'}</div>
                              <div className="text-[9px] text-slate-600 truncate">{m.email}</div>
                            </div>
                            <select
                              value={m.role}
                              onChange={(e) => handleChangeRole(acc.id, m.userId, e.target.value as any)}
                              disabled={!isOwner || m.userId === (userId || 'offline')}
                              className="text-[9px] bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-slate-300 disabled:opacity-60"
                            >
                              <option value="admin">admin</option>
                              <option value="editor">editor</option>
                              <option value="viewer">viewer</option>
                            </select>
                            {isOwner && m.userId !== (userId || 'offline') && (
                              <button
                                onClick={() => handleRemoveMember(acc.id, m.userId)}
                                className="text-slate-600 hover:text-red-400"
                              >
                                <Trash2 size={10} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {isOwner && (
                      <div className="pt-2 border-t border-slate-800 space-y-1.5">
                        <div className="flex items-center gap-1">
                          <Mail size={10} className="text-slate-500" />
                          <span className="text-[9px] text-slate-500 uppercase tracking-wider">Convidar</span>
                        </div>
                        <div className="flex gap-1">
                          <input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="email@empresa.com"
                            className="flex-1 px-2 py-1 text-[10px] bg-slate-900 border border-slate-700 rounded text-slate-200"
                          />
                          <select
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value as any)}
                            className="text-[9px] bg-slate-900 border border-slate-700 rounded text-slate-200 px-1"
                          >
                            <option value="admin">admin</option>
                            <option value="editor">editor</option>
                            <option value="viewer">viewer</option>
                          </select>
                          <button
                            onClick={() => handleInvite(acc.id)}
                            className="px-2 py-1 text-[10px] text-white bg-purple-600 rounded hover:bg-purple-500"
                          >
                            Convidar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {showNew ? (
            <div className="p-3 bg-slate-900/50 border border-slate-700 rounded-lg space-y-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nome do workspace (ex: Agencia Ruston)"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                className="w-full px-2 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200"
              />
              <div className="flex gap-1">
                <button onClick={handleCreate} className="flex-1 py-1.5 text-xs bg-purple-600 text-white rounded hover:bg-purple-500">
                  Criar
                </button>
                <button onClick={() => setShowNew(false)} className="flex-1 py-1.5 text-xs bg-slate-700 text-slate-300 rounded hover:bg-slate-600">
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNew(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-purple-400 bg-purple-500/10 rounded-lg hover:bg-purple-500/20"
            >
              <Plus size={12} />
              Novo Workspace
            </button>
          )}
        </div>

        <div className="px-4 py-2 border-t border-slate-800 bg-[#111118] text-[10px] text-slate-500">
          {isOffline
            ? 'Modo offline: workspaces salvos no browser. Para colaboracao real, configure Supabase.'
            : 'Cloud: workspaces sincronizados via Supabase. Convides via email magic link.'}
        </div>
      </div>
    </div>
  );
};
