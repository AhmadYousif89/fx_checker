import { useQuery } from '@tanstack/react-query'

import { getLatestRates } from '#/server/functions/latest-rates'

export function useLatestRates() {
  return useQuery({
    queryKey: ['latest-rates'],
    queryFn: () => getLatestRates(),
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60 * 24,
    refetchInterval: 1000 * 60 * 15,
  })
}
