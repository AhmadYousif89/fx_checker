import { memo } from 'react'
import { Button } from '#/components/ui/button'
import { useUpdateUrl } from '#/hooks/use-update-url'
import { toggleFavorite } from '#/store/currencies.store'
import type { CurrencyPair, RateWithDiff } from '#/types/currency'
import { ArrowRightIcon, StarIcon } from 'lucide-react'
import { RateDiff } from '#/components/rate-diff'
import { cn } from '#/lib/utils'

export const FavoritesItem = memo(
  ({
    item,
    rate,
    index,
    difference,
    direction,
  }: {
    item: CurrencyPair
    rate: string
    index: number
    difference?: number
    direction?: RateWithDiff['direction']
  }) => {
    const updateUrl = useUpdateUrl()

    const handleClick = () =>
      updateUrl({ from: item.sender, to: item.receiver })

    return (
      <li
        style={{ animationDelay: `${index * 80}ms` }}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        }}
        tabIndex={0}
        role="button"
        className={cn(
          'h-15 flex items-center justify-between gap-5 bg-surface-600 border py-2.5 px-3 md:px-4 rounded-10 cursor-pointer',
          'hover:border-surface-300 active:border-surface-300 transition-colors opacity-0 animate-fade-in',
          'outline-none focus-visible:ring focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        )}
      >
        <span className="flex items-center gap-4 size-full text-body">
          {item.sender}
          <ArrowRightIcon className="size-3 text-muted" />
          {item.receiver}
        </span>
        <div className="flex items-center gap-5">
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-body">{rate}</span>
            {difference != null && direction ? (
              <RateDiff
                difference={difference}
                direction={direction}
                className="text-overline"
              />
            ) : null}
          </div>
          <Button
            size="icon-sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              toggleFavorite(item.sender, item.receiver)
            }}
            className="hover:bg-surface-500 active:bg-surface-500"
          >
            <StarIcon className="fill-accent stroke-accent" />
          </Button>
        </div>
      </li>
    )
  },
)
