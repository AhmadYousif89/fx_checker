import type { RateWithDiff } from '#/types/currency'

type RateDiffProps = {
  difference: number | null
  direction: RateWithDiff['direction']
  className?: string
  isFetching?: boolean
}

export const RateDiff = ({
  difference,
  direction,
  className,
  isFetching = false,
}: RateDiffProps) => {
  if (direction === 'unknown' || difference === null) return null

  const colorClass =
    direction === 'up'
      ? 'text-green'
      : direction === 'down'
        ? 'text-red'
        : 'text-muted'

  return (
    <span
      className={`flex items-center gap-0.5 ${colorClass}${className ? ` ${className}` : ''}`}
    >
      {isFetching ? (
        <span className="w-14 h-2.5 bg-muted/10 animate-pulse rounded-full" />
      ) : (
        <>
          <span>
            {direction === 'up'
              ? '\u25B2'
              : direction === 'down'
                ? '\u25BC'
                : ''}
          </span>
          <span>
            {difference >= 0 ? '+' : ''}
            {difference.toFixed(3)}%
          </span>
        </>
      )}
    </span>
  )
}
