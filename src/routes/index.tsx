import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'

import { getHistory } from '#/server/functions/history'
import { Header } from '#/header'
import { Main } from '#/main'
import { getRates } from '#/server/functions/rates'
import { getCurrencies } from '#/server/functions/currencies'

const searchSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  amount: z.string().optional(),
  date: z.string().optional(),
})

export const Route = createFileRoute('/')({
  validateSearch: searchSchema,
  beforeLoad: async ({ context, search }) => {
    const from = search.from ?? 'USD'
    const to = search.to ?? 'EUR'
    const days = 30
    await Promise.all([
      context.queryClient.prefetchQuery({
        queryKey: ['history', from, to, days],
        queryFn: () => getHistory({ data: { base: from, quote: to, days } }),
        staleTime: 1000 * 60 * 5,
      }),
      context.queryClient.prefetchQuery({
        queryKey: ['rates'],
        queryFn: () => getRates(),
        staleTime: 1000 * 60 * 15,
      }),
      context.queryClient.prefetchQuery({
        queryKey: ['currencies'],
        queryFn: () => getCurrencies(),
        staleTime: 1000 * 60 * 15,
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
