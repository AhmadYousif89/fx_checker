import { TrendingUp } from 'lucide-react'

import { Button } from '#/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/components/ui/tooltip'

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
        className={smaEnabled ? 'text-accent' : 'text-muted'}
      >
        <TrendingUp className="size-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Toggle SMA</p>
    </TooltipContent>
  </Tooltip>
)
