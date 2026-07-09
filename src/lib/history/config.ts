import type { HistoryInput } from '#/server/functions/history'

export const SMA_PERIODS: Record<string, number> = {
  '1d': 12,
  '1w': 7,
  '1m': 7,
  '3m': 20,
  '1y': 12,
  '5y': 12,
}

export const rangeKeys = ['1d', '1w', '1m', '3m', '1y', '5y'] as const

export type RangeKey = (typeof rangeKeys)[number]

export const TIME_RANGES: Record<RangeKey, number> = {
  '1d': 1,
  '1w': 7,
  '1m': 30,
  '3m': 90,
  '1y': 365,
  '5y': 1825,
}

export const RANGE_INTERVALS: Record<RangeKey, HistoryInput['interval']> = {
  '1d': '5min',
  '1w': '1h',
  '1m': '1day',
  '3m': '1day',
  '1y': '1week',
  '5y': '1month',
}
