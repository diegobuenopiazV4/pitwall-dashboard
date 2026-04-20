/**
 * Biblioteca de prompts templates para cada agente.
 * Placeholders sao substituidos em runtime: {{cliente}}, {{segmento}}, {{step}}, {{pilar}}
 */

export interface PromptTemplate {
  id: string;
  agentId: string;
  category: string;
  title: string;
  description: string;
  prompt: string;
  tags: string[];
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  // ===== AGENT 01 - MESTRE =====
  {
    id: 'mestre-diagnostico-completo',
    agentId: '01',
    category: 'Diagnostico',
    title: 'Diagnostico Completo STEP+TOC+AEMR',
    description: 'Analise 360 do cliente com framework FCA e priorizacao ICE',
    prompt: 'Faz um diagnostico completo do cliente {{cliente}} usando STEP + TOC + AEMR. Identifique a restricao principal (gargalo), aplique framework FCA (Fatos, Causas, Acoes), priorize acoes com ICE (Impacto x Confianca x Esforco) e recomende cadeia inter-agentes com prazos. Inclua benchmarks do segmento {{segmento}}.',
    tags: ['diagnostico', 'estrategia', 'toc'],
  },
  {
    id: 'mestre-sprint-planning',
    agentId: '01',
    category: 'Sprint',
    title: 'Sprint Planning Semanal',
    description: 'Planejamento de sprint com tasks P1/P2/P3 por agente',
    prompt: 'Monta sprint planning semanal para {{cliente}} considerando a fase STEP {{step}} e pilar prioritario {{pilar}}. Liste 8-12 tarefas priorizadas P1/P2/P3, por agente responsavel, com criterios de sucesso e prazo. Inclua metas mensurveis da semana.',
    tags: ['sprint', 'planejamento'],
  },
  {
    id: 'mestre-relatorio-mensal',
    agentId: '01',
    category: 'Relatorio',
    title: 'Relatorio Mensal Consolidado',
    description: 'Relatorio mensal com AEMR, KPIs e recomendacoes',
    prompt: 'Gera relatorio mensal consolidado para {{cliente}} com: resumo executivo, KPIs de cada pilar AEMR, analise de throughput (TOC), top 3 vitorias, top 3 gargalos, recomendacoes priorizadas para proximo mes com responsaveis. Formate para envio ao cliente (C-level).',
    tags: ['relatorio', 'mensal', 'cliente'],
  },
  {
    id: 'mestre-okrs-trimestre',
    agentId: '01',
    category: 'OKR',
    title: 'OKRs Trimestrais',
    description: 'Definicao de Objetivos e Key Results para 90 dias',
    prompt: 'Define OKRs trimestrais para {{cliente}}. 3 objetivos ambiciosos alinhados ao pilar {{pilar}}, cada um com 3-5 key results mensurveis (com baseline, target e metodo de medicao). Cadencia de check-in quinzenal proposta.',
    tags: ['okr', 'estrategia'],
  },

  // ===== AGENT 02 - GESTOR DE PROJETOS =====
  {
    id: 'projetos-backlog',
    agentId: '02',
    category: 'Backlog',
    title: 'Backlog Priorizado',
    description: 'Refinamento de backlog com estimativa e priorizacao',
    prompt: 'Refina o backlog de {{cliente}} com estimativa (story points), criterios de aceite claros, priorizacao RICE e dependencias entre tarefas. Identifique tarefas bloqueadas e proponha resolucao.',
    tags: ['backlog', 'agile'],
  },
  {
    id: 'projetos-raci',
    agentId: '02',
    category: 'RACI',
    title: 'RACI Matrix do Projeto',
    description: 'Matriz de responsabilidades por atividade',
    prompt: 'Monta RACI matrix completa para o projeto de {{cliente}}: 10-15 atividades principais x 6 papeis (Cliente, Coord, Trafego, Copy, Design, Dev). Marque Responsible, Accountable, Consulted, Informed em cada celula.',
    tags: ['raci', 'governance'],
  },
  {
    id: 'projetos-retro',
    agentId: '02',
    category: 'Retro',
    title: 'Retrospectiva da Sprint',
    description: 'Template de retrospectiva com Start/Stop/Continue',
    prompt: 'Facilita retrospectiva da ultima sprint de {{cliente}}. Estrutura: O que funcionou, O que nao funcionou, O que aprendemos, Acoes concretas para proxima sprint. Foque em melhorias de processo e colaboracao.',
    tags: ['retro', 'agile'],
  },

  // ===== AGENT 03 - TRAFEGO GOOGLE =====
  {
    id: 'google-campanha-search',
    agentId: '03',
    category: 'Campanha',
    title: 'Estrutura Campanha Search Completa',
    description: 'Campanha com grupos, keywords, copies, extensoes',
    prompt: 'Cria estrutura completa de campanha Google Search para {{cliente}} ({{segmento}}). Inclua: 4 grupos de anuncio (marca, produto principal, problema, competidor), 15 keywords por grupo com match types, 15 RSA headlines e 4 descriptions por grupo, 6 sitelinks, 4 callouts, 3 snippets. Orcamento sugerido, CPC maximo, tCPA.',
    tags: ['google', 'search', 'campanha'],
  },
  {
    id: 'google-pmax-setup',
    agentId: '03',
    category: 'Campanha',
    title: 'Performance Max Setup',
    description: 'Campanha PMax com assets, audiencias, feeds',
    prompt: 'Monta campanha Performance Max para {{cliente}}. Lista: 20 headlines (30 caracteres), 5 long headlines (90c), 5 descriptions (90c), 20 imagens (specs), 5 videos, URLs, audience signals, feeds de produto se e-commerce, conversoes prioritarias, bidding strategy.',
    tags: ['google', 'pmax', 'shopping'],
  },
  {
    id: 'google-quality-score-audit',
    agentId: '03',
    category: 'Audit',
    title: 'Audit Quality Score',
    description: 'Diagnostico completo de QS e plano de melhoria',
    prompt: 'Audita Quality Score da conta de {{cliente}}. Check: relevancia keyword-ad por grupo, CTR esperado vs historico, experiencia da LP (velocidade, mobile, conversao). Liste top 10 keywords com QS baixo e plano de melhoria especifico para cada.',
    tags: ['google', 'audit', 'qs'],
  },
  {
    id: 'google-keywords-negativas',
    agentId: '03',
    category: 'Keywords',
    title: 'Lista de Keywords Negativas',
    description: 'Keywords negativas por segmento e tipo',
    prompt: 'Gera lista completa de keywords negativas para {{cliente}} ({{segmento}}). Separe em: (1) gratis, free, download, (2) concorrentes diretos, (3) termos de pesquisa fora do funil, (4) irrelevantes do segmento, (5) palavras-gatilho de baixa conversao. Minimo 50 negativas por categoria.',
    tags: ['google', 'keywords'],
  },

  // ===== AGENT 04 - TRAFEGO META =====
  {
    id: 'meta-campanha-conversao',
    agentId: '04',
    category: 'Campanha',
    title: 'Campanha Meta Conversao Completa',
    description: 'Campanha CBO com 4 conjuntos e 20 criativos',
    prompt: 'Estrutura campanha de conversao Meta Ads para {{cliente}} ({{segmento}}). Orcamento CBO, 4 conjuntos (LAL 1%, LAL 3%, Interesses, Broad 25-55), 5 criativos por conjunto (video hook, carousel, imagem, UGC, before/after). Pixel + CAPI configurados. Kill rules, escala vertical +20% / 3 dias.',
    tags: ['meta', 'campanha', 'conversao'],
  },
  {
    id: 'meta-escala',
    agentId: '04',
    category: 'Escala',
    title: 'Plano de Escala de Orcamento',
    description: 'Estrategia de escala vertical e horizontal',
    prompt: 'Plano de escala de orcamento Meta para {{cliente}}. Define: (1) triggers de escala (CPA < 80% meta por 3 dias), (2) regras de kill (CPA > 2x meta), (3) escala vertical por conjunto com % e cadencia, (4) escala horizontal duplicando vencedores em novos publicos, (5) rotacao de criativos, (6) metas por fase (testes/escala/manutencao).',
    tags: ['meta', 'escala', 'orcamento'],
  },
  {
    id: 'meta-lookalike',
    agentId: '04',
    category: 'Audiencia',
    title: 'Estrategia de Lookalike Audiences',
    description: '5 audiencias LAL escaladas por qualidade da fonte',
    prompt: 'Define estrategia Lookalike para {{cliente}}. Liste: (1) top 5 fontes ranqueadas por valor (compradores top 10%, compradores, LTV alto, leads SQL, trafego engajado), (2) LAL 1%, 1-3%, 3-5% para cada fonte, (3) exclusoes, (4) tamanho minimo, (5) refresh semanal. Estime volume e qualidade esperada.',
    tags: ['meta', 'lookalike', 'audiencia'],
  },
  {
    id: 'meta-retargeting-funil',
    agentId: '04',
    category: 'Retargeting',
    title: 'Retargeting por Estagio do Funil',
    description: 'Campanhas de retargeting com mensagem por estagio',
    prompt: 'Monta retargeting Meta por estagio do funil para {{cliente}}: (1) TOFU - visitou blog 30d, (2) MOFU - visitou pagina de produto 14d, (3) BOFU - adicionou ao carrinho 7d, (4) Abandono de checkout 3d, (5) Clientes 60d+ para upsell. Copy e criativos por estagio. Frequencia alvo.',
    tags: ['meta', 'retargeting', 'funil'],
  },

  // ===== AGENT 05 - DESIGNER ADS =====
  {
    id: 'design-ads-brief',
    agentId: '05',
    category: 'Brief',
    title: 'Brief Criativo Completo',
    description: 'Brief para pack de criativos de performance',
    prompt: 'Escreve brief criativo completo para {{cliente}}: objetivo da campanha, publico-alvo e dores, proposta de valor, 5 variacoes de mensagem (beneficio, prova social, urgencia, problema-solucao, before-after), guidelines de marca, specs por canal (Meta feed/reels/stories, Google Display, YouTube), referencias visuais.',
    tags: ['design', 'brief', 'criativos'],
  },
  {
    id: 'design-ads-pack',
    agentId: '05',
    category: 'Pack',
    title: 'Pack de 10 Criativos para Teste',
    description: 'Lista de 10 conceitos de criativos para A/B test',
    prompt: 'Gera pack de 10 conceitos de criativos para {{cliente}} ({{segmento}}). Cada conceito: (1) headline visual, (2) elemento principal, (3) CTA, (4) angulo psicologico (escassez, prova social, autoridade, etc.), (5) formato ideal (estatico, video, carousel). Mix balanceado entre abordagens racionais e emocionais.',
    tags: ['design', 'criativos', 'ab-test'],
  },

  // ===== AGENT 06 - DESIGNER SOCIAL =====
  {
    id: 'design-social-brand',
    agentId: '06',
    category: 'Brand',
    title: 'Brand Guidelines Basico',
    description: 'Manual de marca minimo viavel',
    prompt: 'Cria brand guidelines basico para {{cliente}}: (1) paleta de cores (primaria, secundaria, neutras com hex/RGB), (2) tipografia (headlines, body, specs), (3) logo usage (versoes, clear space, min size, dont), (4) tom de voz (3 pilares, do/dont), (5) iconografia estilo, (6) fotos/ilustracoes diretrizes. Export em PDF para compartilhar.',
    tags: ['design', 'brand'],
  },
  {
    id: 'design-social-templates',
    agentId: '06',
    category: 'Templates',
    title: 'Templates Social Media (10 modelos)',
    description: 'Biblioteca de templates para posts recorrentes',
    prompt: 'Lista 10 templates de posts para {{cliente}}: (1) frase motivacional, (2) dica rapida, (3) carousel educativo 5 slides, (4) before-after, (5) case de cliente, (6) pergunta engajamento, (7) meme/humor relevante, (8) bastidores, (9) lancamento/novidade, (10) CTA/oferta. Specs Instagram feed, stories e reels.',
    tags: ['design', 'templates', 'social'],
  },

  // ===== AGENT 07 - SOCIAL MEDIA =====
  {
    id: 'social-calendario',
    agentId: '07',
    category: 'Calendario',
    title: 'Calendario Editorial Mensal',
    description: '30 posts para Instagram/LinkedIn com pilares 70/20/10',
    prompt: 'Monta calendario editorial mensal para {{cliente}} (Instagram + LinkedIn). 30 posts seguindo 70/20/10 (70% conteudo educativo, 20% case/prova, 10% venda). Para cada: data, canal, pilar, titulo, legenda completa (120-150 palavras), hashtags (15-30), CTA, tipo de midia (foto, carrossel, video, reel). Mix balanceado.',
    tags: ['social', 'calendario', 'conteudo'],
  },
  {
    id: 'social-legendas',
    agentId: '07',
    category: 'Legendas',
    title: 'Pack de 10 Legendas Prontas',
    description: 'Legendas virais prontas para postar',
    prompt: 'Escreve 10 legendas prontas para Instagram de {{cliente}} ({{segmento}}). Mix: (1-3) educativas com hook forte, (4-5) historias pessoais/cases, (6-7) polemicas/contrarian, (8) pergunta engajamento, (9) lancamento/oferta, (10) convite direto para DM. Cada uma com hashtags estrategicas (15 mix top/nicho/local) e CTA.',
    tags: ['social', 'legendas'],
  },
  {
    id: 'social-hashtags',
    agentId: '07',
    category: 'Hashtags',
    title: 'Estrategia de Hashtags',
    description: 'Mix de hashtags por volume e nicho',
    prompt: 'Estrategia de hashtags para {{cliente}} ({{segmento}}). 30 hashtags divididas: 5 top (>1M posts, alta competicao), 10 medium (100k-1M, competicao moderada), 10 nicho (10k-100k, alta relevancia), 5 local/geo. Analise competitors. 3 sets rotativos para nao repetir.',
    tags: ['social', 'hashtags'],
  },
  {
    id: 'social-concorrentes',
    agentId: '07',
    category: 'Analise',
    title: 'Analise de Concorrentes Social',
    description: 'Benchmark de 5 concorrentes',
    prompt: 'Analisa 5 principais concorrentes de {{cliente}} ({{segmento}}) no Instagram. Para cada: (1) numero de seguidores, (2) engagement rate, (3) frequencia de posts, (4) top 3 posts mais engajados (e por que), (5) tom de voz, (6) mix de conteudo, (7) uso de stories/reels, (8) oportunidades identificadas para {{cliente}} se diferenciar.',
    tags: ['social', 'competitors'],
  },

  // ===== AGENT 08 - COPY PERFORMANCE =====
  {
    id: 'copy-lp-completa',
    agentId: '08',
    category: 'LP',
    title: 'Copy de Landing Page Completa',
    description: 'LP com hero, problema, solucao, prova, oferta, FAQ',
    prompt: 'Escreve copy COMPLETA de landing page para {{cliente}} ({{segmento}}). Secoes: (1) Hero com H1, sub, CTA, (2) Problema (dor do publico em 3-4 bullets), (3) Solucao (proposta de valor), (4) Beneficios (6 com icones sugeridos), (5) Como funciona (3 passos), (6) Prova social (depoimentos, numeros, logos), (7) Oferta irresistivel, (8) FAQ (8 perguntas), (9) CTA final com urgencia. Use PAS ou AIDA.',
    tags: ['copy', 'lp', 'landing-page'],
  },
  {
    id: 'copy-headlines-ab',
    agentId: '08',
    category: 'Headlines',
    title: '15 Headlines para A/B Test',
    description: 'Headlines com frameworks comprovados',
    prompt: 'Cria 15 headlines para A/B test de landing page de {{cliente}}. Mix de frameworks: (1-3) numero + beneficio, (4-6) pergunta provocativa, (7-9) problema-solucao, (10-12) prova social/autoridade, (13-15) urgencia/escassez. Cada headline com variacao do mesmo angulo para teste estatistico.',
    tags: ['copy', 'headlines', 'ab-test'],
  },
  {
    id: 'copy-email-vendas',
    agentId: '08',
    category: 'Email',
    title: 'Email de Vendas (PAS)',
    description: 'Email completo com problema-agitacao-solucao',
    prompt: 'Escreve email de vendas para {{cliente}} usando framework PAS. 4 variacoes de assunto (curiosidade, beneficio, urgencia, personal), pre-header, corpo: (1) abertura relatable, (2) problema, (3) agitacao (pior cenario), (4) solucao (produto/servico), (5) prova, (6) oferta, (7) CTA, (8) PS com urgencia. Tamanho ideal 400-600 palavras.',
    tags: ['copy', 'email', 'vendas'],
  },
  {
    id: 'copy-cta-otimizados',
    agentId: '08',
    category: 'CTA',
    title: 'CTAs Otimizados por Etapa do Funil',
    description: 'CTAs para TOFU/MOFU/BOFU',
    prompt: 'Gera 30 CTAs para {{cliente}} divididos por etapa do funil: 10 TOFU (suave, ex: "Saiba mais"), 10 MOFU (beneficio, ex: "Descubra como economizar"), 10 BOFU (acao direta, ex: "Comprar agora com desconto"). Para cada CTA: texto + contexto de uso + expectativa de CTR.',
    tags: ['copy', 'cta', 'funil'],
  },

  // ===== AGENT 09 - COPY CONTEUDO =====
  {
    id: 'copy-artigo-completo',
    agentId: '09',
    category: 'Blog',
    title: 'Artigo de Blog Completo (SEO)',
    description: 'Artigo 2000 palavras otimizado para SEO',
    prompt: 'Escreve artigo COMPLETO de blog para {{cliente}} sobre [TEMA]. 2000 palavras minimo. Estrutura: (1) titulo SEO otimizado, (2) meta description 155c, (3) intro com hook, (4) sumario, (5) 5-7 subtitulos H2 com H3 quando necessario, (6) listas, tabelas, exemplos, (7) conclusao com CTA, (8) 5 FAQs schema-ready, (9) 3 imagens sugeridas com alt text, (10) 5 keywords secundarias naturalmente incluidas.',
    tags: ['blog', 'seo', 'conteudo'],
  },
  {
    id: 'copy-sequencia-email',
    agentId: '09',
    category: 'Email',
    title: 'Sequencia de Email de Nutricao (7 emails)',
    description: 'Fluxo de nutricao para novos leads',
    prompt: 'Monta sequencia de nutricao por email para {{cliente}} (7 emails em 14 dias). Email 1: boas-vindas + entrega isca digital. Email 2-3: historia/credibilidade. Email 4: problema comum + educacao. Email 5: case de sucesso. Email 6: oferta com bonus. Email 7: urgencia final. Cada email: assunto (3 variacoes), pre-header, corpo 300-500 palavras, CTA, PS.',
    tags: ['email', 'nutricao', 'sequencia'],
  },
  {
    id: 'copy-ebook',
    agentId: '09',
    category: 'Ebook',
    title: 'E-book Estrutura + Capitulo Modelo',
    description: 'Estrutura de e-book + amostra de capitulo',
    prompt: 'Cria estrutura COMPLETA de e-book para {{cliente}} sobre [TEMA] (30-40 paginas). Entregue: (1) titulo + subtitulo vendedor, (2) sumario com 7-8 capitulos, (3) introducao completa, (4) 1 capitulo modelo COMPLETO (2000 palavras) que sirva de template, (5) conclusao com CTA, (6) sugestao de diagramacao e elementos visuais.',
    tags: ['ebook', 'conteudo', 'isca-digital'],
  },
  {
    id: 'copy-newsletter',
    agentId: '09',
    category: 'Newsletter',
    title: 'Newsletter Semanal',
    description: 'Template de newsletter de autoridade',
    prompt: 'Escreve newsletter semanal para {{cliente}} ({{segmento}}). Estrutura: (1) assunto curiosidade, (2) abertura pessoal/reflexao, (3) 1 insight principal da semana, (4) 3 tips acionaveis, (5) 1 ferramenta/recurso recomendado, (6) 1 pergunta para engajamento, (7) CTA suave para produto/servico. 600-800 palavras, tom conversacional.',
    tags: ['newsletter', 'email'],
  },
  {
    id: 'copy-case-study',
    agentId: '09',
    category: 'Case',
    title: 'Case Study Cliente',
    description: 'Estudo de caso com resultados',
    prompt: 'Escreve case study COMPLETO para {{cliente}}. Estrutura STAR: (1) Situacao inicial (com numeros), (2) Task/desafio, (3) Acoes realizadas (detalhe metodologico), (4) Resultados (KPIs com % de melhoria), (5) Depoimento do cliente, (6) Licoes aprendidas. 1200 palavras, com grafico/tabela de resultados.',
    tags: ['case', 'cliente', 'prova-social'],
  },

  // ===== AGENT 10 - AUTOMACOES =====
  {
    id: 'auto-fluxo-nutricao',
    agentId: '10',
    category: 'Fluxo',
    title: 'Fluxo de Nutricao RD/HubSpot',
    description: 'Fluxo completo com triggers e condicionais',
    prompt: 'Desenha fluxo de automacao de nutricao para {{cliente}} em RD Station / HubSpot. Estrutura: trigger (lead se converte em X), 7 emails com delays (1d, 3d, 5d, 8d, 11d, 14d, 20d), condicionais (abriu? clicou? respondeu? adicionou tag?), desvios (quente vai para SDR, frio vai para nutricao longa). Diagrama em markdown + configuracao passo a passo.',
    tags: ['automacao', 'nutricao'],
  },
  {
    id: 'auto-lead-scoring',
    agentId: '10',
    category: 'Lead Scoring',
    title: 'Modelo de Lead Scoring',
    description: 'Scoring perfil + engajamento',
    prompt: 'Cria modelo de Lead Scoring para {{cliente}}. Duas dimensoes: (1) PERFIL (cargo, empresa size, segmento, orcamento declarado), (2) ENGAJAMENTO (paginas visitadas, downloads, emails abertos/clicados, webinar assistido, responde contato). Pontos por acao (positivo/negativo), thresholds (MQL > 50, SQL > 80), decay (-10/semana sem acao). Export como tabela para RD/HubSpot.',
    tags: ['lead-scoring', 'automacao'],
  },
  {
    id: 'auto-webhook-setup',
    agentId: '10',
    category: 'Integracao',
    title: 'Setup Webhook para Integracao',
    description: 'Configuracao de webhook entre sistemas',
    prompt: 'Documenta setup de webhook para {{cliente}} conectando [sistema A] com [sistema B]. Entregue: (1) endpoint URL, (2) payload esperado (JSON schema), (3) authentication, (4) triggers, (5) testes (curl examples), (6) error handling, (7) retry logic, (8) logs. Com codigo Zapier/Make como alternativa no-code.',
    tags: ['webhook', 'integracao'],
  },

  // ===== AGENT 11 - CRM =====
  {
    id: 'crm-pipeline-review',
    agentId: '11',
    category: 'Pipeline',
    title: 'Pipeline Review',
    description: 'Analise de pipeline com forecast',
    prompt: 'Faz pipeline review de {{cliente}}. Analise: (1) volume por etapa (SDR, SQL, Proposta, Negociacao, Fechado), (2) conversion rate entre etapas (identifique gargalo), (3) tempo medio por etapa, (4) ticket medio, (5) top 5 deals em risco, (6) forecast conservador/realista/otimista para o mes, (7) acoes corretivas priorizadas.',
    tags: ['crm', 'pipeline', 'forecast'],
  },
  {
    id: 'crm-scripts-vendas',
    agentId: '11',
    category: 'Scripts',
    title: 'Scripts de Vendas por Etapa',
    description: 'Cold call, discovery, demo, fechamento',
    prompt: 'Escreve scripts de vendas para {{cliente}}. (1) Cold call 30s (hook, valor, pergunta-qualifier), (2) Discovery call 30min (SPIN questions, dores, orcamento, autoridade), (3) Demo (agenda, features mapeadas a dores, objecoes preventivas), (4) Fechamento (tipos de close: alternativa, urgencia, assumptive). Scripts naturais, nao engessados.',
    tags: ['vendas', 'scripts', 'sdr'],
  },
  {
    id: 'crm-cadencia',
    agentId: '11',
    category: 'Cadencia',
    title: 'Cadencia de Follow-up (21 dias)',
    description: 'Sequencia multicanal de prospeccao',
    prompt: 'Monta cadencia de follow-up de 21 dias para {{cliente}} (B2B). Multicanal: email, LinkedIn, WhatsApp, ligacao. Dia 1, 3, 5, 8, 11, 14, 17, 21. Para cada toque: canal, objetivo, mensagem pronta (curta e especifica), call to action. Break-up email no final.',
    tags: ['follow-up', 'cadencia', 'outbound'],
  },
  {
    id: 'crm-bant',
    agentId: '11',
    category: 'Qualificacao',
    title: 'Qualificacao BANT',
    description: 'Perguntas e criterios BANT',
    prompt: 'Cria framework BANT customizado para {{cliente}} ({{segmento}}). Para cada letra (Budget, Authority, Need, Timing): (1) perguntas de descoberta, (2) criterios de "qualifica/desqualifica", (3) red flags, (4) sinais verdes. Lead score ajustado por BANT. Matriz MEDDIC complementar.',
    tags: ['bant', 'qualificacao'],
  },

  // ===== AGENT 12 - WEB DEV =====
  {
    id: 'web-setup-ga4',
    agentId: '12',
    category: 'Setup',
    title: 'Setup GA4 + GTM + Conversoes',
    description: 'Setup completo de tracking',
    prompt: 'Guia completo de setup GA4 + GTM para {{cliente}}. Passo a passo: (1) criar property GA4, (2) instalar GTM, (3) tag GA4 base, (4) enhanced measurement, (5) 8 conversoes prioritarias (lead, compra, contato, download, etc.) com triggers, (6) parametros customizados, (7) audiencias para Google Ads, (8) dashboard basico, (9) testes com Tag Assistant.',
    tags: ['ga4', 'gtm', 'tracking'],
  },
  {
    id: 'web-core-vitals',
    agentId: '12',
    category: 'Performance',
    title: 'Audit Core Web Vitals',
    description: 'Diagnostico e plano de performance',
    prompt: 'Audita Core Web Vitals do site de {{cliente}}. Metrics: LCP, FID/INP, CLS. Para cada (1) valor atual, (2) meta, (3) gap, (4) top 3 causas identificadas, (5) acoes corretivas priorizadas (lazy loading, image optimization, fonts, JS bundle, cache, CDN), (6) impacto esperado em rankings SEO e conversao.',
    tags: ['performance', 'cwv'],
  },
  {
    id: 'web-lp-tecnica',
    agentId: '12',
    category: 'LP',
    title: 'Especificacao Tecnica de LP',
    description: 'Spec tecnica para dev construir LP',
    prompt: 'Escreve spec tecnica de landing page para {{cliente}} construir. Inclua: (1) estrutura semantica HTML, (2) hierarquia de headings, (3) schema markup (Organization, Product, FAQ, Review), (4) performance budget (<3s LCP, <200KB JS), (5) eventos de tracking (scroll, click, submit, video), (6) acessibilidade WCAG AA, (7) meta tags open graph, (8) Favicons, (9) sitemap/robots.',
    tags: ['dev', 'lp', 'spec'],
  },

  // ===== AGENT 13 - DADOS & BI =====
  {
    id: 'bi-dashboard-kpis',
    agentId: '13',
    category: 'Dashboard',
    title: 'Dashboard de KPIs no Looker Studio',
    description: 'Especificacao de dashboard com graficos',
    prompt: 'Define dashboard Looker Studio para {{cliente}}. 4 pilares AEMR com 3-4 graficos cada: (1) Aquisicao (sessoes, trafego por canal, CPL, ROAS), (2) Engajamento (engagement rate, tempo na pagina, paginas/sessao), (3) Monetizacao (receita, taxa conv, ticket medio), (4) Retencao (churn, NPS, LTV). Comparativo MoM e YoY. Data sources (GA4, Meta, Google Ads, CRM).',
    tags: ['bi', 'dashboard', 'looker'],
  },
  {
    id: 'bi-modelo-atribuicao',
    agentId: '13',
    category: 'Atribuicao',
    title: 'Modelo de Atribuicao Multi-touch',
    description: 'Setup de atribuicao e analise por canal',
    prompt: 'Cria modelo de atribuicao multi-touch para {{cliente}}. Compare: (1) last click, (2) first click, (3) linear, (4) time decay, (5) position based, (6) data-driven. Recomende modelo ideal. Analise ROI por canal com cada modelo. Setup GA4 attribution models e export de dados.',
    tags: ['atribuicao', 'bi'],
  },
  {
    id: 'bi-cohort',
    agentId: '13',
    category: 'Cohort',
    title: 'Cohort Analysis',
    description: 'Analise de retencao por cohort',
    prompt: 'Realiza cohort analysis de {{cliente}}. Agrupe clientes por mes de aquisicao, analise retencao M1, M3, M6, M12. Identifique: (1) melhor cohort e porque, (2) pior cohort e causas, (3) padroes sazonais, (4) impacto de mudancas de produto/processo, (5) recomendacoes para melhorar retencao das proximas cohorts.',
    tags: ['cohort', 'retencao'],
  },

  // ===== AGENT 14 - SEO =====
  {
    id: 'seo-audit-completo',
    agentId: '14',
    category: 'Audit',
    title: 'Audit SEO Completo',
    description: 'Diagnostico SEO tecnico + conteudo + backlinks',
    prompt: 'Audit SEO completo do site de {{cliente}}. Areas: (1) Tecnico (velocidade, mobile, indexacao, sitemap, schema, canonical), (2) On-page (titles, descriptions, H1, keyword density, internal links, imagens), (3) Conteudo (gaps vs competitors, E-E-A-T, topic authority), (4) Backlinks (perfil, anchors, toxic links), (5) Local SEO se aplicavel. Top 20 acoes priorizadas por impacto/esforco.',
    tags: ['seo', 'audit'],
  },
  {
    id: 'seo-keyword-research',
    agentId: '14',
    category: 'Keywords',
    title: 'Keyword Research (50+ keywords)',
    description: 'Keywords por intent e dificuldade',
    prompt: 'Keyword research para {{cliente}} ({{segmento}}). 50+ keywords divididas: (1) branded, (2) produto/servico, (3) problema/dor, (4) comparacao, (5) informacional (long tail). Para cada: volume mensal, dificuldade, CPC, intent (informacional/navegacional/transacional), SERP features, sugestao de URL/conteudo. Cluster em topic hubs.',
    tags: ['seo', 'keywords', 'research'],
  },
  {
    id: 'seo-link-building',
    agentId: '14',
    category: 'Links',
    title: 'Estrategia de Link Building',
    description: 'Plano de backlinks white-hat',
    prompt: 'Plano de link building white-hat para {{cliente}}. Taticas: (1) HARO/Qwoted, (2) broken link building, (3) skyscraper, (4) guest posts em top 10 blogs do segmento, (5) digital PR (pesquisas originais, infograficos), (6) parcerias estrategicas, (7) directory listings relevantes. Meta: 20 backlinks DR > 30 em 90 dias.',
    tags: ['seo', 'links'],
  },

  // ===== AGENT 15 - VIDEO =====
  {
    id: 'video-roteiro-youtube',
    agentId: '15',
    category: 'YouTube',
    title: 'Roteiro de Video YouTube (10min)',
    description: 'Roteiro com hook, desenvolvimento, CTAs',
    prompt: 'Escreve roteiro COMPLETO de video YouTube para {{cliente}} sobre [TEMA]. 10 minutos. Estrutura: (0-15s) Hook irresistivel, (15-30s) Pattern interrupt + promessa, (30s-1min) Quem sou/credibilidade, (1-8min) Desenvolvimento em 3-5 pontos com provas/exemplos, (8-9min) CTA principal + secundario, (9-10min) Outro que leva a proximo video. Marcacoes de B-roll, cortes, CTAs visuais.',
    tags: ['video', 'youtube', 'roteiro'],
  },
  {
    id: 'video-reels',
    agentId: '15',
    category: 'Reels',
    title: 'Script para 5 Reels (virais)',
    description: 'Scripts de 30-60s para Instagram Reels',
    prompt: 'Escreve 5 scripts de Reels (30-60s cada) para {{cliente}}. Mix de formatos: (1) "3 erros que voce comete", (2) tutorial rapido, (3) antes/depois, (4) mito vs verdade, (5) bastidores/pov. Para cada: hook nos primeiros 3s, desenvolvimento punchline, CTA verbal + visual, sugestao de audio trending, legendas sugeridas.',
    tags: ['reels', 'video'],
  },

  // ===== AGENT 16 - CRO/UX =====
  {
    id: 'cro-audit',
    agentId: '16',
    category: 'Audit',
    title: 'Audit CRO Completo',
    description: 'Diagnostico de conversao usando LIFT model',
    prompt: 'Audit CRO da LP/site de {{cliente}}. LIFT Model 6 dimensoes: (1) Proposta de Valor - clareza, (2) Relevancia - match com trafego, (3) Clareza - hierarquia visual, (4) Ansiedade - atritos/riscos, (5) Distracao - elementos que tiram foco, (6) Urgencia - escassez/prazo. Score cada dimensao 1-10. Top 10 hipoteses de teste priorizadas.',
    tags: ['cro', 'audit', 'lift'],
  },
  {
    id: 'cro-ab-test',
    agentId: '16',
    category: 'A/B Test',
    title: 'Design de 5 Testes A/B',
    description: 'Hipoteses testaveis com metricas',
    prompt: 'Desenha 5 testes A/B para {{cliente}} priorizados por ICE. Cada teste: (1) hipotese ("Se X, entao Y, porque Z"), (2) variante atual (control), (3) variante teste (treatment), (4) metrica primaria, (5) metricas secundarias, (6) sample size minimo, (7) duracao estimada, (8) ICE score (impacto x confianca x esforco). Start com quick wins.',
    tags: ['ab-test', 'cro'],
  },
  {
    id: 'cro-heatmap',
    agentId: '16',
    category: 'Heatmap',
    title: 'Analise de Heatmaps',
    description: 'Insights acionaveis de heatmaps/recordings',
    prompt: 'Analisa heatmaps (click, scroll, move) e session recordings do site de {{cliente}}. Identifique: (1) dead clicks (cliques em elementos nao clicaveis), (2) rage clicks (frustacao), (3) scroll depth medio, (4) pontos de abandono, (5) elementos ignorados apesar de importantes, (6) patterns de navegacao inesperados. Top 10 acoes corretivas.',
    tags: ['heatmap', 'cro'],
  },
];

export function getTemplatesByAgent(agentId: string): PromptTemplate[] {
  return PROMPT_TEMPLATES.filter((t) => t.agentId === agentId);
}

export function getAllCategories(): string[] {
  return [...new Set(PROMPT_TEMPLATES.map((t) => t.category))];
}

/**
 * Apply placeholders in a prompt using client data.
 * Replaces {{cliente}}, {{segmento}}, {{step}}, {{pilar}}, {{health}}.
 */
export function applyPlaceholders(prompt: string, ctx: {
  cliente?: string;
  segmento?: string;
  step?: string;
  pilar?: string;
  health?: string;
}): string {
  return prompt
    .replace(/\{\{cliente\}\}/g, ctx.cliente ?? 'seu cliente')
    .replace(/\{\{segmento\}\}/g, ctx.segmento ?? 'seu segmento')
    .replace(/\{\{step\}\}/g, ctx.step ?? 'atual')
    .replace(/\{\{pilar\}\}/g, ctx.pilar ?? 'definir')
    .replace(/\{\{health\}\}/g, ctx.health ?? 'neutro');
}
