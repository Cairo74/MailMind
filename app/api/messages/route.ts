import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { classifyEmail } from '@/lib/ai/classification';

// Interface estendida para incluir a categoria
interface Message {
  id: string;
  subject: string;
  snippet: string;
  from: string;
  receivedAt: string;
  labels: string[];
  unread: boolean;
  bodyText?: string;
  category?: string; // Categoria será adicionada aqui
}

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // 1. Validar a sessão do usuário de forma assíncrona
  const { data: { session }, error: authError } = await supabase.auth.getSession();
  if (authError || !session) {
    return NextResponse.json({ error: authError?.message || 'Unauthorized' }, { status: 401 });
  }
  const user = session.user;

  // 2. Validar token do Google para acessar a API do Gmail
  const googleToken = request.headers.get('X-Google-Access-Token');
  if (!googleToken) {
    return NextResponse.json({ error: 'Google access token is missing from X-Google-Access-Token header' }, { status: 401 });
  }

  const oAuth2Client = new google.auth.OAuth2();
  oAuth2Client.setCredentials({ access_token: googleToken });
  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

  try {
    // 3. Buscar a lista de e-mails do Gmail
    const listResponse = await gmail.users.messages.list({ userId: 'me', maxResults: 20 });
    const messageMetadatas = listResponse.data.messages;
    if (!messageMetadatas || messageMetadatas.length === 0) {
      return NextResponse.json({ messages: [], total: 0 });
    }

    const messageIds = messageMetadatas.map(m => m.id).filter((id): id is string => id !== null);

    // 4. Consultar o cache no Supabase (usando o cliente já criado)
    const { data: cachedClassifications, error: cacheError } = await supabase
      .from('email_classifications')
      .select('message_id, category')
      .in('message_id', messageIds);

    if (cacheError) throw cacheError;

    const classificationMap = new Map(cachedClassifications?.map(c => [c.message_id, c.category]));
    
    // 5. Buscar o conteúdo completo apenas dos e-mails necessários
    const fullEmails = await Promise.all(messageMetadatas.map(async (metadata) => {
        if (!metadata.id) return null;
        const emailResponse = await gmail.users.messages.get({ userId: 'me', id: metadata.id, format: 'full' });
        return emailResponse.data;
    }));

    let messages: Message[] = fullEmails.filter(Boolean).map(email => {
        if (!email || !email.id || !email.internalDate) return null;
        const headers = email.payload?.headers || [];
        const fromHeader = headers.find(h => h.name?.toLowerCase() === 'from');
        const subjectHeader = headers.find(h => h.name?.toLowerCase() === 'subject');
        
        let bodyText = '';
        if (email.payload?.parts) {
            const part = email.payload.parts.find(p => p.mimeType === 'text/plain');
            if (part && part.body?.data) {
                bodyText = Buffer.from(part.body.data, 'base64').toString('utf-8');
            }
        } else if (email.payload?.body?.data) {
            bodyText = Buffer.from(email.payload.body.data, 'base64').toString('utf-8');
        }

        return {
            id: email.id,
            snippet: email.snippet || '',
            from: fromHeader?.value || 'N/A',
            subject: subjectHeader?.value || 'Sem Assunto',
            receivedAt: new Date(parseInt(email.internalDate, 10)).toISOString(),
            labels: email.labelIds || [],
            unread: (email.labelIds || []).includes('UNREAD'),
            bodyText: bodyText
        };
    }).filter((email): email is Message => email !== null);

    // 6. Classificar e-mails que não estavam no cache
    const emailsToClassify = messages.filter(m => !classificationMap.has(m.id));
    const newClassifications: { message_id: string, user_id: string, category: string }[] = [];

    await Promise.all(emailsToClassify.map(async (email) => {
      const category = await classifyEmail({ subject: email.subject, body: email.bodyText || '' });
      email.category = category; // Adiciona a categoria ao objeto do e-mail
      classificationMap.set(email.id, category);
      if (category !== "Não classificado") {
        newClassifications.push({
          message_id: email.id,
          user_id: user.id,
          category: category
        });
      }
    }));
    
    // 7. Salvar novas classificações no cache
    if (newClassifications.length > 0) {
      const { error: insertError } = await supabase.from('email_classifications').insert(newClassifications);
      if (insertError) {
        console.error("Failed to cache new classifications:", insertError);
        // Não bloqueia o retorno, mas registra o erro
      }
    }
    
    // 8. Combinar resultados e retornar
    messages.forEach(m => {
        if (!m.category) {
            m.category = classificationMap.get(m.id) || "Não classificado";
        }
    });

    return NextResponse.json({ messages, total: messages.length });

  } catch (error: any) {
    console.error('Messages API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch emails', details: error.message }, { status: 500 });
  }
}
