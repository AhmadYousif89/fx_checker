import { lazy, Suspense } from 'react'
import { useSearch } from '@tanstack/react-router'
import { useHotkeys } from '@tanstack/react-hotkeys'
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { getHistory } from '#/server/functions/history'
import { computeHistoryStats } from '#/lib/history-helpers'
import { TIME_RANGES, RANGE_INTERVALS } from '#/lib/currency'
import { useActivePair } from '#/hooks/use-active-pair'
import { useUpdateUrl } from '#/hooks/use-update-url'
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
  const selectedTime = search.view || '3m'
  const { sender, receiver } = useActivePair()

  const rangeKeys = Object.keys(TIME_RANGES)

  const hotkeys = rangeKeys.map((rangeKey, i) => ({
    hotkey: { key: `${i + 1}` },
    callback: () => updateUrl({ view: rangeKey }),
  }))

  useHotkeys(hotkeys, { requireReset: true })

  const days = TIME_RANGES[selectedTime]
  const interval = RANGE_INTERVALS[selectedTime]

  const queryKey = ['history', sender, receiver, selectedTime]

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey,
    queryFn: () =>
      getHistory({
        data: {
          base: sender,
          quote: receiver,
          days,
          interval,
        },
      }),
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60 * 24,
    placeholderData: keepPreviousData,
  })

  const prefetchRange = (rangeKey: string) => {
    const d = TIME_RANGES[rangeKey]
    const i = RANGE_INTERVALS[rangeKey]
    queryClient.prefetchQuery({
      queryKey: ['history', sender, receiver, rangeKey],
      queryFn: () =>
        getHistory({
          data: { base: sender, quote: receiver, days: d, interval: i },
        }),
      staleTime: 1000 * 60 * 15,
      gcTime: 1000 * 60 * 60 * 24,
    })
  }

  const stats = computeHistoryStats(data)
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
          {Object.keys(TIME_RANGES).map((rangeKey) => (
            <ToggleGroupItem
              key={rangeKey}
              value={rangeKey}
              onPointerOver={() => prefetchRange(rangeKey)}
            >
              {rangeKey.toUpperCase()}
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
            data={data}
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
