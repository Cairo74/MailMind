import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import Groq from 'groq-sdk';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// --- System Prompts ---
const summarySystemPrompt = `
Você é um assistente de IA especialista em produtividade. Sua tarefa é analisar o corpo de um e-mail e retornar um objeto JSON estrito com três chaves:
1. "text": Um resumo do e-mail em uma única frase concisa.
2. "action": A próxima ação mais lógica (pay, reply, schedule, review, or none).
3. "deadline": Um prazo explícito no formato ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ) ou null.
Retorne apenas o objeto JSON.
`;

const extractionSystemPrompt = `
Você é um assistente de extração de dados. Sua tarefa é analisar um e-mail e retornar um objeto JSON estrito com as seguintes chaves:
- "due_date": Data de vencimento no formato ISO 8601 ou null.
- "amount": um objeto com "raw" (ex: "R$ 1.234,56"), "currency" (ex: "BRL"), "value" (ex: 1234.56) ou null.
- "invoice_number": Número da fatura/pedido como string ou null.
- "urls": Um array de URLs importantes encontradas no corpo do e-mail.
- "meeting_datetime": Data e hora de uma reunião sugerida no formato ISO 8601 ou null.
Retorne apenas o objeto JSON.
`;

const phishingSystemPrompt = `
Você é um especialista em cibersegurança. Analise o e-mail (cabeçalhos e corpo) em busca de sinais de phishing. Retorne um objeto JSON estrito com as seguintes chaves:
- "is_phishing": booleano, true se for altamente provável que seja phishing.
- "phishing_score": um número de 0.0 (seguro) a 1.0 (muito suspeito).
- "reasons": um array de strings explicando os motivos da sua avaliação (ex: "Remetente suspeito", "Senso de urgência", "Link não confiável").
Se o e-mail parecer seguro, retorne um score baixo e um array vazio de razões. Retorne apenas o objeto JSON.
`;

// --- Funções Auxiliares ---
async function getEmailBodyAndHeaders(gmail: any, messageId: string): Promise<{ bodyText: string, headers: any[] }> {
    const emailResponse = await gmail.users.messages.get({ userId: 'me', id: messageId, format: 'full' });
    const email = emailResponse.data;
    const headers = email.payload?.headers || [];
    
    let bodyText = '';
    const findTextPart = (parts: any[]): string => {
        for (const part of parts) {
            if (part.mimeType === 'text/plain' && part.body?.data) {
                return Buffer.from(part.body.data, 'base64').toString('utf-8');
            }
            if (part.parts) {
                const nestedBody = findTextPart(part.parts);
                if (nestedBody) return nestedBody;
            }
        }
        return '';
    };

    if (email.payload?.parts) {
        bodyText = findTextPart(email.payload.parts);
    } else if (email.payload?.body?.data) {
        bodyText = Buffer.from(email.payload.body.data, 'base64').toString('utf-8');
    }

    return { bodyText, headers };
}

async function callGroqAPI(systemPrompt: string, userContent: string, model: 'llama-3.1-8b-instant' | 'llama-3.3-70b-versatile' = 'llama-3.1-8b-instant') {
    const chatCompletion = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent.substring(0, 8000) },
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.1,
        response_format: { type: 'json_object' },
    });
    const responseContent = chatCompletion.choices[0]?.message?.content;
    if (!responseContent) throw new Error('A API da Groq retornou uma resposta vazia.');
    try {
        return JSON.parse(responseContent);
    } catch (e) {
        console.error("Erro ao fazer parse da resposta JSON da Groq:", responseContent);
        throw new Error("A resposta da IA não é um JSON válido.");
    }
}

// --- Rota da API ---
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const messageId = params.id; // Movido para o topo para corrigir o erro 'params should be awaited'
  const googleToken = request.headers.get('X-Google-Access-Token');

  // Validação assíncrona correta da sessão
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session || !googleToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const oAuth2Client = new google.auth.OAuth2();
    oAuth2Client.setCredentials({ access_token: googleToken });
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const { bodyText, headers } = await getEmailBodyAndHeaders(gmail, messageId);
    if (!bodyText) {
      return NextResponse.json({ error: 'Could not retrieve email body' }, { status: 404 });
    }
    
    const fullContentForPhishing = `Headers: ${JSON.stringify(headers, null, 2)}\n\nBody:\n${bodyText}`;

    // Executa as chamadas à IA em paralelo para maior eficiência
    const [summary, entities, phishing] = await Promise.all([
        callGroqAPI(summarySystemPrompt, bodyText, 'llama-3.1-8b-instant').catch(e => { console.error("Error in Summary API:", e); return null; }),
        callGroqAPI(extractionSystemPrompt, bodyText, 'llama-3.1-8b-instant').catch(e => { console.error("Error in Entities API:", e); return null; }),
        callGroqAPI(phishingSystemPrompt, fullContentForPhishing, 'llama-3.3-70b-versatile').catch(e => { console.error("Error in Phishing API:", e); return null; })
    ]);

    const apiResponse = { summary, entities, phishing };

    // TODO: Adicionar lógica para salvar os resultados no Supabase para cache
    // Ex: await supabase.from('email_analysis').upsert({ ... });

    return NextResponse.json(apiResponse);

  } catch (error: any) {
    console.error('Parse API Error:', error);
    return NextResponse.json({ error: 'Failed to parse email', details: error.message }, { status: 500 });
  }
}
