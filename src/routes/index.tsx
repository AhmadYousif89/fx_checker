import { createFileRoute, redirect } from '@tanstack/react-router'

import { Main } from '#/main'
import { Header } from '#/header'
import { Footer } from '#/footer'
import { TopLoader } from '#/components/top-loader'
import { NotificationToaster } from '#/lib/notifications'
import { getRates } from '#/server/functions/rates'
import { getCurrencies } from '#/server/functions/currencies'
import { getFrankfurterHistory } from '#/server/functions/frankfurter-history'
import { sanitizeCurrencySearch, searchSchema } from '#/lib/search'
import { RANGE_INTERVALS, TIME_RANGES } from '#/lib/history/config'
import type { RangeKey } from '#/lib/history/config'
import { getTweleveHistory } from '#/server/functions/twelve-history'

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
    const { from, to } = sanitized

    if (
      (search.from && search.from !== from) ||
      (search.to && search.to !== to)
    ) {
      throw redirect({
        to: '/',
        search: { ...search, from, to },
      })
    }

    const view = (search.view ?? '3m') as RangeKey
    const isIntraday = view === '1d' || view === '1w'
    const days = TIME_RANGES[view]
    const interval = RANGE_INTERVALS[view]

    await Promise.all([
      isIntraday
        ? context.queryClient.prefetchQuery({
            queryKey: ['tweleve-history', from, to, view],
            queryFn: () =>
              getTweleveHistory({
                data: { base: from, quote: to, days, interval },
              }),
            staleTime: 1000 * 60 * 60,
            gcTime: 1000 * 60 * 60 * 24,
          })
        : context.queryClient.prefetchQuery({
            queryKey: ['frankfurter-history', from, to, view],
            queryFn: () =>
              getFrankfurterHistory({ data: { base: from, quote: to, days } }),
            staleTime: 1000 * 60 * 60,
            gcTime: 1000 * 60 * 60 * 24,
          }),
      context.queryClient.prefetchQuery({
        queryKey: ['rates', from],
        queryFn: () => getRates({ data: { base: from } }),
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
      <NotificationToaster />
      <Header />
      <TopLoader />
      <Main />
      <Footer />
    </>
  )
}
