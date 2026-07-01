import { z } from 'zod'
import { createServerFn } from '@tanstack/react-start'

import { OPEN_API_URL } from '../config'
import type { FrankfurterApiRate } from '#/types/currency'

export const getLatestRates = createServerFn()
  .validator(z.object({ base: z.string() }).optional())
  .handler(async ({ data }) => {
    const res = await fetch(
      `${OPEN_API_URL}/v2/rates?base=${data?.base ?? 'EUR'}`,
    )

    if (!res.ok) {
      throw new Error('Failed to fetch latest rates')
    }

    const resData = (await res.json()) as FrankfurterApiRate[]
    const rates = new Map<string, number>()

    for (const r of resData) rates.set(r.quote, r.rate)

    const result = { date: resData[0]?.date ?? '', rates }

    return result
  })
