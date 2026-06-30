import { useQuery } from '@tanstack/react-query'
import { getRates } from '#/server/functions/rates'

export const useLiveTicker = (base: string = 'USD') => {
  return useQuery({
    queryKey: ['rates', base],
    queryFn: () => getRates({ data: { base } }),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
    refetchInterval: 1000 * 60 * 10,
    refetchIntervalInBackground: false,
  })
}
