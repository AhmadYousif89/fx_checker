import type { CurrencyPair } from '#/types/currency'
import { getCrossRate } from '#/lib/currency'
import { useLatestRates } from '#/hooks/use-latest-rates'
import { useCurrencyStore } from '#/store/currencies.store'
import { FavoritesList } from './favorites-list'

export const FavoritesSection = () => {
  const favorites = useCurrencyStore((s) => s.favorites)
  const favoritesCount = favorites.length

  const { data: ratesData, isLoading, isError } = useLatestRates()

  const getRate = (f: CurrencyPair) =>
    ratesData
      ? (getCrossRate({
          rates: ratesData.rates,
          base: f.sender,
          quote: f.receiver,
        }) ?? 0)
      : 0

  if (isLoading) {
    return <FavoritesSkeleton />
  }

  if (isError || !ratesData) {
    return (
      <p className="text-caption text-red text-center py-10">
        Something went wrong, try again later
      </p>
    )
  }

  if (favoritesCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-10">
        <h3 className="text-heading text-foreground-darker">
          No pinned pairs yet
        </h3>
        <p className="text-body text-muted max-w-115 text-center">
          Pin a pair to track its rate here. Tap the star icon on any conversion
          or comparison row.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 md:gap-5 bg-surface border border-surface-600 rounded-16 p-4 md:p-5">
      <header className="flex items-center justify-between gap-2">
        <h3 className="text-body-lg-medium uppercase">pinned pairs</h3>
        <p className="text-foreground-darker text-caption uppercase">
          <span>{favoritesCount} </span>
          <span>favorites</span>
        </p>
      </header>
      <FavoritesList favorites={favorites} getRate={getRate} />
    </div>
  )
}

const FavoritesSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 md:gap-5 bg-surface border border-surface-600 rounded-16 p-4 md:p-5">
      <div className="flex items-center justify-between">
        <div className="h-5 w-36 rounded bg-muted/10 animate-pulse" />
        <div className="h-4 w-24 rounded bg-muted/10 animate-pulse" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-15 rounded-10 animate-pulse bg-muted/10" />
        ))}
      </div>
    </div>
  )
}
