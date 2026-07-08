import type { RateWithDiff } from '#/types/currency'

type RateDiffProps = {
  difference: number
  direction: RateWithDiff['direction']
  className?: string
}

export const RateDiff = ({
  difference,
  direction,
  className,
}: RateDiffProps) => {
  const colorClass =
    direction === 'up'
      ? 'text-green'
      : direction === 'down'
        ? 'text-red'
        : 'text-muted'

  return (
    <span className={`flex items-center gap-0.5 ${colorClass}${className ? ` ${className}` : ''}`}>
      <span>
        {direction === 'up' ? '\u25B2' : direction === 'down' ? '\u25BC' : ''}
      </span>
      <span>
        {difference >= 0 ? '+' : ''}
        {difference.toFixed(3)}%
      </span>
    </span>
  )
}
