import type { HistoryEntry } from '#/lib/history/helpers'
import { createServerFn } from '@tanstack/react-start'
import { OPEN_API_URL, schema } from '../config'
import { FrankfurterRateSchema } from '../validation'
import { getOrFetch } from './cache'

export const getFrankfurterHistory = createServerFn()
  .validator(schema)
  .handler(async ({ data: input }) => {
    const { base, quote, days, endDate: endDateStr } = input

    const fmt = (d: Date) => d.toISOString().split('T')[0]
    const endDate = endDateStr ? new Date(endDateStr + 'T23:59:59Z') : new Date()
    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - days)

    const cacheKey = `frankfurter:history:${base}/${quote}/${days}/${endDateStr ?? fmt(new Date())}`
    const ttl = 60 * 60 * 1000 // 1 hour

    return getOrFetch<HistoryEntry[]>(
      cacheKey,
      async () => {
        const ffUrl = new URL(`${OPEN_API_URL}/v2/rates`)
        ffUrl.searchParams.set('base', base)
        ffUrl.searchParams.set('quotes', quote)
        ffUrl.searchParams.set('from', fmt(startDate))
        ffUrl.searchParams.set('to', fmt(endDate))
        const res = await fetch(ffUrl, { signal: AbortSignal.timeout(10_000) })

        if (!res.ok) {
          throw new Error(`Failed to fetch history for ${base}/${quote}`)
        }

        const raw: unknown = await res.json()
        if (!Array.isArray(raw)) throw new Error('Invalid Frankfurter history')
        const data = raw.map((r) => FrankfurterRateSchema.parse(r))

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
