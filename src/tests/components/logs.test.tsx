import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { LogsSection } from '#/main/logs'
import { useCurrencyStore, addLog } from '#/store/currencies.store'

vi.mock('#/hooks/use-update-url', () => ({
  useUpdateUrl: () => vi.fn(),
}))

afterEach(cleanup)

beforeEach(() => {
  useCurrencyStore.setState({
    favorites: [],
    logs: [],
    lastLogTimestamp: null,
    recent: { from: [], to: [] },
  })
})

describe('LogsSection', () => {
  it('shows empty state when no logs', () => {
    render(<LogsSection />)
    expect(screen.getByText('No conversions logged yet')).toBeInTheDocument()
  })

  it('renders log rows when logs exist', () => {
    addLog({
      sender: 'USD',
      receiver: 'EUR',
      amount: 100,
      baseRate: 0.85,
      result: 85,
      timestamp: 1000,
    })
    addLog({
      sender: 'GBP',
      receiver: 'JPY',
      amount: 50,
      baseRate: 150,
      result: 7500,
      timestamp: 2000,
    })
    render(<LogsSection />)
    expect(screen.getByText((c) => c.includes('USD'))).toBeInTheDocument()
    expect(screen.getByText((c) => c.includes('GBP'))).toBeInTheDocument()
  })

  it('shows log count', () => {
    addLog({
      sender: 'USD',
      receiver: 'EUR',
      amount: 100,
      baseRate: 0.85,
      result: 85,
      timestamp: 1000,
    })
    addLog({
      sender: 'GBP',
      receiver: 'JPY',
      amount: 50,
      baseRate: 150,
      result: 7500,
      timestamp: 2000,
    })
    render(<LogsSection />)
    expect(screen.getByText('2 logged')).toBeInTheDocument()
  })

  it('clear all button removes all logs', () => {
    addLog({
      sender: 'USD',
      receiver: 'EUR',
      amount: 100,
      baseRate: 0.85,
      result: 85,
      timestamp: 1000,
    })
    render(<LogsSection />)
    fireEvent.click(screen.getByText('Clear All'))
    expect(screen.getByText('No conversions logged yet')).toBeInTheDocument()
  })
})
