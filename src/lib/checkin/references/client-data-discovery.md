# Protocolo de Busca Dinâmica de Dados do Cliente

## Objetivo

Quando o usuário mencionar um cliente, o sistema deve **pedir acesso à pasta do cliente** e depois buscar automaticamente todos os dados disponíveis. O sistema é **dinâmico** — funciona com qualquer cliente, novo ou existente, sem depender de uma lista fixa.

## Princípio Fundamental

O plugin **NÃO tem uma lista fixa de clientes**. Qualquer pessoa pode ter qualquer número de clientes. O sistema deve:
1. Receber o nome do cliente mencionado pelo usuário
2. **Perguntar ao usuário onde estão os dados** (via AskUserQuestion)
3. **Solicitar acesso à pasta** (via request_cowork_directory) se necessário
4. Buscar na pasta selecionada por qualquer coisa que corresponda
5. Montar o contexto automaticamente a partir do que encontrar
6. Perguntar apenas o que não conseguiu descobrir sozinho

## Fase 0: Solicitar Acesso à Pasta do Cliente

**Esta fase é OBRIGATÓRIA antes de qualquer busca.**

### Passo 1: Perguntar ao usuário

Usar `AskUserQuestion` com as opções:

```
Para gerar o check-in de [NOME DO CLIENTE], preciso acessar os dados deste cliente.

A) Quero selecionar a pasta do cliente na minha máquina
B) Os dados já estão numa das pastas que selecionei antes
C) Não tenho pasta com dados — vou fornecer tudo manualmente
```

### Passo 2: Obter acesso

- **Se A**: Usar `request_cowork_directory` para que o usuário selecione a pasta. Após a seleção, a pasta fica montada e acessível.
- **Se B**: Verificar as pastas já montadas no contexto da sessão (ex: `/sessions/.../mnt/NomeDaPasta`). Listar as pastas disponíveis e confirmar qual contém os dados do cliente.
- **Se C**: Pular direto para coleta manual — perguntar nome, cores, nicho, dados de performance.

### Passo 3: Confirmar acesso

Após montar a pasta, confirmar ao usuário:
```
Pasta selecionada: [nome da pasta]
Vou agora procurar os dados de [CLIENTE] nesta pasta...
```

## Fase 1: Gerar Variações de Busca

A partir do nome mencionado pelo usuário, gerar múltiplas variações para busca:

**Exemplo:** Usuário diz "check-in da Ring Tecnologia"

Gerar variações:
- Exato: `ring-tecnologia`, `ring tecnologia`, `Ring Tecnologia`
- Parcial: `ring`, `Ring`, `RING`
- Slug: `ring-tecnologia` (lowercase, hyphens)
- Sem acentos: converter acentos → sem acentos
- Abreviações comuns: primeira palavra do nome

**Exemplo:** Usuário diz "check-in da Mais Confecções"
- Variações: `mais-confeccoes`, `mais confeccoes`, `mais-confecções`, `mais`, `confeccoes`

**Exemplo:** Usuário diz "check-in do João Silva Advogados"
- Variações: `joao-silva-advogados`, `joao-silva`, `joao`, `silva-advogados`

## Fase 2: Escanear Pastas da Máquina

Executar buscas **em paralelo** usando Glob e Grep nas pastas montadas do usuário.

### 2.1 Busca por Pastas do Cliente

```bash
# Buscar pastas que contenham o nome/slug do cliente
Glob: **/clientes/{variações}/**
Glob: **/clientes/*{parcial}*/**
Glob: **/{variações}/**/*.md
Glob: **/{variações}/**/*.csv
Glob: **/{variações}/**/*.html
Glob: **/{variações}/**/*.pptx
```

### 2.2 Busca por Check-ins Anteriores (HTML/PPTX)

```bash
# Check-ins HTML já gerados
Glob: **/*checkin*{variações}*.html
Glob: **/*check-in*{variações}*.html
Glob: **/*Check-in*{variações}*.html

# Check-ins PPTX já gerados
Glob: **/*checkin*{variações}*.pptx
Glob: **/*Check-in*{variações}*.pptx
Glob: **/*Checkin*{variações}*.pptx

# Busca mais ampla com termo parcial
Glob: **/*{parcial}*.html
Glob: **/*{parcial}*.pptx
```

### 2.3 Busca por Dados de Tráfego

```bash
# CSVs de Meta Ads / Google Ads
Glob: **/{variações}/**/*.csv
Glob: **/{variações}/**/*.xlsx
Glob: **/trafego/**/*{parcial}*.*
Glob: **/dados/**/*{parcial}*.*
```

### 2.4 Busca por Notas e Reuniões

```bash
# Notas de check-in e reuniões (.md)
Glob: **/{variações}/**/check-in*.md
Glob: **/{variações}/**/call*.md
Glob: **/{variações}/**/reuniao*.md

# Grep por menção ao cliente dentro de arquivos gerais
Grep: "{nome do cliente}" em **/*.md (últimos 30 dias)
```

### 2.5 Busca por Configuração Visual

```bash
# Registro de clientes com cores/configs
Glob: **/clients.md
Glob: **/clientes*.md
Grep: "{nome do cliente}" em **/clients.md
Grep: "{nome do cliente}" em **/clientes*.md
```

## Fase 3: Ler e Extrair Informações

Para cada arquivo encontrado, ler e extrair (em paralelo quando possível):

### De Check-ins Anteriores (.md)
- Resumo da reunião
- Decisões tomadas
- Action items / próximos passos
- Insights para campanhas
- Data do check-in

### De Check-ins HTML anteriores
- Dados de performance (leads, CPL, spend, etc.)
- Criativos campeões
- Gargalo TOC identificado
- Próximos passos definidos
- Período coberto

### De Check-ins PPTX anteriores
- Usar skill PPTX para extrair texto e dados

### De CSVs de Tráfego
- Métricas de campanhas
- Dados por período
- Performance de criativos

### De Registro de Clientes
- Cores da marca (hex)
- Fontes
- Nicho/setor
- Localização
- Meta Ads ID / Google Ads ID
- Fase STEP e Pilar V4
- Health Score
- Contexto setorial

## Fase 4: Montar Contexto e Apresentar

Após a busca, apresentar um resumo organizado ao usuário:

### Template de Resumo

```
📋 Busca automática para [NOME DO CLIENTE]:

ENCONTRADO:
✅ [X] check-ins anteriores (último: [DATA])
✅ [X] arquivos HTML/PPTX de apresentações
✅ Configuração visual: [CORES]
✅ Último check-in: [RESUMO - ações, decisões]
✅ Dados estratégicos: STEP [fase], Pilar V4 [pilar], Health [score]
✅ [X] CSVs de dados de tráfego

NÃO ENCONTRADO:
❌ [lista do que não encontrou]

AÇÕES PENDENTES DO ÚLTIMO CHECK-IN:
1. [ação 1] — status: ?
2. [ação 2] — status: ?

Para prosseguir, preciso de:
→ [o que falta para gerar o check-in]
```

### Se Nada For Encontrado

Se não encontrar nenhuma pasta ou arquivo do cliente:

```
📋 Não encontrei dados de [NOME] na sua máquina.

Para criar o check-in, vou precisar de:
1. Nome oficial e nicho/setor do cliente
2. Cores da marca (primary, accent, secondary) — ou URL do site para extrair
3. Tipo: semanal ou mensal?
4. Período (ex: 29/03 a 04/04)
5. Dados de performance (print do Meta Ads, CSV, ou acesso via Chrome)
```

### Se Encontrar Parcialmente

Apresentar o que encontrou e perguntar apenas o que falta. Nunca repetir perguntas sobre informações já descobertas.

## Fase 5: Organização por Estrutura PIT WALL

Se a máquina do usuário seguir a estrutura PIT WALL, os dados estarão organizados assim:

```
clientes/{slug-do-cliente}/
├── check-ins/          → Notas de reuniões de check-in
├── entregas/
│   ├── automacoes/     → Fluxos e automações
│   ├── copy/           → Textos e copies
│   ├── criativos/      → Arquivos de criativos (imagens, vídeos)
│   ├── crm/            → Configurações de CRM
│   ├── cro-ux/         → Testes e otimizações
│   ├── dados/          → Relatórios de BI, CSVs
│   ├── seo/            → Análises de SEO
│   ├── social-media/   → Conteúdo para redes sociais
│   ├── trafego/        → Dados de Meta/Google Ads, CSVs
│   ├── video/          → Vídeos e roteiros
│   └── web/            → Landing pages, sites
├── relatorios/         → Relatórios mensais
├── sprints/            → Planejamento de sprints
└── briefings/          → Briefings de campanhas
```

Mas **não depender** dessa estrutura — a busca deve funcionar mesmo que os arquivos estejam organizados de forma diferente.

## Regras Importantes

1. **Sempre buscar ANTES de perguntar** — a busca é o primeiro passo
2. **Busca paralela** — executar múltiplos Globs/Greps ao mesmo tempo
3. **Tolerância a variações** — nomes podem ter acentos, maiúsculas, abreviações
4. **Priorizar arquivos recentes** — ordenar por data de modificação
5. **Não assumir estrutura fixa** — funcionar com qualquer organização de pastas
6. **Respeitar privacidade** — buscar apenas em pastas montadas pelo usuário
7. **Ser transparente** — sempre mostrar o que encontrou e o que não encontrou
8. **Nunca inventar dados** — se não encontrou, perguntar ao usuário
