type CacheEntry = {
  data: any;
  expiry: number;
};

const globalCache = globalThis as unknown as { _notionCache: Record<string, CacheEntry> };

if (!globalCache._notionCache) {
  globalCache._notionCache = {};
}

/**
 * @param key 
 * @param fetchFn 
 * @param ttlSeconds 
 */
export async function getCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = 300 
): Promise<T> {
  const now = Date.now();
  const cached = globalCache._notionCache[key];

  if (cached && cached.expiry > now) {
    console.log(`⚡ [CACHE HIT] Usando dados cacheados para: ${key}`);
    return cached.data as T;
  }

  console.log(`🐢 [CACHE MISS] Buscando dados frescos no Notion para: ${key}...`);
  const data = await fetchFn();

  globalCache._notionCache[key] = {
    data,
    expiry: now + (ttlSeconds * 1000),
  };

  return data;
}