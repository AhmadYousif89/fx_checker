import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { getCrossRate } from '#/lib/currency'
import type { CurrencyPair, RateWithDiff } from '#/types/currency'
import { useLatestRates } from '#/hooks/use-latest-rates'
import { useActivePair } from '#/hooks/use-active-pair'
import { useCurrencyStore } from '#/store/currencies.store'
import { getRates } from '#/server/functions/rates'
import { FavoritesList } from './favorites-list'

export const FavoritesSection = () => {
  const favorites = useCurrencyStore((s) => s.favorites)
  const favoritesCount = favorites.length
  const { sender } = useActivePair()

  const { data: ratesData, isLoading, isError } = useLatestRates()
  const { data: diffData } = useQuery({
    queryKey: ['favorites-diff', sender],
    queryFn: () => getRates({ data: { base: sender } }),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
  })

  const getRateWithDiff = useMemo(() => {
    const diffMap = new Map<string, RateWithDiff>()
    if (diffData) {
      for (const r of diffData) {
        diffMap.set(`${r.base}/${r.quote}`, r)
      }
    }

    return (f: CurrencyPair): RateWithDiff | undefined => {
      const cached = diffMap.get(`${f.sender}/${f.receiver}`)
      if (cached) return cached

      if (!ratesData) return undefined
      const rate = getCrossRate({
        rates: ratesData.rates,
        base: f.sender,
        quote: f.receiver,
      })
      if (rate == null) return undefined
      return {
        base: f.sender,
        quote: f.receiver,
        rate,
        difference: 0,
        direction: 'flat',
      }
    }
  }, [diffData, ratesData])

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
    <div className="grid grow place-content-start justify-normal gap-4 md:gap-5 bg-surface border border-surface-600 rounded-16 px-2 md:px-3 py-4 md:py-5">
      <header className="flex items-center justify-between gap-2 px-2">
        <h3 className="text-body-lg-medium uppercase">pinned pairs</h3>
        <p className="text-foreground-darker text-caption uppercase">
          <span>{favoritesCount} </span>
          <span>favorites</span>
        </p>
      </header>
      <FavoritesList favorites={favorites} getRateWithDiff={getRateWithDiff} />
    </div>
  )
}

const FavoritesSkeleton = () => {
  return (
    <div className="grid gap-4 md:gap-5 bg-surface border border-surface-600 rounded-16 p-4 md:p-5">
      <div className="flex items-center justify-between">
        <div className="h-5 w-36 rounded bg-muted/10 animate-pulse" />
        <div className="h-4 w-24 rounded bg-muted/10 animate-pulse" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-15 rounded-10 animate-pulse bg-muted/10" />
        ))}
      </div>
    </div>
  )
}
