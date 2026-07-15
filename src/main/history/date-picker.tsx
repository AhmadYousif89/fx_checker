import { startOfDay, subDays, subYears } from 'date-fns'
import { useMemo, useState } from 'react'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { useHistoryUI } from './history-context'

type DatePickerProps = {
  triggerValue: React.ReactNode
}

export const DatePicker = ({ triggerValue }: DatePickerProps) => {
  const [openPicker, setOpenPicker] = useState(false)
  const { customEndDate, setCustomEndDate } = useHistoryUI()

  const now = useMemo(() => new Date(), [])
  const yesterday = useMemo(() => startOfDay(subDays(new Date(), 1)), [])
  const fiveYearsAgo = useMemo(() => startOfDay(subYears(new Date(), 5)), [])

  return (
    <Popover open={openPicker} onOpenChange={setOpenPicker}>
      <Tooltip>
        <PopoverTrigger asChild>
          <TooltipTrigger asChild>
            <Button
              id="chart-date"
              variant="outline"
              className="text-foreground-darker text-caption h-5 py-0 px-1.5 rounded-full border-border hover:border-accent"
            >
              {triggerValue}
            </Button>
          </TooltipTrigger>
        </PopoverTrigger>
        <TooltipContent className="text-overline uppercase">
          pick a historical date
        </TooltipContent>
      </Tooltip>
      <PopoverContent className="w-auto p-3" align="end">
        <Calendar
          mode="single"
          selected={customEndDate ?? undefined}
          defaultMonth={customEndDate ?? now}
          captionLayout="dropdown"
          startMonth={fiveYearsAgo}
          endMonth={now}
          disabled={[{ before: fiveYearsAgo }, { after: yesterday }]}
          onSelect={(date) => {
            setCustomEndDate(date ?? null)
            setOpenPicker(false)
          }}
        />
        {customEndDate && (
          <div className="flex justify-center mt-2">
            <Button
              type="button"
              size="xs"
              className="text-caption uppercase"
              onClick={() => {
                setCustomEndDate(null)
                setOpenPicker(false)
              }}
            >
              reset
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
