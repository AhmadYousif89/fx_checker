import { useEffect, useState } from 'react'
import { ArrowRightIcon, StarIcon } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { ScrollArea } from '#/components/ui/scroll-area'
import { useElementMaxHeight } from '#/hooks/use-element-max-height'
import { useUpdateUrl } from '#/hooks/use-update-url'
import { formatRate } from '#/lib/currency'
import { toggleFavorite } from '#/store/currencies.store'
import type { CurrencyPair } from '#/types/currency'

type FavoritesListProps = {
  favorites: CurrencyPair[]
  getRate: (f: CurrencyPair) => number
}

export const FavoritesList = ({ favorites, getRate }: FavoritesListProps) => {
  const updateUrl = useUpdateUrl()
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
                <StarIcon className="fill-accent stroke-accent" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </ScrollArea>
  )
}
