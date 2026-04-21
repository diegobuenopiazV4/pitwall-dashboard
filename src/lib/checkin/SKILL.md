---
name: checkin
description: >
  Gerador de check-ins de marketing digital para a V4 Company / Ruston & CO. Gera dashboards HTML interativos com design glassmorphism premium, 20 frameworks estratégicos, gatilhos mentais de Cialdini e dados de Meta Ads e Google Ads. Pede ao usuário que selecione a pasta do cliente na máquina (via request_cowork_directory) e depois busca automaticamente dados, check-ins anteriores, notas de reunião e configurações. MANDATORY TRIGGERS: Sempre que o usuário mencionar check-in, checkin, apresentação de resultados, relatório de performance, dashboard de métricas, resultados da semana, resultados do mês, performance de campanha, KPIs de mídia, review semanal, review mensal, CPL, CTR, CPC, leads, Meta Ads, Google Ads, relatório para cliente, apresentação para cliente, weekly report, monthly report, V4 Company, Ruston. Use esta skill mesmo que o usuário não diga "check-in" — se a solicitação envolve apresentar dados de performance de marketing digital para um cliente, esta skill deve ser ativada.
metadata:
  version: "2.2.0"
  author: "Ruston & CO"
---

# Sistema Check-in V4 Company / Ruston & CO

## O que este sistema faz

Gera apresentações estratégicas de performance de marketing digital no formato **HTML interativo** (dashboard navegável), com opção de **PPTX**. Cada check-in combina dados reais, análise com 20 frameworks, design glassmorphism premium e técnicas de persuasão.

Acessa **automaticamente** as pastas do cliente na máquina do usuário para buscar dados históricos, check-ins anteriores, notas de reunião, configurações de cliente e dados de tráfego.

## Filosofia Central

O check-in **NÃO É** um relatório. É uma experiência que:
1. Diagnostica a dor antes dos dados (Neuromarketing — Pain → Gain → CTA)
2. Posiciona o cliente como herói (StoryBrand)
3. Cria urgência inteligente (Cialdini — Scarcity + Commitment)
4. Valida com autoridade (Cialdini — Authority)
5. Conecta emocionalmente (design premium + linguagem persuasiva)
6. Impacta em 3 segundos — cada slide comunica sua mensagem nesse tempo

## Quando receber um pedido de check-in

### Passo 0: PEDIR ACESSO À PASTA DO CLIENTE E BUSCAR DADOS

**ANTES de qualquer outra coisa**, o sistema precisa de acesso à pasta onde estão os dados do cliente. O fluxo é:

#### 0.1 — Perguntar ao usuário onde estão os dados

Usar `AskUserQuestion` para perguntar ao usuário qual pasta contém os dados do cliente. Exemplo:

```
Para gerar o check-in de [NOME DO CLIENTE], preciso acessar a pasta com os dados deste cliente na sua máquina.

Opções:
A) Selecionar a pasta do cliente (vou pedir para você escolher)
B) Os dados já estão numa pasta que você selecionou anteriormente
C) Não tenho pasta — vou fornecer os dados manualmente
```

#### 0.2 — Solicitar acesso à pasta

Se o usuário escolher A, usar a ferramenta `request_cowork_directory` para que ele selecione a pasta do cliente diretamente no Cowork. Isso monta a pasta e dá acesso ao sistema.

Se o usuário escolher B, verificar nas pastas já montadas (listadas no contexto da sessão).

Se o usuário escolher C, pular para o Passo 1 e coletar dados manualmente.

#### 0.3 — Buscar dados automaticamente na pasta selecionada

Após ter acesso, executar a busca automática. Ver `references/client-data-discovery.md` para o protocolo completo.

**O sistema NÃO depende de uma lista fixa de clientes.** Funciona com qualquer cliente:

1. **Gerar variações de busca** a partir do nome mencionado (slug, parcial, sem acentos, abreviações)
2. **Escanear a pasta selecionada** usando Glob/Grep em paralelo:
   - Pastas do cliente (`**/clientes/*{nome}*/**`)
   - Check-ins HTML/PPTX anteriores (`**/*checkin*{nome}*.html`)
   - CSVs de tráfego (`**/{nome}/**/*.csv`)
   - Notas de reunião (`**/{nome}/**/check-in*.md`)
   - Registro de configuração visual (`**/clients.md`, `**/clientes*.md`)
3. **Ler os arquivos encontrados** para extrair:
   - Contexto do último check-in (ações comprometidas, decisões)
   - Dados de performance anteriores
   - Insights e objeções mencionadas
   - Próximos passos pendentes
   - Cores, fontes, IDs de plataformas ads
   - Fase STEP, pilar V4, health score
4. **Apresentar ao usuário** um resumo do que encontrou e o que ainda falta

Isso permite que o slide de **Contexto Rápido** já venha preenchido com ações anteriores reais, o slide de **Gargalo TOC** tenha contexto histórico, e os **Próximos Passos** considerem o que foi prometido anteriormente.

**Se nada for encontrado na pasta**, pedir as informações básicas ao usuário (nome, cores, nicho, dados).

### Passo 1: Identificar o que falta

Após a busca automática, perguntar **apenas o que não foi encontrado**:
- **Qual período?** (se não estiver claro)
- **Semanal ou mensal?**
- **Dados de performance** (se não encontrou CSVs ou prints)

Se o cliente não estiver no registro, pedir:
- Nome oficial e slug
- Nicho/setor
- Cores da marca (primary, accent, secondary) — extrair do site se possível
- Fontes (heading + body)
- Meta Ads Account ID e/ou Google Ads ID
- Localização

### Passo 2: Carregar referências do plugin

Ler os arquivos de referência conforme necessidade:

| Arquivo | Quando ler | Conteúdo |
|---------|-----------|----------|
| `references/client-data-discovery.md` | **SEMPRE** no início | Protocolo de busca dinâmica — funciona com qualquer cliente |
| `references/clients-ruston.md` | Se existir na máquina | Dados estratégicos dos clientes Ruston (referência) |
| `references/design-system.md` | **SEMPRE** ao gerar HTML | CSS variables, componentes, animações, tipografia |
| `references/frameworks.md` | Ao escrever insights/análises | 20 frameworks detalhados com uso e linguagem |
| `references/persuasion.md` | Ao escrever textos dos slides | Cialdini, gatilhos mentais, neuromarketing |
| `references/slides-structure.md` | **SEMPRE** ao gerar | Estrutura dos 15 (semanal) e 24 (mensal) slides |
| `references/functions-catalog.md` | Ao implementar código | 68 funções catalogadas |
| `references/technical-rules.md` | Ao gerar PPTX | Regras PptxGenJS, SVG |
| `references/example-data.md` | Para referência de schema | Exemplo completo de dados |

### Passo 3: Coletar dados de performance

#### Opção A: Dados encontrados automaticamente nas pastas
Usar CSVs, relatórios ou dados de check-ins anteriores encontrados na busca.

#### Opção B: Usuário fornece dados (print/CSV/texto)
Estruturar no schema padrão e calcular variações.

#### Opção C: Extrair via Chrome (MCP Claude in Chrome)
1. Navegar para o Meta Ads Manager com a conta do cliente
2. Selecionar o período correto
3. **SEMPRE tirar screenshots** — Meta Ads usa virtual DOM, innerText não funciona
4. Extrair métricas consolidadas, por campanha e por criativo
5. Capturar prints dos 3 criativos campeões para o slide de Criativos

#### Opção D: CSV exportado
Parse via PapaParse/SheetJS.

### Passo 4: Gerar o check-in

#### Formato HTML (preferido)

Gerar arquivo `.html` único e auto-contido com:
- **Zero dependências externas** (além de Google Fonts: Inter + Space Grotesk)
- **CSS embutido** com variables para cores do cliente (ver `references/design-system.md`)
- **JavaScript embutido** para navegação (← → teclado, swipe touch, botões, dots)
- **Todos os slides** da estrutura (15 semanal / 24 mensal, ver `references/slides-structure.md`)
- **Glassmorphism dark** — fundo gradiente escuro + glass cards + tipografia hierárquica
- **Dados dinâmicos** renderizados via JS (KPIs, Funil, Tabela com cores automáticas)
- **Animações fadeInUp** escalonadas por slide
- **Responsivo** — funciona em desktop e mobile

**Salvar o arquivo na pasta do usuário** (workspace/outputs).

### Passo 5: Validar antes de entregar

- Todos os slides presentes? (15 semanal / 24 mensal)
- Nenhum campo vazio/undefined?
- Variações WoW/MoM com cores corretas? (respeitar `invert`)
- Imposto META 12,15% calculado?
- Linguagem persuasiva (não apenas informativa)?
- StoryBrand: cliente = herói, nós = guia?
- Dados do check-in anterior usados no slide de Contexto?

## Tipos de Check-in

| Tipo | Slides | Comparação | Foco |
|------|--------|-----------|------|
| Semanal | 15 | WoW (Week over Week) | Tático/Operacional |
| Mensal | 24 | MoM (Month over Month) | Estratégico/Analítico |

## Regras de Comportamento

1. **SEMPRE pedir acesso à pasta do cliente** via `AskUserQuestion` + `request_cowork_directory`, depois buscar dados automaticamente
2. **SEMPRE gerar arquivo HTML** (ou PPTX se pedido) — nunca apenas texto descritivo
3. **SEMPRE usar cores reais** do cliente (do registro ou extraídas do site)
4. **Nunca slides genéricos** — cada slide tem propósito, framework e gatilho mental
5. **Linguagem persuasiva** — cada insight tem ação, cada dado tem contexto
6. **Imposto META 12,15%** — sempre calcular e apresentar
7. **ICE Score** em toda recomendação (Impact x Confidence x Ease)
8. **StoryBrand** — cliente = herói, nós = guia. SEMPRE
9. **Variação WoW/MoM** — sempre com seta + cor (▲ verde / ▼ vermelho), respeitando inversão
10. Se dados não forem fornecidos, gerar com **dados exemplo realistas** do nicho e marcar "[EXEMPLO]"
11. **Conectar com histórico** — usar check-ins anteriores encontrados nas pastas
12. **Slide Contexto Rápido** — preencher com ações e decisões reais do último check-in

## Métricas com Inversão (invert = true)

Para estas métricas, SUBIR é RUIM (variação positiva → vermelho):
- CPL, CPC, CPM, Frequência, Investimento

Para estas, SUBIR é BOM (variação positiva → verde):
- Leads, Alcance, Impressões, Cliques, CTR, ROAS

## Fluxo de Execução

```
FASE 0: ACESSO + DISCOVERY DINÂMICO
├── Receber nome do cliente
├── AskUserQuestion: "Onde estão os dados deste cliente?"
│   ├── A) Selecionar pasta → request_cowork_directory
│   ├── B) Já está numa pasta montada → verificar pastas existentes
│   └── C) Sem pasta → coletar dados manualmente
├── Gerar variações de busca (slug, parcial, sem acentos)
├── Glob/Grep paralelo na pasta selecionada
│   ├── Pastas do cliente (**/clientes/*nome*/...)
│   ├── Check-ins anteriores (**/*checkin*nome*.html/pptx)
│   ├── CSVs de tráfego (**/*nome*/**/*.csv)
│   ├── Notas de reunião (**/*nome*/**/check-in*.md)
│   └── Registro de cores/config (**/clients.md)
├── Ler arquivos encontrados → extrair contexto
└── Apresentar resumo ao usuário (encontrado vs faltando)

FASE 1: PREPARAÇÃO
├── Carregar cores, fontes, tema do cliente
├── Determinar períodos (atual + anterior para comparação)
├── Ler referências do plugin (design, frameworks, slides)
└── Perguntar APENAS o que não foi encontrado

FASE 2: DADOS
├── Usar dados encontrados automaticamente
├── OU usuário fornece dados (print/CSV/texto)
├── OU extrair via browser (Chrome MCP — screenshots!)
└── Validação cruzada obrigatória

FASE 3: ANÁLISE
├── Calcular variações WoW/MoM (todas métricas, com invert)
├── Rankear criativos por leads/CPL
├── Identificar gargalo TOC automaticamente
├── Calcular ICE scores para recomendações
├── Gerar 4 insights (positivo + alerta + destaque + atenção)
├── Calcular funil + taxas de conversão
├── Calcular imposto META (12,15%)
├── Conectar com histórico (ações anteriores, tendências)
└── Aplicar gatilhos mentais na linguagem

FASE 4: GERAÇÃO
├── Gerar HTML com design glassmorphism + cores do cliente
├── Implementar navegação (teclado + touch + botões)
├── Preencher todos os slides com dados reais
├── Incluir contexto do check-in anterior
└── Salvar arquivo na pasta do usuário

FASE 5: QA
├── Validar estrutura e completude
└── Entregar ao usuário
```
