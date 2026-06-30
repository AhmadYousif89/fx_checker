import { describe, it, expect, beforeEach } from 'vitest'
import {
  useCurrencyStore,
  pushToRecent,
  toggleFavorite,
  removeFavorite,
  addLog,
  removeLog,
  clearLogs,
} from '#/store/currencies.store'

beforeEach(() => {
  useCurrencyStore.setState({
    favorites: [],
    logs: [],
    lastLogTimestamp: null,
    recent: { from: [], to: [] },
  })
})

describe('pushToRecent', () => {
  it('adds a code to the front', () => {
    pushToRecent('from', 'USD')
    const state = useCurrencyStore.getState()
    expect(state.recent.from).toEqual(['USD'])
  })

  it('deduplicates existing codes', () => {
    pushToRecent('from', 'USD')
    pushToRecent('from', 'EUR')
    pushToRecent('from', 'USD')
    const state = useCurrencyStore.getState()
    expect(state.recent.from).toEqual(['USD', 'EUR'])
  })

  it('limits to 3 entries', () => {
    pushToRecent('to', 'A')
    pushToRecent('to', 'B')
    pushToRecent('to', 'C')
    pushToRecent('to', 'D')
    const state = useCurrencyStore.getState()
    expect(state.recent.to).toEqual(['D', 'C', 'B'])
  })

  it('supports from and to sides independently', () => {
    pushToRecent('from', 'USD')
    pushToRecent('to', 'EUR')
    const state = useCurrencyStore.getState()
    expect(state.recent.from).toEqual(['USD'])
    expect(state.recent.to).toEqual(['EUR'])
  })
})

describe('toggleFavorite / useIsFavorited / removeFavorite', () => {
  it('adds a favorite', () => {
    toggleFavorite('USD', 'EUR')
    const state = useCurrencyStore.getState()
    expect(state.favorites).toContainEqual({ sender: 'USD', receiver: 'EUR' })
  })

  it('removes an existing favorite on second toggle', () => {
    toggleFavorite('USD', 'EUR')
    toggleFavorite('USD', 'EUR')
    const state = useCurrencyStore.getState()
    expect(state.favorites).toHaveLength(0)
  })

  it('removeFavorite removes specific pair', () => {
    toggleFavorite('USD', 'EUR')
    toggleFavorite('GBP', 'JPY')
    removeFavorite({ sender: 'USD', receiver: 'EUR' })
    const state = useCurrencyStore.getState()
    expect(state.favorites).toHaveLength(1)
    expect(state.favorites[0]).toEqual({ sender: 'GBP', receiver: 'JPY' })
  })

  it('useIsFavorited returns true for favorited pair', () => {
    toggleFavorite('USD', 'EUR')
    const isFav = useCurrencyStore
      .getState()
      .favorites.some((f) => f.sender === 'USD' && f.receiver === 'EUR')
    expect(isFav).toBe(true)
  })
})

describe('addLog / removeLog / clearLogs', () => {
  const log = {
    sender: 'USD',
    receiver: 'EUR',
    amount: 100,
    baseRate: 0.85,
    result: 85,
    timestamp: 1000,
  }

  it('adds a new log entry', () => {
    const status = addLog(log)
    expect(status).toBe('created')
    const state = useCurrencyStore.getState()
    expect(state.logs).toHaveLength(1)
    expect(state.logs[0]).toMatchObject(log)
  })

  it('returns "updated" for duplicate log', () => {
    addLog(log)
    const status = addLog(log)
    expect(status).toBe('updated')
    const state = useCurrencyStore.getState()
    expect(state.logs).toHaveLength(1)
  })

  it('adds multiple distinct logs', () => {
    addLog(log)
    addLog({ ...log, sender: 'GBP', timestamp: 2000 })
    const state = useCurrencyStore.getState()
    expect(state.logs).toHaveLength(2)
  })

  it('removeLog removes by timestamp', () => {
    addLog(log)
    removeLog(1000)
    const state = useCurrencyStore.getState()
    expect(state.logs).toHaveLength(0)
  })

  it('clearLogs empties all logs', () => {
    addLog(log)
    addLog({ ...log, sender: 'GBP', timestamp: 2000 })
    clearLogs()
    const state = useCurrencyStore.getState()
    expect(state.logs).toHaveLength(0)
    expect(state.lastLogTimestamp).toBeNull()
  })

  it('updates lastLogTimestamp on add', () => {
    addLog(log)
    const state = useCurrencyStore.getState()
    expect(state.lastLogTimestamp).toBe(1000)
  })
})
