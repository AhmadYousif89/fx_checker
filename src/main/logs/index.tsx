import { memo } from 'react'
import { ArrowRightIcon, TrashIcon } from 'lucide-react'

import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import { useUpdateUrl } from '#/hooks/use-update-url'
import { formatAmount, shortTimeAgo } from '#/lib/currency'
import {
  clearLogs,
  removeLog,
  useCurrencyStore,
} from '#/store/currencies.store'
import type { ConversionLog } from '#/types/currency'

export const LogsSection = () => {
  const logs = useCurrencyStore((s) => s.logs)
  const logCount = logs.length

  if (logCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted">
        <h3 className="text-heading text-foreground-darker">
          No conversions logged yet
        </h3>
        <p className="text-body text-muted max-w-185 text-center">
          Every conversion is recorded here automatically when you tap LOG
          CONVERSION. Your log is private to this session and this browser.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 md:gap-5 bg-surface border border-surface-600 rounded-16 p-4 md:p-5">
      <header className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
        <h3 className="text-body-lg-medium uppercase">conversion logs</h3>
        <div className="flex items-center justify-between gap-4">
          <span className="text-caption uppercase text-foreground-darker">
            {logCount} logged
          </span>
          <Button
            onClick={clearLogs}
            className="h-7.5 px-3 py-2 text-caption hover:bg-red hover:border-red"
          >
            Clear All
          </Button>
        </div>
      </header>

      <ul className="space-y-3">
        {logs.map((log, index) => (
          <LogRow key={log.timestamp} log={log} index={index} />
        ))}
      </ul>
    </div>
  )
}

const LogRow = memo(({ log, index }: { log: ConversionLog; index: number }) => {
  const updateUrl = useUpdateUrl()
  const logTime = shortTimeAgo(log.timestamp)

  return (
    <li
      onClick={() => {
        updateUrl({
          from: log.sender,
          to: log.receiver,
          amount: String(log.amount),
        })
      }}
      style={{ animationDelay: `${index * 80}ms` }}
      className={cn(
        'h-15 flex items-center justify-between gap-2.5 md:gap-5 bg-surface-600 border py-2.5 px-3 md:px-4 rounded-10 cursor-pointer hover:border-surface-300 active:border-surface-300 transition animate-fade-in',
      )}
    >
      <div className="flex grow md:items-center flex-col md:flex-row gap-1 md:gap-4">
        <time className="text-body text-muted min-w-16">{logTime}</time>
        <span className="flex items-center gap-2 text-body">
          {log.sender}
          <ArrowRightIcon className="size-4 text-muted" />
          {log.receiver}
        </span>
      </div>

      <div
        className={cn(
          'flex grow items-end md:items-center md:justify-end flex-col md:flex-row gap-1 md:gap-4',
        )}
      >
        <span className="text-body-lg text-foreground-darker">
          {formatAmount(log.amount)}
        </span>
        <span className="text-body-lg text-accent">
          {formatAmount(log.result)}
        </span>
      </div>
      <Button
        size="icon-sm"
        variant="outline"
        onClick={() => removeLog(log.timestamp)}
        className="group border-border hover:border-red focus-visible:ring-red hover:bg-surface-500 active:bg-surface-500"
      >
        <TrashIcon className="group-hover:text-red" />
      </Button>
    </li>
  )
})
