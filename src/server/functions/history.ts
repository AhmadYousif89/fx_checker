import { z } from 'zod'
import { createServerFn } from '@tanstack/react-start'

import { getOrFetch } from './cache'
import { computeOutputSize } from '#/lib/history-helpers'
import type { FrankfurterApiRate, TwelveDataApiRate } from '#/types/currency'
import { twelveDataBucket } from '../rate-limiter'
import {
  TWELVE_DATA_API_URL,
  TWELVE_DATA_API_KEY,
  TTL_BY_INTERVAL,
  TDI,
  OPEN_API_URL,
} from '../config'

const schema = z.object({
  base: z.string(),
  quote: z.string(),
  days: z.number().min(1).default(30),
  interval: z.enum(TDI).default('1day'),
})

export type HistoryInput = z.infer<typeof schema>

type HistoryEntry = {
  time: string
  close: number
  open: number
  high: number
  low: number
}

export const getHistory = createServerFn()
  .validator(schema)
  .handler(async ({ data: input }) => {
    const { base, quote, days, interval } = input
    const cacheKey = `history:${base}/${quote}/${days}/${interval}`
    const ttl = TTL_BY_INTERVAL[interval] ?? 15 * 60 * 1000 // default to 15 mins if undefined

    return getOrFetch<HistoryEntry[]>(
      cacheKey,
      async () => {
        await twelveDataBucket.acquire() // Acquire a token from the rate limiter before making the API request
        const outputsize = computeOutputSize(days, interval)

        const res = await fetch(
          `${TWELVE_DATA_API_URL}/time_series/cross?base=${base}&quote=${quote}&interval=${interval}&outputsize=${outputsize}&timezone=UTC&apikey=${TWELVE_DATA_API_KEY}`,
        )

        if (!res.ok) {
          throw new Error(`Failed to fetch history for ${base}/${quote}`)
        }

        const data = (await res.json()) as TwelveDataApiRate

        if (!Array.isArray(data.values) || data.values.length === 0) {
          throw new Error(`Failed to fetch history for ${base}/${quote}`)
        }

        const values = data.values.reverse()
        return values.map((v) => ({
          time: v.datetime,
          close: parseFloat(v.close),
          open: parseFloat(v.open),
          high: parseFloat(v.high),
          low: parseFloat(v.low),
        }))
      },
      ttl,
    )
  })

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
        const res = await fetch(
          `${OPEN_API_URL}/v2/rates?base=${base}&quotes=${quote}&from=${fmt(startDate)}&to=${fmt(endDate)}`,
        )

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
