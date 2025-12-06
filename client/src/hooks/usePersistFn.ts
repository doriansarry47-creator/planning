import { useRef, useCallback } from 'react';

type Fn = (...args: any[]) => any;

/**
 * Hook that persists a function reference across renders
 * Useful to avoid recreating callbacks that depend on props/state
 */
export function usePersistFn<T extends Fn>(fn: T): T {
  const fnRef = useRef<T>(fn);
  
  // Keep the reference up to date
  fnRef.current = fn;

  // Return a stable function that calls the latest version
  const persistedFn = useCallback(
    ((...args: any[]) => {
      return fnRef.current(...args);
    }) as T,
    []
  );

  return persistedFn;
}
