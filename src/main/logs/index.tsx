import { DownloadIcon } from 'lucide-react'
import { useHydrated } from '@tanstack/react-router'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { exportLogsAsCsv, exportLogsAsJson } from '#/lib/export'
import { clearLogs, useCurrencyStore } from '#/store/currencies.store'
import { InsightCard } from '#/components/insight-card'
import { LogRow } from './log-row'

export const LogsSection = () => {
  const logs = useCurrencyStore((s) => s.logs)
  const logCount = logs.length
  const hydrated = useHydrated()

  if (!hydrated) {
    return <InsightCard.Skeleton hasActions={2} />
  }

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
    <InsightCard.Root>
      <InsightCard.Header
        title="conversion logs"
        headerChildren={
          <span className="text-caption uppercase text-foreground-darker">
            {logCount} logged
          </span>
        }
        actions={
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  className="h-7.5 md:w-auto px-3 py-2 text-caption"
                >
                  <DownloadIcon />
                  <span className="hidden md:inline">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => exportLogsAsCsv(logs)}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportLogsAsJson(logs)}>
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="h-7.5 px-3 py-2 text-caption hover:text-[white] hover:bg-red hover:border-red focus-visible:ring-red">
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all logs?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all conversion logs.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="text-body">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={clearLogs}
                    variant="destructive"
                    className="text-[white]! text-body"
                  >
                    Yes, clear all
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        }
      />
      <InsightCard.Body>
        {logs.map((log, index) => (
          <LogRow key={log.timestamp} log={log} index={index} />
        ))}
      </InsightCard.Body>
    </InsightCard.Root>
  )
}
