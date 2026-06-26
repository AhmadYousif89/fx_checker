import { z } from 'zod'
import { createServerFn } from '@tanstack/react-start'
import { OPEN_API_URL } from '../config'

import type { ApiRate } from '#/types/currency'

export const getHistory = createServerFn()
  .validator(
    z.object({
      base: z.string(),
      quote: z.string(),
      days: z.number().min(1).max(Infinity).default(30),
    }),
  )
  .handler(async ({ data: input }) => {
    const { base, quote, days } = input
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)

    const format = (d: Date) => d.toISOString().split('T')[0]

    const res = await fetch(
      `${OPEN_API_URL}/v2/rates?base=${base}&from=${format(startDate)}&to=${format(endDate)}`,
    )

    if (!res.ok) {
      throw new Error(`Failed to fetch history for ${base}/${quote}`)
    }

    const data = (await res.json()) as ApiRate[]

    // Filter to only the quote currency and map to { date, rate }
    const filtered = data
      .filter((r) => r.quote === quote)
      .map((r) => ({ date: r.date, rate: r.rate }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return filtered
  })
