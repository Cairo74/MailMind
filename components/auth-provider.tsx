"use client"

import { useEffect, useState, createContext, useContext, useCallback } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import apiClient, { ApiError } from '@/lib/api-client';

import { createClient } from '@/lib/supabase/client';
import { User as FirebaseUser } from "firebase/auth";

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  googleToken: string | null;
  setAndStoreGoogleToken: (token: string | null) => void;
  syncSupabaseSession: (firebaseUser: FirebaseUser) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Função para definir e armazenar o token de acesso do Google.
  const setAndStoreGoogleToken = useCallback((token: string | null) => {
    if (token) {
      sessionStorage.setItem("google-access-token", token);
      apiClient.setGoogleToken(token); // Configurar o token no apiClient
    } else {
      sessionStorage.removeItem("google-access-token");
      apiClient.setGoogleToken(null); // Limpar o token no apiClient
    }
    setGoogleToken(token);
  }, []);

  const syncSupabaseSession = useCallback(async (firebaseUser: FirebaseUser) => {
    try {
      const idToken = await firebaseUser.getIdToken();
      const response = await apiClient.post<{ supabase_token: string }>('/api/sync-user', { idToken });
      const supabaseToken = response.supabase_token;
      
      if (supabaseToken) {
        sessionStorage.setItem('supabase-access-token', supabaseToken);
        const { error } = await supabase.auth.setSession({
          access_token: supabaseToken,
          refresh_token: supabaseToken, // Usar o mesmo token para o refresh_token
        });
        if (error) {
          console.error('Error setting Supabase session:', error);
        }
      } else {
        console.error("Supabase token not found in sync response.");
      }
    } catch (error) {
      console.error('Error syncing Supabase session:', error);
      if (error instanceof ApiError) {
        console.error('API Error Details:', error.details);
      }
      // Handle error appropriately, e.g., sign out user
      await auth.signOut();
    }
  }, [supabase]);


  useEffect(() => {
    // Tenta carregar o token do Google do sessionStorage no início.
    const storedGoogleToken = sessionStorage.getItem("google-access-token");
    if (storedGoogleToken) {
      setGoogleToken(storedGoogleToken);
      apiClient.setGoogleToken(storedGoogleToken); // Configurar no apiClient
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // A sincronização agora é o passo final antes de parar o carregamento.
        await syncSupabaseSession(firebaseUser);
      } else {
        setUser(null);
        setAndStoreGoogleToken(null);
        // Limpar a sessão do Supabase ao fazer logout
        const supabase = createClient();
        await supabase.auth.signOut();
        sessionStorage.removeItem('supabase-access-token');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [syncSupabaseSession, setAndStoreGoogleToken]);

  return (
    <AuthContext.Provider value={{ user, loading, googleToken, setAndStoreGoogleToken, syncSupabaseSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
