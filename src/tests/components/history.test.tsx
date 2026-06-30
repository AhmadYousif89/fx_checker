import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { getHistory } from '#/server/functions/history'
import { HistorySection } from '#/main/history'

vi.mock('#/hooks/use-update-url', () => ({
  useUpdateUrl: () => vi.fn(),
}))

function renderWithQuery(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>)
}

afterEach(cleanup)

beforeEach(() => {
  vi.mocked(getHistory).mockResolvedValue([
    { time: '2024-01-01', close: 1.1, open: 1.0, high: 1.12, low: 0.99 },
    { time: '2024-01-08', close: 1.15, open: 1.1, high: 1.16, low: 1.09 },
    { time: '2024-01-15', close: 1.2, open: 1.15, high: 1.21, low: 1.14 },
  ])
})

describe('HistorySection', () => {
  it('renders loading spinner initially', () => {
    vi.mocked(getHistory).mockImplementation(() => new Promise(() => {}))
    renderWithQuery(<HistorySection />)
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('renders chart with data', async () => {
    renderWithQuery(<HistorySection />)
    expect(await screen.findByText('USD/EUR')).toBeInTheDocument()
  })

  it('shows error state on failure', async () => {
    vi.mocked(getHistory).mockRejectedValue(new Error('fail'))
    renderWithQuery(<HistorySection />)
    expect(await screen.findByText(/Something went wrong/)).toBeInTheDocument()
  })

  it('renders time range toggles', async () => {
    renderWithQuery(<HistorySection />)
    expect(await screen.findByText('3M')).toBeInTheDocument()
    expect(screen.getByText('1D')).toBeInTheDocument()
    expect(screen.getByText('1W')).toBeInTheDocument()
    expect(screen.getByText('1M')).toBeInTheDocument()
    expect(screen.getByText('6M')).toBeInTheDocument()
    expect(screen.getByText('1Y')).toBeInTheDocument()
    expect(screen.getByText('5Y')).toBeInTheDocument()
  })
})
