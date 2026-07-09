import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Brush,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'

import { useReducedMotion } from '#/hooks/use-reduced-motion'
import { computeSMA, computeHistoryYAxisDomain } from '#/lib/history/helpers'
import { formatAxisDate, formatTooltipDate, formatRate } from '#/lib/currency'

import { SmaToggle } from './sma-toggle'
import { SMA_PERIODS } from '#/lib/history/config'

type HistoyChartProps = {
  data: {
    time: string
    close: number
    open: number
    high: number
    low: number
  }[]
  sender: string
  receiver: string
  selectedTime: string
  yDomain?: [number, number]
  smaEnabled: boolean
  onSmaToggle: () => void
}

export const HistoryChart = ({
  data,
  sender,
  receiver,
  selectedTime,
  yDomain: yDomainProp,
  smaEnabled,
  onSmaToggle,
}: HistoyChartProps) => {
  const reducedMotion = useReducedMotion()
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
    <div className="min-h-96 w-full py-4 px-3 md:p-5 md:pb-3 bg-surface border border-surface-600 rounded-16 flex flex-col gap-5">
      <style>{`.recharts-brush-texts { font-size: 14px !important; font-weight: 100; stroke: var(--foreground-darker) }`}</style>
      <div className="flex justify-between items-center uppercase">
        <span className="text-body-lg-medium text-foreground flex items-center gap-2">
          <span>
            {sender}/{receiver}
          </span>
          <SmaToggle smaEnabled={smaEnabled} onToggle={onSmaToggle} />
          {smaEnabled && smaPeriod > 0 && (
            <span className="text-caption text-muted font-normal">
              SMA {smaPeriod}
            </span>
          )}
        </span>
        <span className="text-foreground-darker text-caption">
          {formatRate(lastData.close)} &bull; {headerDateStr}
        </span>
      </div>
      <div className="flex-1 w-full">
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
                className: 'text-caption',
              }}
              minTickGap={30}
            />
            <YAxis
              domain={yDomain}
              axisLine={false}
              tickLine={false}
              tick={{
                fill: 'var(--muted)',
                className: 'text-caption',
              }}
              tickFormatter={(val) => formatRate(val)}
              orientation="left"
              mirror={true}
              dy={-8}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload.length) return null
                const dateStr = label as string
                const close = payload.find((p) => p.dataKey === 'close')
                  ?.value as number
                const sma = payload.find((p) => p.dataKey === 'sma')?.value as
                  | number
                  | undefined
                return (
                  <div className="bg-surface rounded-10 px-3 py-1.5 text-body text-foreground space-y-0.5 flex flex-col gap-1">
                    <span>{formatTooltipDate(dateStr, selectedTime)}</span>
                    <div className="text-accent uppercase">
                      close {formatRate(close)}
                    </div>
                    {sma != null && (
                      <div className="text-[#f59e0b]">
                        SMA {smaPeriod}: {formatRate(sma)}
                      </div>
                    )}
                  </div>
                )
              }}
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
            <Brush
              dataKey="time"
              fill="transparent"
              stroke="var(--muted)"
              travellerWidth={8}
              height={50}
            >
              <AreaChart>
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke="var(--accent)"
                  fill="var(--accent-darker)"
                  fillOpacity={0.25}
                  isAnimationActive={false}
                />
              </AreaChart>
            </Brush>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
