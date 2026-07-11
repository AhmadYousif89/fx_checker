import { z } from 'zod'
import { createServerFn } from '@tanstack/react-start'

import { getOrFetch } from './cache'
import {
  invertData,
  computeOutputSize,
  computeHistoryCrossRate,
} from '#/lib/history/helpers'
import type { HistoryEntry } from '#/lib/history/helpers'
import { twelveDataBucket } from '../rate-limiter'
import {
  TWELVE_DATA_API_URL,
  TWELVE_DATA_API_KEY,
  TTL_BY_INTERVAL,
  TDI,
} from '../config'
import {
  currencyCode,
  daysParam,
  TwelveDataResponseSchema,
} from '../validation'

class UnsupportedPairError extends Error {
  constructor(symbol: string) {
    super(`Unsupported pair: ${symbol}`)
    this.name = 'UnsupportedPairError'
  }
}

const schema = z.object({
  base: currencyCode,
  quote: currencyCode,
  days: daysParam.default(30),
  interval: z.enum(TDI).default('1day'),
})

export type HistoryInput = z.infer<typeof schema>

const FETCH_TIMEOUT = 10_000

async function fetchWithRetry(url: URL, maxRetries = 3): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const signal = AbortSignal.timeout(FETCH_TIMEOUT)
    const res = await fetch(url, { signal })
    if (res.status !== 429) return res
    const retryAfter = res.headers.get('Retry-After')
    const delayMs = retryAfter
      ? parseInt(retryAfter, 10) * 1000
      : Math.min(1000 * Math.pow(2, attempt) + Math.random() * 500, 10_000)
    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }
  const signal = AbortSignal.timeout(FETCH_TIMEOUT)
  return fetch(url, { signal })
}

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
      const tdUrl = new URL(`${TWELVE_DATA_API_URL}/time_series`)
      tdUrl.searchParams.set('symbol', symbol)
      tdUrl.searchParams.set('interval', interval)
      tdUrl.searchParams.set('outputsize', String(outputsize))
      tdUrl.searchParams.set('timezone', 'UTC')
      tdUrl.searchParams.set('apikey', TWELVE_DATA_API_KEY ?? '')
      const res = await fetchWithRetry(tdUrl)

      if (!res.ok) {
        if (res.status === 404) throw new UnsupportedPairError(symbol)
        throw new Error(`Failed to fetch history for ${symbol}`)
      }

      const raw: unknown = await res.json()
      const data = TwelveDataResponseSchema.parse(raw)

      const values = data.values.reverse()
      return values.map((v) => ({
        time: v.datetime,
        close: v.close,
        open: v.open,
        high: v.high,
        low: v.low,
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
  } catch (err) {
    if (err instanceof UnsupportedPairError) {
      const data = await fetchSymbolTimeSeries(
        `USD/${currency}`,
        days,
        interval,
        ttl,
      )
      return invertData(data)
    }
    throw err
  }
}

export const getTweleveHistory = createServerFn()
  .validator(schema)
  .handler(async ({ data: input }) => {
    const { base, quote, days, interval } = input
    const ttl = TTL_BY_INTERVAL[interval] ?? 15 * 60 * 1000

    const cacheKey = `history:${base}/${quote}/${days}/${interval}`

    return getOrFetch<HistoryEntry[]>(
      cacheKey,
      async () => {
        // Try direct pair first, fall back to inverted on unsupported-symbol
        const tryDirect = async () => {
          try {
            return await fetchSymbolTimeSeries(
              `${base}/${quote}`,
              days,
              interval,
              ttl,
            )
          } catch (err) {
            if (err instanceof UnsupportedPairError) {
              const data = await fetchSymbolTimeSeries(
                `${quote}/${base}`,
                days,
                interval,
                ttl,
              )
              return invertData(data)
            }
            throw err
          }
        }

        if (quote === 'USD' || base === 'USD') {
          return tryDirect()
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
