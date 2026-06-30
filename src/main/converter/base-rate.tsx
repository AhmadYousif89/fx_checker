import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '#/components/ui/button'
import { timeAgo } from '#/lib/currency'

export type BaseRateProps = {
  base: string
  quote: string
  rate: number
  dataUpdatedAt: number
}

export const BaseExchangeRate = ({
  base,
  quote,
  rate,
  dataUpdatedAt,
}: BaseRateProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          className="h-5 p-2.5 rounded-full cursor-default select-text"
        >
          <span className="text-overline md:text-caption">
            1 {base} = {rate.toFixed(4)} {quote}
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" className="hidden md:flex md:flex-col gap-1">
        <span>
          1 {base} = {rate.toFixed(4)} {quote}
        </span>
        <span>
          1 {quote} = {(1 / rate).toFixed(4)} {base}
        </span>
        <span className="border-b border-dotted border-muted" />
        <span className="text-muted">Updated {timeAgo(dataUpdatedAt)}</span>
        <span className="text-muted">Frankfurter (ECB reference rate)</span>
      </TooltipContent>
    </Tooltip>
  )
}
