import { Image } from '@unpic/react'
import { StarIcon, TrashIcon } from 'lucide-react'
import { memo, useEffect, useRef, useState } from 'react'
import { motion, useAnimationControls } from 'framer-motion'

import { cn } from '#/lib/utils'
import { useMediaQuery } from '#/hooks/use-media-query'
import { Button } from '#/components/ui/button'
import { useUpdateUrl } from '#/hooks/use-update-url'
import {
  toggleFavorite,
  useIsFavorited,
  useCurrencyStore,
  removeComparePick,
} from '#/store/currencies.store'
import { toasts } from '#/lib/notifications'
import {
  getFlagUrl,
  formatRate,
  formatAmount,
  abbreviateCurrencyName,
} from '#/lib/currency'

const DELETE_AREA_WIDTH = 100
const DELETE_THRESHOLD = 80

type CompareItemProps = {
  sender: string
  quote: string
  rate: number
  converted: number
  name: string
  isNew?: boolean
  staggerDelay?: number
  isFetching?: boolean
}

export const CompareItem = memo((props: CompareItemProps) => {
  const {
    sender,
    quote,
    rate,
    converted,
    name,
    isNew,
    isFetching,
    staggerDelay = 0,
  } = props
  const updateUrl = useUpdateUrl()
  const isFavorited = useIsFavorited(sender, quote)
  const [showFlash, setShowFlash] = useState(false)
  const controls = useAnimationControls()
  const dragOccurred = useRef(false)
  const isMobile = useMediaQuery('(max-width: 1023px)')

  useEffect(() => {
    if (!isNew) return

    setShowFlash(true)
    useCurrencyStore.setState((s) => ({
      compare: { ...s.compare, lastAddedPick: null },
    }))
    const timer = setTimeout(() => setShowFlash(false), 1000)

    return () => clearTimeout(timer)
  }, [isNew])

  const flagUrl = getFlagUrl(quote)

  const handleClick = () => {
    if (dragOccurred.current) return
    updateUrl({ from: sender, to: quote })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <motion.li
      layout
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { y: 4, opacity: 0 },
        visible: {
          y: 0,
          opacity: 1,
          transition: {
            delay: staggerDelay / 1000,
            duration: 0.35,
            ease: 'easeOut',
          },
        },
      }}
      className={cn('relative group h-15 max-lg:overflow-hidden')}
    >
      <div
        className={cn(
          'absolute inset-0 mx-1 my-0.5 flex items-center gap-2 text-white text-caption uppercase bg-transparent rounded-l-10 pl-4.5 transition-colors duration-200',
          'bg-linear-to-r from-red to-70% to-transparent',
        )}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            removeComparePick(quote)
          }}
          className="cursor-pointer hover:*:text-[#fff] outline-none rounded-xs -translate-x-1.5 p-0.5 focus-visible:ring focus-visible:ring-[#fff] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <TrashIcon className="size-5 text-foreground-darker" />
        </button>
      </div>
      <motion.div
        tabIndex={0}
        role="button"
        animate={controls}
        drag={isMobile ? 'x' : false}
        dragElastic={0.15}
        dragConstraints={{ left: 0, right: DELETE_AREA_WIDTH }}
        whileDrag={{ cursor: 'grabbing' }}
        onDragStart={() => {
          dragOccurred.current = true
        }}
        onDragEnd={(_, info) => {
          if (info.offset.x > DELETE_THRESHOLD) {
            removeComparePick(quote)
          } else {
            controls
              .start({
                x: 0,
                transition: { type: 'spring', stiffness: 500, damping: 30 },
              })
              .then(() => {
                dragOccurred.current = false
              })
          }
        }}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={`View ${sender}/${quote} exchange rate`}
        className={cn(
          'outline-none rounded-10 py-2.5 px-3 md:px-4 flex items-center justify-between gap-5',
          'bg-surface-600 border hover:border-surface-300 active:border-surface-300 truncate cursor-pointer',
          'focus-visible:ring focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
          'max-lg:relative max-lg:z-10',
          'lg:group-hover:scale-x-95 lg:group-focus-within:scale-x-95 lg:group-hover:delay-100 origin-right transform-3d transition-[border,colors,scale] duration-250',
          showFlash && 'animate-flash',
        )}
      >
        <div className="flex items-center gap-2.5 md:gap-5">
          {flagUrl && (
            <Image
              src={flagUrl}
              alt={quote}
              layout="fixed"
              width={24}
              height={24}
              draggable={false}
              className="size-6 rounded-full aspect-square object-center object-cover"
            />
          )}
          <span className="flex flex-col gap-1.5 truncate">
            <span className="text-body">{quote}</span>
            <span className="md:hidden text-caption text-muted truncate shrink min-w-0">
              {abbreviateCurrencyName(name)}
            </span>
            <span className="hidden md:inline text-caption text-muted">
              {name}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex flex-col items-end gap-1.5 truncate min-w-0 shrink">
            {isFetching ? (
              <>
                <span className="animate-pulse w-20 h-3.5 bg-muted/10 rounded-full" />
                <span className="animate-pulse w-14 h-2 bg-muted/10 rounded-full" />
              </>
            ) : (
              <>
                <span className="text-body-lg shrink truncate">
                  {formatAmount(converted)}
                </span>
                <span className="text-overline text-muted">
                  @ {formatRate(rate)}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                const wasFav = useCurrencyStore
                  .getState()
                  .favorites.pairs.some(
                    (f) => f.sender === sender && f.receiver === quote,
                  )
                toggleFavorite(sender, quote)
                toasts.push(
                  wasFav
                    ? `${sender}/${quote} removed from favorites`
                    : `${sender}/${quote} added to favorites`,
                )
              }}
              className="hover:bg-surface-500 active:bg-surface-500"
            >
              <StarIcon
                className={
                  isFavorited ? 'fill-accent stroke-accent' : 'stroke-muted'
                }
              />
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.li>
  )
})
