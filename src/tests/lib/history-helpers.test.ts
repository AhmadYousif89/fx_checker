import { describe, it, expect } from 'vitest'
import {
  computeHistoryYAxisDomain,
  computePointsPerDay,
  computeOutputSize,
  invertData,
  computeCrossRate,
} from '#/lib/history-helpers'
import type { HistoryEntry } from '#/lib/history-helpers'

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

describe('invertData', () => {
  const sample: HistoryEntry[] = [
    {
      time: '2024-01-15 14:30',
      close: 0.0067,
      open: 0.0066,
      high: 0.0068,
      low: 0.0065,
    },
    {
      time: '2024-01-15 14:35',
      close: 0.0068,
      open: 0.0067,
      high: 0.0069,
      low: 0.0066,
    },
  ]

  it('inverts all OHLC values', () => {
    const result = invertData(sample)

    expect(result).toHaveLength(2)
    expect(result[0].close).toBeCloseTo(1 / 0.0067, 6)
    expect(result[0].open).toBeCloseTo(1 / 0.0066, 6)
    expect(result[0].high).toBeCloseTo(1 / 0.0068, 6)
    expect(result[0].low).toBeCloseTo(1 / 0.0065, 6)
  })

  it('preserves time values', () => {
    const result = invertData(sample)

    expect(result[0].time).toBe('2024-01-15 14:30')
    expect(result[1].time).toBe('2024-01-15 14:35')
  })

  it('returns empty array for empty input', () => {
    expect(invertData([])).toEqual([])
  })
})

describe('computeCrossRate', () => {
  const baseData: HistoryEntry[] = [
    { time: '2024-01-15', close: 1.1, open: 1.09, high: 1.12, low: 1.08 },
    { time: '2024-01-16', close: 1.11, open: 1.1, high: 1.13, low: 1.09 },
  ]

  const quoteData: HistoryEntry[] = [
    { time: '2024-01-15', close: 1.3, open: 1.29, high: 1.31, low: 1.28 },
    { time: '2024-01-16', close: 1.31, open: 1.3, high: 1.32, low: 1.29 },
  ]

  it('computes cross rate by dividing base by quote', () => {
    const result = computeCrossRate(baseData, quoteData)

    expect(result).toHaveLength(2)
    expect(result[0].close).toBeCloseTo(1.1 / 1.3, 6)
    expect(result[0].open).toBeCloseTo(1.09 / 1.29, 6)
    expect(result[0].high).toBeCloseTo(1.12 / 1.31, 6)
    expect(result[0].low).toBeCloseTo(1.08 / 1.28, 6)
  })

  it('uses base timestamps', () => {
    const result = computeCrossRate(baseData, quoteData)

    expect(result[0].time).toBe('2024-01-15')
    expect(result[1].time).toBe('2024-01-16')
  })

  it('returns empty array for empty inputs', () => {
    expect(computeCrossRate([], [])).toEqual([])
  })

  it('throws on length mismatch', () => {
    expect(() => computeCrossRate(baseData, baseData.slice(0, 1))).toThrow(
      'Data length mismatch',
    )
  })
})
