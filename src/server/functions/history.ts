import { z } from 'zod'
import { createServerFn } from '@tanstack/react-start'

import { getOrFetch } from './cache'
import {
  computeOutputSize,
  computeHistoryCrossRate,
  invertData,
} from '#/lib/history-helpers'
import type { HistoryEntry } from '#/lib/history-helpers'
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

async function fetchSymbolTimeSeries(
  symbol: string,
  days: number,
  interval: string,
  ttl: number,
): Promise<HistoryEntry[]> {
  const cacheKey = `td:${symbol}/${days}/${interval}`
  const outputsize = computeOutputSize(days, interval)

  return getOrFetch<HistoryEntry[]>(
    cacheKey,
    async () => {
      await twelveDataBucket.acquire()
      const res = await fetch(
        `${TWELVE_DATA_API_URL}/time_series?symbol=${encodeURIComponent(symbol)}&interval=${interval}&outputsize=${outputsize}&timezone=UTC&apikey=${TWELVE_DATA_API_KEY}`,
      )

      if (!res.ok) {
        throw new Error(`Failed to fetch history for ${symbol}`)
      }

      const data = (await res.json()) as TwelveDataApiRate

      if (!Array.isArray(data.values) || data.values.length === 0) {
        throw new Error(`Failed to fetch history for ${symbol}`)
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
}

async function fetchCurrencyVsUSD(
  currency: string,
  days: number,
  interval: string,
  ttl: number,
): Promise<HistoryEntry[]> {
  try {
    return await fetchSymbolTimeSeries(`${currency}/USD`, days, interval, ttl)
  } catch {
    const data = await fetchSymbolTimeSeries(
      `USD/${currency}`,
      days,
      interval,
      ttl,
    )
    return invertData(data)
  }
}

export const getHistory = createServerFn()
  .validator(schema)
  .handler(async ({ data: input }) => {
    const { base, quote, days, interval } = input
    const ttl = TTL_BY_INTERVAL[interval] ?? 15 * 60 * 1000

    const cacheKey = `history:${base}/${quote}/${days}/${interval}`

    return getOrFetch<HistoryEntry[]>(
      cacheKey,
      async () => {
        if (quote === 'USD') {
          return fetchSymbolTimeSeries(`${quote}/${base}`, days, interval, ttl)
        }

        if (base === 'USD') {
          return fetchSymbolTimeSeries(`${base}/${quote}`, days, interval, ttl)
        }

        const [baseData, quoteData] = await Promise.all([
          fetchCurrencyVsUSD(base, days, interval, ttl),
          fetchCurrencyVsUSD(quote, days, interval, ttl),
        ])
        return computeHistoryCrossRate(baseData, quoteData)
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
