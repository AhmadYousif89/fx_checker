import { useQuery } from '@tanstack/react-query'

import { getRate } from '#/server/functions/rate'

export function useRate(base: string, quote: string) {
  return useQuery({
    queryKey: ['rate', base, quote],
    queryFn: () => getRate({ data: { base, quote } }),
    enabled: !!base && !!quote && base !== quote,
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60 * 24,
    refetchInterval: 1000 * 60 * 15,
  })
}
