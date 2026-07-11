import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

class MockIntersectionObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)

vi.mock('#/server/functions/currencies', () => ({
  getCurrencies: vi.fn(),
}))

vi.mock('#/server/functions/latest-rates', () => ({
  getLatestRates: vi.fn(),
}))

vi.mock('#/server/functions/history', () => ({
  getTweleveHistory: vi.fn(),
  getFrankfurterHistory: vi.fn(),
}))

vi.mock('#/server/functions/rates', () => ({
  getRates: vi.fn(),
}))

vi.mock('#/server/functions/favorite-rates', () => ({
  getFavoriteRates: vi.fn(),
}))

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useSearch: ({ select }: { select: any }) => {
      const params = { from: 'USD', to: 'EUR', amount: '1', view: '3m' }
      return select ? select(params) : params
    },
    Link: ({
      children,
      ...props
    }: {
      children: React.ReactNode
      to: string
    }) => <a {...props}>{children}</a>,
  }
})
