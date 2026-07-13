import { useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { keepPreviousData, useQueries } from '@tanstack/react-query'

import { rangeKeys, TIME_RANGES, RANGE_INTERVALS } from '#/lib/history/config'
import type { RangeKey } from '#/lib/history/config'
import { formatRate, formatAxisDate } from '#/lib/currency'
import { TTL_BY_INTERVAL } from '#/server/config'
import type { HistoryEntry } from '#/lib/history/helpers'
import { getTweleveHistory } from '#/server/functions/twelve-history'
import { getFrankfurterHistory } from '#/server/functions/frankfurter-history'
import {
  useCurrencyStore,
  setChartRange,
  removeChartPick,
} from '#/store/currencies.store'
import { ToggleGroup, ToggleGroupItem } from '#/components/ui/toggle-group'
import { cn } from '#/lib/utils'
import { XIcon } from 'lucide-react'

const CHART_COLORS = ['#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']

type SeriesData = {
  key: string
  data: { time: string; close: number; indexed: number }[]
  latestClose: number
}

type CompareChartProps = {
  sender: string
  quotes: string[]
}

export const CompareChart = ({ sender, quotes }: CompareChartProps) => {
  const chartRange = useCurrencyStore((s) => s.chartRange)
  const [hiddenQuotes, setHiddenQuotes] = useState<Set<string>>(new Set())

  const isIntraday = chartRange === '1d' || chartRange === '1w'
  const days = TIME_RANGES[chartRange]
  const interval = RANGE_INTERVALS[chartRange]
  const staleTime = isIntraday ? TTL_BY_INTERVAL[interval] : 60 * 60 * 1000

  const results = useQueries({
    queries: quotes.map((quote) => ({
      queryKey: ['compare-history', sender, quote, chartRange],
      queryFn: () =>
        isIntraday
          ? getTweleveHistory({
              data: { base: sender, quote, days, interval },
            })
          : getFrankfurterHistory({
              data: { base: sender, quote, days },
            }),
      staleTime,
      gcTime: 1000 * 60 * 60 * 24,
      placeholderData: keepPreviousData,
    })),
  })

  const seriesList = useMemo(() => {
    const list: SeriesData[] = []
    for (let i = 0; i < results.length; i++) {
      const data = results[i].data
      if (!data || data.length === 0) continue
      const quote = quotes[i]
      const first = data[0].close
      const latest = data[data.length - 1].close
      if (first === 0 || latest === 0) continue
      list.push({
        key: quote,
        data: data.map((d: HistoryEntry) => ({
          time: d.time,
          close: d.close,
          indexed: (d.close / first) * 100,
        })),
        latestClose: latest,
      })
    }
    return list
  }, [results, quotes])

  const chartData = useMemo(() => {
    if (seriesList.length === 0) return []

    const times = new Set<string>()
    for (const series of seriesList) {
      for (const d of series.data) times.add(d.time)
    }

    return Array.from(times)
      .sort()
      .map((time) => {
        const point: Record<string, string | number | null> = { time }
        for (const series of seriesList) {
          const entry = series.data.find((d) => d.time === time)
          point[`${series.key}_indexed`] = entry
            ? +entry.indexed.toFixed(4)
            : null
          point[`${series.key}_rate`] = entry ? entry.close : null
        }
        return point
      })
  }, [seriesList])

  const yDomain = useMemo(() => {
    let min = Infinity
    let max = -Infinity

    for (const point of chartData) {
      for (const series of seriesList) {
        if (hiddenQuotes.has(series.key)) continue
        const val = point[`${series.key}_indexed`]
        if (typeof val === 'number') {
          if (val < min) min = val
          if (val > max) max = val
        }
      }
    }

    if (min === Infinity || max === -Infinity) return [90, 110]
    const padding = (max - min) * 0.15 || 1
    return [min - padding, max + padding]
  }, [chartData, seriesList, hiddenQuotes])

  const isLoading = results.some((r) => r.isLoading)
  const isFetching = results.some((r) => r.isFetching)

  const pairCount = seriesList.length

  const toggleQuoteVisibility = (quote: string) => {
    setHiddenQuotes((prev) => {
      const next = new Set(prev)
      if (next.has(quote)) next.delete(quote)
      else next.add(quote)
      return next
    })
  }

  if (quotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-body text-muted">
          Add currencies to compare using the picker above.
        </p>
      </div>
    )
  }

  if (pairCount === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-body text-muted">
          No chart data available for the selected currencies.
        </p>
      </div>
    )
  }

  const yTickFormatter = (v: number) => v.toFixed(1)

  return (
    <div className="flex flex-col grow min-h-96 w-full p-2">
      <div className="flex items-center justify-end mb-4">
        <ToggleGroup
          type="single"
          spacing={0.25}
          value={chartRange}
          onValueChange={(value) => {
            if (value) setChartRange(value as RangeKey)
          }}
          className="bg-background p-0.5"
        >
          {rangeKeys.map((rk) => (
            <ToggleGroupItem key={rk} value={rk}>
              {rk.toUpperCase()}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="relative grow flex flex-col">
        {(isLoading || isFetching) && (
          <div className="absolute inset-0 bg-surface/25 flex items-center justify-center z-10">
            <div className="size-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <ResponsiveContainer
          width="100%"
          className="grow"
          initialDimension={{ height: 300, width: 300 }}
        >
          <LineChart
            key={chartRange}
            data={chartData}
            margin={{ top: 20, right: 8, left: 8, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
            />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tickFormatter={(dateStr) => formatAxisDate(dateStr, chartRange)}
              tick={{
                fill: 'var(--muted)',
                className: 'text-caption select-none',
              }}
              minTickGap={30}
            />
            <YAxis
              domain={yDomain}
              axisLine={false}
              tickLine={false}
              tickFormatter={yTickFormatter}
              tick={{
                fill: 'var(--muted)',
                className: 'text-caption select-none',
              }}
              orientation="left"
              mirror
              dy={-10}
            />
            <ReferenceLine
              y={100}
              stroke="var(--muted)"
              strokeDasharray="4 4"
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active) return null
                if (payload.length === 0) return null
                return (
                  <CompareTooltip
                    label={label as string}
                    payload={
                      payload as unknown as ReadonlyArray<
                        Record<string, unknown>
                      >
                    }
                    seriesList={seriesList}
                    hiddenQuotes={hiddenQuotes}
                  />
                )
              }}
            />
            {seriesList.map((series, i) => {
              if (hiddenQuotes.has(series.key)) return null
              return (
                <Line
                  key={series.key}
                  type="monotone"
                  dataKey={`${series.key}_indexed`}
                  stroke={CHART_COLORS[i % CHART_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  name={series.key}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              )
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
        {seriesList.map((series, i) => {
          const isHidden = hiddenQuotes.has(series.key)
          return (
            <div
              key={series.key}
              className={cn(
                'group flex items-center gap-2 py-1 px-2 rounded-6 border hover:bg-accent',
                isHidden
                  ? 'opacity-40 border-transparent'
                  : 'border-surface-600 hover:border-accent',
              )}
            >
              <button
                type="button"
                onClick={() => toggleQuoteVisibility(series.key)}
                className="flex items-center gap-2 text-caption"
              >
                <span
                  className="size-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                  }}
                />
                <span className="group-hover:text-background">
                  {series.key}
                </span>
                <span className="text-muted group-hover:text-background">
                  {formatRate(series.latestClose)}
                </span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeChartPick(series.key)
                }}
                className="text-muted p-0.5 hover:text-red hover:bg-red/20 cursor-pointer"
                aria-label={`Remove ${series.key}`}
              >
                <XIcon className="size-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const CompareTooltip = ({
  label,
  payload,
  seriesList,
  hiddenQuotes,
}: {
  label: string
  payload: ReadonlyArray<Record<string, unknown>>
  seriesList: SeriesData[]
  hiddenQuotes: Set<string>
}) => {
  return (
    <div className="bg-popover border border-surface-600 rounded-8 shadow-md p-3 text-caption">
      <p className="text-muted mb-2">{label}</p>
      <div className="flex flex-col gap-1">
        {seriesList.map((series, i) => {
          if (hiddenQuotes.has(series.key)) return null

          const indexedEntry = payload.find(
            (p) => p.dataKey === `${series.key}_indexed`,
          )
          if (!indexedEntry) return null
          const indexedVal = indexedEntry.value
          if (typeof indexedVal !== 'number') return null
          const pctChange = indexedVal - 100

          const rateEntry = payload.find(
            (p) => p.dataKey === `${series.key}_rate`,
          )
          const rateVal =
            rateEntry && typeof rateEntry.value === 'number'
              ? rateEntry.value
              : null

          return (
            <div key={series.key} className="flex items-center gap-2">
              <span
                className="size-2 rounded-full shrink-0"
                style={{
                  backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                }}
              />
              <span className="text-foreground font-medium min-w-8">
                {series.key}
              </span>
              <span className={pctChange >= 0 ? 'text-green' : 'text-red'}>
                {pctChange >= 0 ? '+' : ''}
                {pctChange.toFixed(2)}%
              </span>
              {rateVal && (
                <span className="text-muted">{formatRate(rateVal)}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
