import type { HistoryInput } from '#/server/functions/history'

export const TIME_RANGES: Record<string, number> = {
  '1d': 1,
  '1w': 7,
  '1m': 30,
  '3m': 90,
  '6m': 180,
  '1y': 365,
  '5y': 1825,
}

export const RANGE_INTERVALS: Record<string, HistoryInput['interval']> = {
  '1d': '5min',
  '1w': '1h',
  '1m': '1day',
  '3m': '1day',
  '6m': '1day',
  '1y': '1week',
  '5y': '1month',
}
