import { ArrowDropDown } from '#/components/icons/arrow-drop-down'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '#/components/ui/select'
import { cn } from '#/lib/utils'

type CompareActionMenuProps = {
  value: 'table' | 'chart'
  onValueChange: (v: 'table' | 'chart') => void
}

export const CompareActionMenu = ({
  value,
  onValueChange,
}: CompareActionMenuProps) => {
  return (
    <Select
      value={value}
      onValueChange={(v) => onValueChange(v as 'table' | 'chart')}
    >
      <SelectTrigger
        renderIcon={<ArrowDropDown />}
        className={cn(
          'min-h-5 min-w-37 text-body rounded-4! uppercase py-0.5 border-0 cursor-pointer',
          'not-hover:text-muted hover:text-foreground focus-visible:text-foreground',
        )}
      >
        <SelectValue placeholder="Select view" />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectItem
          value="table"
          className="text-caption uppercase py-1 min-h-7 focus:bg-accent focus:text-background"
        >
          multi-currency
        </SelectItem>
        <SelectItem
          value="chart"
          className="text-caption uppercase py-1 min-h-7 focus:bg-accent focus:text-background"
        >
          chart-history
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
