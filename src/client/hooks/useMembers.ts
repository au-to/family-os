import { useCallback } from 'react';
import type { Member } from '../../shared/types.js';
import { useApi, apiMutate } from './useApi.js';

interface UseMembersReturn {
  members: Member[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  addMember: (data: Partial<Member>) => Promise<Member>;
  deleteMember: (id: string) => Promise<void>;
}

export function useMembers(): UseMembersReturn {
  const { data, loading, error, refetch } = useApi<Member[]>('/members');

  const addMember = useCallback(async (data: Partial<Member>): Promise<Member> => {
    const result = await apiMutate<Member>('/members', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    refetch();
    return result;
  }, [refetch]);

  const deleteMember = useCallback(async (id: string): Promise<void> => {
    await apiMutate<void>(`/members/${id}`, { method: 'DELETE' });
    refetch();
  }, [refetch]);

  return {
    members: data ?? [],
    loading,
    error,
    refetch,
    addMember,
    deleteMember,
  };
}
