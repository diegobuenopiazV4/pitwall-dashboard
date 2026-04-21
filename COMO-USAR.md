# Como Usar - V4 PIT WALL

## Acesso
**URL publica:** https://pitwall-dashboard.vercel.app

Pode ser acessado de:
- Qualquer computador com browser moderno
- Celular (Chrome/Safari - funciona bem em mobile)
- Tablet
- Qualquer sistema operacional

## Primeiro acesso (1 minuto)

1. Abra https://pitwall-dashboard.vercel.app
2. Digite seu nome e clique em **Entrar** (modo offline funciona imediatamente)
3. Um banner aparecera sugerindo configurar Claude API key — clique em **Configurar**
4. Abra [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) em outra aba
5. Clique em **Create Key**, de um nome, copie a chave `sk-ant-api03-...`
6. Cole no campo "Claude API Key" no modal de Settings
7. Escolha o modelo (recomendo Claude Sonnet 4.5 para qualidade)
8. Clique em **Salvar**

Pronto — agora todos os 16 agentes respondem com Claude de verdade.

## Funcoes principais

### Atalhos essenciais
- `Ctrl+Shift+P` — Command Palette (navegacao rapida)
- `Ctrl+L` — Biblioteca de 50+ prompts prontos
- `Ctrl+K` — Buscar agentes/clientes
- `Ctrl+Shift+K` — View Kanban
- `Ctrl+Shift+A` — View Analytics
- `Ctrl+Shift+D` — View Documents
- `Ctrl+1..9` — Selecionar Agente 1-9

### Fluxo tipico de trabalho

1. **Escolha um cliente** na sidebar (ja tem 10 clientes demo)
2. **Escolha um agente** para a tarefa (ou ative Auto-Router no botao Auto no chat)
3. **Use a biblioteca de prompts** (Ctrl+L) para acelerar
4. **Receba resposta completa** com frameworks V4 aplicados
5. **Favorite** respostas importantes (estrela na mensagem)
6. **Exporte** como MD/HTML/PDF (botao Salvar como)
7. **Gere tarefas** no Kanban e mova entre P1/P2/P3/Done
8. **Consolide** no View Documents ou exporte sprint em CSV

### Features power user
- **Auto-Router**: ativa botao "Auto" no chat → Agente Mestre roteia sua mensagem para o agente ideal automaticamente
- **Multi-Agent Chain** (header): objetivo complexo? → descreva e o sistema executa em sequencia por varios agentes
- **Voice Input**: clique no microfone (so Chrome/Edge) e dite em portugues
- **File Upload**: arraste imagens/PDFs/CSVs para contexto
- **Smart Suggestions**: sistema sugere proximo agente apos cada resposta

## Multi-usuario (Supabase opcional)

Se quiser que varias pessoas da equipe tenham contas separadas com persistencia cloud:

1. Crie projeto em [supabase.com/dashboard](https://supabase.com/dashboard)
2. Pegue **Project URL** e **anon public** key em Settings → API
3. Em [vercel.com](https://vercel.com/dashboard) → seu projeto pitwall-dashboard → **Settings → Environment Variables**
4. Adicione:
   - `VITE_SUPABASE_URL` = sua URL
   - `VITE_SUPABASE_ANON_KEY` = sua anon key
5. Clique em **Redeploy** no ultimo deployment
6. No Supabase SQL Editor, cole o conteudo de `supabase/migrations/001_initial_schema.sql` → **Run**
7. Cole o conteudo de `supabase/migrations/002_seed_agents.sql` → **Run**

Agora a tela de login passa a aceitar email/senha e cada usuario ve apenas os proprios dados.

## Sem Supabase tambem funciona

No modo offline (sem Supabase), os dados ficam no **localStorage do browser**:
- Funciona perfeitamente para uso individual
- Cada dispositivo tem seu proprio conjunto de dados
- Clientes, mensagens, tasks persistem entre sessoes
- Gratis, sem login, sem backend

## Nao gostou de algum agente?

Edite os 16 agentes em `src/lib/agents/agents-data.ts` — cada um tem:
- Nome, area, cor, icone
- Mentores de referencia
- Frameworks e KPIs
- Quick actions pre-configuradas

Adicione/remova agentes livremente. O sistema se adapta dinamicamente.

## Suporte

- **Repo**: https://github.com/diegobuenopiazV4/pitwall-dashboard
- **Issues**: Abra uma issue no GitHub
- **Docs**: pasta `docs/` do projeto

---

**Custo de uso (estimativa):**
- Vercel: $0/mes (free tier ate 100GB bandwidth)
- Supabase: $0/mes (free tier ate 500MB DB)
- Claude API: ~$3-10/mes para equipe pequena (pay-per-use por tokens)
- **Total: $3-10/mes** para uso moderado de equipe

Se nao configurar Claude/Gemini: $0/mes (respostas offline templatizadas).
