# Playbook: V4 PIT WALL Dashboard

## Gargalo Resolvido
Centralizacao da operacao de marketing digital em uma ferramenta multi-usuario acessivel via web, com 16 agentes especializados que produzem conteudo completo (nao briefings), aplicacao automatica de frameworks V4, e geracao de documentos exportaveis.

## O que Faz
Dashboard SaaS com 16 agentes de IA que:
1. Respondem perguntas/solicitacoes com contexto rico (cliente, STEP, pilar V4, TOC, historico)
2. Aplicam automaticamente 12 regras de qualidade em cada resposta
3. Geram conteudo completo (artigos, copies, campanhas, relatorios) — nao apenas briefings
4. Exportam como Markdown, HTML, PDF
5. Gerenciam tarefas em Kanban drag-and-drop
6. Mostram analytics em tempo real
7. Roteiam automaticamente para o agente ideal (Agente Mestre)
8. Executam cadeia de multiplos agentes em sequencia

## Stack
React 19 + Vite 6 + TypeScript 5.8 + Supabase + Tailwind 4 + Gemini AI

## Agentes (todos com mentores reais + frameworks + KPIs + ferramentas)

**Pilar Orquestracao (Todos):**
- 01 Mestre Estrategista — Kotler, Ellis, Goldratt | STP, AARRR, TOC, ICE
- 02 Gestor de Projetos — Schwaber, Sutherland, Doerr | Scrum, OKR, RACI
- 13 Dados & BI — Kaushik, Dykes | Data Storytelling, Cohort

**Aquisicao:**
- 03 Trafego Google — Geddes, Vallaeys | SKAGs, QS, PMax
- 04 Trafego Meta — Foxwell, Loomer | CBO, CAPI, Lookalike
- 05 Designer Ads — Sagmeister, Ogilvy | AIDA Visual
- 12 Web Dev — Krug, Friedman | Core Web Vitals, Schema
- 14 SEO — Fishkin, Dean | E-E-A-T, Skyscraper

**Engajamento:**
- 06 Designer Social — Chris Do, Walsh | Grid System, Brand
- 07 Social Media — Gary Vee, Handley | 70/20/10, JJRH
- 09 Copy Conteudo — Handley, Pulizzi | Content Pillars, SEO Writing
- 15 Video — MrBeast, Neistat | Hook 3s, Storytelling

**Monetizacao:**
- 08 Copy Performance — Schwartz, Halbert | PAS, AIDA
- 11 CRM & Pipeline — Ross, Roberge | Predictable Revenue, BANT
- 16 CRO/UX — Laja, Krug | LIFT Model, Fogg

**Retencao:**
- 10 Automacoes — Brinker | Lead Scoring, Zapier

## Frameworks Core

### AEMR (Metodo V4)
| Pilar | Descricao | Metricas-Norte |
|-------|-----------|----------------|
| Aquisicao | Gerar demanda qualificada | CPL, CPC, ROAS |
| Engajamento | Nutrir e ativar leads | Engagement, Viralidade |
| Monetizacao | Converter em receita | SQL >40%, Resp <5min |
| Retencao | Manter e expandir | NPS >50, Churn <3% |

### STEP (Maturidade do Cliente)
- **Saber**: Nao sabe do problema → Awareness, educacao
- **Ter**: Sabe e quer solucao → Consideracao, comparacao, prova
- **Executar**: Escolheu, implementando → Onboarding, primeiros resultados
- **Potencializar**: Maduro, escalando → Otimizacao, expansao, upsell

### TOC (Teoria das Restricoes)
1. IDENTIFICAR a restricao
2. EXPLORAR ao maximo
3. SUBORDINAR tudo a ela
4. ELEVAR investindo
5. REPETIR

Throughput: T = Receita - CV (maximizar) | I = capital preso (minimizar) | OE = custo fixo

### 12 Regras do Motor
1. Diagnostico antes de prescricao
2. Mostre a matematica
3. Playbook de falhas
4. Red flags
5. Criterios de sucesso 30/60/90d
6. Cadeia inter-agentes
7. Priorizacao ROI (P1/P2/P3)
8. Benchmarks BR
9. Ferramentas reais
10. Templates prontos
11. Formatacao rica
12. Respostas densas (2000-4000 tokens)

## Fluxos Principais

### 1. Atender solicitacao simples
1. Login → seleciona agente → (opcional) seleciona cliente
2. Digita pergunta → Enter
3. Agente responde com system prompt contextualizado
4. Exporta como MD/HTML/PDF

### 2. Usar template pronto
1. Ctrl+L → Biblioteca de Prompts
2. Filtra por agente ou categoria
3. Seleciona template → variaveis {{cliente}} sao preenchidas
4. Ajusta e envia

### 3. Solicitacao sem saber qual agente
1. Ativa Auto-Router (botao no header do chat)
2. Digita solicitacao
3. Sistema roteia automaticamente e avisa qual agente foi escolhido

### 4. Projeto complexo (Multi-Agent Chain)
1. Header → botao Chain
2. Descreve objetivo ("lancamento Black Friday completo")
3. Clica "Sugerir Cadeia" → sistema seleciona agentes em ordem
4. Ajusta a ordem se necessario
5. Executa → cada agente roda em sequencia com contexto do anterior

### 5. Gestao de tarefas
1. Ctrl+Shift+K → View Kanban
2. Drag-and-drop entre colunas P1/P2/P3/Concluidas
3. Export CSV para Excel/Sheets
4. Vincula tasks a cliente e agente

### 6. Analise de performance
1. Ctrl+Shift+A → View Analytics
2. Ve top agentes, top clientes, distribuicoes STEP/Health/Pilar
3. Completion rate, tasks por prioridade
4. Insights para gestao

### 7. Biblioteca de documentos
1. Ctrl+Shift+D → View Documents
2. Busca em respostas ja geradas
3. Filtra por agente/cliente/favoritos
4. Re-exporta ou copia

## Input / Output

**Input:**
- Mensagens de texto (chat)
- Voice (microfone, pt-BR)
- Arquivos (imagens, PDF, CSV, TXT) anexados
- Templates da biblioteca (50+)
- Command Palette (Ctrl+Shift+P)

**Output:**
- Respostas densas (2-4k tokens) em markdown rico
- Exports: MD, HTML, PDF, CSV, XLSX (template)
- Kanban visual de tarefas
- Analytics dashboards
- Biblioteca de documentos

## Tempo Economizado

**Antes (manual):**
- Brief + pesquisa + escrita de artigo blog = 3-4 horas
- Estrutura de campanha Google Ads = 2 horas
- Calendario editorial mensal = 4 horas
- Audit SEO completo = 6 horas
- Sprint planning = 1-2 horas

**Depois (PIT WALL):**
- Mesmo output em segundos (com revisao humana de 10-15 min)
- Ganho medio: **80-90% de tempo**
- Qualidade: rolled-up de mentores de classe mundial
- Escalabilidade: multi-operador simultaneo

## Deploy Multi-Usuario

- Supabase: Auth + Postgres + RLS por user_id
- Vercel: deploy automatico via GitHub
- URL publica com login
- Cada usuario tem seus proprios clientes, conversas, tasks, docs
- Gemini Key por usuario (armazenada localmente no browser)

## Proximas Evolucoes

1. **Ekyte integration**: bookmarklet ja existe, criar conexao direta via API
2. **Meta Ads / Google Ads API**: trazer dados reais para o agente
3. **Realtime collab**: ver mensagens de colegas em tempo real
4. **Notificacoes**: push quando sprint terminar ou tasks atrasadas
5. **Edge Function Gemini**: mover API key para server-side
6. **Roles**: admin/operator/viewer com permissoes
