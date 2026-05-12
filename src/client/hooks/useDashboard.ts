import type { DashboardData } from '../../shared/types.js';
import { useApi } from './useApi.js';

interface UseDashboardReturn {
  dashboard: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDashboard(): UseDashboardReturn {
  const { data, loading, error, refetch } = useApi<DashboardData>('/risks/dashboard');
  return { dashboard: data, loading, error, refetch };
}
