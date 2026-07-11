import { z } from 'zod'
import { createServerFn } from '@tanstack/react-start'

import { OPEN_API_URL } from '../config'
import { getCrossRateAtDate, getRateAtDate } from '#/lib/currency/rates'
import type { FrankfurterApiRate, RateWithDiff } from '#/types/currency'

export const getFavoriteRates = createServerFn()
  .validator(
    z.array(z.object({ sender: z.string(), receiver: z.string() })).min(1),
  )
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

async function getHistoricalRates(): Promise<FrankfurterApiRate[]> {
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

  return (await response.json()) as FrankfurterApiRate[]
}
