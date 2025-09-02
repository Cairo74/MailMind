import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { auth } from 'firebase-admin'
import { getAuth } from 'firebase/auth'
import { firebaseAdmin } from '@/lib/firebase/admin'

export async function GET(request: Request) {
  // Para usar o Firebase Auth no lado do servidor, precisamos verificar o token de autorização
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const idToken = authHeader.split('Bearer ')[1];

  let decodedToken;
  try {
    decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const userId = decodedToken.uid;
  
  const supabase = createClient();
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('firebase_uid', userId) // Corrigido de 'id' para 'firebase_uid'
    .single();

  if (error) {
    console.error('Supabase fetch error:', error);
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  return NextResponse.json(profile);
}

export async function PATCH(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const idToken = authHeader.split('Bearer ')[1];

  let decodedToken;
  try {
    decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const userId = decodedToken.uid;
  const profileData = await request.json();

  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: profileData.name,
      phone: profileData.phone,
      company: profileData.company,
    })
    .eq('firebase_uid', userId)
    .select()
    .single();

  if (error) {
    console.error('Supabase update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }

  return NextResponse.json(data);
}
