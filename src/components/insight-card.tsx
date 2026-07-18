import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import type { Variants } from 'framer-motion'
import { AnimatePresence, motion } from 'framer-motion'

import { cn } from '#/lib/utils'
import { ScrollArea } from '#/components/ui/scroll-area'
import { useElementMaxHeight } from '#/hooks/use-element-max-height'

function Root({
  className,
  children,
  ref,
}: {
  className?: string
  children: ReactNode
  ref?: React.Ref<HTMLElement>
}) {
  return (
    <section
      ref={ref}
      className={cn(
        'flex flex-col grow gap-2 md:gap-3 bg-surface border border-surface-600 rounded-16 px-2 md:px-3 py-4 md:py-5',
        className,
      )}
    >
      {children}
    </section>
  )
}

function Header({
  children,
  className,
}: {
  children?: ReactNode
  className?: string
}) {
  return (
    <header
      className={cn(
        'flex flex-col justify-between gap-2 px-2 md:flex-row md:items-center',
        className,
      )}
    >
      {children}
    </header>
  )
}

function Body({
  children,
  className,
  variants,
  initial,
  animate,
}: {
  children: ReactNode
  className?: string
  variants?: Variants
  initial?: string
  animate?: string
}) {
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
      className="overflow-y-scroll scrollbar-none"
    >
      <motion.ul
        className={cn('flex flex-col gap-3 p-2', className)}
        variants={variants}
        initial={initial}
        animate={animate}
      >
        {children}
      </motion.ul>
    </ScrollArea>
  )
}

function Hint({
  dismissed,
  children,
  className,
}: {
  dismissed: boolean
  children: ReactNode
  className?: string
}) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)
  const hasMounted = useRef(false)

  useEffect(() => {
    if (dismissed) {
      setShow(false)
      return
    }

    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!hasMounted.current) {
            hasMounted.current = true
            return
          }
          if (entry.isIntersecting) {
            setShow(true)
          }
        }
      },
      { threshold: 0 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [dismissed])

  return (
    <AnimatePresence>
      <div ref={sentinelRef} className="h-px" aria-hidden />
      {show && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className={cn(
            'overflow-hidden px-2 mx-2 bg-accent rounded-4',
            className,
          )}
        >
          <div className="flex items-center gap-2 py-2 text-caption text-background">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Skeleton({ hasActions = 0 }: { hasActions?: number }) {
  return (
    <Root>
      <header className="flex flex-col justify-between gap-2 px-2 md:flex-row md:items-center">
        <div className="h-5 w-48 rounded bg-muted/10 animate-pulse" />
        <div className="flex items-center gap-4">
          <div className="h-4 w-24 rounded bg-muted/10 animate-pulse" />
          {Array.from({ length: hasActions }).map((_, i) => (
            <div
              key={i}
              className="h-6 w-24 rounded-8 bg-muted/10 animate-pulse"
            />
          ))}
        </div>
      </header>
      <div className="space-y-3 p-2">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-14 rounded-10 animate-pulse bg-muted/10" />
        ))}
      </div>
    </Root>
  )
}

export const InsightCard = { Root, Header, Body, Hint, Skeleton }
