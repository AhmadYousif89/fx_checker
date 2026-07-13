import { formatRate } from '#/lib/currency'
import { cn } from '#/lib/utils'
import { XIcon } from 'lucide-react'
import { removeChartPick } from '#/store/currencies.store'
import { CHART_COLORS } from './compare-chart.types'
import type { SeriesData } from './compare-chart.types'

type CompareChartLegendProps = {
  seriesList: SeriesData[]
  hiddenQuotes: Set<string>
  onToggle: (quote: string) => void
}

export const CompareChartLegend = ({
  seriesList,
  hiddenQuotes,
  onToggle,
}: CompareChartLegendProps) => (
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
            onClick={() => onToggle(series.key)}
            className="flex items-center gap-2 text-caption"
          >
            <span
              className="size-2.5 rounded-full shrink-0"
              style={{
                backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
              }}
            />
            <span className="group-hover:text-background">{series.key}</span>
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
)
