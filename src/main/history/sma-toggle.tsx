import { TrendingUp } from 'lucide-react'

import { Button } from '#/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/components/ui/tooltip'
import { cn } from '#/lib/utils'

type SmaToggleProps = {
  smaEnabled: boolean
  onToggle: () => void
}

export const SmaToggle = ({ smaEnabled, onToggle }: SmaToggleProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        size="icon-sm"
        variant="ghost"
        onClick={onToggle}
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
