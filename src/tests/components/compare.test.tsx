import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { getLatestRates } from '#/server/functions/latest-rates'
import { getCurrencies } from '#/server/functions/currencies'
import { useCurrencyStore } from '#/store/currencies.store'
import { CompareSection } from '#/main/compare'

vi.mock('#/hooks/use-update-url', () => ({
  useUpdateUrl: () => vi.fn(),
}))

function renderWithQuery(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>)
}

afterEach(cleanup)

beforeEach(() => {
  vi.mocked(getLatestRates).mockResolvedValue({
    date: '2024-01-15',
    rates: new Map([
      ['USD', 1.1],
      ['GBP', 0.85],
      ['JPY', 130],
      ['CHF', 0.95],
      ['CAD', 1.25],
      ['AUD', 1.35],
    ]),
  })
  vi.mocked(getCurrencies).mockResolvedValue([
    {
      name: 'US Dollar',
      symbol: '$',
      iso_code: 'USD',
      iso_numeric: '840',
      start_date: '',
      end_date: '',
    },
    {
      name: 'Euro',
      symbol: '€',
      iso_code: 'EUR',
      iso_numeric: '978',
      start_date: '',
      end_date: '',
    },
    {
      name: 'British Pound',
      symbol: '£',
      iso_code: 'GBP',
      iso_numeric: '826',
      start_date: '',
      end_date: '',
    },
    {
      name: 'Japanese Yen',
      symbol: '¥',
      iso_code: 'JPY',
      iso_numeric: '392',
      start_date: '',
      end_date: '',
    },
  ])
  useCurrencyStore.setState({
    favorites: [],
    logs: [],
    recent: { from: [], to: [] },
  })
})

describe('CompareSection', () => {
  it('renders heading with amount and sender', async () => {
    renderWithQuery(<CompareSection />)
    expect(await screen.findByText(/from USD/)).toBeInTheDocument()
  })

  it('renders compare pairs', async () => {
    renderWithQuery(<CompareSection />)
    expect(await screen.findByText(/pairs/)).toBeInTheDocument()
  })

  it('shows error when rates fail to load', async () => {
    vi.mocked(getLatestRates).mockRejectedValue(new Error('fail'))
    renderWithQuery(<CompareSection />)
    expect(
      await screen.findByText('Something went wrong, try again later'),
    ).toBeInTheDocument()
  })

  it('shows loading skeleton initially', () => {
    vi.mocked(getLatestRates).mockImplementation(() => new Promise(() => {}))
    renderWithQuery(<CompareSection />)
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })
})
