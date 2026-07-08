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
import { LogList } from './log-list'

export const LogsSection = () => {
  const logs = useCurrencyStore((s) => s.logs)
  const logCount = logs.length
  const hydrated = useHydrated()

  if (!hydrated) {
    return <LogsSkeleton />
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
    <div className="grid grow place-content-start justify-normal gap-2 md:gap-3 bg-surface border border-surface-600 rounded-16 px-2 md:px-3 py-4 md:py-5">
      <header className="flex flex-col justify-between gap-2 px-2 md:flex-row md:items-center">
        <h3 className="text-body-lg-medium uppercase">conversion logs</h3>
        <div className="flex items-center justify-between gap-4">
          <span className="text-caption uppercase text-foreground-darker">
            {logCount} logged
          </span>
          <div className="flex items-center gap-2 md:gap-4">
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
          </div>
        </div>
      </header>

      <LogList logs={logs} />
    </div>
  )
}

const LogsSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 md:gap-5 bg-surface border border-surface-600 rounded-16 p-4 md:p-5">
      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
        <div className="h-5 w-40 rounded-8 bg-muted/10 animate-pulse" />
        <div className="h-full flex items-center gap-4">
          <div className="h-5 w-16 rounded-8 bg-muted/10 animate-pulse" />
          <div className="h-7.5 w-24 rounded-8 bg-muted/10 animate-pulse" />
          <div className="h-7.5 w-24 rounded-8 bg-muted/10 animate-pulse" />
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-15 rounded-10 animate-pulse bg-muted/10" />
        ))}
      </div>
    </div>
  )
}
