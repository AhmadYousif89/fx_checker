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
  triggerValue?: React.ReactNode
}

export const DatePicker = ({ triggerValue }: DatePickerProps) => {
  const [openPicker, setOpenPicker] = useState(false)
  const { customEndDate, setCustomEndDate } = useHistoryUI()

  const formatDate = (date: Date) => {
    const dateStr = date
      .toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: '2-digit',
      })
      .toUpperCase()
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
    return `${dateStr} ${timeStr}`
  }

  const displayValue = customEndDate ? formatDate(customEndDate) : triggerValue

  const now = useMemo(() => new Date(), [])
  const yesterday = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    d.setHours(0, 0, 0, 0)
    return d
  }, [])
  const fiveYearsAgo = useMemo(() => {
    const d = new Date()
    d.setFullYear(d.getFullYear() - 5)
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

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
              {displayValue ?? 'Pick a date'}
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
        <div className="flex justify-center mt-2">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="text-caption"
            onClick={() => {
              setCustomEndDate(null)
              setOpenPicker(false)
            }}
          >
            Latest
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
