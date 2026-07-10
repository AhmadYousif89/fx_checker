import { useCallback, useRef, useState } from 'react'

type Selection = {
  left: number
  width: number
  startIndex: number
  endIndex: number
}

export function useDragZoom(
  containerRef: React.RefObject<HTMLDivElement | null>,
  dataLength: number,
) {
  const [selection, setSelection] = useState<Selection | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const lastSelectionRef = useRef<Selection | null>(null)

  const stateRef = useRef({
    isPointerDown: false,
    isDragging: false,
    startX: 0,
    startIndex: 0,
    captured: false,
  })

  const pixelToIndex = useCallback(
    (clientX: number) => {
      const el = containerRef.current
      if (!el || dataLength < 2) return 0
      const rect = el.getBoundingClientRect()
      const relativeX = clientX - rect.left
      const ratio = Math.max(0, Math.min(1, relativeX / rect.width))
      return Math.round(ratio * (dataLength - 1))
    },
    [containerRef, dataLength],
  )

  const buildSelection = useCallback(
    (clientX: number) => {
      const el = containerRef.current
      if (!el) return null
      const s = stateRef.current
      const rect = el.getBoundingClientRect()
      const currentIndex = pixelToIndex(clientX)
      const startIndex = Math.min(s.startIndex, currentIndex)
      const endIndex = Math.max(s.startIndex, currentIndex)

      const left = Math.min(clientX, s.startX) - rect.left
      const right = Math.max(clientX, s.startX) - rect.left

      return { left, width: right - left, startIndex, endIndex }
    },
    [containerRef, pixelToIndex],
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const s = stateRef.current
      s.isPointerDown = true
      s.isDragging = false
      s.startX = e.clientX
      s.startIndex = pixelToIndex(e.clientX)
      s.captured = false
      lastSelectionRef.current = null
    },
    [pixelToIndex],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const s = stateRef.current
      if (!s.isPointerDown) return

      const dx = Math.abs(e.clientX - s.startX)

      if (!s.isDragging && dx > 10) {
        s.isDragging = true
        s.captured = true
        setIsDragging(true)
        ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      }

      if (s.isDragging) {
        const sel = buildSelection(e.clientX)
        if (sel && sel.width > 0) {
          lastSelectionRef.current = sel
          setSelection(sel)
        }
      }
    },
    [buildSelection],
  )

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const s = stateRef.current
    if (s.captured) {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    }

    const wasDragging = s.isDragging
    const result = lastSelectionRef.current

    s.isPointerDown = false
    s.isDragging = false
    s.captured = false
    setIsDragging(false)
    setSelection(null)
    lastSelectionRef.current = null

    const minSpan = e.pointerType === 'touch' ? 8 : 4
    if (
      result &&
      wasDragging &&
      result.endIndex - result.startIndex >= minSpan
    ) {
      return result
    }

    return null
  }, [])

  const handlePointerLeave = useCallback(() => {
    const s = stateRef.current
    if (s.isDragging || s.isPointerDown) {
      s.isPointerDown = false
      s.isDragging = false
      s.captured = false
      setIsDragging(false)
      setSelection(null)
      lastSelectionRef.current = null
    }
  }, [])

  const reset = useCallback(() => {
    stateRef.current.isPointerDown = false
    stateRef.current.isDragging = false
    stateRef.current.captured = false
    setIsDragging(false)
    setSelection(null)
    lastSelectionRef.current = null
  }, [])

  return {
    selection,
    isDragging,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerLeave: handlePointerLeave,
    },
    reset,
  }
}
