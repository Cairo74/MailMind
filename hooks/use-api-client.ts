import { useMemo } from 'react';
import { useAuth } from '@/components/auth-provider';
import apiClient from '@/lib/api-client';

/**
 * Hook customizado que fornece uma instância do apiClient configurada com os tokens de autenticação atuais.
 * Isso garante que todas as chamadas de API feitas com este hook incluam os cabeçalhos de autenticação corretos.
 *
 * @returns Uma instância do apiClient pronta para uso.
 */
export const useApiClient = () => {
  const { googleToken } = useAuth();
  
  // O token do Supabase é lido do sessionStorage, que é atualizado pelo AuthProvider.
  // Esta abordagem é mais simples do que passar o token Supabase através de múltiplos contextos.
  const supabaseToken = typeof window !== 'undefined' ? sessionStorage.getItem('supabase-access-token') : null;

  // useMemo garante que o objeto apiClient não seja recriado em cada renderização,
  // a menos que um dos tokens de autenticação mude.
  const configuredApiClient = useMemo(() => {
    // Retorna uma versão "configurada" do apiClient, que anexa os tokens.
    // A lógica real de anexar os cabeçalhos ainda reside dentro do objeto apiClient original.
    // Este hook serve como um ponto de acesso que reconhece o contexto de autenticação.
    // A implementação atual do apiClient já lê do sessionStorage, então este hook
    // serve principalmente para garantir que os componentes reajam às mudanças de autenticação.
    
    // Para uma implementação mais robusta no futuro, o apiClient poderia ser reestruturado
    // para aceitar tokens como argumentos, em vez de ler globalmente do sessionStorage.
    return apiClient;

  }, [googleToken, supabaseToken]);

  return configuredApiClient;
};
