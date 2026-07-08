import { useEffect, useState } from 'react'

import { formatRate } from '#/lib/currency'
import type { CurrencyPair, RateWithDiff } from '#/types/currency'
import { useElementMaxHeight } from '#/hooks/use-element-max-height'
import { ScrollArea } from '#/components/ui/scroll-area'
import { FavoritesItem } from './favorit-item'

type FavoritesListProps = {
  favorites: CurrencyPair[]
  getRateWithDiff: (f: CurrencyPair) => RateWithDiff | undefined
}

export const FavoritesList = ({
  favorites,
  getRateWithDiff,
}: FavoritesListProps) => {
  const [paddingBottom, setPaddingBottom] = useState(68)
  const [listRef, maxHeight] = useElementMaxHeight(paddingBottom)

  useEffect(() => {
    const pb = (window.innerWidth >= 768 ? 48 : 32) + 20
    setPaddingBottom(pb)
  }, [])

  return (
    <ScrollArea
      ref={listRef}
      style={maxHeight != null ? { maxHeight } : undefined}
    >
      <ul className="space-y-3">
        {favorites.map((f, index) => {
          const diff = getRateWithDiff(f)
          return (
            <FavoritesItem
              key={`${f.sender}-${f.receiver}`}
              item={f}
              index={index}
              rate={formatRate(diff?.rate ?? 0)}
              difference={diff?.difference}
              direction={diff?.direction}
            />
          )
        })}
      </ul>
    </ScrollArea>
  )
}
