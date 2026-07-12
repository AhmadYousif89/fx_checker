import { useEffect, useRef, useState } from 'react'
import { useIsFetching } from '@tanstack/react-query'

import { cn } from '#/lib/utils'
import { useLoadingStore } from '#/store/loading.store'

export const TopLoader = () => {
  const [shouldShow, setShouldShow] = useState(false)
  const anyActive = useLoadingStore((s) => s.anyActive)
  const hasKeepAlive = useLoadingStore((s) => s.hasKeepAlive)
  const settleNonKeepAlive = useLoadingStore((s) => s.settleNonKeepAlive)

  const ratesFetching = useIsFetching({ queryKey: ['rates'] })
  const latestFetching = useIsFetching({ queryKey: ['latest-rates'] })
  const currenciesFetching = useIsFetching({ queryKey: ['currencies'] })
  const historyFetching = useIsFetching({ queryKey: ['frankfurter-history'] })
  const intradayFetching = useIsFetching({ queryKey: ['tweleve-history'] })
  const isFetching =
    historyFetching + intradayFetching + ratesFetching + latestFetching + currenciesFetching

  const hasFetched = useRef(false)
  const settleTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // settle non-keepAlive loaders after a small delay to avoid flickering
  useEffect(() => {
    if (!anyActive) {
      hasFetched.current = false
      return
    }

    if (hasKeepAlive) return

    if (isFetching > 0) {
      hasFetched.current = true
      return
    }

    if (hasFetched.current) {
      settleTimer.current = setTimeout(() => {
        settleNonKeepAlive()
      }, 100)
      return () => clearTimeout(settleTimer.current)
    }
  }, [anyActive, isFetching, hasKeepAlive, settleNonKeepAlive])

  // fallback in case the query is stuck in a loading state
  useEffect(() => {
    if (!anyActive || hasKeepAlive) return
    const fallback = setTimeout(() => {
      if (!hasFetched.current) settleNonKeepAlive()
    }, 100)
    return () => clearTimeout(fallback)
  }, [anyActive, settleNonKeepAlive, hasKeepAlive])

  useEffect(() => {
    if (anyActive) {
      const timer = setTimeout(() => setShouldShow(true), 200)
      return () => clearTimeout(timer)
    }
    setShouldShow(false)
  }, [anyActive])

  return (
    <div className="w-full h-0.5">
      <div
        className={cn(
          'size-full overflow-hidden transition-opacity duration-500',
          shouldShow ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        role="progressbar"
        aria-label="Loading"
      >
        <div
          className={cn(
            'h-full bg-accent origin-left',
            shouldShow && 'animate-loader-grow',
          )}
        />
      </div>
    </div>
  )
}
