import { z } from 'zod'
import { currencyCode, daysParam } from './validation'

export const OPEN_API_URL = 'https://api.frankfurter.dev'
export const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY
export const TWELVE_DATA_API_URL = 'https://api.twelvedata.com'
// Twelve Data API - Available Intervals
export const TDI = [
  '1min',
  '5min',
  '15min',
  '30min',
  '45min',
  '1h',
  '2h',
  '4h',
  '8h',
  '1day',
  '1week',
  '1month',
] as const

export const TTL_BY_INTERVAL: Record<string, number> = {
  '1min': 5 * 60 * 1000,
  '5min': 15 * 60 * 1000,
  '15min': 60 * 60 * 1000,
  '30min': 2 * 60 * 60 * 1000,
  '45min': 2 * 60 * 60 * 1000,
  '1h': 2 * 60 * 60 * 1000,
  '2h': 4 * 60 * 60 * 1000,
  '4h': 4 * 60 * 60 * 1000,
  '8h': 4 * 60 * 60 * 1000,
  '1day': 24 * 60 * 60 * 1000,
  '1week': 24 * 60 * 60 * 1000,
  '1month': 24 * 60 * 60 * 1000,
}

export const schema = z.object({
  base: currencyCode,
  quote: currencyCode,
  days: daysParam.default(30),
  interval: z.enum(TDI).default('1day'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})
