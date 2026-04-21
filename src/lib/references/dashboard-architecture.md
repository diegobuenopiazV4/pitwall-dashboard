# DASHBOARD V4 PIT WALL — ARQUITETURA

Referência técnica do Dashboard HTML, estado, API Gemini, interface, atalhos, customização.

---

## DASHBOARD HTML

Arquivo: `V4-PitWall/Dashboard.html` (~1500 linhas)
- HTML5 + CSS3 (inline, sem framework)
- JavaScript vanilla (ES6+)
- marked.js (Markdown), DOMPurify (sanitização)
- Google Generative AI (Gemini) + Google Search Grounding

**Setup Screen:** Campo "OPERADOR" + "CHAVE DE ACESSO IA" (pré-preenchida) + "ATIVAR V4 PIT WALL". Nenhuma menção a "Gemini" — tudo é "Motor IA V4".

---

## ESTADO GLOBAL (localStorage: `v4pw56`)

```javascript
let S = {
  backend: 'gemini',              // 'gemini' (API real) | 'internal' (offline)
  geminiKey: 'AIzaSyBB9y_kNMr6zaDu0MWu09au06z2dttEfSI',
  geminiModel: 'gemini-2.0-flash',
  userName: '',                    // Nome operador
  curAgent: null,                  // ID agente (01-16)
  curClient: null,                 // Nome cliente
  clients: [],                     // Array clientes
  convs: {},                       // Conversas (key: agentId_clientName)
  tasks: [],                       // Backlog tarefas
  sprintWeek: '',
  sprintGoals: [],
  ppFlags: {                       // Painéis direito
    fca: true, hist: true, tasks: true, sprint: false, report: false
  },
  streaming: false
};
```

**Estrutura Cliente:**
```javascript
{ name: 'ASHEY FIBRA', segment: 'Fibra Óptica/Telecom', 
  step: 'Executar', pilar: 'Aquisição', health: 'green' }
```

**Estrutura Conversa:** `convs['03_ASHEY FIBRA'] = [{role, content, ts}, ...]`

---

## FLUXO DE COMUNICAÇÃO

```
Mensagem → send()
  ↓
S.backend === 'gemini'? 
  ├→ buildSystemPrompt() → callGemini() → API Gemini
  └→ 'internal'? → generateResponse() → Objeto R (offline)
  ↓
Resposta → Streaming word-by-word (12ms/8 pal)
  ↓
Markdown (marked.js + DOMPurify)
  ↓
Salva S.convs[agentId_clientName]
  ↓
Persiste localStorage
```

---

## SYSTEM PROMPT BUILDER

`buildSystemPrompt(agent, client)` gera prompt completo com:
1. Identidade agente (mentores, frameworks, KPIs, ferramentas)
2. Dados cliente (STEP, pilar, health)
3. Método V4 (pilares AEMR)
4. Narrativa STEP (4 fases estratégias)
5. TOC (5 Passos + Throughput Accounting + Drum-Buffer-Rope)
6. 12 Regras Motor Qualidade
7. **INSTRUÇÃO CRÍTICA:** "Entregue CONTEÚDO COMPLETO. Se pedirem artigo, ESCREVA o artigo inteiro. NUNCA apenas direcionamentos ou estruturas."

---

## API GEMINI

- **Chave:** `AIzaSyBB9y_kNMr6zaDu0MWu09au06z2dttEfSI`
- **Modelo:** `gemini-2.0-flash`
- **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`
- **maxOutputTokens:** 8192
- **temperature:** 0.8
- **Google Search Grounding:** ATIVADO (pesquisa web real)

```javascript
async function callGemini(prompt, systemPrompt) {
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: { maxOutputTokens: 8192, temperature: 0.8 },
    tools: [{ googleSearch: {} }]  // Grounding
  };
  // POST para endpoint
}
```

---

## MOTOR INTERNO OFFLINE

Fallback `S.backend === 'internal'`. Objeto `R` com respostas pré-escritas:

| Agente | Conteúdo |
|--------|----------|
| R['01'] | Diagnóstico STEP, sprint, relatório, TOC, AARRR, priorização |
| R['03'] | Estrutura Google Ads, Quality Score |
| R['04'] | Campanha conversão Meta, estratégia escala |
| R['05'] | Copies + conceitos criativos |
| R['07'] | Calendário editorial + legendas |
| R['08'] | Copy completa LP |
| R['09'] | Artigo blog, 5 emails, e-book, case study |
| genericByAgent | Respostas por área (design, automação, CRM, web, dados, SEO, vídeo, CRO) |

`buildGenericResponse()` — gerador dinâmico agentes sem template específico.

---

## INTERFACE VISUAL

**Layout:**
```
┌─ HEADER: V4 PIT WALL | Motor IA V4 | ⚙️ ─┐
├─ SIDEBAR ─┬─ CHAT PRINCIPAL ─┬─ PAINEL DIREITO ─┤
│ • Agentes │ [Mensagens]      │ • Método V4      │
│ • Clientes│ [Streaming]      │ • STEP           │
│ • Tarefas │ [Quick Actions]  │ • TOC            │
│ • Sprint  │ [Input + Send]   │ • Cliente info   │
└───────────┴──────────────────┴──────────────────┘
```

**Sidebar (4 abas):**
1. Agentes — 16 clicáveis com ícone
2. Clientes — Seletor com health (🟢🟡🔴)
3. Tarefas — Backlog
4. Sprint — Board semanal

**Chat:** Streaming word-by-word, Markdown renderizado, Quick Actions contextuais

**Painel Direito:** Método V4, STEP, TOC, info cliente, FCA, 12 Regras

**Funcionalidades:**
- Overview cross-client (📋 ou Ctrl+O)
- Busca rápida (Ctrl+K)
- Briefing rápido (Ctrl+P)

---

## ATALHOS DE TECLADO

| Atalho | Ação |
|--------|------|
| Ctrl+K | Busca rápida |
| Ctrl+1 a Ctrl+9 | Selecionar agente |
| Ctrl+P | Briefing rápido |
| Ctrl+O | Overview cross-client |
| ⚙️ | Reconfigurar (chave, nome) |

---

## CUSTOMIZAÇÃO

**Novo cliente:**
```javascript
S.clients.push({
  name: 'NOVO', segment: 'Seg', 
  step: 'Saber', pilar: 'Aquisição', health: 'green'
});
```

**Novo agente:**
1. Criar `references/XX-nome.md`
2. Adicionar entrada tabela SKILL.md
3. Adicionar quick actions Dashboard
4. Adicionar respostas offline em `R`

**Trocar modelo:** Alterar `S.geminiModel`

**Ativar/desativar painéis:** Flags em `S.ppFlags`
