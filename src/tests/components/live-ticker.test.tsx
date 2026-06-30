import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { getRates } from '#/server/functions/rates'
import { LiveTicker } from '#/header/live-ticker'

function renderWithQuery(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>)
}

beforeEach(() => {
  vi.mocked(getRates).mockResolvedValue([
    {
      base: 'USD',
      quote: 'JPY',
      rate: 130.5,
      difference: 0.5,
      direction: 'up',
    },
    {
      base: 'GBP',
      quote: 'USD',
      rate: 1.25,
      difference: -0.2,
      direction: 'down',
    },
    { base: 'EUR', quote: 'USD', rate: 1.1, difference: 0, direction: 'flat' },
  ])
})

afterEach(cleanup)

describe('LiveTicker', () => {
  it('shows loading skeleton initially', () => {
    vi.mocked(getRates).mockImplementation(() => new Promise(() => {}))
    renderWithQuery(<LiveTicker />)
    const skeleton = document.querySelector('.animate-pulse')
    expect(skeleton).toBeInTheDocument()
  })

  it('renders ticker rates after loading', async () => {
    renderWithQuery(<LiveTicker />)
    const pairs = await screen.findAllByText('USD/JPY')
    expect(pairs.length).toBeGreaterThanOrEqual(1)
  })

  it('shows error message on failure', async () => {
    vi.mocked(getRates).mockRejectedValue(new Error('fail'))
    renderWithQuery(<LiveTicker />)
    expect(
      await screen.findByText('Failed to load market rates'),
    ).toBeInTheDocument()
  })

  it('renders direction indicators', async () => {
    renderWithQuery(<LiveTicker />)
    const rates = await screen.findAllByText(/\+|-/)
    expect(rates.length).toBeGreaterThan(0)
  })
})
