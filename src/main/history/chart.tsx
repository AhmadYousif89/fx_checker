import { memo, useMemo, useRef } from 'react'
import { subDays, format, isValid, isSameYear } from 'date-fns'
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import { RotateCcw } from 'lucide-react'

import { SMA_PERIODS, TIME_RANGES } from '#/lib/history/config'
import { formatAxisDate, formatRate } from '#/lib/currency'
import { computeSMA, computeHistoryYAxisDomain } from '#/lib/history/helpers'

import { SmaToggle } from './sma-toggle'
import { BrushChart } from './brush-chart'
import { TooltipChart } from './tooltip-chart'
import { useDragZoom } from '#/hooks/use-drag-zoom'
import { useReducedMotion } from '#/hooks/use-reduced-motion'
import { Button } from '#/components/ui/button'
import { useHistoryData, useHistoryUI } from './history-context'
import { DatePicker } from './date-picker'

export const HistoryChart = memo(() => {
  const {
    displayData: data,
    fullData,
    yDomain: yDomainProp,
    liveRate,
  } = useHistoryData()
  const {
    sender,
    receiver,
    selectedTime,
    smaEnabled,
    zoomed,
    onZoom,
    onResetZoom,
    customEndDate,
  } = useHistoryUI()

  const reducedMotion = useReducedMotion()
  const chartAreaRef = useRef<HTMLDivElement>(null)

  const drag = useDragZoom(chartAreaRef, data.length)

  if (data.length === 0) return null

  const lastData = data[data.length - 1]

  const smaPeriod = smaEnabled ? (SMA_PERIODS[selectedTime] ?? 0) : 0

  const smaSeries = useMemo(
    () => (smaPeriod > 0 ? computeSMA(data, smaPeriod) : null),
    [data, smaPeriod],
  )

  const chartData = useMemo(
    () =>
      smaSeries ? data.map((d, i) => ({ ...d, sma: smaSeries[i] })) : data,
    [data, smaSeries],
  )

  const yDomain = useMemo(() => {
    if (smaSeries) {
      const smaValues = smaSeries.filter((v): v is number => v !== null)
      if (smaValues.length > 0) {
        const all = [
          ...data.map((d) => ({ close: d.close })),
          ...smaValues.map((v) => ({ close: v })),
        ]
        return computeHistoryYAxisDomain(all)
      }
    }
    return yDomainProp
  }, [data, smaSeries, yDomainProp])

  const headerDate = new Date()

  const headerValid = isValid(headerDate)
  const timeStr = headerValid
    ? headerDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      })
    : ''

  const headerDateStr = headerValid
    ? `${format(headerDate, 'MMM dd').toUpperCase()} ${timeStr}`
    : lastData.time

  const isIntraday = selectedTime === '1d' || selectedTime === '1w'

  const rangeText = customEndDate
    ? (() => {
        const startDate = subDays(customEndDate, TIME_RANGES[selectedTime])
        const fmtDate = (d: Date) => format(d, 'MMM dd, yyyy').toUpperCase()
        const fmtDateShort = (d: Date) => format(d, 'MMM dd').toUpperCase()
        const start = isSameYear(startDate, customEndDate)
          ? fmtDateShort(startDate)
          : fmtDate(startDate)
        const end = fmtDate(customEndDate)
        if (isIntraday) {
          return `${start} - ${end}`
        }
        return `${start} - ${end}`
      })()
    : null

  return (
    <div className="flex flex-col min-h-96 w-full py-4 px-3 md:p-5 md:pb-3 bg-surface border border-surface-600 rounded-16">
      <style>{`.recharts-brush-texts { font-size: 14px !important; font-weight: 100; stroke: var(--foreground-darker) }`}</style>
      <div className="flex justify-between items-baseline uppercase mb-5 text-foreground-darker">
        <span className="text-body-lg-medium text-foreground flex items-center gap-1">
          <div className="flex flex-col items-start sm:flex-row sm:items-center gap-1">
            <span className="whitespace-nowrap">
              {sender}/{receiver}
            </span>
            <div className="flex items-center gap-2">
              <SmaToggle />
              {smaEnabled && smaPeriod > 0 && (
                <span className="text-caption text-amber">SMA {smaPeriod}</span>
              )}
            </div>
          </div>
        </span>
        <div className="ml-auto flex flex-col gap-2 items-end">
          <div className="flex items-baseline">
            <span className="whitespace-nowrap text-caption mr-1">
              {formatRate(liveRate ?? lastData.close)} •
            </span>
            <DatePicker triggerValue={headerDateStr} />
          </div>
          {rangeText && (
            <p className="text-caption text-muted whitespace-nowrap">
              <span className="hidden sm:inline">selected </span>
              <span className="mr-2">range:</span>
              {rangeText}
            </p>
          )}
        </div>
      </div>
      <div
        ref={chartAreaRef}
        className="grow relative mb-2"
        style={{ touchAction: 'none' }}
        onPointerDown={drag.handlers.onPointerDown}
        onPointerMove={drag.handlers.onPointerMove}
        onPointerUp={(e) => {
          const result = drag.handlers.onPointerUp(e)
          if (result)
            onZoom({
              startIndex: result.startIndex,
              endIndex: result.endIndex,
            })
        }}
        onPointerLeave={drag.handlers.onPointerLeave}
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
          minHeight={200}
          initialDimension={{ height: 200, width: 300 }}
        >
          <AreaChart
            key={selectedTime}
            data={chartData}
            margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="1%" stopColor="var(--accent)" stopOpacity={0.5} />
                <stop offset="99%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
            />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tickFormatter={(dateStr) => formatAxisDate(dateStr, selectedTime)}
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
              tick={{
                fill: 'var(--muted)',
                className: 'text-caption select-none',
              }}
              tickFormatter={(val) => formatRate(val)}
              orientation="left"
              mirror={true}
              dy={-8}
            />
            <Tooltip
              content={({ active, payload, label }) => (
                <TooltipChart
                  selectedTime={selectedTime}
                  smaPeriod={smaPeriod}
                  active={active}
                  payload={payload}
                  label={label}
                />
              )}
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke="var(--accent)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRate)"
              isAnimationActive={!reducedMotion}
            />
            {smaSeries && smaPeriod > 0 && (
              <Line
                type="monotone"
                dataKey="sma"
                stroke="#f59e0b"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
                connectNulls={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
        {drag.selection && (
          <div
            style={{
              left: drag.selection.left,
              width: Math.max(drag.selection.width, 2),
            }}
            className="absolute top-5.5 bottom-8 pointer-events-none z-20 rounded-4 bg-linear-to-b from-accent/10 to-surface-600/50"
          />
        )}
        {zoomed && (
          <Button
            type="button"
            size="xs"
            className="absolute -top-4 right-0 z-20 rounded-sm md:gap-2 text-overline md:text-caption bg-surface uppercase"
            onClick={onResetZoom}
          >
            <RotateCcw className="size-3.5" />
            Reset zoom
          </Button>
        )}
      </div>
      {fullData.length > 0 && <BrushChart />}
    </div>
  )
})
