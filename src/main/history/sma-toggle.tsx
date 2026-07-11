import { memo } from 'react'
import { TrendingUp } from 'lucide-react'

import { Button } from '#/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/components/ui/tooltip'
import { cn } from '#/lib/utils'
import { useHistoryUI } from './history-context'

export const SmaToggle = memo(() => {
  const { smaEnabled, onSmaToggle } = useHistoryUI()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={onSmaToggle}
          aria-pressed={smaEnabled}
          className={cn(
            'max-sm:size-6 max-sm:rounded-4 max-sm:border max-sm:border-accent-darker max-sm:aria-pressed:border-accent',
            smaEnabled ? 'text-accent' : 'text-muted',
          )}
        >
          <TrendingUp className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Toggle SMA</p>
      </TooltipContent>
    </Tooltip>
  )
})
