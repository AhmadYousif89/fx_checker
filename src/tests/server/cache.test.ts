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
  await resetCache(testDir)
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
    it('returns undefined for missing key', async () => {
      await expect(getCached('nonexistent')).resolves.toBeUndefined()
    })

    it('returns data for cached key', async () => {
      await setCache('test:1', { foo: 'bar' }, 60_000)
      await expect(getCached('test:1')).resolves.toEqual({ foo: 'bar' })
    })

    it('returns undefined after TTL expires', async () => {
      vi.useFakeTimers()
      await setCache('test:2', 'expired-data', 10_000)
      await expect(getCached('test:2')).resolves.toBe('expired-data')
      vi.advanceTimersByTime(10_001)
      await expect(getCached('test:2')).resolves.toBeUndefined()
      vi.useRealTimers()
    })

    it('stores with custom TTL', async () => {
      await setCache('test:3', 42, 10_000)
      await expect(getCached('test:3')).resolves.toBe(42)
    })

    it('overwrites existing key', async () => {
      await setCache('test:4', 'first', 60_000)
      await setCache('test:4', 'second', 60_000)
      await expect(getCached('test:4')).resolves.toBe('second')
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
    it('writes data to disk on set', async () => {
      await setCache('file:1', 'disk-data', 60_000)
      const files = readdirSync(testDir).filter((f) => f.endsWith('.json'))
      expect(files.length).toBeGreaterThan(0)
      const contents = files.map((f) =>
        JSON.parse(readFileSync(join(testDir, f), 'utf-8')),
      )
      expect(
        contents.some((c) => c.key === 'file:1' && c.data === 'disk-data'),
      ).toBe(true)
    })

    it('survives in-memory clear via disk fallback', async () => {
      await setCache('file:2', 'persisted', 60_000)
      clearCache()
      await expect(getCached('file:2')).resolves.toBe('persisted')
    })

    it('cleans up expired files on read', async () => {
      vi.useFakeTimers()
      await setCache('file:3', 'stale', 10_000)
      vi.advanceTimersByTime(10_001)
      clearCache()
      await expect(getCached('file:3')).resolves.toBeUndefined()
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
    it('clears in-memory store but disk-persisted data survives', async () => {
      await setCache('clear:1', 'a', 60_000)
      clearCache()
      await expect(getCached('clear:1')).resolves.toBe('a')
    })
  })

  describe('multiple keys', () => {
    it('handles multiple keys independently', async () => {
      await setCache('multi:a', 1, 60_000)
      await setCache('multi:b', 2, 60_000)
      await setCache('multi:c', 3, 60_000)
      await expect(getCached('multi:a')).resolves.toBe(1)
      await expect(getCached('multi:b')).resolves.toBe(2)
      await expect(getCached('multi:c')).resolves.toBe(3)
    })
  })

  describe('eviction', () => {
    it('evicts oldest entry when cache exceeds MAX_CACHE_SIZE', async () => {
      for (let i = 0; i < 501; i++) {
        await setCache(`evict:${i}`, i, 60_000)
      }
      await expect(getCached('evict:0')).resolves.toBeUndefined()
      await expect(getCached('evict:500')).resolves.toBe(500)
    }, 30_000)

    it('evicts expired entries before oldest entry', async () => {
      vi.useFakeTimers()
      for (let i = 0; i < 500; i++) {
        await setCache(`expired:${i}`, i, -1)
      }
      vi.advanceTimersByTime(1)
      await setCache('fresh', 'value', 60_000)
      await expect(getCached('expired:0')).resolves.toBeUndefined()
      await expect(getCached('fresh')).resolves.toBe('value')
      vi.useRealTimers()
    }, 30_000)

    it('does not evict when cache is below MAX_CACHE_SIZE', async () => {
      for (let i = 0; i < 499; i++) {
        await setCache(`below:${i}`, i, 60_000)
      }
      await expect(getCached('below:0')).resolves.toBe(0)
      await expect(getCached('below:498')).resolves.toBe(498)
    }, 30_000)
  })
})
