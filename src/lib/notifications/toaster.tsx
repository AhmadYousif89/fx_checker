import { memo, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

import { cn } from '#/lib/utils'
import { toasts } from './store'
import type { ToastItem } from './store'

type Props = {
  className?: string
}

export const NotificationToaster = memo(({ className }: Props) => {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    const unsub = toasts.subscribe(() => setItems(toasts.getSnapshot()))
    setItems(toasts.getSnapshot())
    return () => {
      unsub()
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => toasts.removeExpired(), 250)
    return () => clearInterval(timer)
  }, [])

  return (
    <div
      className={cn(
        'fixed left-1/2 -translate-x-1/2 z-100 flex flex-col gap-2 top-28',
        className,
      )}
    >
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            layout
            key={item.id}
            onMouseEnter={() => toasts.pause(item.id)}
            onMouseLeave={() => toasts.resume(item.id)}
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="group pointer-events-auto bg-accent rounded-8 px-3 py-2 max-w-sm md:max-w-lg md:min-w-sm shadow flex items-center justify-between gap-4 whitespace-nowrap"
          >
            <span className="text-caption text-[black] font-medium">
              {item.message}
            </span>
            {item.dismissable && (
              <button
                type="button"
                onClick={() => toasts.remove(item.id)}
                className="text-[black] group-hover:bg-red group-hover:text-[white] transition-colors p-1 rounded-4 cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
})
