import { useRef, useEffect, useCallback } from 'react'

export function useMarqueeDrag(scrollDuration: number = 180) {
  const scrollerRef = useRef<HTMLDivElement>(null)

  const offsetRef = useRef(0)
  const pausedRef = useRef(false)
  const lastTimeRef = useRef(0)

  const isDraggingRef = useRef(false)
  const lastPointerXRef = useRef(0)

  useEffect(() => {
    let rafId: number | null = null

    const tick = (time: number) => {
      rafId = requestAnimationFrame(tick)
      const el = scrollerRef.current
      if (!el) return

      const dt = lastTimeRef.current ? (time - lastTimeRef.current) / 1000 : 0
      lastTimeRef.current = time
      if (!pausedRef.current) {
        const half = el.scrollWidth / 2
        if (half > 0) {
          offsetRef.current += (half / scrollDuration) * dt
          if (offsetRef.current >= half) offsetRef.current -= half
          if (offsetRef.current < 0) offsetRef.current += half
        }
        el.style.transform = `translateX(-${offsetRef.current}px)`
      }
    }

    rafId = requestAnimationFrame(tick)
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [scrollDuration])

  const handlePointerEnter = useCallback(() => {
    pausedRef.current = true
  }, [])

  const handlePointerLeave = useCallback(() => {
    if (isDraggingRef.current) return
    pausedRef.current = false
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const el = scrollerRef.current
    if (!el) return

    isDraggingRef.current = true
    pausedRef.current = true
    lastPointerXRef.current = e.clientX
    el.setPointerCapture(e.pointerId)
    el.style.cursor = 'grabbing'
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return

    const delta = lastPointerXRef.current - e.clientX
    lastPointerXRef.current = e.clientX
    offsetRef.current += delta

    const el = scrollerRef.current
    if (el) {
      const half = el.scrollWidth / 2
      if (half > 0) {
        if (offsetRef.current >= half) offsetRef.current -= half
        if (offsetRef.current < 0) offsetRef.current += half
      }
      el.style.transform = `translateX(-${offsetRef.current}px)`
    }
  }, [])

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      isDraggingRef.current = false
      pausedRef.current = false
      e.currentTarget.releasePointerCapture(e.pointerId)
      e.currentTarget.style.cursor = ''
    },
    [],
  )

  return {
    scrollerRef,
    handlePointerEnter,
    handlePointerLeave,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  }
}
