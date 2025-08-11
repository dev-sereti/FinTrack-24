const cache = new Map<string, { value: any; expiry: number }>();

export const setCache = (key: string, value: any, ttlMs: number) => {
  cache.set(key, { value, expiry: Date.now() + ttlMs });
};

export const getCache = (key: string) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.value;
};