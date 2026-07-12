import { memo, useCallback, useState } from 'react'
import { useSearch } from '@tanstack/react-router'
import { useHotkey } from '@tanstack/react-hotkeys'
import { domToPng } from 'modern-screenshot'
import { CameraIcon } from 'lucide-react'

import { Button } from '#/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/components/ui/tooltip'
import { useActivePair } from '#/hooks/use-active-pair'
import { useHistoryUI } from './history-context'

export const ScreenshotAction = memo(() => {
  const { isWaiting } = useHistoryUI()
  const { sender, receiver } = useActivePair()
  const [isProcessing, setIsProcessing] = useState(false)
  const selectedTime = useSearch({ from: '/', select: (s) => s.view ?? '3m' })

  const handleScreenshot = useCallback(async () => {
    setIsProcessing(true)
    try {
      await new Promise((r) => requestAnimationFrame(r))

      const bg =
        getComputedStyle(document.documentElement)
          .getPropertyValue('--background')
          .trim() || '#0a0a0a'

      const w = Math.max(1, document.documentElement.scrollWidth)
      const h = Math.max(1, document.documentElement.scrollHeight)

      const dataUrl = await domToPng(document.documentElement, {
        width: w,
        height: h,
        backgroundColor: bg,
      })

      const date = new Date()
      const dateStr = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`

      const link = document.createElement('a')
      link.download = `fx-checker-${sender}-${receiver}-${selectedTime}_${dateStr}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Screenshot failed', err)
    } finally {
      setIsProcessing(false)
    }
  }, [sender, receiver, selectedTime])

  useHotkey('Shift+H', handleScreenshot, {
    requireReset: true,
    enabled: !isProcessing && !isWaiting,
  })

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          onClick={handleScreenshot}
          disabled={isProcessing || isWaiting}
          className="h-9 w-auto aspect-square"
        >
          <CameraIcon className="size-4.5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>Take a screenshot</p>
      </TooltipContent>
    </Tooltip>
  )
})
