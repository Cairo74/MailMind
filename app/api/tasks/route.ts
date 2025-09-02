import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: authError?.message || 'Unauthorized' }, { status: 401 });
    }

    try {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Get Tasks API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch tasks', details: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: authError?.message || 'Unauthorized' }, { status: 401 });
    }

    try {
        const { sourceMessageId, title, description, dueDate, priority } = await request.json();

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }
        
        const taskData = {
            user_id: user.id,
            message_id: sourceMessageId,
            title,
            description,
            due_date: dueDate,
            priority,
            status: 'todo' as const,
        };

        const { data, error } = await supabase
            .from('tasks')
            .insert(taskData)
            .select()
            .single();

        if (error) {
            console.error('Supabase insert error:', error);
            throw error;
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Create Task API Error:', error);
        return NextResponse.json({ error: 'Failed to create task', details: error.message }, { status: 500 });
    }
}
