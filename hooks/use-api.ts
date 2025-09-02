import { useState, useEffect, useCallback } from 'react';
import apiClient, { ApiError } from '@/lib/api-client';

interface UseApiResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

interface ApiOptions {
  enabled?: boolean;
}

export function useApi<T>(url: string, options: ApiOptions = { enabled: true }): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(options.enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!url || !options.enabled) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiClient.get<T>(url);
      setData(result);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`${err.message} (Status: ${err.status})`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro desconhecido.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [url, options.enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
