import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { firebaseAdmin } from '@/lib/firebase/admin';

// --- Interfaces ---
interface Message {
  id: string;
  subject: string;
  snippet: string;
  from: string;
  receivedAt: string;
  labels: string[];
  unread: boolean;
}

interface MessageFull extends Message {
  bodyText: string;
  bodyHtml?: string;
  attachments: { filename: string; size: number }[];
}

// --- API Route ---
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const messageId = params.id;
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Authorization header is missing' }, { status: 401 });
  }
  const providerToken = authHeader.split(' ')[1];

  try {
    const oAuth2Client = new google.auth.OAuth2();
    oAuth2Client.setCredentials({ access_token: providerToken });
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const emailResponse = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full',
    });

    const email = emailResponse.data;
    if (!email || !email.id || !email.internalDate) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const headers = email.payload?.headers || [];
    const fromHeader = headers.find(h => h.name?.toLowerCase() === 'from');
    const subjectHeader = headers.find(h => h.name?.toLowerCase() === 'subject');
    
    let bodyText = '';
    let bodyHtml = '';
    const attachments: { filename: string; size: number }[] = [];

    if (email.payload?.parts) {
      email.payload.parts.forEach(part => {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          bodyText = Buffer.from(part.body.data, 'base64').toString('utf-8');
        } else if (part.mimeType === 'text/html' && part.body?.data) {
          bodyHtml = Buffer.from(part.body.data, 'base64').toString('utf-8');
        } else if (part.filename && part.body?.size) {
          attachments.push({ filename: part.filename, size: part.body.size });
        }
      });
    } else if (email.payload?.body?.data) {
      bodyText = Buffer.from(email.payload.body.data, 'base64').toString('utf-8');
    }

    const message: MessageFull = {
      id: email.id,
      snippet: email.snippet || '',
      from: fromHeader?.value || 'N/A',
      subject: subjectHeader?.value || 'Sem Assunto',
      receivedAt: new Date(parseInt(email.internalDate, 10)).toISOString(),
      labels: email.labelIds || [],
      unread: email.labelIds?.includes('UNREAD') || false,
      bodyText,
      bodyHtml,
      attachments,
    };

    return NextResponse.json({ message });

  } catch (error: any) {
    console.error('Get Message API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch message', details: error.message }, { status: 500 });
  }
}
