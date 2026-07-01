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
]

export const TTL_BY_INTERVAL: Record<string, number> = {
  '1min': 15 * 60 * 1000,
  '5min': 15 * 60 * 1000,
  '15min': 15 * 60 * 1000,
  '30min': 15 * 60 * 1000,
  '45min': 15 * 60 * 1000,
  '1h': 15 * 60 * 1000,
  '2h': 4 * 60 * 60 * 1000,
  '4h': 4 * 60 * 60 * 1000,
  '8h': 4 * 60 * 60 * 1000,
  '1day': 24 * 60 * 60 * 1000,
  '1week': 24 * 60 * 60 * 1000,
  '1month': 24 * 60 * 60 * 1000,
}
