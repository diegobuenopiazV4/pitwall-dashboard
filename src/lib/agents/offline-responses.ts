import type { Agent, Client } from './types';

type ResponseFn = (client: Client | null) => string;
type AgentResponses = Record<string, ResponseFn>;

const RESPONSES: Record<string, AgentResponses> = {
  '01': {
    diagnostico: (client) => {
      if (!client) return 'Selecione um cliente para diagnostico.';
      const restriction =
        client.step === 'Saber' ? 'Awareness — cliente nao gera demanda suficiente' :
        client.step === 'Ter' ? 'Consideracao — leads nao avancam no funil' :
        client.step === 'Executar' ? 'Conversao — implementacao precisa gerar ROI rapido' :
        'Escala — otimizacao para maximizar throughput';
      const need =
        client.step === 'Saber' ? 'educacao de mercado' :
        client.step === 'Ter' ? 'prova social e comparacao' :
        client.step === 'Executar' ? 'execucao rapida e resultados' :
        'otimizacao e expansao';
      const acquisition = client.step === 'Saber' ? 'Campanha awareness Google+Meta' : 'Otimizar campanhas existentes';
      const monetization = client.pilar === 'Monetizacao' ? 'LP otimizada + copy vendas' : 'CRM pipeline review';
      return `## Diagnostico STEP — ${client.name}

### Fase: ${client.step}
**Segmento:** ${client.segment} | **Pilar V4:** ${client.pilar} | **Health:** ${client.health}

### Analise TOC
**Restricao Identificada:** ${restriction}

### FCA
| | Detalhe |
|---|---|
| **FATOS** | Cliente em fase ${client.step}, pilar ${client.pilar}, health ${client.health} |
| **CAUSAS** | Necessidade de ${need} |
| **ACOES** | Ver recomendacoes abaixo |

### Recomendacoes por Pilar
| Pilar | Acao | Agente | Prazo |
|-------|------|--------|-------|
| Aquisicao | ${acquisition} | 03, 04 | 7 dias |
| Engajamento | Calendario editorial + nutricao | 07, 09 | 14 dias |
| Monetizacao | ${monetization} | 08, 11 | 7 dias |
| Retencao | Fluxo automacao pos-venda | 10 | 21 dias |`;
    },
    sprint: () => `## Sprint Planning

| # | Tarefa | Agente | Prioridade | Status |
|---|--------|--------|-----------|--------|
| 1 | Revisar campanhas ativas | 03, 04 | P1 | Pendente |
| 2 | Refresh criativos | 05 | P1 | Pendente |
| 3 | Calendario editorial semana | 07 | P2 | Pendente |
| 4 | Audit landing pages | 16 | P2 | Pendente |
| 5 | Dashboard KPIs atualizado | 13 | P3 | Pendente |

### Metas
- [ ] ROAS > 3x em campanhas ativas
- [ ] 5 novos criativos em producao
- [ ] Calendario editorial aprovado
- [ ] 3 testes A/B rodando`,
    relatorio: () => `## Relatorio Mensal Consolidado

### KPIs Gerais
| Metrica | Valor | Meta | Status |
|---------|-------|------|--------|
| Leads Gerados | - | - | Configurar |
| CPL Medio | - | - | Configurar |
| Taxa Conversao | - | >3% | Configurar |
| ROAS | - | >3x | Configurar |

> Configure os KPIs do cliente para dados reais.

### Analise AEMR
- **Aquisicao:** Revisar CPL e volume de leads
- **Engajamento:** Verificar engagement rate social
- **Monetizacao:** Analisar taxa SQL e ticket medio
- **Retencao:** Checar NPS e churn`,
  },
  '03': {
    campanha: () => `## Estrutura de Campanha Google Ads

### Campanha Search
| Elemento | Configuracao |
|----------|-------------|
| Objetivo | Conversao (Lead/Venda) |
| Rede | Search |
| Orcamento | R$ XX/dia |
| Lance | Maximizar Conversoes (tCPA) |
| Segmentacao | Brasil / Regiao |

### Grupos de Anuncio
| Grupo | Keywords | Match Type |
|-------|----------|------------|
| Grupo 1 - Marca | [marca], "marca" | Exact, Phrase |
| Grupo 2 - Produto | [produto principal] | Exact |
| Grupo 3 - Problema | "como resolver X" | Phrase |

### Quality Score Checklist
- [ ] Relevancia keyword-anuncio > 7
- [ ] LP com keyword no H1
- [ ] Velocidade LP < 3s
- [ ] CTR esperado > media`,
    quality: () => `## Audit Quality Score

### Checklist
| Fator | Peso | Verificar |
|-------|------|----------|
| Relevancia Ad | Alto | Keyword no headline + description |
| CTR Esperado | Alto | Historico + extensoes |
| Experiencia LP | Alto | Velocidade + relevancia + mobile |

### Acoes para Melhorar
1. **Keywords no Ad Copy** — Insira a keyword exata no Headline 1
2. **LP Dedicada** — Uma LP por grupo de keywords
3. **Velocidade** — Core Web Vitals verdes
4. **Mobile First** — 60%+ trafego e mobile`,
  },
  '04': {
    campanha: () => `## Campanha Meta Ads — Conversao

### Estrutura
| Nivel | Configuracao |
|-------|-------------|
| Campanha | Conversao - [Produto/Servico] |
| Otimizacao | Compra / Lead |
| Orcamento | CBO R$ XX/dia |
| Pixel | Configurado + CAPI |

### Conjuntos de Anuncio
| Conjunto | Publico | Tamanho Est. |
|----------|---------|-------------|
| Lookalike 1% | Base clientes | 1-2M |
| Interesse | [Interesses relevantes] | 2-5M |
| Retargeting | Visitantes 30d | 5-50K |
| Broad | 25-55 Brasil | 10M+ |

### Metricas Alvo
| Metrica | Meta |
|---------|------|
| CPM | < R$ 30 |
| CTR | > 1.5% |
| CPC | < R$ 2 |
| CPL | < R$ XX |
| ROAS | > 3x |`,
    escala: () => `## Estrategia de Escala Meta Ads

### Regras
1. **Escala Vertical:** +20% orcamento a cada 3 dias com CPA estavel
2. **Escala Horizontal:** Duplicar conjunto vencedor com novo publico
3. **Kill Rule:** Pausar se CPA > 2x meta por 3 dias

### Funil de Criativos
| Fase | Volume | Rotacao |
|------|--------|---------|
| Teste | 5-10/semana | Eliminar < CTR medio |
| Escala | 3-5 vencedores | Manter ate fadigar |
| Refresh | 2-3/semana | Substituir fadigados |`,
  },
};

export function generateOfflineResponse(text: string, agent: Agent | null, client: Client | null): string {
  const t = text.toLowerCase();
  const id = agent?.id ?? '01';

  if (RESPONSES[id]) {
    for (const [keyword, fn] of Object.entries(RESPONSES[id])) {
      if (t.includes(keyword)) return fn(client);
    }
  }

  return buildGenericResponse(text, agent, client);
}

function buildGenericResponse(text: string, agent: Agent | null, client: Client | null): string {
  const clientInfo = client ? `\n**Cliente:** ${client.name} | ${client.segment} | STEP: ${client.step} | V4: ${client.pilar}` : '';
  return `## ${agent?.icon ?? ''} ${agent?.name ?? 'Agente'} — Resposta${clientInfo}

Recebi sua solicitacao: **"${text}"**

### Analise
Baseado no framework ${agent?.frameworks ?? 'V4'}, recomendo:

1. **Diagnostico** — Avaliar situacao atual com dados
2. **Planejamento** — Definir metas e KPIs especificos
3. **Execucao** — Implementar com prioridade P1/P2/P3
4. **Medicao** — Acompanhar resultados 30/60/90 dias

### Proximos Passos
- [ ] Coletar dados atuais
- [ ] Definir baseline e metas
- [ ] Criar plano de acao detalhado
- [ ] Iniciar execucao P1

> **Nota:** Para respostas completas com IA, configure sua chave Gemini nas configuracoes.`;
}
