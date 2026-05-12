import type { AgentSummary } from '../../shared/types.js';
import { useApi } from './useApi.js';

interface UseAgentSummaryReturn {
  summary: AgentSummary | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAgentSummary(): UseAgentSummaryReturn {
  const { data, loading, error, refetch } = useApi<AgentSummary>('/agent/summary');
  return { summary: data, loading, error, refetch };
}
