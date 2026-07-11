import { createServerFn } from '@tanstack/react-start'

import { pairArray } from '../validation'
import type { RateWithDiff } from '#/types/currency'
import { getHistoricalRates } from './history-rates'
import { getCrossRateAtDate, getRateAtDate } from '#/lib/currency/rates'

export const getFavoriteRates = createServerFn()
  .validator(pairArray)
  .handler(async ({ data: pairs }) => {
    const rates = await getHistoricalRates()

    const uniqueDates = Array.from(new Set(rates.map((r) => r.date))).sort(
      (a, b) => b.localeCompare(a),
    )

    const completeDates = uniqueDates.filter(
      (date) => rates.filter((r) => r.date === date).length > 20,
    )

    const result: RateWithDiff[] = []

    for (const { sender, receiver } of pairs) {
      const latestDate = completeDates.find(
        (date) => getRateAtDate(rates, date, sender) !== null,
      )
      if (!latestDate) continue

      const previousDate = completeDates.find(
        (date) =>
          date < latestDate && getRateAtDate(rates, date, sender) !== null,
      )

      const latestRate = getCrossRateAtDate(rates, latestDate, sender, receiver)
      if (latestRate === null) continue

      let difference = 0
      let direction: 'up' | 'down' | 'flat' = 'flat'

      if (previousDate) {
        const previousRate = getCrossRateAtDate(
          rates,
          previousDate,
          sender,
          receiver,
        )
        if (previousRate !== null && previousRate > 0) {
          difference = ((latestRate - previousRate) / previousRate) * 100
          direction =
            difference > 0.0001 ? 'up' : difference < -0.0001 ? 'down' : 'flat'
        }
      }

      result.push({
        base: sender,
        quote: receiver,
        rate: latestRate,
        difference,
        direction,
      })
    }

    return result
  })
