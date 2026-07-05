import {
  mkdirSync,
  unlinkSync,
  existsSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'

let CACHE_DIR = process.env.CACHE_DIR ?? resolve(process.cwd(), 'var/cache')

const MAX_CACHE_SIZE = 500
const store = new Map<string, { data: unknown; expires: number }>()
const pending = new Map<string, Promise<unknown>>()

let initialized = false

function init(): void {
  if (initialized) return
  initialized = true
  ensureDir()
  loadFromDisk()
}

function ensureDir(): void {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true })
  }
}

function loadFromDisk(): void {
  try {
    const files = readdirSync(CACHE_DIR)
    for (const file of files) {
      if (!file.endsWith('.json')) continue
      try {
        const content = readFileSync(resolve(CACHE_DIR, file), 'utf-8')
        const { key, data, expires } = JSON.parse(content) as {
          key: string
          data: unknown
          expires: number
        }
        if (Date.now() > expires) {
          unlinkSync(resolve(CACHE_DIR, file))
          continue
        }
        store.set(key, { data, expires })
      } catch {
        /* skip corrupted files */
      }
    }
  } catch {
    /* directory might not exist */
  }
}

function getFilePath(key: string): string {
  const hash = createHash('sha256').update(key).digest('hex')
  return resolve(CACHE_DIR, `${hash}.json`)
}

export function getCached<T>(key: string): T | undefined {
  init()

  const entry = store.get(key)
  if (entry) {
    if (Date.now() > entry.expires) {
      store.delete(key)
      try {
        unlinkSync(getFilePath(key))
      } catch {
        /* file may not exist */
      }
      return undefined
    }
    return entry.data as T
  }

  // Fall back to disk (survives in-memory clear / restart)
  try {
    const filePath = getFilePath(key)
    if (existsSync(filePath)) {
      const content = readFileSync(filePath, 'utf-8')
      const { data, expires } = JSON.parse(content) as {
        data: unknown
        expires: number
      }
      if (Date.now() <= expires) {
        store.set(key, { data, expires })
        return data as T
      }
      unlinkSync(filePath)
    }
  } catch {
    /* file read error */
  }

  return undefined
}

export function setCache<T>(key: string, data: T, ttl: number): void {
  init()

  if (store.size >= MAX_CACHE_SIZE) {
    const now = Date.now()
    for (const [k, v] of store) {
      if (v.expires < now) store.delete(k)
      if (store.size < MAX_CACHE_SIZE) break
    }
    if (store.size >= MAX_CACHE_SIZE) {
      const firstKey = store.keys().next().value
      if (firstKey) store.delete(firstKey)
    }
  }

  const expires = Date.now() + ttl
  store.set(key, { data, expires })

  const filePath = getFilePath(key)
  try {
    writeFileSync(filePath, JSON.stringify({ key, data, expires }), 'utf-8')
  } catch {
    /* write error — non-critical, in-memory cache still works */
  }
}

export async function getOrFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number,
): Promise<T> {
  const cached = getCached<T>(key)
  if (cached !== undefined) return cached

  const existing = pending.get(key)
  if (existing) return existing as Promise<T>

  const promise = fetchFn()
    .then((data) => {
      setCache(key, data, ttl)
      pending.delete(key)
      return data
    })
    .catch((err) => {
      pending.delete(key)
      throw err
    })

  pending.set(key, promise)
  return promise
}

export function clearCache(): void {
  store.clear()
  pending.clear()
}

export function resetCache(dir?: string): void {
  store.clear()
  pending.clear()
  initialized = false
  if (dir) CACHE_DIR = dir
}
