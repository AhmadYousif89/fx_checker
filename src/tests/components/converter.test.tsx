import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'

import { getLatestRates } from '#/server/functions/latest-rates'
import { useCurrencyStore } from '#/store/currencies.store'
import { RateConverter } from '#/main/converter.section'

vi.mock('#/hooks/use-update-url', () => ({
  useUpdateUrl: () => vi.fn(),
}))

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return (
    <QueryClientProvider client={qc}>
      <TooltipProvider>{children}</TooltipProvider>
    </QueryClientProvider>
  )
}

function renderWithProviders(ui: React.ReactElement) {
  return render(ui, { wrapper: Wrapper })
}

afterEach(cleanup)

beforeEach(() => {
  vi.mocked(getLatestRates).mockResolvedValue(
    new Map([
      ['USD', { rate: 1.1, date: '2024-01-15' }],
      ['GBP', { rate: 0.85, date: '2024-01-15' }],
      ['JPY', { rate: 130, date: '2024-01-15' }],
    ]),
  )
  useCurrencyStore.setState({
    logs: { entries: [], lastTimestamp: null, sortField: 'date', sortDir: 'desc' },
    favorites: { pairs: [], lastAddedKey: null },
    conversion: { recent: { from: [], to: [] }, activePicker: null, lastActivePicker: null },
    compare: { view: 'table', tablePicks: [], chartPicks: [], chartRange: '3m' },
  })
})

describe('RateConverter', () => {
  it('renders send and receive fields', () => {
    renderWithProviders(<RateConverter />)
    expect(screen.getByText('Send')).toBeInTheDocument()
    expect(screen.getByText('Receive')).toBeInTheDocument()
  })

  it('renders the swap button', () => {
    renderWithProviders(<RateConverter />)
    expect(
      screen.getByLabelText('Swap send and receive currencies'),
    ).toBeInTheDocument()
  })

  it('renders favorite button', async () => {
    renderWithProviders(<RateConverter />)
    expect(await screen.findByText('Favorite')).toBeInTheDocument()
  })

  it('renders log conversion button', async () => {
    renderWithProviders(<RateConverter />)
    expect(await screen.findByText('Log conversion')).toBeInTheDocument()
  })

  it('shows rate information when data loads', async () => {
    renderWithProviders(<RateConverter />)
    const rateText = await screen.findByText(/^1 USD =/, { selector: 'span' })
    expect(rateText).toBeInTheDocument()
  })

  it('shows rate unavailable on error', async () => {
    vi.mocked(getLatestRates).mockRejectedValue(new Error('fail'))
    renderWithProviders(<RateConverter />)
    expect(await screen.findByText('Rate unavailable')).toBeInTheDocument()
  })
})
