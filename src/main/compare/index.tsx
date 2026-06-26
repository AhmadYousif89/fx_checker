import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { useCurrencyStore, toggleFavorites } from '#/store/currencies.store'
import { StarIcon } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useLatestRates } from '#/hooks/use-latest-rates'

export const CompareSection = ({
  className,
  ...props
}: React.ComponentProps<'section'>) => {
  const navigate = useNavigate()
  const activePair = useCurrencyStore((s) => s.activePair)
  const { data: ratesData, isLoading, isError } = useLatestRates()

  let content = (
    <div className="flex flex-col gap-4 md:gap-5 bg-surface border border-surface-600 rounded-16 p-4 md:p-5">
      <header className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
        <h3 className="uppercase">
          <span className="text-body text-muted">multi-currency </span>
          <span className="text-body-lg-medium text-foreground">
            1,000 from {activePair.sender}
          </span>
        </h3>
        <p className="text-caption text-foreground-darker uppercase">8 pairs</p>
      </header>

      <ul className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <li
            key={i}
            onClick={() =>
              navigate({
                to: '/',
                search: (prev) => ({
                  ...prev,
                  from: activePair.sender,
                  to: '---',
                }),
              })
            }
            className="flex items-center justify-between gap-5 bg-surface-600 border py-2.5 px-3 rounded-10 cursor-pointer hover:border-accent active:border-accent transition-colors"
          >
            <span className="flex items-center gap-1 text-body">
              {activePair.sender}
              {'---'}
            </span>
            <div className="flex items-center gap-5">
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-body">rate</span>
                <span className="text-overline text-muted">@ base rate</span>
              </div>
              <Button
                size="icon-sm"
                variant="outline"
                onClick={toggleFavorites}
                className="hover:bg-surface-500 active:bg-surface-500"
              >
                <StarIcon className="fill-lime stroke-lime" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )

  if (isLoading) {
    content = (
      <div className="flex flex-col gap-2 p-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 rounded-8 animate-pulse bg-muted/30" />
        ))}
      </div>
    )
  }

  if (isError || !ratesData) {
    content = (
      <p className="text-caption text-red text-center py-8">
        Failed to load rates
      </p>
    )
  }

  return (
    <section
      className={cn('hidden data-[state=active]:block', className)}
      {...props}
    >
      {content}
    </section>
  )
}
