import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { MAX_CHART_PICKS } from '#/main/compare/compare-chart.types'
import type { RangeKey } from '#/lib/history/config'
import type { CurrencyPair, ConversionLog } from '#/types/currency'

type ActivePicker = 'sender' | 'receiver' | null

type SortField = 'date' | 'base' | 'quote' | 'result' | 'amount'
type SortDir = 'asc' | 'desc'

type CurrencyStore = {
  conversion: {
    recent: { from: string[]; to: string[] }
    activePicker: ActivePicker
    lastActivePicker: ActivePicker
  }
  favorites: {
    pairs: CurrencyPair[]
    lastAddedKey: string | null
  }
  compare: {
    view: 'table' | 'chart'
    tablePicks: string[]
    chartPicks: string[]
    chartRange: RangeKey
    lastAddedPick: string | null
    swipeHintDismissed: boolean
  }
  logs: {
    entries: ConversionLog[]
    lastTimestamp: number | null
    sortField: SortField
    sortDir: SortDir
  }
}

const initialState: CurrencyStore = {
  conversion: {
    recent: { from: [], to: [] },
    activePicker: null,
    lastActivePicker: null,
  },
  favorites: {
    pairs: [],
    lastAddedKey: null,
  },
  compare: {
    view: 'table',
    tablePicks: [],
    chartPicks: [],
    chartRange: '3m',
    lastAddedPick: null,
    swipeHintDismissed: false,
  },
  logs: {
    entries: [],
    lastTimestamp: null,
    sortField: 'date',
    sortDir: 'desc',
  },
}

export const useCurrencyStore = create(
  persist<CurrencyStore>(() => initialState, {
    name: 'fx_checker',
    version: 2,
    migrate: (persisted, version) => {
      if (version === 0) {
        const old = persisted as Record<string, unknown>
        return {
          logs: {
            entries: (old.logs as ConversionLog[] | undefined) ?? [],
            lastTimestamp: (old.lastLogTimestamp as number | null) ?? null,
            sortField: (old.logSortField as SortField | undefined) ?? 'date',
            sortDir: (old.logSortDir as SortDir | undefined) ?? 'desc',
          },
          favorites: {
            pairs: (old.favorites as CurrencyPair[] | undefined) ?? [],
            lastAddedKey: (old.lastAddedFavKey as string | null) ?? null,
          },
          conversion: {
            recent: (old.recent as
              | { from: string[]; to: string[] }
              | undefined) ?? {
              from: [],
              to: [],
            },
            activePicker: (old.activePicker as ActivePicker | null) ?? null,
            lastActivePicker:
              (old.lastActivePicker as ActivePicker | null) ?? null,
          },
          compare: {
            view: (old.compareView as 'table' | 'chart' | undefined) ?? 'table',
            tablePicks: (old.comparePicks as string[] | undefined) ?? [],
            chartPicks: (old.chartPicks as string[] | undefined) ?? [],
            chartRange: (old.chartRange as RangeKey | undefined) ?? '3m',
            lastAddedPick: null,
            swipeHintDismissed: false,
          },
        }
      }
      if (version === 1) {
        const old = persisted as CurrencyStore
        return {
          ...old,
          compare: {
            ...old.compare,
            lastAddedPick: null,
            swipeHintDismissed: false,
          },
        }
      }
      return persisted as CurrencyStore
    },
  }),
)

export function pushToRecent(side: 'from' | 'to', code: string) {
  useCurrencyStore.setState((state) => ({
    conversion: {
      ...state.conversion,
      recent: {
        ...state.conversion.recent,
        [side]: [
          code,
          ...state.conversion.recent[side].filter((c) => c !== code),
        ].slice(0, 3),
      },
    },
  }))
}

export function useIsFavorited(sender: string, receiver: string) {
  return useCurrencyStore((s) =>
    s.favorites.pairs.some(
      (f) => f.sender === sender && f.receiver === receiver,
    ),
  )
}

export function toggleFavorite(sender: string, receiver: string) {
  useCurrencyStore.setState((state) => {
    const exists = state.favorites.pairs.some(
      (f) => f.sender === sender && f.receiver === receiver,
    )
    return {
      favorites: {
        pairs: exists
          ? state.favorites.pairs.filter(
              (f) => f.sender !== sender || f.receiver !== receiver,
            )
          : [{ sender, receiver }, ...state.favorites.pairs],
        lastAddedKey: exists ? null : `${sender}_${receiver}`,
      },
    }
  })
}

export function removeFavorite(pair: CurrencyPair) {
  useCurrencyStore.setState((state) => ({
    favorites: {
      ...state.favorites,
      pairs: state.favorites.pairs.filter(
        (f) => f.sender !== pair.sender || f.receiver !== pair.receiver,
      ),
    },
  }))
}

export function addLog(log: ConversionLog): 'created' | 'updated' {
  let status: 'created' | 'updated' = 'created'

  useCurrencyStore.setState((state) => {
    const existingIndex = state.logs.entries.findIndex(
      (l) =>
        l.sender === log.sender &&
        l.receiver === log.receiver &&
        l.amount === log.amount &&
        l.baseRate === log.baseRate &&
        l.result === log.result,
    )

    if (existingIndex !== -1) {
      const updated = [...state.logs.entries]
      updated.splice(existingIndex, 1)
      const newTimestamp = Date.now()
      status = 'updated'
      return {
        logs: {
          ...state.logs,
          entries: [{ ...log, timestamp: newTimestamp }, ...updated],
          lastTimestamp: newTimestamp,
        },
      }
    }

    return {
      logs: {
        ...state.logs,
        entries: [log, ...state.logs.entries],
        lastTimestamp: log.timestamp,
      },
    }
  })

  return status
}

export function removeLog(timestamp: number) {
  useCurrencyStore.setState((state) => ({
    logs: {
      ...state.logs,
      entries: state.logs.entries.filter((l) => l.timestamp !== timestamp),
    },
  }))
}

export function clearLogs() {
  useCurrencyStore.setState((state) => ({
    logs: { ...state.logs, entries: [], lastTimestamp: null },
  }))
}

export function setActivePicker(picker: ActivePicker) {
  useCurrencyStore.setState((state) => ({
    conversion: {
      ...state.conversion,
      activePicker: picker,
      ...(picker !== null ? { lastActivePicker: picker } : {}),
    },
  }))
}

export function seedComparePicks(codes: string[]) {
  useCurrencyStore.setState((state) => ({
    compare: { ...state.compare, tablePicks: codes },
  }))
}

export function addComparePick(code: string) {
  useCurrencyStore.setState((state) => {
    if (state.compare.tablePicks.includes(code)) return state
    return {
      compare: {
        ...state.compare,
        tablePicks: [code, ...state.compare.tablePicks],
        lastAddedPick: code,
      },
    }
  })
}

export function removeComparePick(code: string) {
  useCurrencyStore.setState((state) => ({
    compare: {
      ...state.compare,
      tablePicks: state.compare.tablePicks.filter((c) => c !== code),
    },
  }))
}

export function setCompareView(view: 'table' | 'chart') {
  useCurrencyStore.setState((state) => ({
    compare: { ...state.compare, view },
  }))
}

export function dismissSwipeHint() {
  useCurrencyStore.setState((state) => ({
    compare: { ...state.compare, swipeHintDismissed: true },
  }))
}

export function setChartRange(range: RangeKey) {
  useCurrencyStore.setState((state) => ({
    compare: { ...state.compare, chartRange: range },
  }))
}

export function addChartPick(code: string) {
  useCurrencyStore.setState((state) => {
    if (state.compare.chartPicks.includes(code)) return state
    if (state.compare.chartPicks.length >= MAX_CHART_PICKS) return state
    return {
      compare: {
        ...state.compare,
        chartPicks: [...state.compare.chartPicks, code],
      },
    }
  })
}

export function removeChartPick(code: string) {
  useCurrencyStore.setState((state) => ({
    compare: {
      ...state.compare,
      chartPicks: state.compare.chartPicks.filter((c) => c !== code),
    },
  }))
}

export type { SortField, SortDir }

export function setLogSort(field: SortField, dir: SortDir) {
  useCurrencyStore.setState((state) => ({
    logs: { ...state.logs, sortField: field, sortDir: dir },
  }))
}
