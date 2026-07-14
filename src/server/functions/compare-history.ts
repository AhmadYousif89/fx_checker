import { z } from 'zod'
import { createServerFn } from '@tanstack/react-start'

import { getTweleveHistory } from './twelve-history'
import { getFrankfurterHistory } from './frankfurter-history'
import { TDI } from '../config'
import { currencyCode, daysParam } from '../validation'
import { MAX_CHART_PICKS } from '#/main/compare/compare-chart.types'
import type { HistoryEntry } from '#/lib/history/helpers'

const compareSchema = z.object({
  base: currencyCode,
  quotes: z.array(currencyCode).min(1).max(MAX_CHART_PICKS),
  days: daysParam.default(30),
  interval: z.enum(TDI).default('1day'),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
})

export type CompareHistoryInput = z.infer<typeof compareSchema>

export const getCompareHistory = createServerFn()
  .validator(compareSchema)
  .handler(async ({ data }) => {
    const { base, quotes, days, interval, endDate } = data

    const isIntraday = interval !== '1day'

    const results = await Promise.all(
      quotes.map(async (quote) => {
        if (isIntraday) {
          const history = await getTweleveHistory({
            data: { base, quote, days, interval, endDate },
          })
          return { quote, data: history }
        }
        const history = await getFrankfurterHistory({
          data: { base, quote, days, endDate },
        })
        return { quote, data: history }
      }),
    )

    const record: Record<string, HistoryEntry[] | undefined> = {}
    for (const { quote, data: history } of results) {
      record[quote] = history
    }
    return record
  })
