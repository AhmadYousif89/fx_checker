import { useQuery } from '@tanstack/react-query'

import { getRateLimiterStatus } from '#/server/functions/rate-limiter'

export function useRateLimiterStatus(enabled: boolean) {
  return useQuery({
    queryKey: ['rate-limiter-status'],
    queryFn: () => getRateLimiterStatus(),
    enabled,
    refetchInterval: 1_000,
    staleTime: 0,
    gcTime: 0,
  })
}
