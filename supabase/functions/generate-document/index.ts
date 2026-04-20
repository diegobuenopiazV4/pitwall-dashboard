// Supabase Edge Function: generate-document
// Generates document content via Gemini with a specialized prompt

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface GenerateDocRequest {
  prompt: string;
  documentType: 'artigo' | 'email' | 'landing-page' | 'campanha' | 'roteiro' | 'relatorio' | 'custom';
  agentId: string;
  clientName?: string;
}

const DOC_INSTRUCTIONS: Record<string, string> = {
  artigo: 'Gere um artigo COMPLETO de blog em markdown com H1, H2s, H3s, listas, tabelas, exemplos e conclusao. Minimo 1500 palavras. Use SEO best practices.',
  email: 'Gere um email COMPLETO com assunto, pre-header, abertura, corpo, CTA e assinatura. Use AIDA ou PAS.',
  'landing-page': 'Gere copy COMPLETA de landing page: hero, problema, solucao, beneficios, prova social, oferta, FAQ, CTA final.',
  campanha: 'Gere uma campanha de anuncios COMPLETA: 5 headlines, 3 descriptions, 3 copies longas, targeting, orcamento sugerido.',
  roteiro: 'Gere um roteiro COMPLETO de video com: hook de 3s, apresentacao, desenvolvimento, CTAs intermediarios, conclusao. Marcacoes de tempo.',
  relatorio: 'Gere um relatorio COMPLETO com: resumo executivo, KPIs principais em tabela, analise por pilar AEMR, recomendacoes, proximos passos.',
  custom: 'Gere o conteudo solicitado de forma COMPLETA em markdown rico.',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { prompt, documentType, agentId, clientName }: GenerateDocRequest = await req.json();
    const instructions = DOC_INSTRUCTIONS[documentType] ?? DOC_INSTRUCTIONS.custom;

    const systemPrompt = `Voce e um especialista em marketing digital gerando documentos entregaveis.
${instructions}

${clientName ? `Cliente: ${clientName}` : ''}

REGRAS:
- ENTREGUE CONTEUDO COMPLETO, nunca briefings
- Use dados reais e numeros especificos
- Formatacao markdown rica
- Aplique as 12 Regras do Motor de Qualidade V4`;

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiKey) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;
    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { maxOutputTokens: 8192, temperature: 0.7 },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      throw new Error(`Gemini ${geminiRes.status}: ${errText}`);
    }

    const geminiData = await geminiRes.json();
    const content = geminiData.candidates?.[0]?.content?.parts
      ?.map((p: any) => p.text || '')
      .join('') || '';

    return new Response(JSON.stringify({ content, documentType, agentId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
