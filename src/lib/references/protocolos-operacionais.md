# PROTOCOLOS OPERACIONAIS V4 PIT WALL

> Protocolos completos de trabalho, estrutura de pastas, formatos de entrega,
> integração Google Drive, comandos rápidos, handoff inter-agentes,
> resolução de conflitos, gestão de sprints, e compliance.

---

## PROTOCOLO DE TRABALHO (10 PASSOS)

### Passo 1 — Identificar o Cliente
Pergunte se não mencionado. Localize dados (segmento, STEP, pilar, health). Acesse pasta `V4-PitWall/clientes/[nome]/`. Se não existir, crie estrutura completa.

### Passo 2 — Buscar Contexto no Google Drive
Execute: `fullText contains 'Check-in' and fullText contains '[CLIENTE]'` + `fullText contains 'FCA'` + `fullText contains '[CLIENTE]' and fullText contains 'call'`. Leia com `google_drive_fetch`. Extraia decisões, problemas, restrições. Salve resumo em `briefings/contexto-gdrive-YYYY-MM-DD.md`.

### Passo 3 — Identificar Restrição (TOC Passo 1)
Onde acumula fila? Aquisição (03/04/14/12) | Engajamento (06/07/09/15) | Monetização (08/11/16) | Retenção (10/11/09). Confirme: se dobrar capacidade aqui, resultado dobra?

### Passo 4 — Rotear para Agente(s)
Consulte tabela (16 Agentes). Agente primário + secundários. Ler referência em `references/[XX]-[nome].md`.

### Passo 5 — Aplicar STEP
**Saber:** Educação, awareness, didático | **Ter:** Consultivo, comparação, prova social | **Executar:** Prático, quick wins | **Potencializar:** Técnico, avançado, scale.

### Passo 6 — Aplicar 12 Regras do Motor de Qualidade
Diagnóstico (STEP+V4+restrições) + Matemática (números, ROI) + Playbook falhas (3-5 riscos) + Red flags + Critérios sucesso (30/60/90d) + Cadeia inter-agentes + Priorização ROI (P1/P2/P3 ICE) + Benchmarks BR + Ferramentas reais (nome+caminho) + Templates prontos + Formatação (headers, tabelas, código) + Densidade (2-4k tokens).

### Passo 7 — Gerar Conteúdo COMPLETO
NUNCA briefings ou estruturas. SEMPRE conteúdo real, pronto para uso. PESQUISE web para dados atualizados. Ver tabela "Regra Crítica: Conteúdo Completo".

### Passo 8 — Salvar Entrega em Pasta do Cliente
Caminho: `V4-PitWall/clientes/[NOME]/entregas/[AREA]/YYYY-MM-DD-[descricao].ext`. Criar pastas se necessário. Extensão: .md (padrão), .xlsx, .docx, .pptx.

### Passo 9 — Salvar Resumo do Drive (se aplicável)
Arquivo: `V4-PitWall/clientes/[NOME]/briefings/contexto-gdrive-YYYY-MM-DD.md`. Inclua fontes, decisões-chave, próximos passos.

### Passo 10 — Informar o Operador
Link do arquivo + resumo (2-3 linhas) + próximos passos com prazos e responsáveis. Se multi-agente, informar sequência de handoff.

---

## REGRA CRÍTICA: CONTEÚDO COMPLETO

| Solicitação | ✅ ENTREGA ESPERADA |
|---|---|
| Artigo blog | INTEIRO (1500-3000 palavras) com pesquisa web, dados, h2/h3, SEO otimizado |
| Email marketing | TODOS os emails: assunto, pré-header, corpo, CTA, versão mobile, timing |
| Copy de LP | Toda seção: hero (80-120 pal), 3-4 benefícios com proof, FAQ, CTA finais |
| Roteiro vídeo | COMPLETO: falas exatas, marcações cena, transições, timing, on-screen text |
| Legendas sociais | TODAS prontas: emojis, CTAs, hashtags, tagging, alt-text, versão stories |
| Campanha ads | Estrutura COMPLETA com copies de TODOS anúncios, segmentação, lances, cronograma |
| Sequência emails | TODAS as emails (5+) com timing, condicionais, A/B testing sugerido |
| Script vendas | COMPLETO: 10+ objeções, respostas prontas, gatilhos de fechamento |
| Dashboard KPIs | Real em .xlsx com fórmulas, gráficos, data sources, refresh automático |
| Audit SEO | COMPLETO: 30+ keywords, gaps vs. concorrentes, plano P1/P2/P3 priorizado |
| Automação fluxo | COMPLETO: triggers, condições, 3+ mensagens, timing, webhooks descrito |
| E-book | COMPLETO (5000-8000 pal): capa, sumário, capítulos, gráficos, conclusão, CTA |
| Case study | COMPLETO: intro, problema, solução detalhada, métricas antes/depois, quote cliente |
| Proposta venda | COMPLETA: executive summary, escopo, timeline, pricing, termos, assinatura |

---

## ESTRUTURA DE PASTAS POR CLIENTE

```
V4-PitWall/clientes/[NOME-CLIENTE]/
├── briefings/
│   ├── briefing-inicial.md              ← Nome, segmento, STEP, pilar, health, objetivos
│   ├── contexto-gdrive-*.md             ← FCA, Check-in, Calls (atualizar sempre)
│   └── diagnostico-completo-*.md        ← STEP + TOC + restrições
├── entregas/
│   ├── trafego-google/                  ← Agente 03 (Search, PMax)
│   ├── trafego-meta/                    ← Agente 04 (FB, IG)
│   ├── criativos/                       ← Agentes 05, 06 (Ads + Social Design)
│   ├── social/                          ← Agentes 07, 06 (Editorial + Design)
│   ├── copy/                            ← Agentes 08, 09 (LP, Email, Blog, Ebook)
│   ├── seo/                             ← Agente 14 (Keywords, Audit, Links)
│   ├── automacao/                       ← Agente 10 (Fluxos, Webhooks, Lead Scoring)
│   ├── crm/                             ← Agente 11 (Pipeline, Scripts, Forecast)
│   ├── web/                             ← Agente 12 (LP, GA4, Tracking, CWV)
│   ├── dados/                           ← Agente 13 (Dashboard, BI, Cohort)
│   ├── video/                           ← Agente 15 (Roteiros, YouTube, Reels)
│   └── cro/                             ← Agente 16 (A/B, UX, Heatmaps)
├── sprints/                             ← Sprint planning 2 semanas
│   ├── sprint-2026-04-07-a-20.md
│   └── backlog-tarefas.md
├── relatorios/                          ← Relatórios mensais
│   └── relatorio-marco-2026.md
└── _historico/                          ← Backup antigos
    ├── 2026-03/
    └── 2026-02/
```

---

## NOMENCLATURA DE ARQUIVOS

Padrão: `YYYY-MM-DD-[tipo]-[descricao-curta].[ext]`

Exemplos: `2026-04-01-campanha-google-search-marca.md` | `2026-04-05-artigo-guia-fibra-optica.md` | `2026-04-10-audit-seo-completo.xlsx` | `2026-04-15-roteiro-youtube-20min.md`

---

## FORMATO DE ENTREGA PADRÃO

```markdown
## 🎯 AGENTE [ID] — [Título da Entrega]
📁 **CLIENTE:** [Nome] | **Segmento:** [Segmento]
🗓️ **Data:** YYYY-MM-DD

### 🔍 DIAGNÓSTICO
**STEP:** [Fase] | **V4:** [Pilar] | **Restrição:** [Identificada]

### 📋 CONTEÚDO PRINCIPAL
[CONTEÚDO COMPLETO — não estruturas]

### 📊 MÉTRICAS / CÁLCULOS
[Benchmarks, ROI, metas 30/60/90d em tabela]

### 🚨 PLAYBOOK DE FALHAS
**Risco 1:** [Descrição] → Sinal: [...] → Recuperação: [...]

### ⚠️ RED FLAGS
[Quando NÃO usar, pré-requisitos]

### ✅ CRITÉRIOS DE SUCESSO
[Métrica-chave, baseline, metas 30/60/90d]

### 🔗 CADEIA INTER-AGENTES
[Se multi-agente: De → Para, Entregável, Prazo]

### 🎯 PRIORIZAÇÃO (ICE)
[P1/P2/P3 com Impact × Confidence × Ease]

### 🛠️ FERRAMENTAS RECOMENDADAS
[Nome exato, menu, config]

### 📄 TEMPLATES PRONTOS
[Links ou descrição]

### ⚖️ COMPLIANCE
✅ LGPD: [Status] | ✅ Governança IA: [Status]

### 💡 PRÓXIMOS PASSOS
[Com responsável e prazo]

### 💾 ARQUIVO SALVO
`V4-PitWall/clientes/[NOME]/entregas/[AREA]/[arquivo].[ext]`
```

---

## COMANDOS RÁPIDOS (20+)

| # | Comando | Ação | Agente(s) |
|---|---|---|---|
| 1 | `novo cliente [nome]` | Criar estrutura + briefing | 01 |
| 2 | `listar clientes` | Todos os clientes com health | 01 |
| 3 | `histórico [cliente]` | Todas as entregas | 01 |
| 4 | `diagnóstico [cliente]` | STEP + TOC completo | 01 |
| 5 | `restrição [cliente]` | Identificar restrição (TOC P1) | 01 |
| 6 | `sprint [cliente]` | Sprint planning semanal | 02 |
| 7 | `standup [cliente]` | Standup de progresso | 02 |
| 8 | `review [cliente]` | Sprint review + health score | 02 |
| 9 | `retro [cliente]` | Sprint retrospectiva | 02 |
| 10 | `relatório [cliente]` | Relatório mensal | 01+13 |
| 11 | `artigo [cliente] [tema]` | Artigo COMPLETO (1500-3000 pal) | 09+14 |
| 12 | `email [cliente] [tipo]` | Sequência COMPLETA com timing | 09+10 |
| 13 | `campanha [cliente] [canal]` | Campanha COMPLETA com copies | 03/04+05+08 |
| 14 | `lp [cliente]` | Copy COMPLETA LP (hero, benefícios, CTA) | 08+12+16 |
| 15 | `social [cliente]` | Calendário editorial COMPLETO | 07+06 |
| 16 | `roteiro [cliente] [formato]` | Roteiro vídeo COMPLETO | 15 |
| 17 | `seo [cliente]` | Audit SEO COMPLETO | 14+12 |
| 18 | `crm [cliente]` | Pipeline + scripts COMPLETOS | 11 |
| 19 | `automação [cliente]` | Fluxo nutrição COMPLETO | 10 |
| 20 | `dashboard [cliente]` | Dashboard KPIs .xlsx | 13 |
| 21 | `ebook [cliente] [tema]` | E-book COMPLETO (5000-8000 pal) | 09 |
| 22 | `case [cliente]` | Case study COMPLETO | 09+13 |
| 23 | `contexto [cliente]` | Buscar contexto Google Drive | 01 |

---

## PROTOCOLO DE HANDOFF INTER-AGENTES

Template: De (Agente) → Para (Agente) | Entregável | Contexto | Ação Esperada | Prazo | Prioridade (ICE)

**Campanha Completa:** 01 Brief → 03/04 paralelo → 05 Designer → 08 Copy → Launch [D+0 até D+7]

**Keyword Alto Volume:** 14 SEO → 09 Copy Conteúdo + 12 Web Dev [D+0 até D+7]

**Criativo Fatigado:** 13 Dados → 04 Meta → 05 Designer [D+0 até D+2, URGENTE]

---

## MATRIZ DE RESOLUÇÃO DE CONFLITOS

| Conflito | Decisor | Critério | Ação |
|---|---|---|---|
| Escalar vs. ROI caindo | Ag. 13 (Dados) | Dados > Intuição | Seguir análise Ag. 13 |
| Copy testa vs. Design marca | Ag. 05 (Design) | Brand > performance | Usar brand, testar A/B |
| SEO longo vs. Social curto | Ambos | Versão longa + adaptar | Conteúdo long-form, distribuir social |
| CRO LP vs. Web velocidade | Ag. 12 (Web) | Core Web Vitals > Teste | Priorizar velocidade, depois CRO |
| Qual canal investir | Ag. 13 (Dados) | ROAS histórico | Seguir performance data |

---

## DECOMPOSIÇÃO TAREFAS COMPLEXAS

Para "Lançar campanha omnichannel":
1. Decompor por agente (01 → 03, 04, 05, 07, 08, 09, 12, 14)
2. Mapear dependências (01 Brief → 03/04 paralelo; 05 recebe de 03/04; 08 recebe de 05)
3. Cronograma (Sem 1: Brief; Sem 2: Criativos; Sem 3: Copy; Sem 4: Launch)
4. Gerar briefings por agente (inputs, outputs, prazo, métricas)
5. Executar em paralelo (agentes independentes simultaneamente)

---

## GESTÃO DE SPRINT (2 SEMANAS)

**Seg — Sprint Planning (1-2h):** 1) Revisar velocidade anterior; 2) Definir meta (1 frase); 3) Backlog refinement + ICE score; 4) Alocação por agente; 5) Criar `sprint-YYYY-MM-DD-a-DD.md`

**Ter-Qui — Standup Diário (15 min):** Ontem: [tarefas] | Hoje: [tarefas] | Blockers?: [sim/não]

**Sex — Review (30 min) + Retro (30 min):** Review: Tarefas completadas, meta atingida? | Health Score: 🟢/🟡/🔴 | Retro: Start/Stop/Continue

---

## INTEGRAÇÃO GOOGLE DRIVE

**Queries:** `fullText contains 'FCA'` | `fullText contains 'Check-in' and fullText contains '[CLIENTE]'` | `fullText contains '[CLIENTE]' and fullText contains 'call'`

**Extrair:** FCA (Fatos, Causa, Ação, ROI) | Check-in (Status, métricas, problemas) | Calls (Decisões, compromissos)

**Protocolo:** 1) Busque 3 tipos; 2) Leia com `google_drive_fetch`; 3) Extraia insights; 4) Crie `contexto-gdrive-*.md`; 5) Cite nos diagnósticos

---

## GERAÇÃO DE ARQUIVOS

| Formato | Melhor Para | Quando Usar |
|---|---|---|
| .md | Entregas padrão, briefings, estratégias | 90% dos casos |
| .xlsx | Planilhas com fórmulas, dashboards, audits | Dados estruturados |
| .docx | Propostas, relatórios executivos, SOPs | Cliente formal |
| .pptx | Apresentações executivas, pitch decks | Apresentação |
| .pdf | Relatórios finais, ebooks, case studies | Distribuição final |

---

## CHECKLIST COMPLIANCE LGPD

✅ Coleta: Apenas dados consentidos? | ✅ Armazenamento: Criptografado? | ✅ Retenção: Período definido? | ✅ Transferência: Consentimento explícito? | ✅ Remarketing: Apenas dados consentidos? | ✅ Comunicação: Email/SMS opt-in? | ✅ Transparência: Política privacidade atualizada? | ✅ Direitos: Acesso/Retificação/Exclusão em 15 dias?

---

## REGRAS GOVERNANÇA IA

✅ FACT-CHECKING: Números verificados em fonte confiável? | ✅ HUMANIZAÇÃO: Conteúdo IA-redact, humano-validado? | ✅ E-E-A-T: Experiência, expertise, autoridade, trustworthiness? | ✅ APROVAÇÃO: Humano aprova antes de publicar (Ads/Blog/Email)? | ✅ TRANSPARÊNCIA: Se IA-assistido, informado ao usuário?

---

## GATILHOS AUTOMÁTICOS INTER-AGENTES

| Evento | Origem | Destino | Urgência |
|---|---|---|---|
| Criativo fatigou (Freq > 3.5) | 13 | 04 → 05 | 🔴 URGENTE |
| ROAS caiu > 25% | 13 | 03/04 | 🔴 URGENTE |
| Keyword alto volume | 14 | 09 + 12 | 🟡 Semana |
| Lead não converte (SQL < 20%) | 11 | 03/04 | 🟡 Semana |
| Bounce > 60% | 13 | 16 + 12 | 🟡 Semana |
| CTR email < 1% | 13 | 09 → 08 | 🟡 Semana |
| Hook rate vídeo < 20% | 13 | 15 → 05 | 🟡 Semana |
| Core Web Vitals VERMELHO | 12 | 14 | 🟡 Semana |
| NPS < 30 | 11 | 01 (Mestre) | 🔴 URGENTE |
| Churn > 5%/mês | 13 | 11 → 10 | 🔴 URGENTE |

---

**Versão:** 2.0 | **Última atualização:** 2026-04-09
