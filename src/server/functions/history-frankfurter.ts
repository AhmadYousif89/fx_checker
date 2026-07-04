import { z } from 'zod'
import { createServerFn } from '@tanstack/react-start'

import { getOrFetch } from './cache'
import { OPEN_API_URL } from '../config'
import type { FrankfurterApiRate } from '#/types/currency'

const schema = z.object({
  base: z.string(),
  quote: z.string(),
  days: z.number().min(1).default(30),
})

export type FrankfurterHistoryInput = z.infer<typeof schema>

type HistoryEntry = {
  time: string
  close: number
  open: number
  high: number
  low: number
}

export const getFrankfurterHistory = createServerFn()
  .validator(schema)
  .handler(async ({ data: input }) => {
    const { base, quote, days } = input

    const endDate = new Date()
    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - days)

    const fmt = (d: Date) => d.toISOString().split('T')[0]

    const cacheKey = `frankfurter:history:${base}/${quote}/${days}`
    const ttl = 24 * 60 * 60 * 1000

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
