import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useSearch } from '@tanstack/react-router'
import { useHotkeys } from '@tanstack/react-hotkeys'
import {
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'

import type { RangeKey } from '#/lib/history/config'
import { rangeKeys, TIME_RANGES, RANGE_INTERVALS } from '#/lib/history/config'
import {
  computeHistoryStats,
  computeHistoryYAxisDomain,
} from '#/lib/history/helpers'
import type { HistoryEntry } from '#/lib/history/helpers'
import { getCrossRate } from '#/lib/currency'

import { useUpdateUrl } from '#/hooks/use-update-url'
import { useActivePair } from '#/hooks/use-active-pair'
import { useLatestRates } from '#/hooks/use-latest-rates'
import { useRateLimiterStatus } from '#/hooks/use-rate-limiter'
import { getHistory, getFrankfurterHistory } from '#/server/functions/history'

type HistoryStatsData = {
  open: number
  close: number
  change: number
  percentChange: number
}

type HistoryDataContextValue = {
  displayData: HistoryEntry[]
  fullData: HistoryEntry[]
  yDomain: [number, number]
  stats: HistoryStatsData | null
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  hasData: boolean
  liveRate: number | null
}

type HistoryUIContextValue = {
  sender: string
  receiver: string
  selectedTime: RangeKey
  smaEnabled: boolean
  zoomed: boolean
  zoomStart: number | undefined
  zoomEnd: number | undefined
  onZoom: (range: { startIndex: number; endIndex: number }) => void
  onBrushZoom: (range: { startIndex: number; endIndex: number }) => void
  onResetZoom: () => void
  onSmaToggle: () => void
  prefetchRange: (key: RangeKey) => void
  updateUrl: (updates: Record<string, unknown>) => void
  isWaiting: boolean
}

const HistoryDataContext = createContext<HistoryDataContextValue | null>(null)
const HistoryUIContext = createContext<HistoryUIContextValue | null>(null)

export function useHistoryData() {
  const ctx = useContext(HistoryDataContext)
  if (!ctx)
    throw new Error('useHistoryData must be used within HistoryProvider')
  return ctx
}

export function useHistoryUI() {
  const ctx = useContext(HistoryUIContext)
  if (!ctx) throw new Error('useHistoryUI must be used within HistoryProvider')
  return ctx
}

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()

  const search = useSearch({ from: '/' })
  const smaEnabled = search.sma
  const selectedTime = (search.view ?? '3m') as RangeKey

  const { sender, receiver } = useActivePair()

  const updateUrl = useUpdateUrl()
  const handleSmaToggle = useCallback(
    () => updateUrl({ sma: !smaEnabled }),
    [smaEnabled, updateUrl],
  )

  const hotkeys = rangeKeys.map((rangeKey, i) => ({
    hotkey: { key: `${i + 1}` },
    callback: () => updateUrl({ view: rangeKey }),
  }))

  useHotkeys(hotkeys, { requireReset: true })

  const isIntraday = selectedTime === '1d' || selectedTime === '1w'
  const days = TIME_RANGES[selectedTime]
  const interval = RANGE_INTERVALS[selectedTime]

  const queryKey = isIntraday
    ? ['history', sender, receiver, selectedTime]
    : ['frankfurter-history', sender, receiver, selectedTime]

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey,
    queryFn: () =>
      isIntraday
        ? getHistory({
            data: { base: sender, quote: receiver, days, interval },
          })
        : getFrankfurterHistory({
            data: { base: sender, quote: receiver, days },
          }),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    placeholderData: keepPreviousData,
  })

  const { data: rateLimiterData } = useRateLimiterStatus(
    isIntraday && isFetching,
  )

  const { data: latestRates } = useLatestRates()

  const liveRate = latestRates?.rates
    ? getCrossRate({ rates: latestRates.rates, base: sender, quote: receiver })
    : null

  const prefetchRange = useCallback(
    (rangeKey: RangeKey) => {
      const d = TIME_RANGES[rangeKey]
      const i = RANGE_INTERVALS[rangeKey]
      const intraday = rangeKey === '1d' || rangeKey === '1w'
      queryClient.prefetchQuery({
        queryKey: intraday
          ? ['history', sender, receiver, rangeKey]
          : ['frankfurter-history', sender, receiver, rangeKey],
        queryFn: () =>
          intraday
            ? getHistory({
                data: { base: sender, quote: receiver, days: d, interval: i },
              })
            : getFrankfurterHistory({
                data: { base: sender, quote: receiver, days: d },
              }),
        staleTime: 1000 * 60 * 60,
        gcTime: 1000 * 60 * 60 * 24,
      })
    },
    [queryClient, sender, receiver],
  )

  const [zoomRange, setZoomRange] = useState<{
    start: number
    end: number
  } | null>(null)

  useEffect(() => {
    setZoomRange(null)
  }, [sender, receiver])

  const chartData = data
  const displayData =
    zoomRange && chartData
      ? chartData.slice(zoomRange.start, zoomRange.end + 1)
      : (chartData ?? [])

  const handleZoom = useCallback(
    (range: { startIndex: number; endIndex: number }) => {
      setZoomRange((prev) => {
        const offset = prev?.start ?? 0
        return {
          start: range.startIndex + offset,
          end: range.endIndex + offset,
        }
      })
    },
    [],
  )

  const handleBrushZoom = useCallback(
    (range: { startIndex: number; endIndex: number }) => {
      setZoomRange({ start: range.startIndex, end: range.endIndex })
    },
    [],
  )

  const handleResetZoom = useCallback(() => setZoomRange(null), [])

  const yDomain = useMemo(
    () => computeHistoryYAxisDomain(displayData),
    [displayData],
  )

  const stats = useMemo(() => computeHistoryStats(data), [data])

  const hasData = !!(data && data.length > 0)

  const dataCtx = useMemo<HistoryDataContextValue>(
    () => ({
      displayData,
      fullData: chartData ?? [],
      yDomain,
      stats,
      isLoading,
      isFetching,
      isError,
      hasData,
      liveRate,
    }),
    [
      displayData,
      chartData,
      yDomain,
      stats,
      isLoading,
      isFetching,
      isError,
      hasData,
      liveRate,
    ],
  )

  const uiCtx = useMemo<HistoryUIContextValue>(
    () => ({
      sender,
      receiver,
      selectedTime,
      smaEnabled: !!smaEnabled,
      zoomed: zoomRange !== null,
      zoomStart: zoomRange?.start,
      zoomEnd: zoomRange?.end,
      onZoom: handleZoom,
      onBrushZoom: handleBrushZoom,
      onResetZoom: handleResetZoom,
      onSmaToggle: handleSmaToggle,
      prefetchRange,
      updateUrl,
      isWaiting: rateLimiterData?.isWaiting ?? false,
    }),
    [
      sender,
      receiver,
      selectedTime,
      smaEnabled,
      zoomRange,
      handleZoom,
      handleBrushZoom,
      handleResetZoom,
      handleSmaToggle,
      prefetchRange,
      updateUrl,
      rateLimiterData?.isWaiting,
    ],
  )

  return (
    <HistoryDataContext.Provider value={dataCtx}>
      <HistoryUIContext.Provider value={uiCtx}>
        {children}
      </HistoryUIContext.Provider>
    </HistoryDataContext.Provider>
  )
}
