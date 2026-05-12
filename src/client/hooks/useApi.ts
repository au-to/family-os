import { useState, useEffect, useRef, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  refetch: () => void;
}

const API_BASE = '/api';

export function useApi<T>(endpoint: string, timeoutMs = 10000): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(() => {
    // Abort any in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    const timer = setTimeout(() => controller.abort(), timeoutMs);

    setState(prev => ({ ...prev, loading: true, error: null }));

    fetch(`${API_BASE}${endpoint}`, { signal: controller.signal })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(text || `HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json() as Promise<T>;
      })
      .then(data => {
        if (!controller.signal.aborted) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        setState(prev => ({
          data: prev.data,
          loading: false,
          error: err.message || '请求失败，请稍后重试',
        }));
      })
      .finally(() => {
        clearTimeout(timer);
      });
  }, [endpoint, timeoutMs]);

  useEffect(() => {
    fetchData();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}

export async function apiMutate<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs = 10000
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || `HTTP ${res.status}: ${res.statusText}`);
    }

    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timer);
  }
}
