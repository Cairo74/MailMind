import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import Groq from 'groq-sdk';
import { firebaseAdmin } from '@/lib/firebase/admin';
import { validateSupabaseToken } from '@/lib/supabase/server-helpers';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const replySystemPrompt = `
Você é um assistente de IA especializado em compor respostas de e-mail.
Sua tarefa é gerar uma resposta concisa e profissional para o e-mail fornecido.
O usuário especificará o tom (por exemplo, "formal", "casual", "neutro") e o tamanho (por exemplo, "curto", "médio", "longo").
Baseie-se no conteúdo do e-mail original para criar uma resposta relevante.
Retorne a resposta no formato JSON com duas chaves: "subject" e "body".
O assunto deve ser apropriado para a resposta, geralmente começando com "Re:".
O corpo da resposta deve ser apenas o texto da mensagem, sem saudações como "Olá [Nome]," ou assinaturas como "Atenciosamente,".
`;

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Acesso correto aos `params` no início da função
    const messageId = params.id;
    
    const supabaseValidation = await validateSupabaseToken(request);
    if (supabaseValidation.error) {
      return NextResponse.json({ error: supabaseValidation.error }, { status: 401 });
    }
    
    const { tone, length, originalMessage } = await request.json();

    if (!messageId || !tone || !length || !originalMessage) {
      return NextResponse.json({ error: 'Parâmetros ausentes' }, { status: 400 });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: replySystemPrompt,
        },
        {
          role: 'user',
          content: `Gere uma resposta para este e-mail:\n\n${originalMessage}\n\nTom: ${tone}\nTamanho: ${length}`,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
      response_format: { type: 'json_object' },
    });

    const replyContent = chatCompletion.choices[0]?.message?.content;
    if (!replyContent) {
      throw new Error('A API da Groq não retornou conteúdo.');
    }

    const parsedReply = JSON.parse(replyContent);

    return NextResponse.json(parsedReply);
  } catch (error) {
    console.error('Erro ao gerar resposta:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
    return NextResponse.json({ error: 'Falha ao gerar resposta', details: errorMessage }, { status: 500 });
  }
}
