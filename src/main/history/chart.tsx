import { memo, useCallback, useMemo, useRef } from 'react'
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

import { SMA_PERIODS } from '#/lib/history/config'
import { formatAxisDate, formatRate } from '#/lib/currency'
import { computeSMA, computeHistoryYAxisDomain } from '#/lib/history/helpers'

import { SmaToggle } from './sma-toggle'
import { BrushChart } from './brush-chart'
import { TooltipChart } from './tooltip-chart'
import { useDragZoom } from '#/hooks/use-drag-zoom'
import { useReducedMotion } from '#/hooks/use-reduced-motion'
import { Button } from '#/components/ui/button'

type HistoyChartProps = {
  data: {
    time: string
    close: number
    open: number
    high: number
    low: number
  }[]
  fullData?: { time: string; close: number }[]
  sender: string
  receiver: string
  selectedTime: string
  yDomain?: [number, number]
  smaEnabled: boolean
  onSmaToggle: () => void
  zoomed: boolean
  zoomStart?: number
  zoomEnd?: number
  onZoom: (range: { startIndex: number; endIndex: number }) => void
  onResetZoom: () => void
}

export const HistoryChart = memo(
  ({
    data,
    fullData,
    sender,
    receiver,
    selectedTime,
    yDomain: yDomainProp,
    smaEnabled,
    onSmaToggle,
    zoomed,
    zoomStart,
    zoomEnd,
    onZoom,
    onResetZoom,
  }: HistoyChartProps) => {
    const reducedMotion = useReducedMotion()
    const lastData = data[data.length - 1]
    const chartAreaRef = useRef<HTMLDivElement>(null)

    const drag = useDragZoom(chartAreaRef, data.length)

    const handleBrushChange = useCallback(
      (range: { startIndex?: number; endIndex?: number }) => {
        if (range.startIndex != null && range.endIndex != null) {
          onZoom({ startIndex: range.startIndex, endIndex: range.endIndex })
        }
      },
      [onZoom],
    )

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
      if (smaSeries && yDomainProp) {
        const smaValues = smaSeries.filter((v): v is number => v !== null)
        if (smaValues.length > 0) {
          const all = [
            ...data.map((d) => ({ close: d.close })),
            ...smaValues.map((v) => ({ close: v })),
          ]
          return computeHistoryYAxisDomain(all)
        }
      }
      return yDomainProp ?? computeHistoryYAxisDomain(data)
    }, [data, smaSeries, yDomainProp])

    const headerDate =
      selectedTime === '5y'
        ? new Date()
        : new Date(lastData.time.replace(' ', 'T') + 'Z')

    const timeStr = Number.isNaN(headerDate.getTime())
      ? ''
      : headerDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short',
        })

    const headerDateStr = Number.isNaN(headerDate.getTime())
      ? lastData.time
      : `${headerDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase()} ${timeStr}`

    return (
      <div className="flex flex-col min-h-96 w-full py-4 px-3 md:p-5 md:pb-3 bg-surface border border-surface-600 rounded-16">
        <style>{`.recharts-brush-texts { font-size: 14px !important; font-weight: 100; stroke: var(--foreground-darker) }`}</style>
        <div className="flex justify-between items-baseline uppercase mb-5">
          <span className="text-body-lg-medium text-foreground flex items-center gap-1">
            <div className="flex flex-col items-start sm:flex-row sm:items-center gap-1">
              <span className="whitespace-nowrap">
                {sender}/{receiver}
              </span>
              <div className="flex items-center gap-2">
                <SmaToggle smaEnabled={smaEnabled} onToggle={onSmaToggle} />
                {smaEnabled && smaPeriod > 0 && (
                  <span className="text-caption text-amber">
                    SMA {smaPeriod}
                  </span>
                )}
              </div>
            </div>
          </span>
          <span className="whitespace-nowrap text-foreground-darker text-caption">
            {formatRate(lastData.close)} • {headerDateStr}
          </span>
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
                  <stop
                    offset="1%"
                    stopColor="var(--accent)"
                    stopOpacity={0.5}
                  />
                  <stop
                    offset="99%"
                    stopColor="var(--accent)"
                    stopOpacity={0}
                  />
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
                tickFormatter={(dateStr) =>
                  formatAxisDate(dateStr, selectedTime)
                }
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
        {fullData && (
          <BrushChart
            data={fullData}
            zoomStart={zoomStart}
            zoomEnd={zoomEnd}
            onChange={handleBrushChange}
          />
        )}
      </div>
    )
  },
)
