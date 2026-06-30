import { createServerFn } from '@tanstack/react-start'
import { TICKER_PAIRS } from '#/lib/currency'
import { OPEN_API_URL } from '../config'

import type { RateWithDiff, FrankfurterApiRate } from '#/types/currency'

export const getRates = createServerFn().handler(async () => {
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
    base: string,
    quote: string,
  ): number | null => {
    const rBase = getRateAtDate(date, base)
    const rQuote = getRateAtDate(date, quote)
    if (rBase === null || rQuote === null) return null
    return rQuote / rBase
  }

  const ratesWithDiff: RateWithDiff[] = []

  for (const pair of TICKER_PAIRS) {
    if (!latestDate) continue

    const latestRate = getCrossRate(latestDate, pair.base, pair.quote)
    if (latestRate === null) continue

    let difference = 0
    let direction: 'up' | 'down' | 'flat' = 'flat'

    if (previousDate) {
      const previousRate = getCrossRate(previousDate, pair.base, pair.quote)
      if (previousRate !== null && previousRate > 0) {
        difference = ((latestRate - previousRate) / previousRate) * 100
        direction =
          difference > 0.0001 ? 'up' : difference < -0.0001 ? 'down' : 'flat'
      }
    }

    ratesWithDiff.push({
      base: pair.base,
      quote: pair.quote,
      rate: latestRate,
      difference,
      direction,
    })
  }

  return ratesWithDiff
})

async function getHistoricalRates() {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - 5) // get 5 days of rates to calculate the difference

  const format = (d: Date) => d.toISOString().split('T')[0] // extract date to YYYY-MM-DD

  const response = await fetch(
    `${OPEN_API_URL}/v2/rates?from=${format(startDate)}&to=${format(endDate)}`,
  )

  if (!response.ok) {
    throw new Error('Failed to fetch historical rates')
  }

  const result = await response.json()
  return result as FrankfurterApiRate[]
}
