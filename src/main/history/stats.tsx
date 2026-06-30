import { formatRate } from '#/lib/currency'

type HistoryStatsProps = {
  stats: {
    open: number
    close: number
    change: number
    percentChange: number
  } | null
  isLoading: boolean
}

export const HistoryStats = ({ stats, isLoading }: HistoryStatsProps) => {
  return (
    <div className="w-full lg:max-w-[610px] grid grid-cols-[repeat(auto-fit,minmax(140px,1fr)minmax(140px,1fr))] items-center gap-2.5 md:gap-4 uppercase">
      <div className="aspect-square h-20 w-full px-5 py-3 border border-surface-600 bg-surface flex flex-col gap-4 rounded-16">
        <span className="text-foreground-darker text-body">open</span>
        {isLoading ? (
          <div className="h-full w-24 rounded-full animate-pulse bg-muted/30" />
        ) : (
          <span className="text-heading whitespace-nowrap">
            {stats ? formatRate(stats.open) : '—'}
          </span>
        )}
      </div>
      <div className="aspect-square h-20 w-full px-5 py-3 border border-surface-600 bg-surface flex flex-col gap-4 rounded-16">
        <span className="text-foreground-darker text-body">last</span>
        {isLoading ? (
          <div className="h-full w-24 rounded-full animate-pulse bg-muted/30" />
        ) : (
          <span className="text-heading whitespace-nowrap">
            {stats ? formatRate(stats.close) : '—'}
          </span>
        )}
      </div>
      <div className="aspect-square h-20 w-full px-5 py-3 border border-surface-600 bg-surface flex flex-col gap-4 rounded-16">
        <span className="text-foreground-darker text-body">change</span>
        {isLoading ? (
          <div className="h-full w-24 rounded-full animate-pulse bg-muted/30" />
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
        <span className="text-foreground-darker text-body">% change</span>
        {isLoading ? (
          <div className="h-full w-24 rounded-full animate-pulse bg-muted/30" />
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
}
