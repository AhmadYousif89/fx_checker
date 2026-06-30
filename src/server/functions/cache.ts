const store = new Map<string, { data: unknown; expires: number }>()

const DEFAULT_TTL = 15 * 60 * 1000

export function getCached<T>(key: string): T | undefined {
  const entry = store.get(key)
  if (!entry) return undefined
  if (Date.now() > entry.expires) {
    store.delete(key)
    return undefined
  }
  return entry.data as T
}

export function setCache<T>(key: string, data: T, ttl = DEFAULT_TTL): void {
  store.set(key, { data, expires: Date.now() + ttl })
}
