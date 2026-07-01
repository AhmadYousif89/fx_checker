import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'

import { TIME_RANGES, RANGE_INTERVALS } from '#/lib/currency'
import { getHistory } from '#/server/functions/history'
import { Header } from '#/header'
import { Main } from '#/main'
import { getRates } from '#/server/functions/rates'
import { getCurrencies } from '#/server/functions/currencies'

const searchSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  amount: z.string().optional(),
  view: z.string().optional(),
})

export const Route = createFileRoute('/')({
  validateSearch: searchSchema,
  beforeLoad: async ({ context, search }) => {
    const from = search.from ?? 'USD'
    const to = search.to ?? 'EUR'
    const rangeKeys = ['3m']

    await Promise.all([
      ...rangeKeys.map((key) =>
        context.queryClient.prefetchQuery({
          queryKey: ['history', from, to, key],
          queryFn: () =>
            getHistory({
              data: {
                base: from,
                quote: to,
                days: TIME_RANGES[key],
                interval: RANGE_INTERVALS[key],
              },
            }),
          staleTime: 1000 * 60 * 15, // 15 minutes
        }),
      ),
      context.queryClient.prefetchQuery({
        queryKey: ['rates'],
        queryFn: () => getRates(),
        staleTime: 1000 * 60 * 10, // 10 minutes
      }),
      context.queryClient.prefetchQuery({
        queryKey: ['currencies'],
        queryFn: () => getCurrencies(),
        staleTime: 1000 * 60 * 60, // 1 hour
      }),
    ])
  },
  component: Home,
})

function Home() {
  return (
    <>
      <Header />
      <Main />
    </>
  )
}
