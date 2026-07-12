import { useEffect, useRef, useState } from 'react'

import { cn } from '#/lib/utils'
import { useLoadingStore } from '#/store/loading.store'

type Phase = 'idle' | 'delayed' | 'growing' | 'completing'

export const TopLoader = () => {
  const [progress, setProgress] = useState(0)
  const [shouldShow, setShouldShow] = useState(false)
  const anyActive = useLoadingStore((s) => s.anyActive)

  const rafRef = useRef(0)
  const startTimeRef = useRef(0)
  const phaseRef = useRef<Phase>('idle')
  const prevAnyActive = useRef(false)

  // Catch-all cleanup on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // Animate the progress bar
  useEffect(() => {
    const wasActive = prevAnyActive.current
    prevAnyActive.current = anyActive

    if (anyActive && !wasActive) {
      cancelAnimationFrame(rafRef.current)
      phaseRef.current = 'delayed'
      startTimeRef.current = performance.now()
      setProgress(0.1)

      const showTimer = setTimeout(() => {
        if (phaseRef.current !== 'delayed') return
        phaseRef.current = 'growing'
        setShouldShow(true)

        const animate = () => {
          if (phaseRef.current !== 'growing') return
          const elapsed = performance.now() - startTimeRef.current
          const p = 1 - Math.exp(-elapsed / 3000)
          setProgress(Math.min(Math.max(p, 0.1), 0.95))
          rafRef.current = requestAnimationFrame(animate)
        }
        rafRef.current = requestAnimationFrame(animate)
      }, 200)

      return () => {
        clearTimeout(showTimer)
        cancelAnimationFrame(rafRef.current)
      }
    }

    if (!anyActive && wasActive && phaseRef.current !== 'idle') {
      cancelAnimationFrame(rafRef.current)

      if (phaseRef.current === 'delayed') {
        phaseRef.current = 'idle'
        setShouldShow(false)
        setProgress(0)
        return
      }

      // growing → snap to 100% then hide
      phaseRef.current = 'completing'
      setProgress(1)
      const hideTimer = setTimeout(() => {
        phaseRef.current = 'idle'
        setShouldShow(false)
      }, 400)
      return () => clearTimeout(hideTimer)
    }
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
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
      >
        <div
          className="h-full bg-accent origin-left transition-transform duration-200 ease-out"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
    </div>
  )
}
