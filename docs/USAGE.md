# Guia de Uso - V4 PIT WALL Dashboard

## Para toda a equipe V4

Este dashboard centraliza o operacional de marketing digital. 16 agentes de IA especializados respondem suas solicitacoes com base em mentores reais e frameworks validados.

---

## Primeiro acesso

1. Acesse `https://seu-dominio.vercel.app`
2. Clique em **"Nao tem conta? Criar"**
3. Insira nome, email, senha
4. Voce ja esta dentro!

OU clique em **"Entrar sem conta (modo offline)"** para testar sem cadastro.

---

## Interface: 3 Colunas

### Coluna Esquerda: Sidebar
- **Agentes**: 16 agentes disponiveis. Clique para selecionar.
- **Clientes**: Seus 10 clientes (ou adicione novos). Clique para contextualizar.
- **Tarefas**: TODO list pessoal. Persistente.
- **Sprint**: Define semana atual + metas.

### Coluna Central: Chat
- Mensagens com o agente selecionado
- **Quick Actions** no topo: atalhos dos comandos mais comuns
- Input embaixo: digite sua solicitacao
- Em cada resposta: botao **Copiar** e **Salvar como** (MD/HTML/PDF)

### Coluna Direita: Contexto
- **AEMR**: pilares do metodo V4
- **STEP**: fase do cliente ativo
- **TOC**: os 5 passos focalizadores
- **Cliente Ativo**: detalhes do cliente selecionado
- **Parametros do Prompt**: flags que controlam o que vai no system prompt
- **12 Regras do Motor**: qualidade obrigatoria

---

## Fluxo tipico

### Pedir um diagnostico de cliente

1. Selecione **Agente 01 - Mestre**
2. Selecione o cliente (ex: "ASHEY FIBRA")
3. Clique no Quick Action **"Diagnostico STEP"** ou digite "faz um diagnostico completo"
4. Agente retorna: fase STEP, restricao TOC, FCA, recomendacoes por pilar

### Criar copy de landing page

1. Selecione **Agente 08 - Copy Performance**
2. Selecione o cliente
3. Digite: "cria copy completa para landing page de [produto]"
4. Agente retorna copy secao por secao
5. Clique **Salvar como > Markdown** para baixar

### Planejar sprint semanal

1. Selecione **Agente 02 - Projetos**
2. Digite: "faz sprint planning para a semana"
3. Agente retorna tabela com tarefas, agentes responsaveis, prioridades
4. Copie as tarefas para o sidebar de **Tarefas**

### Campanha Meta Ads

1. Selecione **Agente 04 - Trafego Meta**
2. Selecione cliente
3. Quick Action **"Campanha Conversao"**
4. Recebe estrutura completa: campanha, conjuntos, criativos, metas

---

## Atalhos de Teclado

| Atalho | Acao |
|--------|------|
| Ctrl+K | Buscar agentes/clientes/comandos |
| Ctrl+O | Overview de clientes |
| Ctrl+1-9 | Selecionar agente 1 a 9 |
| Enter | Enviar mensagem |
| Shift+Enter | Nova linha |
| Esc | Fechar modal |

---

## Exportar Documentos

Cada resposta do agente pode ser salva:

- **Markdown (.md)**: Ideal para compartilhar no Notion, GitHub, Docs
- **HTML (.html)**: Abre em qualquer browser, printavel
- **PDF**: Imprima via janela do browser (mais controle)

Os arquivos sao nomeados automaticamente com: `[agente]-[cliente]-[data].ext`

---

## Configurar Gemini (IA real)

Sem Gemini configurada, o sistema usa respostas template (modo offline).

Para ativar IA real:

1. Clique no icone **Configuracoes** no header
2. Cole sua Gemini API Key
3. Salvar

A key e guardada localmente no browser (localStorage).

Para obter key: [ai.google.dev](https://ai.google.dev) -> "Get API Key"

---

## Gerenciar Clientes

### Adicionar cliente novo
1. Sidebar > Clientes > **"+ Novo Cliente"**
2. Preencha nome, segmento, fase STEP, pilar, health
3. Salvar -> ja esta disponivel em todas as conversas

### Remover cliente
1. Passe mouse sobre o cliente
2. Clique no icone lixeira
3. Confirme com "OK"

> **Atencao**: Remover cliente tambem apaga suas conversas persistidas.

---

## Flags do Prompt (Contexto)

No painel direito, voce controla o que vai no system prompt do agente:

- **FCA**: Inclui instrucao para usar framework Fatos/Causas/Acoes
- **Historico**: Inclui ultimas 6 mensagens na conversa
- **Tarefas**: Lista suas tasks atuais para o agente considerar
- **Sprint**: Inclui semana e metas ativas
- **Report**: Pede formato de relatorio (em desenvolvimento)

Flags ligadas aparecem em vermelho. Desligue flags para respostas mais rapidas e focadas.

---

## FAQ

**Posso compartilhar minhas conversas com outro usuario?**
Nao por padrao. Cada usuario tem seus dados isolados via RLS.

**Os 10 clientes default aparecem para todo mundo?**
Sim, sao criados automaticamente no primeiro login como seed inicial.

**Posso editar um cliente depois?**
Nesta versao, apenas adicionar/remover. Edicao inline esta no roadmap.

**Como funciona o modo offline?**
Respostas sao templates pre-definidas para os agentes 01, 03 e 04. Outros agentes recebem resposta generica. Sem Supabase, dados ficam so em memoria.

**A Gemini key precisa ser paga?**
Nao no tier free (15 RPM / 1500 requests/dia). Para uso intensivo, habilite billing.

**Posso usar outro LLM (Claude, GPT)?**
Nao nativamente. Precisaria adaptar `ChatArea.tsx` e o builder de prompts.

---

## Suporte

- Bugs: abra issue no GitHub
- Duvidas: canal #pitwall-dashboard no Slack V4
- Feedback: `diego@v4company.com`
