import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'

import { Header } from '#/header'
import { Main } from '#/main'

const searchSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  amount: z.string().optional(),
  date: z.string().optional(),
})

export const Route = createFileRoute('/')({
  validateSearch: searchSchema,
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
