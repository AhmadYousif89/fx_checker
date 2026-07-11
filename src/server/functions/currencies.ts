import { createServerFn } from '@tanstack/react-start'

import { getOrFetch } from './cache'
import { CurrencyDetailsSchema } from '../validation'
import type { CurrencyDetails } from '#/types/currency'

export const getCurrencies = createServerFn().handler(async () => {
  return getOrFetch<CurrencyDetails[]>(
    'currencies',
    async () => {
      const response = await fetch('https://api.frankfurter.dev/v2/currencies', {
        signal: AbortSignal.timeout(10_000),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch currencies')
      }

      const raw: unknown = await response.json()
      if (typeof raw !== 'object' || raw === null) {
        throw new Error('Invalid currencies response')
      }

      return Object.values(raw).map((v) => CurrencyDetailsSchema.parse(v))
    },
    1000 * 60 * 60, // 1 hour TTL
  )
})
