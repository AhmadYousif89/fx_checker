import { z } from 'zod'
import { createServerFn } from '@tanstack/react-start'

import { OPEN_API_URL } from '../config'
import { FLAG_CODE_SET } from '#/lib/currency'
import type { RateWithDiff, FrankfurterApiRate } from '#/types/currency'

export const getRates = createServerFn()
  .validator(z.object({ base: z.string() }).optional())
  .handler(async ({ data }) => {
    const base = data ? data.base : 'USD'
    const rates = await getHistoricalRates()

    // Get unique dates in descending order (latest first)
    const uniqueDates = Array.from(new Set(rates.map((r) => r.date))).sort(
      (a, b) => b.localeCompare(a),
    )

    // Skip dates with too few currencies (partial-day data from the API)
    const completeDates = uniqueDates.filter(
      (date) => rates.filter((r) => r.date === date).length > 20,
    )

    const latestDate = completeDates[0]
    const previousDate = completeDates[1]

    const getRateAtDate = (date: string, quote: string): number | null => {
      if (quote === 'EUR') return 1
      const match = rates.find((r) => r.date === date && r.quote === quote)
      return match ? match.rate : null
    }

    const getCrossRate = (
      date: string,
      baseCode: string,
      quoteCode: string,
    ): number | null => {
      const rBase = getRateAtDate(date, baseCode)
      const rQuote = getRateAtDate(date, quoteCode)
      if (rBase === null || rQuote === null) return null
      return rQuote / rBase
    }

    const supportedQuotes = Array.from(
      new Set(rates.map((r) => r.quote)),
    ).filter(
      (q) => q !== base && FLAG_CODE_SET.has(q.slice(0, 2).toLowerCase()),
    )

    const ratesWithDiff: RateWithDiff[] = []

    for (const quote of supportedQuotes) {
      if (!latestDate) continue

      const latestRate = getCrossRate(latestDate, base, quote)
      if (latestRate === null) continue

      let difference = 0
      let direction: 'up' | 'down' | 'flat' = 'flat'

      if (previousDate) {
        const previousRate = getCrossRate(previousDate, base, quote)
        if (previousRate !== null && previousRate > 0) {
          difference = ((latestRate - previousRate) / previousRate) * 100
          direction =
            difference > 0.0001 ? 'up' : difference < -0.0001 ? 'down' : 'flat'
        }
      }

      ratesWithDiff.push({
        base,
        quote,
        rate: latestRate,
        difference,
        direction,
      })
    }

    return ratesWithDiff
  })

async function getHistoricalRates() {
  const now = new Date()
  const endDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  )
  const startDate = new Date(endDate)
  startDate.setUTCDate(endDate.getUTCDate() - 5)

  const format = (d: Date) => d.toISOString().split('T')[0]

  const response = await fetch(
    `${OPEN_API_URL}/v2/rates?from=${format(startDate)}&to=${format(endDate)}`,
  )

  if (!response.ok) {
    throw new Error('Failed to fetch historical rates')
  }

  const result = await response.json()
  return result as FrankfurterApiRate[]
}
