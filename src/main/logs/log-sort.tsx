import { memo } from 'react'
import { ArrowDownIcon, ArrowUpIcon, ArrowUpDownIcon } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { Button } from '#/components/ui/button'
import { useCurrencyStore, setLogSort } from '#/store/currencies.store'
import type { SortDir, SortField } from '#/store/currencies.store'

type SortOption = {
  field: SortField
  label: string
  defaultDir: SortDir
}

const SORT_OPTIONS: SortOption[] = [
  { field: 'date', label: 'Date', defaultDir: 'desc' },
  { field: 'base', label: 'Base \u2192 Quote', defaultDir: 'asc' },
  { field: 'quote', label: 'Quote \u2190 Base', defaultDir: 'asc' },
  { field: 'amount', label: 'Amount', defaultDir: 'desc' },
  { field: 'result', label: 'Result', defaultDir: 'desc' },
]

const fieldLabels: Record<SortField, string> = {
  date: 'Date',
  base: 'Base',
  quote: 'Quote',
  amount: 'Amount',
  result: 'Result',
}

export const LogSortButton = memo(() => {
  const dir = useCurrencyStore((s) => s.logs.sortDir)
  const field = useCurrencyStore((s) => s.logs.sortField)

  const handleSelect = (selected: SortField) => {
    if (selected === field) {
      setLogSort(field, dir === 'asc' ? 'desc' : 'asc')
    } else {
      const option = SORT_OPTIONS.find((o) => o.field === selected)
      if (option) setLogSort(selected, option.defaultDir)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" className="h-7.5 md:w-auto px-3 py-2 text-caption">
          {dir === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />}
          <span className="hidden md:inline">{fieldLabels[field]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SORT_OPTIONS.map(({ field: f, label }) => {
          const isActive = f === field
          return (
            <DropdownMenuItem key={f} onClick={() => handleSelect(f)}>
              {isActive ? (
                dir === 'asc' ? (
                  <ArrowUpIcon />
                ) : (
                  <ArrowDownIcon />
                )
              ) : (
                <ArrowUpDownIcon />
              )}
              {label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
})
