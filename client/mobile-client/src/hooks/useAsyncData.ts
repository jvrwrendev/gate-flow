import { useCallback, useEffect, useState } from 'react';

interface UseAsyncDataOptions<T> {
  fetcher: () => Promise<T>;
  deps?: React.DependencyList;
}

export function useAsyncData<T>({ fetcher, deps = [] }: UseAsyncDataOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    refetch();
  }, deps);

  return { data, loading, error, refetch };
}
