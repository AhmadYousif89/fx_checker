import { z } from 'zod'
import { createServerFn } from '@tanstack/react-start'
import { OPEN_API_URL } from '../config'

import type { ApiRate } from '#/types/currency'

export const getRate = createServerFn()
  .validator(
    z.object({
      base: z.string(),
      quote: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const { base, quote } = data
    const response = await fetch(`${OPEN_API_URL}/v2/rate/${base}/${quote}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch rate for ${base}/${quote}`)
    }

    const result: ApiRate = await response.json()
    return result
  })
