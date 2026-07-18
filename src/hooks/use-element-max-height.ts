import { useCallback, useEffect, useRef, useState } from 'react'

export function useElementMaxHeight(bottom = 0) {
  const [height, setHeight] = useState<number | undefined>(undefined)
  const elementRef = useRef<HTMLElement | null>(null)
  const bottomRef = useRef(bottom)
  bottomRef.current = bottom

  const measure = useCallback(() => {
    if (typeof window === 'undefined') return
    const el = elementRef.current
    if (!el) return
    if (window.innerWidth < 768) {
      setHeight(undefined)
      return
    }
    const rect = el.getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) return
    const b = bottomRef.current
    const available = window.innerHeight - rect.top - b
    setHeight(Math.max(150, Math.round(available)))
  }, [])

  useEffect(() => measure(), [measure])

  const ref = useCallback((node: HTMLElement | null) => {
    elementRef.current = node
  }, [])

  useEffect(() => {
    const el = elementRef.current
    if (!el) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) measure()
      },
      { threshold: 0 },
    )
    io.observe(el)

    window.addEventListener('resize', measure)
    return () => {
      io.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [measure])

  return [ref, height] as const
}
