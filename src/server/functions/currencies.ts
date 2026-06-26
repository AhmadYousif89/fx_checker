import { createServerFn } from '@tanstack/react-start'

import type { CurrencyDetails } from '#/types/currency'

export const getCurrencies = createServerFn().handler(async () => {
  const response = await fetch('https://api.frankfurter.dev/v2/currencies')

  if (!response.ok) {
    throw new Error('Failed to fetch currencies')
  }

  const result = await response.json()

  return result as CurrencyDetails[]
})
