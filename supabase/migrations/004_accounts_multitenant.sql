-- V4 PIT WALL - Multi-tenant: Accounts + Members
-- Execute apos 003

-- Accounts (empresas/agencias)
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references profiles(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro', 'enterprise')),
  settings jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.accounts enable row level security;

-- Account members (quem tem acesso)
create table if not exists public.account_members (
  account_id uuid not null references accounts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null default 'editor' check (role in ('admin', 'editor', 'viewer')),
  joined_at timestamptz not null default now(),
  primary key (account_id, user_id)
);

alter table public.account_members enable row level security;

-- Convites pendentes
create table if not exists public.account_invites (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id) on delete cascade,
  email text not null,
  role text not null default 'editor' check (role in ('admin', 'editor', 'viewer')),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'expired')),
  invited_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  unique(account_id, email)
);

alter table public.account_invites enable row level security;

-- RLS policies
-- Accounts: o owner + members podem ver
create policy "Members can view their accounts" on accounts for select
  using (
    owner_id = auth.uid() or
    id in (select account_id from account_members where user_id = auth.uid())
  );

create policy "Owners can update their accounts" on accounts for update
  using (owner_id = auth.uid());

create policy "Anyone authenticated can create accounts" on accounts for insert
  with check (owner_id = auth.uid());

-- Account members: membros podem ver outros membros do mesmo account
create policy "Members see other members" on account_members for select
  using (
    user_id = auth.uid() or
    account_id in (select account_id from account_members where user_id = auth.uid())
  );

create policy "Admins manage members" on account_members for all
  using (
    account_id in (
      select account_id from account_members
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Account invites: admins gerenciam
create policy "Admins manage invites" on account_invites for all
  using (
    account_id in (
      select account_id from account_members
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Adicionar account_id a tabela clients (compartilhamento entre members)
alter table public.clients add column if not exists account_id uuid references accounts(id) on delete set null;

-- Atualizar RLS de clients: membros do account podem ver/editar
drop policy if exists "Users manage own clients" on clients;

create policy "Account members access clients" on clients for all
  using (
    user_id = auth.uid() or
    account_id in (select account_id from account_members where user_id = auth.uid())
  );

-- Idem para tasks, conversations, messages
alter table public.tasks add column if not exists account_id uuid references accounts(id) on delete set null;
alter table public.conversations add column if not exists account_id uuid references accounts(id) on delete set null;

drop policy if exists "Users manage own tasks" on tasks;
create policy "Account members access tasks" on tasks for all
  using (
    user_id = auth.uid() or
    account_id in (select account_id from account_members where user_id = auth.uid())
  );

drop policy if exists "Users manage own conversations" on conversations;
create policy "Account members access conversations" on conversations for all
  using (
    user_id = auth.uid() or
    account_id in (select account_id from account_members where user_id = auth.uid())
  );

-- Trigger: quando um account e criado, o owner vira admin automaticamente
create or replace function public.handle_new_account()
returns trigger as $$
begin
  insert into public.account_members (account_id, user_id, role)
  values (new.id, new.owner_id, 'admin')
  on conflict (account_id, user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_account_created on public.accounts;
create trigger on_account_created
  after insert on public.accounts
  for each row execute procedure public.handle_new_account();

-- Tabela para check-ins e documentos compartilhados publicamente (sharing)
create table if not exists public.public_shares (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null default substr(md5(random()::text || clock_timestamp()::text), 1, 12),
  user_id uuid not null references profiles(id) on delete cascade,
  account_id uuid references accounts(id) on delete cascade,
  kind text not null check (kind in ('checkin', 'conversation', 'document')),
  title text not null,
  content text not null,
  content_type text default 'html',
  expires_at timestamptz,
  views integer default 0,
  created_at timestamptz not null default now()
);

alter table public.public_shares enable row level security;

create policy "Owners manage own shares" on public_shares for all
  using (user_id = auth.uid());

-- Public read acesso (sem auth) - por design
create policy "Anyone can read public shares" on public_shares for select
  using (true);

-- Usage log (cost tracking persistido)
create table if not exists public.usage_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  account_id uuid references accounts(id) on delete cascade,
  agent_id text,
  client_id uuid references clients(id) on delete set null,
  model_id text not null,
  model_provider text not null check (model_provider in ('claude', 'gemini', 'openrouter')),
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  thinking_tokens integer default 0,
  estimated_cost_usd numeric(10, 6) default 0,
  created_at timestamptz not null default now()
);

alter table public.usage_log enable row level security;

create policy "Account members read usage" on usage_log for select
  using (
    user_id = auth.uid() or
    account_id in (select account_id from account_members where user_id = auth.uid())
  );

create policy "Users insert own usage" on usage_log for insert
  with check (user_id = auth.uid());

create index if not exists idx_usage_log_user_date on usage_log(user_id, created_at desc);
create index if not exists idx_usage_log_account_date on usage_log(account_id, created_at desc);

-- Custom templates (salvos pelo user)
create table if not exists public.custom_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  account_id uuid references accounts(id) on delete cascade,
  title text not null,
  description text,
  prompt text not null,
  agent_id text,
  category text default 'Custom',
  preferred_model_id text,
  tags text[] default '{}',
  shared_in_account boolean default false,
  use_count integer default 0,
  created_at timestamptz not null default now()
);

alter table public.custom_templates enable row level security;

create policy "Users manage own templates" on custom_templates for all
  using (user_id = auth.uid());

create policy "Account members read shared templates" on custom_templates for select
  using (
    shared_in_account = true and
    account_id in (select account_id from account_members where user_id = auth.uid())
  );
