import { z } from 'zod'
import { createServerFn } from '@tanstack/react-start'
import { OPEN_API_URL } from '../config'

import type { ApiRate } from '#/types/currency'

export const convert = createServerFn()
  .validator(
    z.object({
      base: z.string(),
      quote: z.string(),
      amount: z.number(),
    }),
  )
  .handler(async ({ data }) => {
    const { base, quote, amount } = data
    const response = await fetch(`${OPEN_API_URL}/v2/rate/${base}/${quote}`)
    const { rate }: ApiRate = await response.json()
    return (amount * rate).toFixed(2)
  })
