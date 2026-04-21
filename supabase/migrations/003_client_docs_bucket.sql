-- V4 PIT WALL - Bucket para documentos do cliente
-- Execute apos 001 e 002

-- Criar bucket client-docs se nao existir
insert into storage.buckets (id, name, public)
values ('client-docs', 'client-docs', true)
on conflict (id) do nothing;

-- RLS policies para client-docs: usuario so ve/modifica seus proprios arquivos
create policy "Users can upload own client docs"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'client-docs' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can read own client docs"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'client-docs' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can update own client docs"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'client-docs' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete own client docs"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'client-docs' and (storage.foldername(name))[1] = auth.uid()::text);

-- Tabela opcional para metadata estruturada (complementa storage.objects)
create table if not exists public.client_docs_metadata (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  file_name text not null,
  file_type text,
  file_size bigint,
  storage_path text not null,
  extracted_content text,
  tags text[] default '{}',
  created_at timestamptz not null default now()
);

alter table public.client_docs_metadata enable row level security;

create policy "Users manage own client_docs_metadata" on client_docs_metadata
  for all using (auth.uid() = user_id);

create index if not exists idx_client_docs_metadata_client on client_docs_metadata(client_id);
