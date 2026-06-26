import { useQuery } from '@tanstack/react-query'
import { getRates } from '#/server/functions/rates'

export const useLiveTicker = () => {
  return useQuery({
    queryKey: ['rates'],
    queryFn: () => getRates(),
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchInterval: 1000 * 60 * 15,
    refetchIntervalInBackground: false,
  })
}
