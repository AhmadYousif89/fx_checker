import { lazy, Suspense, useMemo } from 'react'
import { useSearch } from '@tanstack/react-router'
import { useHotkeys } from '@tanstack/react-hotkeys'
import {
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'

import { rangeKeys } from '#/lib/currency/time-ranges'
import type { RangeKey } from '#/lib/currency/time-ranges'
import { computeHistoryStats } from '#/lib/history-helpers'
import { TIME_RANGES, RANGE_INTERVALS, getCrossRate } from '#/lib/currency'

import { getHistory } from '#/server/functions/history'
import { getFrankfurterHistory } from '#/server/functions/history-frankfurter'
import { useActivePair } from '#/hooks/use-active-pair'
import { useUpdateUrl } from '#/hooks/use-update-url'
import { useLatestRates } from '#/hooks/use-latest-rates'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { CustomSpinner } from '#/components/custom-spinner'
import { HistoryStats } from './stats'

const HistoryChart = lazy(() =>
  import('./chart').then((m) => ({ default: m.HistoryChart })),
)

export const HistorySection = () => {
  const queryClient = useQueryClient()

  const search = useSearch({ from: '/' })
  const updateUrl = useUpdateUrl()
  const selectedTime = (search.view ?? '3m') as RangeKey
  const { sender, receiver } = useActivePair()

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
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60 * 24,
    placeholderData: keepPreviousData,
  })

  const { data: latestRates } = useLatestRates()

  const liveRate = latestRates?.rates
    ? getCrossRate({ rates: latestRates.rates, base: sender, quote: receiver })
    : null

  const patchedData = useMemo(() => {
    if (!data || data.length === 0 || liveRate == null) return data

    const last = data[data.length - 1]
    const pad = (n: number) => n.toString().padStart(2, '0')
    const useTime = last.time.includes(' ')
    const formatTS = (d: Date) => {
      const datePart = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
      if (!useTime) return datePart
      const timePart = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`
      return `${datePart} ${timePart}`
    }

    const intervalMinutes = interval.endsWith('min')
      ? parseInt(interval)
      : interval.endsWith('h')
        ? parseInt(interval) * 60
        : null

    if (!intervalMinutes) {
      const now = new Date()
      return [
        ...data.slice(0, -1),
        { ...last, close: liveRate, time: formatTS(now) },
      ]
    }

    const lastDate = new Date(last.time.replace(' ', 'T') + 'Z')
    if (Number.isNaN(lastDate.getTime())) {
      const now = new Date()
      return [
        ...data.slice(0, -1),
        { ...last, close: liveRate, time: formatTS(now) },
      ]
    }

    const now = new Date()
    const diffMinutes = (now.getTime() - lastDate.getTime()) / (1000 * 60)

    if (diffMinutes < intervalMinutes) {
      return [
        ...data.slice(0, -1),
        { ...last, close: liveRate, time: formatTS(now) },
      ]
    }

    const pointsToAdd = Math.min(Math.floor(diffMinutes / intervalMinutes), 144)
    const lastClose = last.close
    const totalSteps = pointsToAdd + 1

    const interpolated: typeof data = []
    for (let i = 1; i <= pointsToAdd; i++) {
      const t = i / totalSteps
      const close = lastClose + (liveRate - lastClose) * t
      const time = formatTS(
        new Date(lastDate.getTime() + i * intervalMinutes * 60 * 1000),
      )
      interpolated.push({ ...last, close, time })
    }

    return [
      ...data.slice(0, -1),
      last,
      ...interpolated,
      { ...last, close: liveRate, time: formatTS(now) },
    ]
  }, [data, liveRate, interval])

  const prefetchRange = (rangeKey: RangeKey) => {
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
      staleTime: 1000 * 60 * 15,
      gcTime: 1000 * 60 * 60 * 24,
    })
  }

  const stats = computeHistoryStats(patchedData)
  const hasData = data && data.length > 0

  if (isLoading && !hasData) {
    return <CustomSpinner />
  }

  if (isError && !hasData) {
    return (
      <div className="flex items-center justify-center py-10">
        <p className="text-red text-center">
          Something went wrong, try again later
        </p>
      </div>
    )
  }

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-10">
        <h3 className="text-heading text-foreground-darker">
          No chart data available
        </h3>
        <p className="text-body text-muted max-w-127 text-center">
          We couldn&apos;t load rate history for {sender}/{receiver} right now.
          This usually clears up in a minute.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">
        {/* Stats */}
        <HistoryStats stats={stats} isLoading={isFetching} />
        {/* Time range */}
        <ToggleGroup
          type="single"
          spacing={0.25}
          value={selectedTime}
          onValueChange={(value) => {
            if (value) updateUrl({ view: value })
          }}
          className="mt-5 bg-surface p-0.5 lg:self-end"
        >
          {rangeKeys.map((rk) => (
            <ToggleGroupItem
              key={rk}
              value={rk}
              onPointerOver={() => prefetchRange(rk)}
            >
              {rk.toUpperCase()}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      {/* Chart */}
      <div className="relative flex overflow-hidden mt-4 md:mt-5">
        {isFetching && (
          <div className="absolute inset-0 bg-surface/25 flex items-center justify-center z-10">
            <CustomSpinner />
          </div>
        )}
        <Suspense fallback={<ChartSkeleton />}>
          <HistoryChart
            data={patchedData ?? data}
            sender={sender}
            receiver={receiver}
            selectedTime={selectedTime}
          />
        </Suspense>
      </div>
    </>
  )
}

const ChartSkeleton = () => {
  return (
    <div className="w-full bg-surface flex flex-col gap-5 py-4 px-3 md:p-5 rounded-16">
      <div className="flex items-center justify-between h-5">
        <span className="h-full w-18.5 bg-muted/10 rounded-full animate-pulse" />
        <span className="h-full w-57.5 bg-muted/10 rounded-full animate-pulse" />
      </div>
      <div className="size-full bg-muted/10 animate-pulse rounded-16" />
    </div>
  )
}
