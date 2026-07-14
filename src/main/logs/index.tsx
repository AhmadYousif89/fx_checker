import { useCallback, useEffect, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useHydrated } from '@tanstack/react-router'

import { exportLogsAsCsv, exportLogsAsJson } from '#/lib/export'
import { useCurrencyStore } from '#/store/currencies.store'
import type { SortDir, SortField } from '#/store/currencies.store'
import type { ConversionLog } from '#/types/currency'
import { InsightCard } from '#/components/insight-card'
import { LogActionButtons } from './log-actions'
import { LogSortButton } from './log-sort'
import { LogRow } from './log-row'

let logsDidMount = false

function sortLogs(logs: ConversionLog[], field: SortField, dir: SortDir) {
  const sorted = [...logs]
  sorted.sort((a, b) => {
    let cmp = 0
    switch (field) {
      case 'date':
        cmp = a.timestamp - b.timestamp
        break
      case 'base':
        cmp = a.sender.localeCompare(b.sender)
        break
      case 'quote':
        cmp = a.receiver.localeCompare(b.receiver)
        break
      case 'result':
        cmp = a.result - b.result
        break
      case 'amount':
        cmp = a.amount - b.amount
        break
    }
    return dir === 'desc' ? -cmp : cmp
  })
  return sorted
}

export const LogsSection = () => {
  const logs = useCurrencyStore((s) => s.logs.entries)
  const logSortField = useCurrencyStore((s) => s.logs.sortField)
  const logSortDir = useCurrencyStore((s) => s.logs.sortDir)
  const lastLogTimestamp = useCurrencyStore.getState().logs.lastTimestamp
  const logCount = logs.length

  const sortedLogs = useMemo(
    () => sortLogs(logs, logSortField, logSortDir),
    [logs, logSortField, logSortDir],
  )

  useEffect(() => {
    logsDidMount = logCount > 0
  }, [logCount])

  const handleExportCsv = useCallback(() => exportLogsAsCsv(logs), [logs])
  const handleExportJson = useCallback(() => exportLogsAsJson(logs), [logs])

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
      <InsightCard.Header>
        <h3 className="text-body-lg-medium uppercase">conversion logs</h3>
        <div className="flex items-center justify-between gap-4">
          <span className="text-caption uppercase text-foreground-darker">
            {logCount} logged
          </span>
          <div className="flex items-center gap-2 md:gap-4">
            <LogSortButton />
            <LogActionButtons
              handleExportCsv={handleExportCsv}
              handleExportJson={handleExportJson}
            />
          </div>
        </div>
      </InsightCard.Header>
      <InsightCard.Body>
        <AnimatePresence mode="popLayout" initial={logsDidMount ? false : true}>
          {sortedLogs.map((log, idx) => (
            <LogRow
              key={log.timestamp}
              log={log}
              staggerDelay={logsDidMount ? 0 : idx * 80}
              isNew={logsDidMount && log.timestamp === lastLogTimestamp}
            />
          ))}
        </AnimatePresence>
      </InsightCard.Body>
    </InsightCard.Root>
  )
}
