import { useCallback } from 'react';
import type { Risk } from '../../shared/types.js';
import { useApi, apiMutate } from './useApi.js';

interface UseRisksReturn {
  risks: Risk[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createRisk: (data: Partial<Risk>) => Promise<Risk>;
  updateRisk: (id: string, data: Partial<Risk>) => Promise<Risk>;
  deleteRisk: (id: string) => Promise<void>;
}

export function useRisks(): UseRisksReturn {
  const { data, loading, error, refetch } = useApi<Risk[]>('/risks');

  const createRisk = useCallback(async (data: Partial<Risk>): Promise<Risk> => {
    const result = await apiMutate<{ risk: Risk; advice: unknown[] }>('/risks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    refetch();
    return result.risk;
  }, [refetch]);

  const updateRisk = useCallback(async (id: string, data: Partial<Risk>): Promise<Risk> => {
    const result = await apiMutate<Risk>(`/risks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    refetch();
    return result;
  }, [refetch]);

  const deleteRisk = useCallback(async (id: string): Promise<void> => {
    await apiMutate<void>(`/risks/${id}`, { method: 'DELETE' });
    refetch();
  }, [refetch]);

  return {
    risks: data ?? [],
    loading,
    error,
    refetch,
    createRisk,
    updateRisk,
    deleteRisk,
  };
}
