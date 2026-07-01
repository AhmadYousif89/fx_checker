import { useSearch } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { getHistory } from '#/server/functions/history'
import { TIME_RANGES, RANGE_INTERVALS } from '#/lib/currency'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useActivePair } from '#/hooks/use-active-pair'
import { useUpdateUrl } from '#/hooks/use-update-url'
import { HistoryChart } from './chart'
import { HistoryStats } from './stats'
import { CustomSpinner } from '#/components/custom-spinner'
import { computeHistoryStats } from '#/lib/history-helpers'

export const HistorySection = () => {
  const queryClient = useQueryClient()

  const search = useSearch({ from: '/' })
  const updateUrl = useUpdateUrl()
  const selectedTime = search.view || '3m'
  const { sender, receiver } = useActivePair()
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
    })
  }

  const stats = computeHistoryStats(data)

  if (isLoading) {
    return <CustomSpinner />
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-10">
        <p className="text-red text-center">
          Something went wrong, try again later
        </p>
      </div>
    )
  }

  if (!data || data.length === 0) {
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
        <HistoryStats stats={stats} isLoading={isFetching || isLoading} />
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
      <HistoryChart
        data={data}
        sender={sender}
        receiver={receiver}
        selectedTime={selectedTime}
      />
    </>
  )
}
