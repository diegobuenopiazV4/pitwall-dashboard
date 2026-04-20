-- V4 PIT WALL - Schema Inicial
-- Execute no Supabase SQL Editor

-- Profiles (estende auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  avatar_url text,
  role text not null default 'operator' check (role in ('admin', 'operator', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Agents (16 agentes, seeded)
create table if not exists public.agents (
  id text primary key,
  name text not null,
  area text not null,
  icon text not null,
  color text not null,
  pilar text not null,
  mentors text not null,
  frameworks text not null,
  kpis text not null,
  tools text not null,
  quick_actions text[] not null,
  system_prompt_template text,
  created_at timestamptz not null default now()
);

alter table public.agents enable row level security;
create policy "Authenticated can read agents" on agents for select using (auth.role() = 'authenticated');

-- Clients (per-user)
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  segment text not null default '',
  step text not null default 'Saber' check (step in ('Saber', 'Ter', 'Executar', 'Potencializar')),
  pilar text not null default 'Aquisicao',
  health text not null default 'yellow' check (health in ('green', 'yellow', 'red')),
  metadata jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, name)
);

alter table public.clients enable row level security;
create policy "Users manage own clients" on clients for all using (auth.uid() = user_id);

-- Conversations
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  agent_id text not null references agents(id),
  client_id uuid references clients(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, agent_id, client_id)
);

alter table public.conversations enable row level security;
create policy "Users manage own conversations" on conversations for all using (auth.uid() = user_id);

-- Messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role text not null check (role in ('user', 'bot')),
  content text not null,
  agent_id text references agents(id),
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;
create policy "Users read own messages" on messages for select
  using (exists (select 1 from conversations c where c.id = conversation_id and c.user_id = auth.uid()));
create policy "Users insert own messages" on messages for insert
  with check (exists (select 1 from conversations c where c.id = conversation_id and c.user_id = auth.uid()));

create index if not exists idx_messages_conv on messages(conversation_id, created_at);

-- Tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  agent_id text references agents(id),
  text text not null,
  done boolean not null default false,
  priority text default 'P2' check (priority in ('P1', 'P2', 'P3')),
  sprint_week text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tasks enable row level security;
create policy "Users manage own tasks" on tasks for all using (auth.uid() = user_id);

-- Sprints
create table if not exists public.sprints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  week_label text not null,
  goals text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.sprints enable row level security;
create policy "Users manage own sprints" on sprints for all using (auth.uid() = user_id);

-- Documents (metadata, files in Supabase Storage)
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  agent_id text references agents(id),
  file_name text not null,
  file_type text not null,
  storage_path text not null,
  category text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

alter table public.documents enable row level security;
create policy "Users manage own documents" on documents for all using (auth.uid() = user_id);
