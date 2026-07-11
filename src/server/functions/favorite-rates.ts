import { createServerFn } from '@tanstack/react-start'

import { pairArray } from '../validation'
import type { DegradedResponse, RateWithDiff } from '#/types/currency'
import { getHistoricalRates } from './history-rates'
import { getCrossRateAtDate, getRateAtDate } from '#/lib/currency/rates'

export const getFavoriteRates = createServerFn()
  .validator(pairArray)
  .handler(
    async ({ data: pairs }): Promise<DegradedResponse<RateWithDiff[]>> => {
      const rates = await getHistoricalRates()

      const uniqueDates = Array.from(new Set(rates.map((r) => r.date))).sort(
        (a, b) => b.localeCompare(a),
      )

      const completeDates = uniqueDates.filter(
        (date) => rates.filter((r) => r.date === date).length > 20,
      )

      const result: RateWithDiff[] = []

      for (const { sender, receiver } of pairs) {
        // Per-pair date selection: latest and previous where BOTH have data
        let latestDate: string | null = null
        let previousDate: string | null = null

        for (const date of completeDates) {
          if (
            getRateAtDate(rates, date, sender) !== null &&
            getRateAtDate(rates, date, receiver) !== null
          ) {
            if (latestDate === null) {
              latestDate = date
            } else {
              previousDate = date
              break
            }
          }
        }

        if (!latestDate) continue

        const latestRate = getCrossRateAtDate(
          rates,
          latestDate,
          sender,
          receiver,
        )
        if (latestRate === null) continue

        let difference: number | null = null
        let direction: 'up' | 'down' | 'flat' | 'unknown' = 'unknown'

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
              difference > 0.0001
                ? 'up'
                : difference < -0.0001
                  ? 'down'
                  : 'flat'
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

      return { data: result, degraded: false }
    },
  )
