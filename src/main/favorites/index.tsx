import { Button } from '#/components/ui/button'
import { useLatestRates } from '#/hooks/use-latest-rates'
import { cn } from '#/lib/utils'
import { toggleFavorites, useCurrencyStore } from '#/store/currencies.store'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRightIcon, StarIcon } from 'lucide-react'

export const FavoritesSection = ({
  className,
  ...props
}: React.ComponentProps<'section'>) => {
  const navigate = useNavigate()
  const favorites = useCurrencyStore((s) => s.favorites)
  const favoritesCount = favorites.length

  const { data: ratesData, isLoading, isError } = useLatestRates()

  let content = (
    <div className="flex flex-col gap-4 md:gap-5 bg-surface border border-surface-600 rounded-16 p-4 md:p-5">
      <header className="flex items-center justify-between gap-2">
        <h3 className="text-body-lg-medium uppercase">pinned pairs</h3>
        <p className="text-foreground-darker text-caption uppercase">
          <span>{favoritesCount} </span>
          <span>favorites</span>
        </p>
      </header>
      <ul className="space-y-3">
        {favorites.map((f) =>
          isLoading ? (
            <div
              key={`${f.sender}-${f.receiver}`}
              className="h-15 rounded-10 animate-pulse bg-muted/30"
            />
          ) : (
            <li
              key={`${f.sender}-${f.receiver}`}
              onClick={() =>
                navigate({
                  to: '/',
                  search: (prev) => ({
                    ...prev,
                    from: f.sender,
                    to: f.receiver,
                  }),
                })
              }
              className="h-15 flex items-center justify-between gap-5 bg-surface-600 border py-2.5 px-3 rounded-10 cursor-pointer hover:border-surface-300 active:border-surface-300 transition-colors"
            >
              <span className="flex items-center gap-1 text-body">
                {f.sender}
                <ArrowRightIcon className="size-3 text-muted" />
                {f.receiver}
              </span>
              <div className="flex items-center gap-5">
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-body">
                    {new Intl.NumberFormat('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 4,
                    }).format(ratesData?.rates[f.sender] ?? 0)}
                  </span>
                  <span className="text-overline"></span>
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
          ),
        )}
      </ul>
    </div>
  )

  if (isError || !ratesData) {
    content = (
      <p className="text-caption text-red text-center py-8">
        Something went wrong, try again later
      </p>
    )
  }

  if (favoritesCount === 0) {
    content = (
      <div className="flex flex-col items-center justify-center gap-4 py-10">
        <h3 className="text-heading text-foreground-darker">
          No pinned pairs yet
        </h3>
        <p className="text-body text-muted max-w-[460px] text-center">
          Pin a pair to track its rate here. Tap the star icon on any conversion
          or comparison row.
        </p>
      </div>
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
