import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateSupabaseToken } from '@/lib/supabase/server-helpers';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = await validateSupabaseToken(request);
    if (authError || !user) {
        return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();
    const { id } = params;

    if (!status || !['todo', 'in_progress', 'done'].includes(status)) {
      return NextResponse.json({ error: 'Status inválido fornecido.' }, { status: 400 });
    }
    
    const supabase = createClient();
    const { data, error } = await supabase
      .from('tasks')
      .update({ status: status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id) // Garante que o usuário só pode atualizar suas próprias tarefas
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return NextResponse.json({ error: 'Tarefa não encontrada ou você não tem permissão para atualizá-la.' }, { status: 404 });
      }
      console.error('Supabase update error:', error);
      throw error;
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Update Task API Error:', error);
    return NextResponse.json({ error: 'Falha ao atualizar a tarefa.', details: error.message }, { status: 500 });
  }
}
