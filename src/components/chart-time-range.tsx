import type { RangeKey } from '#/lib/history/config'
import { rangeKeys } from '#/lib/history/config'
import { ToggleGroup, ToggleGroupItem } from '#/components/ui/toggle-group'

type ChartTimeRangeProps = {
  value: RangeKey
  onChange: (value: RangeKey) => void
  disabled?: boolean
  className?: string
  prefetchRange?: (key: RangeKey) => void
}

export const ChartTimeRange = ({
  value,
  onChange,
  disabled,
  className = 'bg-surface p-0.5',
  prefetchRange,
}: ChartTimeRangeProps) => (
  <ToggleGroup
    type="single"
    spacing={0.25}
    value={value}
    disabled={disabled}
    onValueChange={(v) => {
      if (v) onChange(v as RangeKey)
    }}
    className={className}
  >
    {rangeKeys.map((rk) => (
      <ToggleGroupItem
        key={rk}
        value={rk}
        onPointerOver={() => prefetchRange?.(rk)}
      >
        {rk.toUpperCase()}
      </ToggleGroupItem>
    ))}
  </ToggleGroup>
)
