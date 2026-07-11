import { z } from 'zod'
import { createServerFn } from '@tanstack/react-start'

import { OPEN_API_URL } from '../config'
import { FrankfurterRateSchema, currencyCode } from '../validation'
import type { LatestRatesEntry } from '#/types/currency'

export const getLatestRates = createServerFn()
  .validator(z.object({ base: currencyCode }).optional())
  .handler(async ({ data }) => {
    const url = new URL(`${OPEN_API_URL}/v2/rates`)
    url.searchParams.set('base', data?.base ?? 'EUR')
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) })

    if (!res.ok) {
      throw new Error('Failed to fetch latest rates')
    }

    const raw: unknown = await res.json()
    if (!Array.isArray(raw)) throw new Error('Invalid latest rates response')
    const resData = raw.map((r) => FrankfurterRateSchema.parse(r))
    const rates = new Map<string, LatestRatesEntry>()

    for (const r of resData) rates.set(r.quote, { rate: r.rate, date: r.date })

    return rates
  })
