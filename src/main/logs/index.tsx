import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { useCurrencyStore } from '#/store/currencies.store'

export const LogsSection = ({
  className,
  ...props
}: React.ComponentProps<'section'>) => {
  const logs = useCurrencyStore((s) => s.logs)
  const logCount = logs.length

  let content = (
    <div className="flex flex-col gap-4 md:gap-5 bg-surface border border-surface-600 rounded-16 p-4 md:p-5">
      {' '}
      <header className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
        <h3 className="text-body-lg-medium uppercase">conversion logs</h3>
        <div className="flex items-center justify-between gap-4">
          <span className="text-caption uppercase text-foreground-darker">
            {logCount} logged
          </span>
          <Button className="h-7.5 px-3 py-2 text-caption">Clear All</Button>
        </div>
      </header>
    </div>
  )

  if (logCount === 0) {
    content = (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted">
        <h3 className="text-heading text-foreground-darker">
          No conversions logged yet
        </h3>
        <p className="text-body text-muted max-w-[740px] text-center">
          Every conversion is recorded here automatically when you tap LOG
          CONVERSION. Your log is private to this session and this browser.
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
