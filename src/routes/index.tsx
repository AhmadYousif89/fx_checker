import { createFileRoute, redirect } from '@tanstack/react-router'

import { Main } from '#/main'
import { Header } from '#/header'
import { Footer } from '#/footer'
import { getRates } from '#/server/functions/rates'
import { getHistory } from '#/server/functions/history'
import { getCurrencies } from '#/server/functions/currencies'
import { TIME_RANGES, RANGE_INTERVALS } from '#/lib/currency'
import { sanitizeCurrencySearch, searchSchema } from '#/lib/currency/search'

export const Route = createFileRoute('/')({
  validateSearch: searchSchema,
  beforeLoad: async ({ context, search }) => {
    const currencies = await context.queryClient.fetchQuery({
      queryKey: ['currencies'],
      queryFn: () => getCurrencies(),
      staleTime: 1000 * 60 * 60, // 1 hour
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    })

    const sanitized = sanitizeCurrencySearch(search, currencies)

    if (
      (search.from && search.from !== sanitized.from) ||
      (search.to && search.to !== sanitized.to)
    ) {
      throw redirect({
        to: '/',
        search: { ...search, from: sanitized.from, to: sanitized.to },
      })
    }

    await Promise.all([
      context.queryClient.prefetchQuery({
        queryKey: ['history', sanitized.from, sanitized.to, '3m'],
        queryFn: () =>
          getHistory({
            data: {
              base: sanitized.from,
              quote: sanitized.to,
              days: TIME_RANGES['3m'],
              interval: RANGE_INTERVALS['3m'],
            },
          }),
        staleTime: 1000 * 60 * 15, // 15 minutes
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
      }),
      context.queryClient.prefetchQuery({
        queryKey: ['rates'],
        queryFn: () => getRates(),
        staleTime: 1000 * 60 * 10, // 10 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
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
      <Footer />
    </>
  )
}
