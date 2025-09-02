import { NextRequest, NextResponse } from 'next/server';
import { classifyEmail } from '@/lib/ai/classification';

export async function POST(request: NextRequest) {
  try {
    const { subject, body } = await request.json();
    
    // Reutiliza a função de classificação centralizada.
    const category = await classifyEmail({ subject, body });

    if (category === "Não classificado") {
        return NextResponse.json({ error: 'Falha ao classificar o e-mail' }, { status: 500 });
    }

    return NextResponse.json({ category });

  } catch (error) {
    console.error('Classify API Route Error:', error);
    return NextResponse.json({ error: 'Falha ao classificar o e-mail' }, { status: 500 });
  }
}
