import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import type { Variants } from 'framer-motion'
import { motion } from 'framer-motion'

import { cn } from '#/lib/utils'
import { ScrollArea } from '#/components/ui/scroll-area'
import { useElementMaxHeight } from '#/hooks/use-element-max-height'

function Root({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <section
      className={cn(
        'grid grow place-content-start justify-normal gap-2 md:gap-3 bg-surface border border-surface-600 rounded-16 px-2 md:px-3 py-4 md:py-5',
        className,
      )}
    >
      {children}
    </section>
  )
}

function Header({
  title,
  headerChildren,
  actions,
}: {
  title: ReactNode
  headerChildren?: ReactNode
  actions?: ReactNode
}) {
  return (
    <header className="flex flex-col justify-between gap-2 px-2 md:flex-row md:items-center">
      <h3 className="text-body-lg-medium uppercase">{title}</h3>
      <div className="flex items-center gap-4">
        {headerChildren}
        {actions}
      </div>
    </header>
  )
}

function Body({
  children,
  variants,
  initial,
  animate,
}: {
  children: ReactNode
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
    >
      <motion.ul
        className="space-y-3 p-2"
        variants={variants}
        initial={initial}
        animate={animate}
      >
        {children}
      </motion.ul>
    </ScrollArea>
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

export const InsightCard = { Root, Header, Body, Skeleton }
