# V4 PIT WALL - Dashboard de Agentes IA

> Sistema de 16 Agentes de IA para Marketing Digital - V4 Company / Ruston Assessoria

Dashboard multi-usuario com 16 agentes de IA especializados, orquestrados por um Agente Mestre. Cada agente possui mentores reais de classe mundial, frameworks validados e ferramentas especificas para entregar resultados de marketing digital.

## Features

- **16 Agentes Especializados** com mentores, frameworks e KPIs reais
- **Agente Mestre** que orquestra os 15 agentes especializados
- **Multi-usuario** com autenticacao Supabase
- **Chat contextual** por cliente + agente com persistencia
- **Gestao de clientes** com STEP, Pilar V4 e Health Score
- **Gestao de tarefas e sprints** por cliente
- **Geracao de documentos** (Markdown, HTML, PDF)
- **Frameworks embutidos**: AEMR, STEP, TOC, 12 Regras do Motor
- **Atalhos de teclado**: Ctrl+K (busca), Ctrl+O (overview), Ctrl+1-9 (agentes)
- **Modo offline**: Funciona sem Supabase/Gemini com respostas template
- **Deploy Vercel**: Pronto para producao

## Tech Stack

- **Frontend**: React 19, Vite 6, TypeScript 5.8, Tailwind 4
- **Backend**: Supabase (Postgres + Auth + Storage + Edge Functions)
- **IA**: Google Gemini 2.0 Flash com Google Search grounding
- **State**: Zustand
- **UI**: lucide-react, react-markdown, react-hot-toast
- **Deploy**: Vercel (frontend) + Supabase (backend)

---

## Setup Rapido (5 minutos)

### Pre-requisitos
- Node.js 18+ ([nodejs.org](https://nodejs.org))
- Conta Supabase ([supabase.com](https://supabase.com)) - gratis
- Gemini API Key ([ai.google.dev](https://ai.google.dev)) - gratis
- Conta Vercel para deploy ([vercel.com](https://vercel.com)) - gratis

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar ambiente
```bash
cp .env.example .env.local
```

Edite `.env.local`:
```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
VITE_GEMINI_API_KEY=sua-gemini-key
```

### 3. Configurar Supabase
No [Supabase Dashboard](https://supabase.com/dashboard):
1. Crie um projeto
2. Em **SQL Editor**, execute na ordem:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_seed_agents.sql`
3. Em **Authentication > Providers**, habilite Email
4. Copie URL e Anon Key de **Settings > API** para o `.env.local`

### 4. Rodar localmente
```bash
npm run dev
```
Acesse http://localhost:3000

### 5. Deploy no Vercel
Ver [`docs/DEPLOY.md`](./docs/DEPLOY.md) para guia completo.

---

## Os 16 Agentes

| # | Agente | Area | Pilar V4 |
|---|--------|------|----------|
| 01 | Mestre Estrategista | Orquestracao | Todos |
| 02 | Gestor de Projetos | Sprints/OKR | Todos |
| 03 | Trafego Google | Google Ads | Aquisicao |
| 04 | Trafego Meta | Meta Ads | Aquisicao |
| 05 | Designer Ads | Criativos Ads | Aquisicao |
| 06 | Designer Social | Design Social | Engajamento |
| 07 | Social Media | Calendario/Engajamento | Engajamento |
| 08 | Copy Performance | Headlines/CTAs/LP | Monetizacao |
| 09 | Copy Conteudo | Blog/Email/Ebooks | Engajamento |
| 10 | Automacoes | Fluxos/MarTech | Retencao |
| 11 | CRM & Pipeline | Vendas/RevOps | Monetizacao |
| 12 | Web Dev | LP/GTM/GA4 | Aquisicao |
| 13 | Dados & BI | Dashboards/Atribuicao | Todos |
| 14 | SEO | Keywords/Tecnico | Aquisicao |
| 15 | Video | Roteiros/YouTube | Engajamento |
| 16 | CRO/UX | Testes A/B | Monetizacao |

---

## Frameworks Embutidos

### AEMR (Metodo V4)
- **Aquisicao**: CPL, CPC, ROAS
- **Engajamento**: Engagement Rate, Viralidade
- **Monetizacao**: SQL>40%, Resp<5min
- **Retencao**: NPS>50, Churn<3%

### STEP (Maturidade do Cliente)
- **Saber**: Nao sabe do problema -> Educacao, awareness
- **Ter**: Quer solucao -> Consideracao, prova social
- **Executar**: Implementando -> Onboarding, conversao
- **Potencializar**: Maduro -> Otimizacao, expansao

### TOC (Teoria das Restricoes)
5 Passos: Identificar -> Explorar -> Subordinar -> Elevar -> Repetir

### 12 Regras do Motor de Qualidade
Obrigatorias em toda resposta: diagnostico, matematica, playbooks, red flags, criterios de sucesso, etc.

---

## Documentacao

- [`docs/DEPLOY.md`](./docs/DEPLOY.md) - Guia completo de deploy
- [`docs/USAGE.md`](./docs/USAGE.md) - Como usar o dashboard
- [`docs/playbook.md`](./docs/playbook.md) - Playbook V4

---

## Estrutura do Projeto

```
pitwall-dashboard/
├── src/
│   ├── components/
│   │   ├── layout/       # AppLayout, Header
│   │   ├── sidebar/      # Agents, Clients, Tasks, Sprint
│   │   ├── chat/         # ChatArea, MessageBubble, MessageActions
│   │   ├── context/      # AEMR, STEP, TOC, Quality Rules
│   │   ├── modals/       # Search, Overview, NewClient, Settings
│   │   └── auth/         # LoginForm
│   ├── lib/
│   │   ├── agents/       # 16 agentes + frameworks + prompts
│   │   ├── documents/    # Exporters (MD/HTML/PDF)
│   │   └── supabase/     # Client config
│   ├── hooks/            # useKeyboardShortcuts, useSupabaseSync
│   ├── stores/           # Zustand app store
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   ├── migrations/       # SQL schema + seed
│   └── functions/        # Edge Functions server-side
├── docs/
│   ├── DEPLOY.md
│   ├── USAGE.md
│   └── playbook.md
├── scripts/              # Setup automatico
├── .env.example
├── vercel.json
└── package.json
```

---

## Scripts Disponiveis

```bash
npm run dev       # Dev server (porta 3000)
npm run build     # Build producao
npm run preview   # Preview do build
npm run lint      # Check TypeScript
npm run setup     # Setup interativo (cria .env.local)
```

---

## Seguranca

Por padrao, a Gemini key fica client-side. Para producao:

1. Deploy Edge Function `supabase/functions/chat`
2. `supabase secrets set GEMINI_API_KEY=xxx`
3. Ajuste ChatArea para chamar `supabase.functions.invoke('chat', ...)`

Ver [`docs/DEPLOY.md`](./docs/DEPLOY.md) para detalhes.

---

## Troubleshooting

**"Supabase not configured"**: Configure `.env.local` com URL e Anon Key
**"Gemini API 400"**: Key invalida ou sem quota
**"CORS error no chat"**: Se usando Edge Function, confirme CORS habilitado
**Mensagens nao persistem**: Verifique migrations executadas e RLS ativo

---

## Licenca

Interno - V4 Company / Ruston Assessoria

Co-Authored-By: Claude Opus 4.7 (1M context)
