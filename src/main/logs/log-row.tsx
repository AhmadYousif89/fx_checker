import { memo } from 'react'
import { motion } from 'framer-motion'
import { ArrowRightIcon, TrashIcon } from 'lucide-react'

import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import { useUpdateUrl } from '#/hooks/use-update-url'
import { formatAmount, shortTimeAgo } from '#/lib/currency'
import { removeLog } from '#/store/currencies.store'
import type { ConversionLog } from '#/types/currency'

const itemVariants = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0 },
}

type LogRowProps = {
  log: ConversionLog
}

export const LogRow = memo(({ log }: LogRowProps) => {
  const updateUrl = useUpdateUrl()
  const logTime = shortTimeAgo(log.timestamp)

  const handleClick = () => {
    updateUrl({
      from: log.sender,
      to: log.receiver,
      amount: String(log.amount),
    })
  }

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
      variants={itemVariants}
      className={cn(
        'h-15 flex items-center justify-between gap-5 bg-surface-600 border py-2.5 px-3 md:px-4 rounded-10 cursor-pointer',
        'hover:border-surface-300 active:border-surface-300 transition-colors',
        'outline-none focus-visible:ring focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
      )}
    >
      <div className="flex grow md:items-center flex-col md:flex-row gap-1 md:gap-4">
        <time className="text-body text-muted min-w-16">{logTime}</time>
        <span className="flex items-center gap-2 text-body">
          {log.sender}
          <ArrowRightIcon className="size-4 text-muted" />
          {log.receiver}
        </span>
      </div>

      <div
        className={cn(
          'flex grow items-end md:items-center md:justify-end flex-col md:flex-row gap-1 md:gap-4',
        )}
      >
        <span className="text-body-lg text-foreground-darker">
          {formatAmount(log.amount)}
        </span>
        <span className="text-body-lg text-accent">
          {formatAmount(log.result)}
        </span>
      </div>
      <Button
        size="icon-sm"
        variant="outline"
        onClick={(e) => {
          e.stopPropagation()
          removeLog(log.timestamp)
        }}
        className="border-border hover:text-[white] hover:bg-red hover:border-red focus-visible:ring-red active:bg-red active:border-red"
      >
        <TrashIcon />
      </Button>
    </motion.li>
  )
})
