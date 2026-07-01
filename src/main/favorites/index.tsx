import { ArrowRightIcon, StarIcon } from 'lucide-react'

import { Button } from '#/components/ui/button'
import type { CurrencyPair } from '#/types/currency'
import { formatRate, getCrossRate } from '#/lib/currency'
import { useLatestRates } from '#/hooks/use-latest-rates'
import { useUpdateUrl } from '#/hooks/use-update-url'
import { toggleFavorite, useCurrencyStore } from '#/store/currencies.store'
import { CustomSpinner } from '#/components/custom-spinner'

export const FavoritesSection = () => {
  const updateUrl = useUpdateUrl()
  const favorites = useCurrencyStore((s) => s.favorites)
  const favoritesCount = favorites.length

  const { data: ratesData, isLoading, isFetching, isError } = useLatestRates()

  const getRate = (f: CurrencyPair) =>
    ratesData
      ? (getCrossRate({
          rates: ratesData.rates,
          base: f.sender,
          quote: f.receiver,
        }) ?? 0)
      : 0

  if (isLoading || isFetching) {
    return <CustomSpinner />
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
      <ul className="space-y-3">
        {favorites.map((f, index) => (
          <li
            key={`${f.sender}-${f.receiver}`}
            onClick={() =>
              updateUrl({
                from: f.sender,
                to: f.receiver,
              })
            }
            style={{ animationDelay: `${index * 80}ms` }}
            className="h-15 flex items-center justify-between gap-5 bg-surface-600 border py-2.5 px-3 md:px-4 rounded-10 cursor-pointer hover:border-surface-300 active:border-surface-300 transition-colors opacity-0 animate-fade-in"
          >
            <span className="flex items-center gap-4 size-full text-body">
              {f.sender}
              <ArrowRightIcon className="size-3 text-muted" />
              {f.receiver}
            </span>
            <div className="flex items-center gap-5">
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-body">{formatRate(getRate(f))}</span>
                <span className="text-overline"></span>
              </div>
              <Button
                size="icon-sm"
                variant="outline"
                onClick={() => toggleFavorite(f.sender, f.receiver)}
                className="hover:bg-surface-500 active:bg-surface-500"
              >
                <StarIcon className="fill-lime stroke-lime" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
