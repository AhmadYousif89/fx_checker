import { memo } from 'react'

import { formatRate } from '#/lib/currency'
import { useHistoryData } from './history-context'

export const HistoryStats = memo(() => {
  const { stats, isLoading } = useHistoryData()

  return (
    <div className="w-full lg:max-w-152 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr)minmax(140px,1fr))] items-center gap-2.5 md:gap-4 uppercase">
      <div className="aspect-square h-20 w-full px-5 py-3 border border-surface-600 bg-surface flex flex-col gap-4 rounded-16">
        <span className="text-foreground-darker text-body select-none">
          open
        </span>
        {isLoading ? (
          <div className="h-full w-24 rounded-full animate-pulse bg-muted/10" />
        ) : (
          <span className="text-heading whitespace-nowrap">
            {stats ? formatRate(stats.open) : '—'}
          </span>
        )}
      </div>
      <div className="aspect-square h-20 w-full px-5 py-3 border border-surface-600 bg-surface flex flex-col gap-4 rounded-16">
        <span className="text-foreground-darker text-body select-none">
          last
        </span>
        {isLoading ? (
          <div className="h-full w-24 rounded-full animate-pulse bg-muted/10" />
        ) : (
          <span className="text-heading whitespace-nowrap">
            {stats ? formatRate(stats.close) : '—'}
          </span>
        )}
      </div>
      <div className="aspect-square h-20 w-full px-5 py-3 border border-surface-600 bg-surface flex flex-col gap-4 rounded-16">
        <span className="text-foreground-darker text-body select-none">
          change
        </span>
        {isLoading ? (
          <div className="h-full w-24 rounded-full animate-pulse bg-muted/10" />
        ) : (
          <span
            className={`text-heading whitespace-nowrap ${stats && stats.change > 0 ? 'text-green' : stats && stats.change < 0 ? 'text-red' : ''}`}
          >
            {stats
              ? `${stats.change >= 0 ? '+' : ''}${formatRate(stats.change)}`
              : '—'}
          </span>
        )}
      </div>
      <div className="aspect-square h-20 w-full px-5 py-3 border border-surface-600 bg-surface flex flex-col gap-4 rounded-16">
        <span className="text-foreground-darker text-body select-none">
          % change
        </span>
        {isLoading ? (
          <div className="h-full w-24 rounded-full animate-pulse bg-muted/10" />
        ) : (
          <span
            className={`text-heading whitespace-nowrap ${stats && stats.percentChange > 0 ? 'text-green' : stats && stats.percentChange < 0 ? 'text-red' : ''}`}
          >
            {stats
              ? `${stats.percentChange > 0 ? '▲' : stats.percentChange < 0 ? '▼' : ''} ${stats.percentChange >= 0 ? '+' : ''}${stats.percentChange.toFixed(2)}%`
              : '—'}
          </span>
        )}
      </div>
    </div>
  )
})
