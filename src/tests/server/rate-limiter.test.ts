import { describe, it, expect, vi, afterEach } from 'vitest'

import { TokenBucket } from '#/server/rate-limiter'

afterEach(() => {
  vi.useRealTimers()
})

describe('TokenBucket', () => {
  describe('tryAcquire', () => {
    it('allows up to maxTokens immediate acquisitions', () => {
      const now = 0
      const bucket = new TokenBucket(8, 60_000, () => now)

      for (let i = 0; i < 8; i++) {
        expect(bucket.tryAcquire()).toBe(true)
      }

      expect(bucket.tryAcquire()).toBe(false)
    })

    it('refills tokens as time elapses', () => {
      let now = 0
      const bucket = new TokenBucket(8, 60_000, () => now)

      for (let i = 0; i < 8; i++) bucket.tryAcquire()
      expect(bucket.tryAcquire()).toBe(false)

      now += 30_000
      expect(bucket.tryAcquire()).toBe(true)
      expect(bucket.tryAcquire()).toBe(true)
      expect(bucket.tryAcquire()).toBe(true)
      expect(bucket.tryAcquire()).toBe(true)
      expect(bucket.tryAcquire()).toBe(false)
    })

    it('never exceeds maxTokens on long idle', () => {
      let now = 0
      const bucket = new TokenBucket(8, 60_000, () => now)

      now += 365 * 24 * 60 * 60 * 1000
      expect(bucket.availableTokens).toBe(8)
      for (let i = 0; i < 8; i++) expect(bucket.tryAcquire()).toBe(true)
      expect(bucket.tryAcquire()).toBe(false)
    })

    it('accumulates fractional tokens but only allows acquisition at whole tokens', () => {
      let now = 0
      const bucket = new TokenBucket(8, 60_000, () => now)

      for (let i = 0; i < 8; i++) bucket.tryAcquire()

      now += 7_500 // time for exactly 1 token at 8/min
      expect(bucket.tryAcquire()).toBe(true)

      now += 3_750 // time for 0.5 more tokens
      expect(bucket.tryAcquire()).toBe(false)

      now += 3_750 // time for the remaining 0.5
      expect(bucket.tryAcquire()).toBe(true)
      expect(bucket.tryAcquire()).toBe(false)
    })
  })

  describe('availableTokens', () => {
    it('returns maxTokens initially', () => {
      const bucket = new TokenBucket(5, 10_000, () => 0)
      expect(bucket.availableTokens).toBe(5)
    })

    it('decreases after acquisitions', () => {
      const now = 0
      const bucket = new TokenBucket(5, 10_000, () => now)

      bucket.tryAcquire()
      expect(bucket.availableTokens).toBeCloseTo(4)

      bucket.tryAcquire()
      expect(bucket.availableTokens).toBeCloseTo(3)
    })

    it('increases over time', () => {
      let now = 0
      const bucket = new TokenBucket(5, 10_000, () => now)

      for (let i = 0; i < 5; i++) bucket.tryAcquire()
      expect(bucket.availableTokens).toBeCloseTo(0)

      now += 6_000
      expect(bucket.availableTokens).toBeCloseTo(3)
    })
  })

  describe('acquire', () => {
    it('resolves immediately when tokens available', async () => {
      const bucket = new TokenBucket(1, 60_000, () => 0)

      await bucket.acquire()
      expect(bucket.availableTokens).toBe(0)
    })

    it('waits for refill when tokens exhausted', async () => {
      vi.useFakeTimers()
      let now = Date.now()
      const bucket = new TokenBucket(1, 200, () => now)

      await bucket.acquire()
      expect(bucket.availableTokens).toBe(0)

      const promise = bucket.acquire()

      now += 200
      vi.advanceTimersByTime(200)

      await promise
      expect(bucket.availableTokens).toBe(0)
    })

    it('waits for refill with real timers', async () => {
      const bucket = new TokenBucket(1, 50, () => Date.now())

      await bucket.acquire()
      const start = Date.now()
      await bucket.acquire()
      const elapsed = Date.now() - start

      expect(elapsed).toBeGreaterThanOrEqual(40)
    })
  })
})
