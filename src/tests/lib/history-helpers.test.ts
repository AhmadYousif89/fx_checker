import { describe, it, expect } from 'vitest'
import {
  computeHistoryYAxisDomain,
  computePointsPerDay,
  computeOutputSize,
} from '#/lib/history-helpers'

describe('computePointsPerDay', () => {
  it('returns 288 for 5min interval', () => {
    expect(computePointsPerDay('5min')).toBe(288)
  })

  it('returns 96 for 15min interval', () => {
    expect(computePointsPerDay('15min')).toBe(96)
  })

  it('returns 24 for 1h interval', () => {
    expect(computePointsPerDay('1h')).toBe(24)
  })

  it('returns 12 for 2h interval', () => {
    expect(computePointsPerDay('2h')).toBe(12)
  })

  it('returns 1 for 1day interval', () => {
    expect(computePointsPerDay('1day')).toBe(1)
  })

  it('returns ~0.1429 for 1week interval', () => {
    expect(computePointsPerDay('1week')).toBeCloseTo(1 / 7, 4)
  })

  it('returns ~0.0333 for 1month interval', () => {
    expect(computePointsPerDay('1month')).toBeCloseTo(1 / 30, 4)
  })

  it('returns 1 for unknown interval', () => {
    expect(computePointsPerDay('unknown')).toBe(1)
  })
})

describe('computeOutputSize', () => {
  it('computes normal output size', () => {
    expect(computeOutputSize(7, '1h')).toBe(168)
  })

  it('clamps to minimum of 1', () => {
    expect(computeOutputSize(1, '1month')).toBe(1)
  })

  it('clamps to maximum of 5000', () => {
    expect(computeOutputSize(1000, '5min')).toBe(5000)
  })
})

describe('computeHistoryYAxisDomain', () => {
  it('pads tiny price ranges to avoid chart exaggeration', () => {
    const [min, max] = computeHistoryYAxisDomain([
      { close: 3.6725 },
      { close: 3.6735 },
    ])

    expect(min).toBeLessThan(3.6725)
    expect(max).toBeGreaterThan(3.6735)
    expect(max - min).toBeGreaterThanOrEqual(0.0015)
  })

  it('adds padding for flat series', () => {
    const [min, max] = computeHistoryYAxisDomain([{ close: 1.25 }])

    expect(min).toBeLessThan(1.25)
    expect(max).toBeGreaterThan(1.25)
  })
})
