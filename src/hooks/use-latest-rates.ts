import { useQuery } from '@tanstack/react-query'

import { getLatestRates } from '#/server/functions/latest-rates'

export function useLatestRates(base = 'EUR') {
  return useQuery({
    queryKey: ['latest-rates', base],
    queryFn: () => getLatestRates({ data: { base } }),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
    refetchInterval: 1000 * 60 * 10,
  })
}
