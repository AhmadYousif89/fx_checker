import { createFileRoute, redirect } from '@tanstack/react-router'

import { Main } from '#/main'
import { Header } from '#/header'
import { Footer } from '#/footer'
import { TopLoader } from '#/components/top-loader'
import { getRates } from '#/server/functions/rates'
import { getCurrencies } from '#/server/functions/currencies'
import { getFrankfurterHistory } from '#/server/functions/frankfurter-history'
import { sanitizeCurrencySearch, searchSchema } from '#/lib/search'
import { TIME_RANGES } from '#/lib/history/config'

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
        queryKey: ['frankfurter-history', sanitized.from, sanitized.to, '3m'],
        queryFn: () =>
          getFrankfurterHistory({
            data: {
              base: sanitized.from,
              quote: sanitized.to,
              days: TIME_RANGES['3m'],
            },
          }),
        staleTime: 1000 * 60 * 60,
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
      }),
      context.queryClient.prefetchQuery({
        queryKey: ['rates', sanitized.from],
        queryFn: () => getRates({ data: { base: sanitized.from } }),
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
      <TopLoader />
      <Main />
      <Footer />
    </>
  )
}
