import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import Groq from 'groq-sdk';
import { createClient } from '@/lib/supabase/server';
import { firebaseAdmin } from '@/lib/firebase/admin';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const summarySystemPrompt = `
Você é um assistente de IA especialista em produtividade. Sua tarefa é analisar o corpo de um e-mail e retornar um objeto JSON estrito com três chaves:
1. "summary": Um resumo do e-mail em uma única frase concisa, capturando o ponto principal.
2. "action": A próxima ação mais lógica a ser tomada. Deve ser uma das seguintes strings: 'pay', 'reply', 'schedule', 'review', ou 'none'.
3. "deadline": Se houver uma data ou prazo explícito no e-mail, retorne-o no formato ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ). Se não houver, retorne null.

Analise o e-mail a seguir e retorne apenas o objeto JSON. Não inclua explicações ou texto adicional.
`;

async function getEmailBody(gmail: any, messageId: string): Promise<string> {
  const emailResponse = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'full',
  });

  const email = emailResponse.data;
  let bodyText = '';
  if (email.payload?.parts) {
    const part = email.payload.parts.find((p: any) => p.mimeType === 'text/plain');
    if (part && part.body?.data) {
      bodyText = Buffer.from(part.body.data, 'base64').toString('utf-8');
    }
  } else if (email.payload?.body?.data) {
    bodyText = Buffer.from(email.payload.body.data, 'base64').toString('utf-8');
  }
  return bodyText;
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const messageId = params.id;
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Authorization header is missing or invalid' }, { status: 401 });
  }
  const providerToken = authHeader.split(' ')[1];

  try {
    const oAuth2Client = new google.auth.OAuth2();
    oAuth2Client.setCredentials({ access_token: providerToken });
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const emailBody = await getEmailBody(gmail, messageId);

    if (!emailBody) {
      return NextResponse.json({ error: 'Could not retrieve email body' }, { status: 404 });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: summarySystemPrompt },
        { role: 'user', content: emailBody.substring(0, 4000) }, // Limitar para economizar tokens
      ],
      model: 'llama3-70b-8192',
      temperature: 0,
      max_tokens: 200,
      response_format: { type: 'json_object' },
    });

    const responseContent = chatCompletion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('Failed to generate summary from Groq');
    }

    const parsedSummary = JSON.parse(responseContent);

    const apiResponse = {
      summary: {
        text: parsedSummary.summary,
        tone: "auto", // Adicionando um valor padrão
        generatedAt: new Date().toISOString(),
        ...parsedSummary // Incluir action e deadline
      },
    };


    // TODO: Salvar o resumo no Supabase para cache

    return NextResponse.json(apiResponse);

  } catch (error: any) {
    console.error('Summary API Error:', error);
    return NextResponse.json({ error: 'Failed to generate summary', details: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    const messageId = params.id;
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];

    let decodedToken;
    try {
        decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    } catch (error) {
        return NextResponse.json({ error: 'Unauthorized: Invalid Token' }, { status: 401 });
    }
    const userId = decodedToken.uid;

    try {
        const { text, tone } = await request.json();
        if (!text) {
            return NextResponse.json({ error: 'Summary text is required' }, { status: 400 });
        }

        const supabase = createClient();
        
        const summaryData = {
            user_id: userId,
            message_id: messageId,
            text,
            tone: tone || 'auto',
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('summaries')
            .upsert(summaryData, { onConflict: 'user_id, message_id' })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ ok: true, summary: data });

    } catch (error: any) {
        console.error('Update Summary API Error:', error);
        return NextResponse.json({ error: 'Failed to update summary', details: error.message }, { status: 500 });
    }
}
