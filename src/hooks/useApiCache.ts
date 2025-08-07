import { useState, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export function useApiCache<T>(defaultTTL: number = 300000) { // 5 minutes default
  const [cache, setCache] = useState<Map<string, CacheEntry<T>>>(new Map());

  const get = useCallback((key: string): T | null => {
    const entry = cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(key);
        return newCache;
      });
      return null;
    }
    
    return entry.data;
  }, [cache]);

  const set = useCallback((key: string, data: T, ttl: number = defaultTTL) => {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    };
    
    setCache(prev => new Map(prev).set(key, entry));
  }, [defaultTTL]);

  const clear = useCallback(() => {
    setCache(new Map());
  }, []);

  const has = useCallback((key: string): boolean => {
    const entry = cache.get(key);
    return entry !== undefined && Date.now() <= entry.expiresAt;
  }, [cache]);

  return { get, set, clear, has };
}