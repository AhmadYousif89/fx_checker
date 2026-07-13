import { formatRate } from '#/lib/currency'
import { CHART_COLORS } from './compare-chart.types'
import type { SeriesData } from './compare-chart.types'

type CompareChartTooltipProps = {
  label: string
  payload: ReadonlyArray<Record<string, unknown>>
  seriesList: SeriesData[]
  hiddenQuotes: Set<string>
}

export const CompareChartTooltip = ({
  label,
  payload,
  seriesList,
  hiddenQuotes,
}: CompareChartTooltipProps) => {
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

          const rateEntry = series.data.find((d) => d.time === label)
          const rateVal = rateEntry ? rateEntry.close : null

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
              <span className="text-muted">
                {rateVal != null ? formatRate(rateVal) : null}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
