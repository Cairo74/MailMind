import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

export async function POST(request: NextRequest) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const { messageId, feedbackType, details } = await request.json();

        if (!messageId || !feedbackType) {
            return NextResponse.json({ error: 'Parâmetros ausentes (messageId, feedbackType)' }, { status: 400 });
        }
        
        // No momento, apenas logamos o feedback no console.
        // Em uma implementação futura, isso seria salvo em uma tabela do Supabase.
        console.log(`
            --- FEEDBACK RECEBIDO ---
            Usuário: ${session.user.id}
            E-mail ID: ${messageId}
            Tipo: ${feedbackType}
            Detalhes: ${details}
            -------------------------
        `);
        
        // TODO: Inserir dados de feedback em uma tabela Supabase `user_feedback`
        /*
        const { error } = await supabase.from('user_feedback').insert({
            user_id: session.user.id,
            message_id: messageId,
            feedback_type: feedbackType,
            details: details,
        });

        if (error) {
            throw error;
        }
        */

        return NextResponse.json({ success: true, message: 'Feedback recebido com sucesso.' });

    } catch (error: any) {
        console.error('API de Feedback - Erro:', error);
        return NextResponse.json({ error: 'Falha ao processar o feedback.', details: error.message }, { status: 500 });
    }
}
