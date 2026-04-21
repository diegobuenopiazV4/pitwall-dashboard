# V4 SISTEMAS OPERACIONAIS — 4 PILARES DE DECISÃO

**NBO | FORECAST 12M | BASE DE CONHECIMENTO | SUPORTE MATRIZ**

---

## 1. NBO — NEXT BEST OFFER (Upsell Estruturado)

### O que é
Sistema de expansão via IA que recomenda próximo produto/serviço ideal **AGORA** para cada cliente. Responde: "Como gerar +receita com este cliente sem risco?"

### Quando usar
- Após diagnóstico STEP completo
- Reviews mensais/trimestrais
- Quando identificar gap operacional exploável
- Planejamento crescimento receita existente
- Sprints monetização

### Algoritmo de Decisão (5 passos)
```
1. MAPEIE STEP atual → Saber/Ter/Executar/Potencializar?
2. LISTE serviços ativos → O que V4 já faz para cliente?
3. IDENTIFIQUE restrição TOC → O que bloqueia crescimento?
4. CONSULTE portfolio V4 → Qual agente resolve essa restrição?
5. CALCULE ROI → Investimento + payback vs. receita incremental
```

### Scoring Model
```
SCORE = (Impacto_Receita × Pré_requisitos_Met × Taxa_Conversão) / Investimento

Impacto_Receita: 0-100 (quanto receita cresce?)
Pré_requisitos_Met: 0-1 (cliente pronto?)
Taxa_Conversão: 0-1 (histórico V4)
Investimento: R$ (setup + 3m operação)

Score > 150 = P1 Recomenda
Score 100-150 = P2 Considerar
Score < 100 = P3 Backlog
```

### Template NBO
```
NBO ANALYSIS — [CLIENTE]

STEP ATUAL: [Fase] | RECEITA V4/MÊS: R$ X | RESTRIÇÃO TOC: [Qual?]

OPÇÃO 1: [Serviço] (Agente XX)
├ Resolve: [Gap específico]
├ Investimento: R$ X | Payback: X meses
├ Receita +12m: R$ X
├ Pré-requisito: [O quê?]
└ SCORE: X/200

RECOMENDAÇÃO: Opção X é P1 (ROI > 200%)
```

### Exemplo Real
**Cliente:** BOX ACNT | STEP: Ter | Saúde: Amarela  
**Restrição:** SQLs bons (200/mês), mas conversão lenta (15% vs. 40%)

**NBO Recomendado:**  
→ Agente 11 (CRM) + Agente 16 (CRO) para pipeline + LP A/B  
→ Investimento: R$ 8K/mês  
→ Impacto: +10pp conversão = +R$ 45K/mês  
→ SCORE: 168 = **P1**

---

## 2. FORECAST 12 MESES — Modelo Matemático

### O que é
Previsão estruturada que:
- Valida realidade do funil de vendas
- Identifica restrição crítica (TOC)
- Simula impacto de intervenções
- Traduz melhoria operacional → receita acumulada

### Quando usar
- Sprint planning (metas realistas)
- Diagnóstico estratégico completo
- Justificar investimento novo
- Demonstrar ROI ao cliente
- Priorizar P1/P2/P3 (qual impacta mais?)
- Reviews mensais vs. forecast

### Fórmula Base
```
Cada mês (1 a 12):

LEADS = Traffic × Conversion_Trafego
SQLs = LEADS × Conversion_Lead_SQL
SALES = SQLs × Conversion_SQL_Sale
REVENUE = SALES × Ticket_Medio

ROI = (Receita_Incremental - Investimento) / Investimento
```

### Inputs Necessários (do CRM/Analytics)
- Traffic atual (10k, 15k, 50k/mês?)
- Conversion Tráfego→Lead (8%, 12%, 15%?)
- Conversion Lead→SQL (20%, 25%, 30%?)
- Conversion SQL→Sale (30%, 40%, 50%?)
- Ticket Médio (R$ 5k, 15k, 50k?)
- **REVENUE MENSAL ATUAL**

### Estrutura Forecast
```
FORECAST 12 MESES — [CLIENTE]

━━ BASELINE ATUAL ━━
Traffic: 10k | Leads: 800 | SQLs: 200 | Sales: 80 | Revenue: R$ 400K

━━ CENÁRIO 1: Sem intervenção (natural +5%/mês) ━━
Mês 1: R$ 400K | Mês 6: R$ 428K | Mês 12: R$ 463K
ACUMULADO 12M: R$ 5.106K

━━ CENÁRIO 2: P1 — [Qual? Ex: +20% conversion tráfego] ━━
LEADS: 10k × 9.6% = 960 | SQLs: 240 | Sales: 96 | Revenue: R$ 480K
Mês 1: R$ 480K | Mês 6: R$ 514K | Mês 12: R$ 556K
ACUMULADO 12M: R$ 6.127K | **DELTA: +R$ 1.021K | ROI: X%**

━━ CENÁRIO 3: P2 — [+15% conversion SQL→Sale] ━━
Baseline com SQL→Sale de 40% → 45%
SALES: 90 → 100 | Revenue: R$ 440K
ACUMULADO 12M: R$ 5.580K | **DELTA: +R$ 474K**

━━ RECOMENDAÇÃO ━━
P1: Cenário 2 (maior impacto) → Agentes 03+04
P2: Cenário 3 → Agentes 16+08
PROJEÇÃO CONSOLIDADA (P1+P2): R$ 7.200K (+R$ 2.094K vs. baseline)
```

### Exemplo Scenario
**ASHEY FIBRA** (Telecom) | STEP: Executar | 15k visits/mês  
**Problema:** Leads crescem, SQLs não acompanham (qual.: 12% vs. 25% esperada)  
**Restrição TOC:** Lead qualification quebrada

**Forecast Recomendado:**
- **Baseline:** 1.800 leads → 216 SQLs (12%) → 86 sales (40%) → R$ 1.290K/mês
- **Intervention:** Fluxo automatizado qualificação (Agente 10)
  - Nova taxa: 22% (vs. 12%) = +9 SQLs/mês
  - Impacto Mês 1: +R$ 51K
  - **Acumulado 12m: +R$ 612K incremental**
  - Investimento: R$ 12K (setup) + R$ 3K/mês
  - **ROI: 4.850%**

---

## 3. BASE DE CONHECIMENTO — Repositório Centralizado

### O que é
Library V4 de:
- Frameworks (STP, AARRR, AEMR, TOC, ICE, etc.)
- Padrões decisão por agente
- Templates prontos (campanhas, emails, roteiros, LPs)
- Playbooks de falhas (top 5 causas por problema + sinais + recuperação)
- Benchmarks Brasil por segmento
- Processos standardizados

### Quando usar
- Antes de responder qualquer solicitação
- Validar framework aplicável
- Garantir consistência entre agentes
- Antes de montar proposta cliente
- Referenciar padrão V4 em recomendações

### Estrutura
```
Base_V4/
├── FRAMEWORKS/ (STP, AARRR, AEMR, TOC, ICE, etc.)
├── PLAYBOOKS/ (por agente + problema)
│   ├── conversao-caiu.md (top 5 causas)
│   ├── criativo-fatiga.md
│   ├── lead-quality-ruim.md
│   └── ...
├── TEMPLATES/ (ready-to-use)
│   ├── email-sequencia-5-partes.md
│   ├── roteiro-video-long.md
│   ├── landing-page-copy.md
│   ├── campanha-ads-skag.md
│   └── checklist-auditoria.md
└── BENCHMARKS/ (por segmento Brasil)
    ├── telecom.md (ASHEY: ROAS goal 3.5x)
    ├── containers.md (BOX: Conv. goal 40%)
    └── ...
```

### Uso por Agente
1. Problema chega → Agente consulta Base
2. Se playbook existe → Adaptar vs. criar zero
3. Se não existe → Documentar novo aprendizado (feedback loop)
4. Template pronto → Customizar com dados cliente

---

## 4. SUPORTE MATRIZ — Central Operacional

### O que é
Sistema de processos que:
- Centraliza demandas entre agentes/HQ
- Rastreia status (aberto/progresso/concluído)
- Garante SLA de respostas
- Reduz bloqueios operacionais

### Quando usar
- Agente precisa recurso externo (copywriting, design, dev)
- Bloqueio operacional (cliente não responde, tool falhou)
- Request administrativo
- Escalação/exceção

### Request Template
```
[SUPORTE MATRIZ REQUEST]

Cliente: [Nome]
Agente Solicitante: [XX]
Tipo: [Copywriting / Design / Dev / Analytics / Outro]
Descrição: [O quê? Por quê? Contexto]
Prazo: [24h / 48h / 1 semana]
Prioridade: P1 (urgência) | P2 (semana) | P3 (backlog)

Status: ABERTO → EM PROGRESSO → CONCLUÍDO
```

### Exemplo
```
Cliente: ASHEY FIBRA
Agente: 03 (Tráfego Google)
Tipo: Copywriting
Descrição: 3 headlines para campanha Search Shopping (RFID Hospitalar)
Prazo: 24h (campaign live em 48h)
Prioridade: P1
```

---

## ÁRVORE DE DECISÃO: QUAL SISTEMA USAR?

```
PERGUNTA-CHAVE: O que preciso fazer AGORA?

├─ "Cliente pode crescer mais receita?" 
│  └─> NBO (identifique upsell/cross-sell)
│
├─ "Preciso justificar investimento?"
│  └─> FORECAST 12M (quantifique impacto + ROI)
│
├─ "Qual framework/template V4 aplica?"
│  └─> BASE DE CONHECIMENTO (valide padrão)
│
├─ "Preciso recurso externo ou há bloqueio?"
│  └─> SUPORTE MATRIZ (request estruturado)
│
└─ "Full diagnóstico (tudo)?"
   └─> NBO + FORECAST + BASE + (talvez) SUPORTE
       └─ Agente 01 orquestra tudo
```

---

## CENÁRIO END-TO-END: RING TECNOLOGIA

**Situação:** Tráfego OK, conversão caiu de 45% → 35% (STEP: Ter)

### Dia 1 — Diagnóstico
1. **Agente 01** acessa **BASE DE CONHECIMENTO**
   - Playbook: "conversao-caiu.md" → Top 5 causas
   
2. **Agente 13** valida: Onde caiu? LP? Email?
   - Descobre: LP de 45% → 35%, emails OK
   - Restrição TOC: Copy/Design da LP

3. **Agente 16** audit: Heatmap + scroll depth
   - Descobre: Fold 1 OK, fold 2-3 scroll baixo
   - Causa raiz: Criativo fatiga (3 meses, freq 3.8)

### Dia 2 — Planejamento
4. **Agente 01** constrói **FORECAST 12 MESES**
   - Baseline: 200 SQLs/mês
   - P1: Refresh criativo (Agente 05) → +7% conv = +14 SQLs = +R$ 84K/12m
   - P2: CRO+copy (16+08) → +5% = +R$ 60K/12m

5. **Agente 05** abre **SUPORTE MATRIZ**
   - Request: 5 conceitos novos (24h)
   - Prioridade: P1

### Dia 3 — Execução
6. Agente 05 entrega (SLA cumprido)
7. Agente 04 testa 2 vs. atual (A/B)
8. **Agente 01** define **NBO** pós-resultado
   - Conversão: 35% → 41% (+6pp)
   - Nova receita: +R$ 14K/mês
   - **NBO P1:** Escalar tráfego (+30%)
   - Investimento: R$ 12K/mês → R$ 360K/12m
   - **ROI: 2.400%**

---

## CHECKLIST ANTES DE RESPONDER

- [ ] Identifiquei cliente + STEP atual?
- [ ] Consultei BASE DE CONHECIMENTO?
- [ ] Identifiquei restrição TOC?
- [ ] Cliente em expansão? → Aplicarei NBO?
- [ ] Preciso justificar? → Farei FORECAST?
- [ ] Bloqueio operacional? → Abrirei SUPORTE?
- [ ] Resposta integra todos sistemas relevantes?

---

## MÉTRICAS DE SAÚDE

| Sistema | KPI | Target |
|---------|-----|--------|
| **NBO** | % clientes com NBO ativo | 80%+ |
| **FORECAST** | Accuracy vs. realizado | 85%+ |
| **BASE** | Queries findadas sem custom | 70%+ |
| **SUPORTE** | SLA cumprido | 95%+ |

---

**V4 Operacional — 4 Sistemas, 1 Fluxo**  
**Agente 01 (Mestre) — Última atualização: 2026-04-09**
