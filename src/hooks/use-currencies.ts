import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { FLAG_CODE_SET } from '#/lib/currency'
import { getCurrencies } from '#/server/functions/currencies'

export function useCurrenciesQuery() {
  const query = useQuery({
    queryKey: ['currencies'],
    queryFn: () => getCurrencies(),
    staleTime: 1000 * 60 * 60 * 12,
    gcTime: 1000 * 60 * 60 * 24,
  })

  const currencies = useMemo(
    () =>
      query.data?.filter((c) =>
        FLAG_CODE_SET.has(c.iso_code.slice(0, 2).toLowerCase()),
      ) ?? [],
    [query.data],
  )

  return { ...query, currencies, totalCurrencies: currencies.length }
}
