import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { CurrencyPair, ConversionLog } from '#/types/currency'

type CurrencyStore = {
  favorites: CurrencyPair[]
  logs: ConversionLog[]
  lastLogTimestamp: number | null
  recent: {
    from: string[]
    to: string[]
  }
}

const initialState: CurrencyStore = {
  favorites: [],
  logs: [],
  lastLogTimestamp: null,
  recent: { from: [], to: [] },
}

export const useCurrencyStore = create(
  persist<CurrencyStore>(() => initialState, { name: 'fx_checker' }),
)

export function pushToRecent(side: 'from' | 'to', code: string) {
  useCurrencyStore.setState((state) => ({
    recent: {
      ...state.recent,
      [side]: [code, ...state.recent[side].filter((c) => c !== code)].slice(
        0,
        3,
      ),
    },
  }))
}

export function useIsFavorited(sender: string, receiver: string) {
  return useCurrencyStore((s) =>
    s.favorites.some((f) => f.sender === sender && f.receiver === receiver),
  )
}

export function toggleFavorite(sender: string, receiver: string) {
  useCurrencyStore.setState((state) => {
    const exists = state.favorites.some(
      (f) => f.sender === sender && f.receiver === receiver,
    )
    return {
      favorites: exists
        ? state.favorites.filter(
            (f) => f.sender !== sender || f.receiver !== receiver,
          )
        : [...state.favorites, { sender, receiver }],
    }
  })
}

export function removeFavorite(pair: CurrencyPair) {
  useCurrencyStore.setState((state) => ({
    favorites: state.favorites.filter(
      (f) => f.sender !== pair.sender || f.receiver !== pair.receiver,
    ),
  }))
}

export function addLog(log: ConversionLog): 'created' | 'updated' {
  let status: 'created' | 'updated' = 'created'

  useCurrencyStore.setState((state) => {
    const existingIndex = state.logs.findIndex(
      (l) =>
        l.sender === log.sender &&
        l.receiver === log.receiver &&
        l.amount === log.amount &&
        l.baseRate === log.baseRate &&
        l.result === log.result,
    )

    if (existingIndex !== -1) {
      const updated = [...state.logs]
      updated.splice(existingIndex, 1)
      const newTimestamp = Date.now()
      status = 'updated'
      return {
        logs: [{ ...log, timestamp: newTimestamp }, ...updated],
        lastLogTimestamp: newTimestamp,
      }
    }

    return { logs: [log, ...state.logs], lastLogTimestamp: log.timestamp }
  })

  return status
}

export function removeLog(timestamp: number) {
  useCurrencyStore.setState((state) => ({
    logs: state.logs.filter((l) => l.timestamp !== timestamp),
  }))
}

export function clearLogs() {
  useCurrencyStore.setState({ logs: [] })
}
