// @vitest-environment node
import {
  it,
  vi,
  expect,
  describe,
  afterAll,
  beforeAll,
  beforeEach,
} from 'vitest'
import { join } from 'node:path'
import { readdirSync, readFileSync } from 'node:fs'

import {
  getCached,
  setCache,
  getOrFetch,
  clearCache,
  resetCache,
} from '#/server/functions/cache'

let testDir: string

beforeAll(async () => {
  const { tmpdir } = await import('node:os')
  const { mkdtempSync } = await import('node:fs')
  testDir = mkdtempSync(join(tmpdir(), 'fx-checker-cache-test-'))
  resetCache(testDir)
})

afterAll(async () => {
  const { rmSync } = await import('node:fs')
  rmSync(testDir, { recursive: true, force: true })
})

beforeEach(() => {
  clearCache()
})

describe('cache', () => {
  describe('getCached / setCache', () => {
    it('returns undefined for missing key', () => {
      expect(getCached('nonexistent')).toBeUndefined()
    })

    it('returns data for cached key', () => {
      setCache('test:1', { foo: 'bar' }, 60_000)
      expect(getCached('test:1')).toEqual({ foo: 'bar' })
    })

    it('returns undefined after TTL expires', () => {
      vi.useFakeTimers()
      setCache('test:2', 'expired-data', 10_000)
      expect(getCached('test:2')).toBe('expired-data')
      vi.advanceTimersByTime(10_001)
      expect(getCached('test:2')).toBeUndefined()
      vi.useRealTimers()
    })

    it('stores with custom TTL', () => {
      setCache('test:3', 42, 10_000)
      expect(getCached('test:3')).toBe(42)
    })

    it('overwrites existing key', () => {
      setCache('test:4', 'first', 60_000)
      setCache('test:4', 'second', 60_000)
      expect(getCached('test:4')).toBe('second')
    })
  })

  describe('getOrFetch', () => {
    it('returns fetched data and caches it', async () => {
      const fetchFn = vi.fn().mockResolvedValue('fetched-data')
      const result = await getOrFetch('gof:1', fetchFn, 60_000)
      expect(result).toBe('fetched-data')
      expect(fetchFn).toHaveBeenCalledTimes(1)
    })

    it('returns cached data on subsequent calls', async () => {
      const fetchFn = vi.fn().mockResolvedValue('cached-result')
      await getOrFetch('gof:2', fetchFn, 60_000)
      const result = await getOrFetch('gof:2', fetchFn, 60_000)
      expect(result).toBe('cached-result')
      expect(fetchFn).toHaveBeenCalledTimes(1)
    })

    it('coalesces concurrent requests for the same key', async () => {
      let callCount = 0
      const fetchFn = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => {
              callCount++
              resolve('coalesced')
            }, 50),
          ),
      )

      const [r1, r2] = await Promise.all([
        getOrFetch('gof:3', fetchFn, 60_000),
        getOrFetch('gof:3', fetchFn, 60_000),
      ])

      expect(r1).toBe('coalesced')
      expect(r2).toBe('coalesced')
      expect(callCount).toBe(1)
      expect(fetchFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('file persistence', () => {
    it('writes data to disk on set', () => {
      setCache('file:1', 'disk-data', 60_000)
      const files = readdirSync(testDir).filter((f) => f.endsWith('.json'))
      expect(files.length).toBeGreaterThan(0)
      const contents = files.map((f) =>
        JSON.parse(readFileSync(join(testDir, f), 'utf-8')),
      )
      expect(
        contents.some((c) => c.key === 'file:1' && c.data === 'disk-data'),
      ).toBe(true)
    })

    it('survives in-memory clear via disk fallback', () => {
      setCache('file:2', 'persisted', 60_000)
      clearCache()
      expect(getCached('file:2')).toBe('persisted')
    })

    it('cleans up expired files on read', () => {
      vi.useFakeTimers()
      setCache('file:3', 'stale', 10_000)
      vi.advanceTimersByTime(10_001)
      clearCache()
      expect(getCached('file:3')).toBeUndefined()
      vi.useRealTimers()
      const files = readdirSync(testDir).filter((f) => f.endsWith('.json'))
      expect(
        files.some((f) => {
          const content = JSON.parse(readFileSync(join(testDir, f), 'utf-8'))
          return content.key === 'file:3'
        }),
      ).toBe(false)
    })
  })

  describe('clearCache', () => {
    it('clears in-memory store but disk-persisted data survives', () => {
      setCache('clear:1', 'a', 60_000)
      clearCache()
      // Disk fallback re-populates in-memory from file
      expect(getCached('clear:1')).toBe('a')
    })
  })

  describe('multiple keys', () => {
    it('handles multiple keys independently', () => {
      setCache('multi:a', 1, 60_000)
      setCache('multi:b', 2, 60_000)
      setCache('multi:c', 3, 60_000)
      expect(getCached('multi:a')).toBe(1)
      expect(getCached('multi:b')).toBe(2)
      expect(getCached('multi:c')).toBe(3)
    })
  })

  describe('eviction', () => {
    it('evicts oldest entry when cache exceeds MAX_CACHE_SIZE', () => {
      for (let i = 0; i < 501; i++) {
        setCache(`evict:${i}`, i, 60_000)
      }
      expect(getCached('evict:0')).toBeUndefined()
      expect(getCached('evict:500')).toBe(500)
    })

    it('evicts expired entries before oldest entry', () => {
      vi.useFakeTimers()
      for (let i = 0; i < 500; i++) {
        setCache(`expired:${i}`, i, -1)
      }
      vi.advanceTimersByTime(1)
      setCache('fresh', 'value', 60_000)
      expect(getCached('expired:0')).toBeUndefined()
      expect(getCached('fresh')).toBe('value')
      vi.useRealTimers()
    })

    it('does not evict when cache is below MAX_CACHE_SIZE', () => {
      for (let i = 0; i < 499; i++) {
        setCache(`below:${i}`, i, 60_000)
      }
      expect(getCached('below:0')).toBe(0)
      expect(getCached('below:498')).toBe(498)
    })
  })
})
