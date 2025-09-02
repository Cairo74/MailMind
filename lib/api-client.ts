import { createClient } from '@/lib/supabase/client';

export class ApiError extends Error {
  constructor(message: string, public status: number, public details?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

// Armazenar uma referência ao googleToken globalmente no módulo
let googleToken: string | null = null;

const apiClient = {
  setGoogleToken(token: string | null) {
    googleToken = token;
  },

  async request<T>(method: string, url: string, data?: any): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Para a maioria das rotas, precisamos do token de autenticação do Supabase.
    if (!url.startsWith('/api/sync-user')) {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.access_token) {
            headers['Authorization'] = `Bearer ${session.access_token}`;
        } else {
            console.warn("Sessão Supabase ou token de acesso não encontrado ao fazer a requisição.");
        }
    }

    // Usar o token do Google armazenado no módulo
    if (googleToken) {
      headers['X-Google-Access-Token'] = googleToken;
    }
    
    const config: RequestInit = {
      method,
      headers,
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.error || `Erro na requisição: ${response.statusText}`,
        response.status,
        errorData.details
      );
    }
    
    const responseText = await response.text();
    return responseText ? (JSON.parse(responseText) as T) : ({} as T);
  },

  get<T>(url: string): Promise<T> {
    return this.request<T>('GET', url);
  },

  post<T>(url: string, data: any): Promise<T> {
    return this.request<T>('POST', url, data);
  },

  patch<T>(url: string, data: any): Promise<T> {
    return this.request<T>('PATCH', url, data);
  },

  delete<T>(url: string): Promise<T> {
    return this.request<T>('DELETE', url);
  },
};

export default apiClient;
