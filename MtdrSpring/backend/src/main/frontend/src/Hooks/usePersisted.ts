import { useState, useEffect, useRef, useCallback } from 'react';
import { saveToStorage, getFromStorage, STORAGE_KEYS } from '../Utils/storage';

interface UsePersistedStateOptions<T> {
  storageKey: string;
  defaultValue: T;
  fallbackValue?: T; 
  onError?: (error: Error) => void;
}

export function usePersistedState<T>(options: UsePersistedStateOptions<T>) {
  const {
    storageKey,
    defaultValue,
    fallbackValue = defaultValue,
    onError,
  } = options;

  const [state, setState] = useState<T>(() => {
    try {
      const stored = getFromStorage<T>(storageKey);
      if (stored !== null) return stored;

      return defaultValue;
    } catch (error) {
      console.error(`Error initializing state for ${storageKey}:`, error);
      onError?.(error as Error);
      return fallbackValue;
    }
  });

  const isInitializedRef = useRef(false);

  useEffect(() => {
    isInitializedRef.current = true;
  }, []);

  const setState_Persisted = useCallback((newState: T | ((prevState: T) => T)) => {
    setState((prevState) => {
      const nextState = typeof newState === 'function'
        ? (newState as (prev: T) => T)(prevState)
        : newState;

      try {
        saveToStorage(storageKey, nextState);
      } catch (error) {
        console.error(`Error persisting state for ${storageKey}:`, error);
        onError?.(error as Error);
      }

      return nextState;
    });
  }, [storageKey, onError]);

  return [state, setState_Persisted] as const;
}

interface UseApiWithFallbackOptions<T> {
  fetchFunction: () => Promise<T>;
  storageKey: string;
  fallbackValue: T;
  onError?: (error: Error) => void;
}

export function useApiWithFallback<T>(options: UseApiWithFallbackOptions<T>) {
  const { fetchFunction, storageKey, fallbackValue, onError } = options;

  const [data, setData] = useState<T>(() => {
    const stored = getFromStorage<T>(storageKey);
    return stored ?? fallbackValue;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const isMountedRef = useRef(true);

  useEffect(() => {
    let shouldFetch = true;

    const fetchData = async () => {
      if (!shouldFetch) return;

      setLoading(true);
      setError('');

      try {
        const result = await fetchFunction();
        if (shouldFetch && isMountedRef.current) {
          setData(result);
          saveToStorage(storageKey, result);
        }
      } catch (err) {
        if (shouldFetch && isMountedRef.current) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          setError(errorMessage);
          console.error(`Error in useApiWithFallback (${storageKey}):`, err);
          onError?.(err as Error);

          // Try to load from storage as fallback
          const stored = getFromStorage<T>(storageKey);
          if (stored) {
            setData(stored);
            console.log(`Using stored data as fallback for ${storageKey}`);
          } else {
            setData(fallbackValue);
          }
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      shouldFetch = false;
      isMountedRef.current = false;
    };
  }, [fetchFunction, storageKey, fallbackValue, onError]);

  return {
    data,
    loading,
    error,
    isFromFallback: !error && getFromStorage<T>(storageKey) === null,
    refetch: async () => {
      setLoading(true);
      try {
        const result = await fetchFunction();
        if (isMountedRef.current) {
          setData(result);
          saveToStorage(storageKey, result);
          setError('');
        }
      } catch (err) {
        if (isMountedRef.current) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          setError(errorMessage);
          onError?.(err as Error);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
  };
}
