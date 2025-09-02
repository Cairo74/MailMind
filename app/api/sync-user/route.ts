import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { firebaseAdmin } from '@/lib/firebase/admin';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

// Criar um cliente Supabase com privilégios de administrador (service_role)
// Este cliente é usado APENAS no backend para operações seguras.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: 'ID token is missing' }, { status: 400 });
    }

    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    const { uid: firebase_uid, email, name } = decodedToken;
    
    // Tentar criar o usuário. Se o e-mail já existir, o Supabase retornará um erro
    // que podemos ignorar para então buscar o usuário existente.
    // Esta abordagem "try-create-catch-fetch" é mais eficiente do que listar usuários.
    let { data: { user: supabaseUser }, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: randomBytes(16).toString('hex'), // Gerar uma senha segura e aleatória
        email_confirm: true,
    });

    // Corrigido: Verificar o código de erro em vez da mensagem de texto
    if (createUserError && (createUserError as any).code === 'email_exists') {
        // Se o usuário já existe, buscamos os dados dele usando listUsers.
        const { data: { users }, error: listUsersError } = await supabaseAdmin.auth.admin.listUsers({ email: email! });

        if (listUsersError) throw listUsersError; // Se a busca falhar aqui, é um erro real.
        if (users.length === 0) {
            // Isso não deveria acontecer se a criação falhou por e-mail existente, mas é uma boa verificação.
            throw new Error('User with existing email not found via listUsers.');
        }

        supabaseUser = users[0];

    } else if (createUserError) {
        // Se for qualquer outro erro durante a criação, lançamos o erro.
        console.error('Erro ao criar usuário no Supabase Auth:', createUserError);
        throw createUserError;
    }

    if (!supabaseUser || !supabaseUser.id) {
        throw new Error('Não foi possível encontrar ou criar o usuário no Supabase.');
    }
    const supabase_user_id = supabaseUser.id;
    
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: supabase_user_id,
        firebase_uid: firebase_uid,
        email: email,
        full_name: name || null,
      }, { onConflict: 'id' });

    if (profileError) {
      console.error('Erro ao criar/atualizar perfil:', profileError);
      throw profileError;
    }

    const jwtSecret = process.env.SUPABASE_JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('SUPABASE_JWT_SECRET não está definido');
    }

    const payload = {
      aud: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
      sub: supabase_user_id,
      email: email,
      role: 'authenticated',
    };

    const supabaseToken = jwt.sign(payload, jwtSecret);

    return NextResponse.json({ supabase_token: supabaseToken });

  } catch (error: any) {
    console.error('Sync user error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred during user sync.', details: error.message || 'Unknown error' }, { status: 500 });
  }
}
