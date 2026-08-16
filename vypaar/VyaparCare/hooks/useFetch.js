import { useCallback, useEffect, useState } from 'react';
import { isSupabaseConfigured } from '../lib/supabase';

/**
 * Screens ka data-fetch pattern ek jagah: data + loading + error + reload.
 *
 * Demo mode (Supabase keys nahi hain) me koi call nahi jaati — `demoData`
 * turant mil jaata hai, isliye app bina backend ke bhi waise hi chalta hai.
 *
 *   const { data, loading, error, reload } = useFetch(
 *     () => getServices(), [], { demoData: SERVICES }
 *   );
 */
export function useFetch(fetcher, deps = [], { demoData = null, enabled = true } = {}) {
  const live = isSupabaseConfigured && enabled;

  const [data, setData] = useState(live ? null : demoData);
  const [loading, setLoading] = useState(live);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const run = useCallback(
    async (isRefresh = false) => {
      if (!live) {
        setData(demoData);
        setLoading(false);
        return;
      }

      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const result = await fetcher();
        setData(result);
      } catch (err) {
        console.log('Fetch error:', err.message);
        setError(err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [live, ...deps]
  );

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  return {
    data,
    setData,
    loading,
    error,
    refreshing,
    reload: () => run(false),
    refresh: () => run(true),
    isLive: live,
  };
}
