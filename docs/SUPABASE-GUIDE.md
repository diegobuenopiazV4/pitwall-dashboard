# Guia Supabase — Onde achar URL e Anon Key

## Passo 1 — Acessar o Dashboard

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faca login com a conta que voce ja tem
3. Clique no projeto que voce criou (se ainda nao criou, clique em **New Project**)

## Passo 2 — Achar URL e Anon Key

Com o projeto aberto:

1. No menu lateral esquerdo, clique no icone de **engrenagem** (Settings), bem la embaixo
2. Dentro do menu Settings, clique em **API** (ou **API Settings**)
3. Voce vera duas secoes importantes:

### Project URL
```
https://xxxxxxxxxxxx.supabase.co
```
Copie esse URL — essa e a sua **VITE_SUPABASE_URL**.

### Project API keys
Voce vera duas keys:
- **anon** / **public** — esta e a **VITE_SUPABASE_ANON_KEY** (pode ser exposta publicamente, tem RLS protegendo)
- **service_role** — NAO use no frontend, e secreta (so para server-side)

Copie a **anon public** key.

## Passo 3 — Rodar as Migrations (criar tabelas)

No Supabase Dashboard, com o projeto aberto:

1. No menu lateral, clique em **SQL Editor** (icone de banco de dados com lapis)
2. Clique em **New Query**
3. Cole o conteudo completo do arquivo `supabase/migrations/001_initial_schema.sql` (ta no repo)
4. Clique em **Run** (ou Ctrl+Enter)
5. Deve mostrar "Success. No rows returned"
6. Abra outro **New Query**
7. Cole o conteudo de `supabase/migrations/002_seed_agents.sql`
8. Clique em **Run**
9. Deve mostrar "Success" e 16 linhas criadas

Pronto — banco configurado com as 8 tabelas + 16 agentes.

## Passo 4 — Habilitar Email Auth (login)

1. No menu lateral, clique em **Authentication**
2. Em **Providers**, garanta que **Email** esta habilitado
3. Opcional: em **Settings > Auth > Email Templates**, customize os emails
4. Opcional: em **Email Auth**, desmarque "Confirm email" se quiser que usuarios entrem direto sem confirmar email (bom pra testes)

## Passo 5 — Configurar URLs permitidas

No menu **Authentication > URL Configuration**:

- **Site URL**: apos o deploy Vercel, coloque a URL do seu site (ex: `https://pitwall-dashboard.vercel.app`)
- **Redirect URLs**: adicione tanto `http://localhost:3000` (para dev local) quanto sua URL da Vercel

## Usar as credenciais

### Para rodar local:
No arquivo `.env.local` do projeto:
```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5...
```

### Para Vercel:
No dashboard da Vercel, em **Settings > Environment Variables**, adicione:
- `VITE_SUPABASE_URL` = sua URL
- `VITE_SUPABASE_ANON_KEY` = sua anon key

---

## Troubleshooting

**"Invalid API key"**: voce copiou a service_role em vez da anon. Use a `anon public`.

**"relation 'agents' does not exist"**: as migrations nao rodaram. Execute os 2 SQLs na ordem.

**Cannot connect**: URL errada ou projeto pausado. Projetos gratis pausam apos 7 dias sem uso.

**"Row Level Security" errors**: normal — o RLS esta funcionando. Tem que estar logado para criar dados.
