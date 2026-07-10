import { useEffect, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'

import { getCrossRate, formatRate } from '#/lib/currency'
import type { CurrencyPair, RateWithDiff } from '#/types/currency'
import { useLatestRates } from '#/hooks/use-latest-rates'
import { useActivePair } from '#/hooks/use-active-pair'
import { useCurrencyStore } from '#/store/currencies.store'
import { getRates } from '#/server/functions/rates'
import { InsightCard } from '#/components/insight-card'
import { FavoritesItem } from './favorit-item'

let favsDidMount = false

export const FavoritesSection = () => {
  const favorites = useCurrencyStore((s) => s.favorites)
  const lastAddedFavKey = useCurrencyStore((s) => s.lastAddedFavKey)
  const favoritesCount = favorites.length
  const shouldAnimateOnMount = !favsDidMount

  const { sender } = useActivePair()
  const { data: ratesData, isLoading, isError } = useLatestRates()

  const { data: diffData } = useQuery({
    queryKey: ['favorites-diff', sender],
    queryFn: () => getRates({ data: { base: sender } }),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
  })

  useEffect(() => {
    if (isLoading || isError || favoritesCount === 0) return
    favsDidMount = true
  }, [favoritesCount, isError, isLoading])

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
    return <InsightCard.Skeleton />
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
    <InsightCard.Root>
      <InsightCard.Header
        title="pinned pairs"
        headerChildren={
          <span className="text-caption uppercase text-foreground-darker">
            {favoritesCount} favorites
          </span>
        }
      />
      <InsightCard.Body>
        <AnimatePresence mode="popLayout" initial={shouldAnimateOnMount}>
          {favorites.map((f, idx) => {
            const diff = getRateWithDiff(f)
            const key = `${f.sender}_${f.receiver}`
            return (
              <FavoritesItem
                key={key}
                item={f}
                rate={formatRate(diff?.rate ?? 0)}
                difference={diff?.difference}
                direction={diff?.direction}
                staggerDelay={shouldAnimateOnMount ? idx * 80 : 0}
                isNew={favsDidMount && key === lastAddedFavKey}
              />
            )
          })}
        </AnimatePresence>
      </InsightCard.Body>
    </InsightCard.Root>
  )
}
