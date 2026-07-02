import { describe, it, expect, vi, beforeEach } from 'vitest'

import {
  getFlagUrl,
  parseCurrency,
  abbreviateCurrencyName,
  restrictNumeric,
  timeAgo,
  shortTimeAgo,
  getCrossRate,
  formatAmount,
  formatRate,
  formatTooltipDate,
  formatAxisDate,
  orderCompareCurrencies,
} from '#/lib/currency'
import { computeHistoryStats } from '#/lib/history-helpers'

describe('getFlagUrl', () => {
  it('returns correct url for known code', () => {
    expect(getFlagUrl('USD')).toBe('/assets/images/flags/us.webp')
  })

  it('returns empty for unknown code', () => {
    expect(getFlagUrl('XX')).toBe('')
  })

  it('handles lowercase input', () => {
    expect(getFlagUrl('eur')).toBe('/assets/images/flags/eu.webp')
  })

  it('handles longer codes by slicing first 2 chars', () => {
    expect(getFlagUrl('USDT')).toBe('/assets/images/flags/us.webp')
  })
})

describe('parseCurrency', () => {
  it('splits code and name by dash', () => {
    expect(parseCurrency('USD-United States Dollar')).toEqual({
      code: 'USD',
      name: 'United States Dollar',
    })
  })

  it('handles multi-word names', () => {
    expect(parseCurrency('KPW-North Korean Won')).toEqual({
      code: 'KPW',
      name: 'North Korean Won',
    })
  })

  it('handles code only', () => {
    expect(parseCurrency('EUR')).toEqual({ code: 'EUR', name: '' })
  })
})

describe('abbreviateCurrencyName', () => {
  it('returns short names unchanged', () => {
    expect(abbreviateCurrencyName('US Dollar')).toBe('US Dollar')
  })

  it('abbreviates long names', () => {
    expect(abbreviateCurrencyName('United States Dollar')).toBe('US Dollar')
  })

  it('handles three-word names', () => {
    expect(abbreviateCurrencyName('North Korean Won')).toBe('NK Won')
  })
})

describe('restrictNumeric', () => {
  it('keeps digits and dot', () => {
    expect(restrictNumeric('123.45')).toBe('123.45')
  })

  it('removes letters', () => {
    expect(restrictNumeric('12a3')).toBe('123')
  })

  it('allows only the first dot', () => {
    expect(restrictNumeric('12.34.56')).toBe('12.3456')
  })

  it('handles empty string', () => {
    expect(restrictNumeric('')).toBe('')
  })
})

describe('timeAgo', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('returns "just now" for <5 seconds', () => {
    vi.setSystemTime(1000)
    expect(timeAgo(999)).toBe('just now')
  })

  it('returns minutes for <1 hour', () => {
    vi.setSystemTime(120_000)
    expect(timeAgo(60_000)).toBe('1 min ago')
  })

  it('returns hours for <24 hours', () => {
    vi.setSystemTime(3_600_000 * 2)
    expect(timeAgo(0)).toBe('2h ago')
  })

  it('returns days for >=24 hours', () => {
    vi.setSystemTime(86_400_000 * 3)
    expect(timeAgo(0)).toBe('3d ago')
  })
})

describe('shortTimeAgo', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('returns "<1M" for <1 minute', () => {
    vi.setSystemTime(30_000)
    expect(shortTimeAgo(0)).toBe('<1M')
  })

  it('returns minutes for <1 hour', () => {
    vi.setSystemTime(120_000)
    expect(shortTimeAgo(60_000)).toBe('1M')
  })

  it('returns hours for <24 hours', () => {
    vi.setSystemTime(3_600_000 * 5)
    expect(shortTimeAgo(0)).toBe('5H')
  })
})

describe('getCrossRate', () => {
  const rates = new Map([
    ['USD', 1.1],
    ['GBP', 0.85],
    ['JPY', 130],
  ])

  it('returns 1 for same base and quote', () => {
    expect(getCrossRate({ rates, base: 'USD', quote: 'USD' })).toBe(1)
  })

  it('converts from EUR to a currency', () => {
    expect(getCrossRate({ rates, base: 'EUR', quote: 'USD' })).toBe(1.1)
  })

  it('converts from a currency to EUR', () => {
    expect(getCrossRate({ rates, base: 'USD', quote: 'EUR' })).toBeCloseTo(
      0.90909,
      4,
    )
  })

  it('calculates cross rate between two non-EUR currencies', () => {
    const rate = getCrossRate({ rates, base: 'USD', quote: 'JPY' })
    expect(rate).toBeCloseTo(130 / 1.1, 4)
  })

  it('returns null when base is missing from rates', () => {
    expect(getCrossRate({ rates, base: 'XYZ', quote: 'USD' })).toBeNull()
  })

  it('returns null when quote is missing from rates', () => {
    expect(getCrossRate({ rates, base: 'USD', quote: 'XYZ' })).toBeNull()
  })
})

describe('formatAmount', () => {
  it('uses 4 decimals for values < 10', () => {
    const result = formatAmount(5.1234)
    expect(result).toBe('5.1234')
  })

  it('uses 2 decimals for values >= 10', () => {
    const result = formatAmount(1000)
    expect(result).toBe('1,000')
  })

  it('formats with commas', () => {
    expect(formatAmount(157910, 0)).toBe('157,910')
  })
})

describe('formatRate', () => {
  it('uses 4 decimals for rates < 10', () => {
    expect(formatRate(0.853)).toBe('0.8530')
  })

  it('uses 2 decimals for rates >= 10', () => {
    expect(formatRate(157.91)).toBe('157.91')
  })
})

describe('formatTooltipDate', () => {
  it('handles empty string', () => {
    expect(formatTooltipDate('', '1d')).toBe('')
  })

  it('returns raw string for invalid date', () => {
    expect(formatTooltipDate('not-a-date', '1d')).toBe('not-a-date')
  })

  it('formats 1d range with full date and time', () => {
    const result = formatTooltipDate('2024-01-15 14:30', '1d')
    expect(result).toContain('Jan')
    expect(result).toContain('2024')
    expect(result).toContain('14:30')
  })

  it('formats 1w range with full date and time', () => {
    const result = formatTooltipDate('2024-06-30 09:50', '1w')
    expect(result).toContain('Jun')
    expect(result).toContain('2024')
    expect(result).toContain('09:50')
  })

  it('formats 1m range with full date (no time)', () => {
    const result = formatTooltipDate('2024-01-15', '1m')
    expect(result).toBe('Jan 15, 2024')
  })

  it('formats 3m range with full date (no time)', () => {
    const result = formatTooltipDate('2024-01-15', '3m')
    expect(result).toBe('Jan 15, 2024')
  })

  it('formats 5y range with full date (no time)', () => {
    const result = formatTooltipDate('2024-01-15', '5y')
    expect(result).toBe('Jan 15, 2024')
  })
})

describe('formatAxisDate', () => {
  it('handles empty string', () => {
    expect(formatAxisDate('', '1d')).toBe('')
  })

  it('returns raw string for invalid date', () => {
    expect(formatAxisDate('bad-date', '1d')).toBe('bad-date')
  })

  it('formats 1d range as hour:minute only', () => {
    const result = formatAxisDate('2024-01-15 14:30', '1d')
    expect(result).toBe('14:30')
  })

  it('formats 1w range as month+day', () => {
    const result = formatAxisDate('2024-06-30', '1w')
    expect(result).toBe('Jun 30')
  })

  it('formats 1m range as month+day', () => {
    const result = formatAxisDate('2024-01-15', '1m')
    expect(result).toBe('Jan 15')
  })

  it('formats 3m range as month+day', () => {
    const result = formatAxisDate('2024-04-10', '3m')
    expect(result).toBe('Apr 10')
  })

  it('formats 1y range as month+year', () => {
    const result = formatAxisDate('2024-01-15', '1y')
    expect(result).toBe('Jan 24')
  })

  it('formats 5y range as month+year', () => {
    const result = formatAxisDate('2024-01-15', '5y')
    expect(result).toBe('Jan 24')
  })
})

describe('computeHistoryStats', () => {
  it('returns null for undefined data', () => {
    expect(computeHistoryStats(undefined)).toBeNull()
  })

  it('returns null for empty data', () => {
    expect(computeHistoryStats([])).toBeNull()
  })

  it('computes stats correctly', () => {
    const data = [
      { open: 100, close: 110 },
      { open: 105, close: 108 },
      { open: 108, close: 115 },
    ]
    const stats = computeHistoryStats(data)
    expect(stats).toEqual({
      open: 100,
      close: 115,
      change: 15,
      percentChange: 15,
    })
  })

  it('handles zero open value without division by zero', () => {
    const data = [
      { open: 0, close: 5 },
      { open: 5, close: 10 },
    ]
    const stats = computeHistoryStats(data)
    expect(stats?.percentChange).toBe(0)
  })

  it('handles negative change', () => {
    const data = [
      { open: 100, close: 90 },
      { open: 90, close: 80 },
    ]
    const stats = computeHistoryStats(data)
    expect(stats?.change).toBe(-20)
    expect(stats?.percentChange).toBe(-20)
  })

  it('handles single entry data', () => {
    const data = [{ open: 50, close: 50 }]
    const stats = computeHistoryStats(data)
    expect(stats).toEqual({ open: 50, close: 50, change: 0, percentChange: 0 })
  })
})

describe('orderCompareCurrencies', () => {
  const availableCodes = new Set([
    'USD',
    'EUR',
    'GBP',
    'JPY',
    'CHF',
    'CAD',
    'AUD',
  ])

  it('excludes sender and receiver', () => {
    const result = orderCompareCurrencies({
      sender: 'USD',
      receiver: 'EUR',
      favorites: [],
      recent: { from: [], to: [] },
      availableCodes,
    })
    expect(result).not.toContain('USD')
    expect(result).not.toContain('EUR')
  })

  it('places favorites first', () => {
    const result = orderCompareCurrencies({
      sender: 'EUR',
      receiver: 'USD',
      favorites: [{ sender: 'GBP', receiver: 'JPY' }],
      recent: { from: [], to: [] },
      availableCodes,
    })
    expect(result.indexOf('GBP')).toBeLessThan(result.indexOf('CHF'))
    expect(result.indexOf('JPY')).toBeLessThan(result.indexOf('CHF'))
  })

  it('places recent after favorites', () => {
    const result = orderCompareCurrencies({
      sender: 'USD',
      receiver: 'EUR',
      favorites: [],
      recent: { from: ['AUD'], to: ['CAD'] },
      availableCodes,
    })
    expect(result.indexOf('AUD')).toBeLessThan(result.indexOf('GBP'))
    expect(result.indexOf('CAD')).toBeLessThan(result.indexOf('GBP'))
  })

  it('limits to 8 results', () => {
    const result = orderCompareCurrencies({
      sender: 'USD',
      receiver: 'EUR',
      favorites: [],
      recent: { from: [], to: [] },
      availableCodes: new Set([
        'USD',
        'EUR',
        'GBP',
        'JPY',
        'CHF',
        'CAD',
        'AUD',
        'NZD',
        'SEK',
        'NOK',
      ]),
    })
    expect(result.length).toBeLessThanOrEqual(8)
  })

  it('filters out unavailable codes', () => {
    const limited = new Set(['USD', 'EUR', 'GBP'])
    const result = orderCompareCurrencies({
      sender: 'USD',
      receiver: 'EUR',
      favorites: [],
      recent: { from: [], to: [] },
      availableCodes: limited,
    })
    expect(result).toEqual(['GBP'])
  })
})
