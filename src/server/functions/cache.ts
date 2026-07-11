import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import {
  mkdir,
  readdir,
  readFile,
  writeFile,
  unlink,
  rename,
} from 'node:fs/promises'

/**
 * Single-process in-memory cache with optional disk persistence.
 *
 * Disk I/O is async and non-blocking. If the disk directory is unavailable
 * or read-only, the cache degrades gracefully to memory-only.
 *
 * NOT process-safe: multiple workers sharing the same directory may overwrite
 * each other's files. Do not share CACHE_DIR across processes.
 */

let CACHE_DIR = process.env.CACHE_DIR ?? resolve(process.cwd(), 'var/cache')

const MAX_CACHE_SIZE = 500
const store = new Map<string, { data: unknown; expires: number }>()
const pending = new Map<string, Promise<unknown>>()

let diskAvailable = false
let initialized = false

async function init(): Promise<void> {
  if (initialized) return
  initialized = true
  try {
    await mkdir(CACHE_DIR, { recursive: true })
    diskAvailable = true
    await loadFromDisk()
  } catch {
    diskAvailable = false
  }
}

function getFilePath(key: string): string {
  const hash = createHash('sha256').update(key).digest('hex')
  return resolve(CACHE_DIR, `${hash}.json`)
}

async function loadFromDisk(): Promise<void> {
  let files: string[]
  try {
    files = await readdir(CACHE_DIR)
  } catch {
    return
  }

  const jsonFiles = files.filter((f) => f.endsWith('.json'))
  if (jsonFiles.length === 0) return

  // Sort by modification time descending to load most recent first
  const entries: {
    key: string
    data: unknown
    expires: number
    path: string
  }[] = []

  const results = await Promise.allSettled(
    jsonFiles.map(async (file) => {
      const filePath = resolve(CACHE_DIR, file)
      try {
        const content = await readFile(filePath, 'utf-8')
        const parsed = JSON.parse(content) as {
          key: string
          data: unknown
          expires: number
        }
        if (Date.now() > parsed.expires) {
          await unlink(filePath).catch(() => {})
          return null
        }
        return { ...parsed, path: filePath }
      } catch {
        return null
      }
    }),
  )

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      entries.push(result.value)
    }
  }

  // Enforce MAX_CACHE_SIZE, keeping the newest entries
  entries.sort((a, b) => b.expires - a.expires)
  const keep = entries.slice(0, MAX_CACHE_SIZE)
  const remove = entries.slice(MAX_CACHE_SIZE)

  for (const entry of keep) {
    store.set(entry.key, { data: entry.data, expires: entry.expires })
  }
  for (const entry of remove) {
    await unlink(entry.path).catch(() => {})
  }
}

async function removeCacheEntry(key: string): Promise<void> {
  store.delete(key)
  if (diskAvailable) {
    await unlink(getFilePath(key)).catch(() => {})
  }
}

export async function getCached<T>(key: string): Promise<T | undefined> {
  await init()

  const entry = store.get(key)
  if (entry) {
    if (Date.now() > entry.expires) {
      store.delete(key)
      if (diskAvailable) {
        await unlink(getFilePath(key)).catch(() => {})
      }
      return undefined
    }
    return entry.data as T
  }

  if (!diskAvailable) return undefined

  try {
    const filePath = getFilePath(key)
    const content = await readFile(filePath, 'utf-8')
    const { data, expires } = JSON.parse(content) as {
      data: unknown
      expires: number
    }
    if (Date.now() <= expires) {
      store.set(key, { data, expires })
      return data as T
    }
    await unlink(filePath).catch(() => {})
  } catch {
    // File read error — not in cache
  }

  return undefined
}

export async function setCache<T>(
  key: string,
  data: T,
  ttl: number,
): Promise<void> {
  await init()

  if (store.size >= MAX_CACHE_SIZE) {
    const now = Date.now()
    for (const [k, v] of store) {
      if (v.expires < now) await removeCacheEntry(k)
      if (store.size < MAX_CACHE_SIZE) break
    }
    if (store.size >= MAX_CACHE_SIZE) {
      const firstKey = store.keys().next().value
      if (firstKey) await removeCacheEntry(firstKey)
    }
  }

  const expires = Date.now() + ttl
  store.set(key, { data, expires })

  if (!diskAvailable) return

  // Atomic write: temp file + rename
  const filePath = getFilePath(key)
  const tmpPath = filePath + '.tmp'
  try {
    await writeFile(tmpPath, JSON.stringify({ key, data, expires }), 'utf-8')
    await rename(tmpPath, filePath)
  } catch {
    // Write error — non-critical, in-memory cache still works
  }
}

export async function getOrFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number,
): Promise<T> {
  const cached = await getCached<T>(key)
  if (cached !== undefined) return cached

  const existing = pending.get(key)
  if (existing) return existing as Promise<T>

  const promise = fetchFn()
    .then((data) => setCache(key, data, ttl).then(() => data))
    .catch((err) => {
      throw err
    })
    .finally(() => {
      pending.delete(key)
    })

  pending.set(key, promise)
  return promise
}

export function clearCache(): void {
  store.clear()
  pending.clear()
}

export async function resetCache(dir?: string): Promise<void> {
  store.clear()
  pending.clear()
  initialized = false
  diskAvailable = false
  if (dir) CACHE_DIR = dir
}
