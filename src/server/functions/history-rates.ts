import { OPEN_API_URL } from '../config'
import { FrankfurterRateSchema } from '../validation'
import { getOrFetch } from './cache'
import type { FrankfurterApiRate } from '#/types/currency'

// Fetch historical rates from the Frankfurter API for the last 5 days
export async function getHistoricalRates() {
  const now = new Date()
  const endDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  )
  const startDate = new Date(endDate)
  startDate.setUTCDate(endDate.getUTCDate() - 5)

  const format = (d: Date) => d.toISOString().split('T')[0]

  const cacheKey = `historical-rates:${format(startDate)}:${format(endDate)}`
  const ttl = 10 * 60 * 1000 // 10 minutes

  return getOrFetch<FrankfurterApiRate[]>(
    cacheKey,
    async () => {
      const url = new URL(`${OPEN_API_URL}/v2/rates`)
      url.searchParams.set('from', format(startDate))
      url.searchParams.set('to', format(endDate))
      const response = await fetch(url, { signal: AbortSignal.timeout(10_000) })

      if (!response.ok) {
        throw new Error('Failed to fetch historical rates')
      }

      const raw: unknown = await response.json()
      if (!Array.isArray(raw)) {
        throw new Error('Invalid historical rates response')
      }
      return raw.map((r) => FrankfurterRateSchema.parse(r))
    },
    ttl,
  )
}
