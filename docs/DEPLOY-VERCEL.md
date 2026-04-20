# Deploy Vercel — Passo a Passo

## Pre-requisitos
- Conta GitHub
- Conta Vercel ([vercel.com](https://vercel.com)) — pode logar com GitHub
- Projeto commitado localmente (ja feito)

---

## Parte 1 — Criar repo no GitHub

### Opcao A: Via browser (recomendado)

1. Va em [github.com/new](https://github.com/new)
2. Preencha:
   - **Repository name**: `pitwall-dashboard`
   - **Description**: "V4 PIT WALL - Dashboard de 16 Agentes de IA"
   - **Public** ou **Private** (sua escolha)
   - **NAO** marque "Add a README" (ja tem)
   - **NAO** marque ".gitignore" (ja tem)
3. Clique em **Create repository**
4. Na proxima tela, o GitHub mostra instrucoes — copie a URL que aparece em "push an existing repository", algo como:
   ```
   https://github.com/SEU-USER/pitwall-dashboard.git
   ```

### Rodar no seu terminal:

```bash
cd C:/Users/Diego/Agentes/pitwall-dashboard
git remote add origin https://github.com/SEU-USER/pitwall-dashboard.git
git branch -M main
git push -u origin main
```

Se pedir login, use seu usuario do GitHub. Se configurar 2FA, precisa usar um **Personal Access Token** em vez de senha (Settings → Developer Settings → Tokens).

---

## Parte 2 — Deploy na Vercel

### Se voce nunca usou Vercel:

1. Va em [vercel.com/signup](https://vercel.com/signup)
2. Clique em **Continue with GitHub**
3. Autorize a Vercel a ler seus repos

### Conectar repo:

1. No dashboard Vercel, clique em **Add New... → Project**
2. Voce vera uma lista dos seus repos GitHub
3. Encontre `pitwall-dashboard` e clique em **Import**
4. Na tela de configuracao:
   - **Framework Preset**: Vite (deve detectar automaticamente)
   - **Build Command**: `npm run build` (padrao, ja esta no package.json)
   - **Output Directory**: `dist` (padrao do Vite)
   - **Install Command**: `npm install`

### Configurar Environment Variables

Ainda na tela de configuracao, expanda **Environment Variables** e adicione:

| Nome | Valor |
|------|-------|
| `VITE_SUPABASE_URL` | sua URL Supabase |
| `VITE_SUPABASE_ANON_KEY` | sua anon key |
| `VITE_CLAUDE_API_KEY` | sua Claude API key (opcional — cada user pode configurar no app) |

Clique em **Deploy**.

### Aguardar build

Em 1-3 minutos, a Vercel vai:
1. Clonar o repo
2. Rodar `npm install`
3. Rodar `npm run build`
4. Fazer deploy global (CDN)

**Se der erro no build** — leia os logs. Provavel causa: env vars faltando ou build command errado.

---

## Parte 3 — Acessar seu site

Apos o deploy, a Vercel te da:
- URL de producao: `https://pitwall-dashboard.vercel.app` (ou similar)
- URL de preview: uma URL unica por commit

Voce pode:
- Compartilhar a URL com qualquer pessoa
- Configurar um dominio customizado em **Settings → Domains**
- Adicionar mais env vars depois em **Settings → Environment Variables**

---

## Parte 4 — Atualizar Supabase com a URL Vercel

Importante! Apos o deploy:

1. Copie a URL final da Vercel (ex: `https://pitwall-dashboard.vercel.app`)
2. Va em [Supabase Dashboard](https://supabase.com/dashboard) → seu projeto → **Authentication → URL Configuration**
3. Em **Site URL**, coloque a URL Vercel
4. Em **Redirect URLs**, adicione:
   - `https://pitwall-dashboard.vercel.app`
   - `https://pitwall-dashboard.vercel.app/*`
   - `http://localhost:3000` (para continuar funcionando local)
5. Salve

Sem isso, o login pelo Supabase nao vai funcionar em producao.

---

## Parte 5 — Auto-deploy em push

A partir de agora, toda vez que voce fizer:
```bash
git add .
git commit -m "sua alteracao"
git push
```

A Vercel detecta o push e **automaticamente faz deploy** em ~1 min. Sem config adicional.

---

## Troubleshooting

### "Build failed: Cannot find module"
- Rode `npm install` local
- Verifique que `package.json` esta versionado
- Force rebuild no Vercel: **Deployments → click no ultimo → Redeploy**

### "Environment variable undefined"
- Variaveis precisam comecar com `VITE_` para serem acessiveis no frontend
- Apos mudar env vars, precisa redeploy (clica em **Redeploy**)

### "Supabase: Invalid redirect URL"
- Adicione a URL Vercel na lista de Redirect URLs no Supabase
- Incluir tanto com `*` no final quanto sem

### Pagina em branco apos deploy
- Abra o DevTools (F12) → Console e veja o erro
- Muito comum: env vars faltando. Verifique em Vercel → Settings → Environment Variables
- Lembre: depois de mudar env vars, clique em **Redeploy**

### Como eu acesso de outro computador/celular?
- **Qualquer** dispositivo com browser pode acessar a URL Vercel
- Para multi-usuario com login, precisa ter o Supabase configurado
- Login persiste via cookie — cada usuario ve apenas seus proprios dados (RLS)

---

## Custos

Tudo em **plano gratis**:

| Servico | Plano Free |
|---------|-----------|
| Vercel | Hobby: 100GB bandwidth/mes, unlimited deploys |
| Supabase | Free: 500MB DB, 1GB storage, 50k MAU |
| Claude API | Pay-per-use: ~$3/M tokens input, $15/M output (Sonnet 4.5) |

Para uma equipe pequena (10-20 usuarios, uso moderado), provavelmente custa **$0-10/mes** em Claude API. Vercel e Supabase ficam de graca.
