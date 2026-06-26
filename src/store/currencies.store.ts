import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { CurrencyPair, ConversionLog } from '#/types/currency'

type CurrencyStore = {
  activePair: CurrencyPair
  favorites: CurrencyPair[]
  logs: ConversionLog[]
  recent: {
    from: string[]
    to: string[]
  }
}

const initialState: CurrencyStore = {
  activePair: { sender: 'USD', receiver: 'EUR' },
  favorites: [],
  logs: [],
  recent: { from: [], to: [] },
}

export const useCurrencyStore = create(
  persist<CurrencyStore>(() => initialState, {
    name: 'fx_checker',
    merge: (persisted, current) => {
      const merged = { ...current, ...(persisted as CurrencyStore) }
      if (!merged.activePair?.sender || !merged.activePair?.receiver) {
        merged.activePair = current.activePair
      }
      return merged
    },
  }),
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

export function updateActivePair(payload: Partial<CurrencyPair>) {
  useCurrencyStore.setState((state) => {
    return {
      activePair: { ...state.activePair, ...payload },
    }
  })
}

export function swapActivePair() {
  useCurrencyStore.setState((state) => {
    return {
      activePair: {
        sender: state.activePair.receiver,
        receiver: state.activePair.sender,
      },
    }
  })
}

export function useIsFavorited() {
  return useCurrencyStore((s) =>
    s.favorites.some(
      (f) =>
        f.sender === s.activePair.sender &&
        f.receiver === s.activePair.receiver,
    ),
  )
}

export function toggleFavorites() {
  useCurrencyStore.setState((state) => ({
    favorites: state.favorites.some(
      (f) =>
        f.sender === state.activePair.sender &&
        f.receiver === state.activePair.receiver,
    )
      ? state.favorites.filter(
          (f) =>
            f.sender !== state.activePair.sender ||
            f.receiver !== state.activePair.receiver,
        )
      : [...state.favorites, state.activePair],
  }))
}

export function removeFavorite(pair: CurrencyPair) {
  useCurrencyStore.setState((state) => ({
    favorites: state.favorites.filter(
      (f) => f.sender !== pair.sender || f.receiver !== pair.receiver,
    ),
  }))
}
