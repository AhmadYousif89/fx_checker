import { useCallback } from 'react'
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
import { useLoadingStore } from '#/store/loading.store'

export const ScreenshotAction = ({ disabled }: { disabled?: boolean }) => {
  const { sender, receiver } = useActivePair()
  const isActive = useLoadingStore((s) => 'screenshot' in s.loaders)
  const startLoading = useLoadingStore((s) => s.startLoading)
  const stopLoading = useLoadingStore((s) => s.stopLoading)
  const selectedTime = useSearch({ from: '/', select: (s) => s.view ?? '3m' })

  const handleScreenshot = useCallback(async () => {
    startLoading('screenshot', { keepAlive: true })
    try {
      await new Promise((r) => setTimeout(r, 400))

      await new Promise((r) => requestAnimationFrame(r))

      const loader = document.querySelector<HTMLElement>('[role="progressbar"]')
      if (loader) loader.style.display = 'none'

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

      if (loader) loader.style.display = ''

      const date = new Date()
      const dateStr = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`

      const link = document.createElement('a')
      link.download = `fx-checker-${sender}-${receiver}-${selectedTime}_${dateStr}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Screenshot failed', err)
    } finally {
      stopLoading('screenshot')
    }
  }, [sender, receiver, selectedTime, startLoading, stopLoading])

  useHotkey('Shift+H', handleScreenshot, {
    requireReset: true,
    enabled: !isActive && !disabled,
  })

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={handleScreenshot}
          disabled={isActive || disabled}
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
}
