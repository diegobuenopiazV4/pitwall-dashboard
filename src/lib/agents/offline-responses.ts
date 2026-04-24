import type { Agent, Client } from './types';
import { getClaudeKey, getGeminiKey, getOpenRouterKey } from '../ai/chat-provider';

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
| Engajamento | Calendario editorial 60/20/20 + nutricao | 07, 09 | 14 dias |
| Monetizacao | ${monetization} | 08, 11 | 7 dias |
| Retencao | Fluxo automacao pos-venda 12 touchpoints | 10 | 21 dias |`;
    },
  },
  // Social Media: legendas prontas
  '07': {
    legenda: () => `## 3 Legendas para Instagram (Framework 60/20/20)

### 1. Autoridade (60% — educa)
\`Sua internet cai no pior momento? 90% das empresas perdem R$12k/ano com instabilidade. Fibra optica dedicada nao da espaco para "desculpa do modem".\`

### 2. Interacao (20% — conecta)
\`Comenta aqui: em quantos minutos sua internet cai hoje? Ja tivemos cliente que mediu — e decidiu migrar no mesmo dia.\`

### 3. Oferta (20% — converte)
\`100 MEGA de fibra dedicada com SLA 99,9% por R$149/mes. So hoje, adesao zero. Link na bio.\`

### Por que funciona
- **Framework 60/20/20** (autoridade/interacao/oferta) para calendario editorial mensal
- Cada legenda tem hook + prova + CTA implicito
- Tom direto, sem fluff, adaptavel para qualquer provedor de fibra`,
    calendario: () => `## Calendario Editorial Mensal (Framework 60/20/20)

### Distribuicao Ideal
- **60% Autoridade** — conteudo educacional, insights, bastidores profissionais
- **20% Interacao** — enquetes, perguntas, UGC, trends participativos
- **20% Oferta** — promocoes, ofertas limitadas, CTAs de venda direta

### Grid Mensal (20 posts)
| Semana | Autoridade (12) | Interacao (4) | Oferta (4) |
|--------|-----------------|---------------|------------|
| 1 | 3 carrosseis educativos | 1 enquete | 1 oferta semanal |
| 2 | 3 tips rapidas reels | 1 pergunta stories | 1 lancamento |
| 3 | 3 bastidores + cases | 1 trend participativo | 1 cupom exclusivo |
| 4 | 3 dados + insights | 1 review/UGC | 1 ultima chance |`,
  },
  // CRM: 12 pontos de contato
  '11': {
    cadencia: () => `## Cadencia de Prospeccao — 12 Pontos de Contato

### Estrutura Ideal V4 (15 dias)
| # | Dia | Canal | Tipo | Objetivo |
|---|-----|-------|------|----------|
| 1 | D+0 | Email | Apresentacao | Primeiro contato com valor |
| 2 | D+1 | LinkedIn | Conexao + nota | Estabelecer rapport |
| 3 | D+3 | Email | Case relevante | Mostrar prova social |
| 4 | D+4 | WhatsApp | Mensagem curta | Toque humano |
| 5 | D+5 | Call | Tentativa 1 | Conversa rapida |
| 6 | D+7 | Email | Conteudo rico (ebook/artigo) | Nutrir sem pedir |
| 7 | D+8 | LinkedIn | Interacao organica em post | Presence marketing |
| 8 | D+10 | Email | Pergunta provocativa | Ativar curiosidade |
| 9 | D+11 | Call | Tentativa 2 (horario diferente) | Segunda chance |
| 10 | D+13 | WhatsApp | Audio de 30s personalizado | Diferenciacao total |
| 11 | D+14 | Email | Break-up email (ultima tentativa) | Gatilho da perda |
| 12 | D+15 | LinkedIn | Like/comentario final | Manter na memoria |

### Regras de Resposta Automatica
- **Respondeu positivo:** Avancar para fechamento
- **Respondeu negativo:** Agendar reengajamento em 90 dias
- **Sem resposta:** Retirar da cadencia, marcar como "nao engajado"
- **Respondeu pedindo espaco:** Pausar 30 dias e retomar com novo angulo`,
  },
};

function hasAnyKey(): boolean {
  try {
    return !!(getClaudeKey() || getGeminiKey() || getOpenRouterKey());
  } catch {
    return false;
  }
}

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
  const apiNote = hasAnyKey()
    ? `> **Nota:** Todas as chaves estao configuradas (Claude/Gemini/OpenRouter). Se voce esta vendo esta resposta, significa que houve um erro de comunicacao com TODAS as APIs. Verifique sua conexao ou o saldo das contas.`
    : `> **Nota:** Configure ao menos uma chave de IA em Settings (Claude, Gemini ou OpenRouter).`;

  return `## ${agent?.icon ?? ''} ${agent?.name ?? 'Agente'} — Resposta${clientInfo}

Recebi sua solicitacao: **"${text}"**

### Analise
Baseado no framework ${agent?.frameworks ?? 'V4'}, recomendo:

1. **Diagnostico** — Avaliar situacao atual com dados
2. **Planejamento** — Definir metas e KPIs especificos (framework 60/20/20 para conteudo, 12 touchpoints para CRM)
3. **Execucao** — Implementar com prioridade P1/P2/P3
4. **Medicao** — Acompanhar resultados 30/60/90 dias

### Proximos Passos
- [ ] Coletar dados atuais
- [ ] Definir baseline e metas
- [ ] Criar plano de acao detalhado
- [ ] Iniciar execucao P1

${apiNote}`;
}
