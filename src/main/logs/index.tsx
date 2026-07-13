import { useCallback, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useHydrated } from '@tanstack/react-router'

import { exportLogsAsCsv, exportLogsAsJson } from '#/lib/export'
import { useCurrencyStore } from '#/store/currencies.store'
import { InsightCard } from '#/components/insight-card'
import { LogActionButtons } from './log-actions'
import { LogRow } from './log-row'

let logsDidMount = false

export const LogsSection = () => {
  const logs = useCurrencyStore((s) => s.logs)
  const lastLogTimestamp = useCurrencyStore.getState().lastLogTimestamp
  const logCount = logs.length

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
        <h3 className="text-body-lg-medium uppercase">converstion logs</h3>
        <div className="flex items-center justify-between gap-4">
          <span className="text-caption uppercase text-foreground-darker">
            {logCount} logged
          </span>
          <LogActionButtons
            handleExportCsv={handleExportCsv}
            handleExportJson={handleExportJson}
          />
        </div>
      </InsightCard.Header>
      <InsightCard.Body>
        <AnimatePresence mode="popLayout" initial={logsDidMount ? false : true}>
          {logs.map((log, idx) => (
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
