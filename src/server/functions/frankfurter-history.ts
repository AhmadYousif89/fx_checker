import type { HistoryEntry } from '#/lib/history/helpers'
import type { FrankfurterApiRate } from '#/types/currency'
import { createServerFn } from '@tanstack/react-start'
import { OPEN_API_URL, schema } from '../config'
import { getOrFetch } from './cache'

export const getFrankfurterHistory = createServerFn()
  .validator(schema)
  .handler(async ({ data: input }) => {
    const { base, quote, days } = input

    const endDate = new Date()
    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - days)

    const fmt = (d: Date) => d.toISOString().split('T')[0]

    const cacheKey = `frankfurter:history:${base}/${quote}/${days}`
    const ttl = 24 * 60 * 60 * 1000 // 1 day

    return getOrFetch<HistoryEntry[]>(
      cacheKey,
      async () => {
        const ffUrl = new URL(`${OPEN_API_URL}/v2/rates`)
        ffUrl.searchParams.set('base', base)
        ffUrl.searchParams.set('quotes', quote)
        ffUrl.searchParams.set('from', fmt(startDate))
        ffUrl.searchParams.set('to', fmt(endDate))
        const res = await fetch(ffUrl)

        if (!res.ok) {
          throw new Error(`Failed to fetch history for ${base}/${quote}`)
        }

        const data = (await res.json()) as FrankfurterApiRate[]

        return data.map((entry) => ({
          time: entry.date,
          close: entry.rate,
          open: entry.rate,
          high: entry.rate,
          low: entry.rate,
        }))
      },
      ttl,
    )
  })
