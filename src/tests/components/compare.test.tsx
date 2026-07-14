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
  vi.mocked(getLatestRates).mockResolvedValue(
    new Map([
      ['USD', { rate: 1.1, date: '2024-01-15' }],
      ['GBP', { rate: 0.85, date: '2024-01-15' }],
      ['JPY', { rate: 130, date: '2024-01-15' }],
      ['CHF', { rate: 0.95, date: '2024-01-15' }],
      ['CAD', { rate: 1.25, date: '2024-01-15' }],
      ['AUD', { rate: 1.35, date: '2024-01-15' }],
    ]),
  )
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
    logs: { entries: [], lastTimestamp: null, sortField: 'date', sortDir: 'desc' },
    favorites: { pairs: [], lastAddedKey: null },
    conversion: { recent: { from: [], to: [] }, activePicker: null, lastActivePicker: null },
    compare: { view: 'table', tablePicks: [], chartPicks: [], chartRange: '3m' },
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
