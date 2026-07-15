import { memo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRightIcon, StarIcon } from 'lucide-react'

import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import { useUpdateUrl } from '#/hooks/use-update-url'
import { toggleFavorite } from '#/store/currencies.store'
import { toasts } from '#/lib/notifications'
import type { CurrencyPair, RateWithDiff } from '#/types/currency'
import { RateDiff } from '#/components/rate-diff'

export const FavoritesItem = memo(
  ({
    item,
    rate,
    difference,
    direction,
    staggerDelay,
    isNew,
  }: {
    item: CurrencyPair
    rate: string
    difference?: number | null
    direction?: RateWithDiff['direction']
    staggerDelay: number
    isNew: boolean
  }) => {
    const updateUrl = useUpdateUrl()
    const [showFlash, setShowFlash] = useState(false)
    const flashShown = useRef(false)

    const handleClick = () =>
      updateUrl({ from: item.sender, to: item.receiver })

    return (
      <motion.li
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
        layout
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { zIndex: -1, opacity: 0 },
          visible: {
            zIndex: 1,
            opacity: 1,
            transition: {
              delay: staggerDelay / 1000,
              duration: 0.35,
              ease: 'easeOut',
            },
          },
        }}
        onAnimationStart={() => {
          if (isNew && !flashShown.current) {
            flashShown.current = true
            setShowFlash(true)
          }
        }}
        onAnimationEnd={() => setShowFlash(false)}
        className={cn(
          'h-15 flex items-center justify-between gap-5 bg-surface-600 border py-2.5 px-3 md:px-4 rounded-10 cursor-pointer',
          'hover:border-surface-300 active:border-surface-300 transition-colors',
          'outline-none focus-visible:ring focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
          showFlash && 'animate-flash',
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
            type="button"
            size="icon-sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              toggleFavorite(item.sender, item.receiver)
              toasts.push(
                `${item.sender}/${item.receiver} removed from favorites`,
              )
            }}
            className="hover:bg-surface-500 active:bg-surface-500"
          >
            <StarIcon className="fill-accent stroke-accent" />
          </Button>
        </div>
      </motion.li>
    )
  },
)
