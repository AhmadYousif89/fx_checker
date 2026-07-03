import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { formatAxisDate, formatTooltipDate, formatRate } from '#/lib/currency'
import { computeHistoryYAxisDomain } from '#/lib/history-helpers'
import { useReducedMotion } from '#/hooks/use-reduced-motion'

export const HistoryChart = ({
  data,
  sender,
  receiver,
  selectedTime,
}: {
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
}) => {
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
    <div className="min-h-96 w-full py-4 px-3 md:p-5 bg-surface border border-surface-600 rounded-16 flex flex-col gap-5">
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
            data={data}
            margin={{ top: 20, right: 25, left: 0, bottom: 0 }}
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
              dy={10}
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
              dy={-10}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload.length) return null
                const dateStr = label as string
                const value = payload[0].value as number
                return (
                  <div className="bg-surface-600 rounded-10 px-3 py-1.5 text-body text-foreground">
                    <span>{formatTooltipDate(dateStr, selectedTime)}</span>{' '}
                    &mdash;{' '}
                    <span className="text-accent">{formatRate(value)}</span>
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
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
