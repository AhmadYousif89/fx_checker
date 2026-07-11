import { z } from 'zod'
import { createServerFn } from '@tanstack/react-start'

import { OPEN_API_URL } from '../config'
import type { FrankfurterApiRate, LatestRatesEntry } from '#/types/currency'
import { currencyCode } from '../validation'

export const getLatestRates = createServerFn()
  .validator(z.object({ base: currencyCode }).optional())
  .handler(async ({ data }) => {
    const url = new URL(`${OPEN_API_URL}/v2/rates`)
    url.searchParams.set('base', data?.base ?? 'EUR')
    const res = await fetch(url)

    if (!res.ok) {
      throw new Error('Failed to fetch latest rates')
    }

    const resData = (await res.json()) as FrankfurterApiRate[]
    const rates = new Map<string, LatestRatesEntry>()

    for (const r of resData) rates.set(r.quote, { rate: r.rate, date: r.date })

    return rates
  })
