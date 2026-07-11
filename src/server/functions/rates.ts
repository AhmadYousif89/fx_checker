import { z } from 'zod'
import { createServerFn } from '@tanstack/react-start'

import { FLAG_CODE_SET } from '#/lib/currency'
import type { RateWithDiff } from '#/types/currency'
import {
  generateFallbackPairs,
  getCrossRateAtDate,
  getRateAtDate,
} from '#/lib/currency/rates'
import { currencyCode } from '../validation'
import { getHistoricalRates } from './history-rates'

export const getRates = createServerFn()
  .validator(z.object({ base: currencyCode }).optional())
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

    // Find the latest date where the base currency actually has data.
    // On weekends, less-traded currencies are missing from Frankfurter,
    // so picking the absolute latest date would produce empty results
    // for bases like ARS, BDT, CLP, CNH, etc.
    const latestDate = completeDates.find(
      (date) => getRateAtDate(rates, date, base) !== null,
    )

    if (!latestDate) {
      return generateFallbackPairs(rates, completeDates)
    }

    const previousDate = completeDates.find(
      (date) => date < latestDate && getRateAtDate(rates, date, base) !== null,
    )

    const supportedQuotes = Array.from(
      new Set(rates.map((r) => r.quote)),
    ).filter(
      (q) => q !== base && FLAG_CODE_SET.has(q.slice(0, 2).toLowerCase()),
    )

    const ratesWithDiff: RateWithDiff[] = []

    for (const quote of supportedQuotes) {
      const latestRate = getCrossRateAtDate(rates, latestDate, base, quote)
      if (latestRate === null) continue

      let difference = 0
      let direction: 'up' | 'down' | 'flat' = 'flat'

      if (previousDate) {
        const previousRate = getCrossRateAtDate(
          rates,
          previousDate,
          base,
          quote,
        )
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
