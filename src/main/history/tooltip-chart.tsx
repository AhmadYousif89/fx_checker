import { formatRate, formatTooltipDate } from '#/lib/currency'
import { memo } from 'react'
import type { TooltipPayload } from 'recharts'

type TooltipChartProps = {
  selectedTime: string
  smaPeriod: number
  active: boolean
  payload: TooltipPayload
  label: string | number | undefined
}

export const TooltipChart = memo(
  ({ active, payload, label, selectedTime, smaPeriod }: TooltipChartProps) => {
    if (!active || !payload.length) return null
    const dateStr = label as string
    const close = payload.find((p) => p.dataKey === 'close')?.value as number
    const high = payload.find((p) => p.dataKey === 'high')?.value as
      | number
      | undefined
    const low = payload.find((p) => p.dataKey === 'low')?.value as
      | number
      | undefined
    const sma = payload.find((p) => p.dataKey === 'sma')?.value as
      | number
      | undefined

    return (
      <div className="bg-surface rounded-10 px-3 py-1.5 text-caption md:text-body text-foreground space-y-0.5 flex flex-col gap-1 border">
        <span>{formatTooltipDate(dateStr, selectedTime)}</span>
        <div className="text-accent uppercase">close {formatRate(close)}</div>
        {high != null && low != null && (
          <div className="text-muted">
            H: {formatRate(high)} L: {formatRate(low)}
          </div>
        )}
        {sma != null && (
          <div className="text-amber">
            SMA {smaPeriod}: {formatRate(sma)}
          </div>
        )}
      </div>
    )
  },
)
