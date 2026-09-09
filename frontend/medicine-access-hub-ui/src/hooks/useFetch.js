import { useState, useEffect, useRef } from 'react';

/**
 * useFetch — simulates an async REST call against local mock data.
 * Mirrors the shape of a real fetch hook so this can be swapped for a live
 * Spring Boot / Python AI-service endpoint in later phases without
 * changing any consuming component's interface.
 *
 * @param {Function} resolver - () => data, or () => Promise<data>
 * @param {Array} deps - dependency array, re-runs the fetch when changed
 * @param {number} delayMs - simulated network latency
 */
export function useFetch(resolver, deps = [], delayMs = 400) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const resolverRef = useRef(resolver);
  resolverRef.current = resolver;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        const result = await resolverRef.current();
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      }
    }, delayMs);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}
