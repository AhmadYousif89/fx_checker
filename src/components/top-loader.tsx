import { useEffect, useRef, useState } from 'react'
import { useIsFetching } from '@tanstack/react-query'

import { cn } from '#/lib/utils'
import { useLoadingStore } from '#/store/loading.store'

export const TopLoader = () => {
  const [shouldShow, setShouldShow] = useState(false)
  const isLoading = useLoadingStore((s) => s.isLoading)
  const setLoading = useLoadingStore((s) => s.setLoading)

  const ratesFetching = useIsFetching({ queryKey: ['rates'] })
  const latestFetching = useIsFetching({ queryKey: ['latest-rates'] })
  const currenciesFetching = useIsFetching({ queryKey: ['currencies'] })
  const historyFetching = useIsFetching({ queryKey: ['frankfurter-history'] })
  const isFetching =
    historyFetching + ratesFetching + latestFetching + currenciesFetching

  const hasFetched = useRef(false)
  const settleTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const keepAlive = useLoadingStore((s) => s.keepAlive)

  // settle the loading state after a small delay to avoid flickering when switching between pairs
  useEffect(() => {
    if (!isLoading) {
      hasFetched.current = false
      return
    }

    if (keepAlive) return

    if (isFetching > 0) {
      hasFetched.current = true
      return
    }

    if (hasFetched.current) {
      settleTimer.current = setTimeout(
        () => setLoading({ isLoading: false }),
        100,
      )
      return () => clearTimeout(settleTimer.current)
    }
  }, [isLoading, isFetching, keepAlive])

  // fallback in case the query is stuck in a loading state
  useEffect(() => {
    if (!isLoading || keepAlive) return
    const fallback = setTimeout(() => {
      if (!hasFetched.current) setLoading({ isLoading: false })
    }, 100)
    return () => clearTimeout(fallback)
  }, [isLoading, setLoading, keepAlive])

  // show the loader after a small delay to avoid flickering when switching between pairs
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setShouldShow(true), 200)
      return () => clearTimeout(timer)
    }
    setShouldShow(false)
  }, [isLoading])

  return (
    <div
      className={cn(
        'w-full h-0.5 overflow-hidden transition-opacity duration-500',
        shouldShow ? 'opacity-100' : 'opacity-0 pointer-events-none',
      )}
      role="progressbar"
      aria-label="Loading"
    >
      <div
        className={cn(
          'h-full bg-accent origin-left',
          shouldShow ? 'animate-loader-grow' : '',
        )}
      />
    </div>
  )
}
