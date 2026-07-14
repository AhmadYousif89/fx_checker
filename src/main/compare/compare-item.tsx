import { memo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Image } from '@unpic/react'
import { StarIcon } from 'lucide-react'

import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import { useUpdateUrl } from '#/hooks/use-update-url'
import { toggleFavorite, useIsFavorited } from '#/store/currencies.store'
import {
  getFlagUrl,
  formatRate,
  formatAmount,
  abbreviateCurrencyName,
} from '#/lib/currency'

type CompareItemProps = {
  sender: string
  quote: string
  rate: number
  converted: number
  name: string
  isNew?: boolean
  staggerDelay?: number
}

export const CompareItem = memo((props: CompareItemProps) => {
  const { sender, quote, rate, converted, name, isNew, staggerDelay = 0 } = props
  const updateUrl = useUpdateUrl()
  const isFavorited = useIsFavorited(sender, quote)
  const [showFlash, setShowFlash] = useState(false)
  const flashShown = useRef(false)

  const flagUrl = getFlagUrl(quote)
  const handleClick = () => updateUrl({ from: sender, to: quote })

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
        hidden: { opacity: 0, y: 4 },
        visible: {
          opacity: 1,
          y: 0,
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
      <div className="flex items-center gap-2.5 size-full md:gap-5">
        {flagUrl && (
          <Image
            src={flagUrl}
            alt={quote}
            layout="fixed"
            width={24}
            height={24}
            className="size-6 rounded-full"
          />
        )}
        <span className="flex flex-col">
          <span className="text-body">{quote}</span>
          <span className="md:hidden text-caption text-muted">
            {abbreviateCurrencyName(name)}
          </span>
          <span className="hidden md:inline text-caption text-muted">
            {name}
          </span>
        </span>
      </div>
      <div className="flex items-center gap-5">
        <div className="flex flex-col items-end gap-1.5 whitespace-nowrap">
          <span className="text-body-lg truncate max-w-32">
            {formatAmount(converted)}
          </span>
          <span className="text-overline text-muted">@ {formatRate(rate)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              toggleFavorite(sender, quote)
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
    </motion.li>
  )
})
