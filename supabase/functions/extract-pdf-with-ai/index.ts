import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfBase64 } = await req.json();

    if (!pdfBase64) {
      throw new Error('PDF text data is required');
    }

    console.log('🤖 Iniciando extração via IA...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em extração de dados de PDFs de recibos/pedidos.
            
            Analise o texto extraído do PDF e extraia EXATAMENTE as informações em formato JSON.
            
            IMPORTANTE: 
            - Se um campo não estiver presente, retorne string vazia "" ou array vazio []
            - NÃO invente dados que não estão no PDF
            - Para produtos, extraia TODOS os itens listados
            - Se o cliente for "Consumidor Final" e não houver nome específico, use "Consumidor Final"
            - Procure por padrões de dados mesmo que estejam formatados de forma irregular
            
            Retorne APENAS o JSON no formato exato:
            {
              "cliente": {
                "nome": "",
                "cpfCnpj": "",
                "endereco": "",
                "telefone": "",
                "email": ""
              },
              "pedido": {
                "numero": "",
                "data": "",
                "vendedor": "",
                "formaPagamento": "",
                "valorTotal": 0
              },
              "produtos": [
                {
                  "codigo": "",
                  "descricao": "",
                  "quantidade": 0,
                  "valor": 0,
                  "total": 0
                }
              ],
              "veiculo": {
                "modelo": "",
                "ano": "",
                "placa": "",
                "cor": ""
              },
              "equipe": {
                "vendedor": "",
                "instalador": ""
              },
              "observacoes": ""
            }`
          },
          {
            role: 'user',
            content: `Extraia os dados deste texto de recibo/pedido: ${pdfBase64}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Erro da OpenAI API:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const extractedText = data.choices[0].message.content;

    console.log('🤖 Resposta da IA:', extractedText);

    // Parse o JSON retornado pela IA
    let extractedData;
    try {
      // Remove possíveis markdown code blocks
      const cleanJson = extractedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      extractedData = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse do JSON:', parseError);
      throw new Error('Falha ao processar resposta da IA');
    }

    console.log('✅ Dados extraídos com sucesso:', extractedData);

    return new Response(JSON.stringify({ extractedData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro na extração via IA:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});