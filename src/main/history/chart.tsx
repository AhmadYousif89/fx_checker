import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Brush,
} from 'recharts'

import { formatAxisDate, formatTooltipDate, formatRate } from '#/lib/currency'
import { computeHistoryYAxisDomain } from '#/lib/history-helpers'
import { useReducedMotion } from '#/hooks/use-reduced-motion'

const getRange = (length: number) => ({
  startIndex: 0,
  endIndex: Math.max(length - 1, 0),
})

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
}

export const HistoryChart = ({
  data,
  sender,
  receiver,
  selectedTime,
}: HistoyChartProps) => {
  const [range, setRange] = useState(() => getRange(data.length))
  const storedDateRangeRef = useRef<{
    startTime: string
    endTime: string
  } | null>(null)

  const handleChange = useCallback(
    ({ startIndex, endIndex }: { startIndex: number; endIndex: number }) => {
      setRange((prev) => {
        if (prev.startIndex === startIndex && prev.endIndex === endIndex)
          return prev
        return { startIndex, endIndex }
      })
    },
    [],
  )

  useEffect(() => {
    if (storedDateRangeRef.current) {
      const { startTime, endTime } = storedDateRangeRef.current
      const startIndex = data.findIndex((d) => d.time === startTime)
      const endIndex =
        data.length -
        1 -
        [...data].reverse().findIndex((d) => d.time === endTime)
      if (startIndex !== -1 && endIndex !== -1) {
        setRange({ startIndex, endIndex })
        return
      }
    }
    storedDateRangeRef.current = null
    setRange(getRange(data.length))
  }, [data])

  useEffect(() => {
    if (brushStartIndex === 0 && brushEndIndex === maxIndex) return
    storedDateRangeRef.current = {
      startTime: data[range.startIndex]?.time,
      endTime: data[range.endIndex]?.time,
    }
  }, [range.startIndex, range.endIndex, data])

  const maxIndex = Math.max(data.length - 1, 0)
  const brushStartIndex = Math.min(range.startIndex, maxIndex)
  const brushEndIndex = Math.min(range.endIndex, maxIndex)

  const reducedMotion = useReducedMotion()
  const lastData = data[data.length - 1]
  const yDomain = computeHistoryYAxisDomain(data)

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
        <span className="text-body-lg-medium text-foreground">
          {sender}/{receiver}
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
            data={data}
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
                const value = payload[0].value as number
                return (
                  <div className="bg-surface-600 rounded-10 px-3 py-1.5 text-body text-foreground">
                    <span>{formatTooltipDate(dateStr, selectedTime)}</span>{' '}
                    &mdash; <span>{formatRate(value)}</span>
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
            <Brush
              dataKey="time"
              startIndex={brushStartIndex}
              endIndex={brushEndIndex}
              onChange={handleChange}
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
