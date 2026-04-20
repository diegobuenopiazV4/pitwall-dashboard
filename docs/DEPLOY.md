# Guia de Deploy - Pitwall Dashboard

## Deploy Completo em 3 partes

### Parte 1: Supabase (Backend + Banco)

#### 1.1. Criar projeto Supabase

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. "New project"
3. Escolha organization, nome (`pitwall-dashboard`), senha forte do DB, regiao (`South America (Sao Paulo)`)
4. Aguarde ~2 minutos para provisionar

#### 1.2. Executar migrations

Em **SQL Editor**:

1. Cole o conteudo de `supabase/migrations/001_initial_schema.sql` -> Run
2. Cole o conteudo de `supabase/migrations/002_seed_agents.sql` -> Run

Verifique em **Table Editor** que tem 8 tabelas: profiles, agents (com 16 rows), clients, conversations, messages, tasks, sprints, documents.

#### 1.3. Configurar Auth

Em **Authentication > Providers**:
- Habilite **Email** (ja vem por default)
- (Opcional) Desabilite "Confirm email" em Settings > Email Auth para testes rapidos

Em **Authentication > URL Configuration**:
- Site URL: `https://seu-dominio.vercel.app`
- Redirect URLs: `https://seu-dominio.vercel.app/**`

#### 1.4. Capturar credenciais

Em **Settings > API**:
- Copie **URL** -> sera `VITE_SUPABASE_URL`
- Copie **anon public** -> sera `VITE_SUPABASE_ANON_KEY`
- (Opcional) Copie **service_role** -> usada so em Edge Functions

#### 1.5. (Opcional) Deploy Edge Functions

Para mover a Gemini key para server-side (recomendado para producao):

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link ao projeto (pegue o ref em Settings > General)
supabase link --project-ref SEU-REF-AQUI

# Definir secret
supabase secrets set GEMINI_API_KEY=sua-gemini-key

# Deploy
supabase functions deploy chat
supabase functions deploy generate-document
```

---

### Parte 2: Gemini API

1. Acesse [ai.google.dev](https://ai.google.dev)
2. "Get API key" -> "Create API key"
3. Escolha ou crie um projeto Google Cloud
4. Copie a key (comeca com `AIza...`)
5. Guarde com seguranca (sera `VITE_GEMINI_API_KEY`)

> **IMPORTANTE**: A Gemini key gratuita tem limites. Para uso intensivo, habilite billing no Google Cloud.

---

### Parte 3: Vercel (Frontend)

#### 3.1. Push para GitHub

```bash
git add .
git commit -m "[accounts] setup inicial pitwall-dashboard"
git push -u origin feature/accounts-pitwall-dashboard
```

(Crie o repo primeiro no GitHub se nao existir.)

#### 3.2. Import no Vercel

1. Acesse [vercel.com/new](https://vercel.com/new)
2. "Import Git Repository" -> escolha seu repo
3. Framework Preset: **Vite** (auto-detectado)
4. Build Command: `npm run build` (default)
5. Output Directory: `dist` (default)

#### 3.3. Environment Variables

Adicione no Vercel (Settings > Environment Variables):

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | https://xxx.supabase.co |
| `VITE_SUPABASE_ANON_KEY` | eyJhbGci... |
| `VITE_GEMINI_API_KEY` | AIzaSy... |

Scopes: Production, Preview, Development

#### 3.4. Deploy

Clique "Deploy". Em ~2 minutos estara online.

#### 3.5. Configurar dominio (opcional)

Settings > Domains > Add:
- Seu dominio custom (ex: `pitwall.v4company.com`)
- Siga as instrucoes de DNS (CNAME apontando para `cname.vercel-dns.com`)

---

## Verificacao

Acesse seu dominio Vercel e teste:

- [ ] Criar conta nova (email + senha)
- [ ] Login funciona
- [ ] 10 clientes default aparecem
- [ ] Selecionar agente 01 + cliente -> enviar mensagem "diagnostico" -> recebe resposta Gemini
- [ ] Resposta tem tabelas formatadas (AEMR, FCA)
- [ ] Botao "Copiar" funciona
- [ ] Botao "Salvar como > Markdown" baixa arquivo
- [ ] Botao "Salvar como > PDF" abre janela de impressao
- [ ] Criar nova task no sidebar
- [ ] Logout e login novamente -> dados persistem

## Atualizacoes

```bash
git push origin feature/accounts-pitwall-dashboard
# Vercel deploya automaticamente
```

Para mudancas de schema:
```sql
-- No Supabase SQL Editor, rode a migracao nova
-- Ex: alter table public.clients add column notes text;
```

## Monitoramento

- **Supabase**: Dashboard mostra queries, storage, auth
- **Vercel**: Dashboard mostra deployments, analytics, logs
- **Gemini**: Google Cloud Console mostra uso da API

## Custos (estimativa mensal)

Com uso moderado (10-20 usuarios ativos):

- **Supabase**: Gratis ate 500MB DB + 50k MAU
- **Vercel**: Gratis ate 100GB bandwidth
- **Gemini**: Gratis ate 15 RPM / 1500 requests/dia no tier free

**Total: R$ 0/mes no tier gratuito.**
