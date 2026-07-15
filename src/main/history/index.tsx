import { lazy, Suspense } from 'react'
import { InfoIcon } from 'lucide-react'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/components/ui/tooltip'
import { CustomSpinner } from '#/components/custom-spinner'
import { ChartTimeRange } from '#/components/chart-time-range'
import { HistoryStats } from './stats'
import {
  HistoryProvider,
  useHistoryData,
  useHistoryUI,
} from './history-context'

const HistoryChart = lazy(() =>
  import('./chart').then((m) => ({ default: m.HistoryChart })),
)

const HistorySectionLayout = () => {
  const { isLoading, isFetching, hasData } = useHistoryData()
  const {
    sender,
    receiver,
    selectedTime,
    updateUrl,
    onResetZoom,
    prefetchRange,
    isWaiting,
  } = useHistoryUI()
  if (!hasData && !isLoading && !isFetching) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-10">
        <h3 className="text-heading text-foreground-darker">
          No chart data available
        </h3>
        <p className="text-body text-muted max-w-127 text-center">
          We couldn&apos;t load rate history for {sender}/{receiver} right now.
          This usually clears up in a minute.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">
        <HistoryStats />
        <div className="mt-5 w-full lg:self-end">
          <div className="flex items-center justify-between lg:justify-end gap-2">
            <ChartTimeRange
              value={selectedTime}
              onChange={(v) => {
                onResetZoom()
                updateUrl({ view: v })
              }}
              disabled={isLoading || isWaiting}
              prefetchRange={prefetchRange}
            />
            {isWaiting && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="size-4 text-red" />
                </TooltipTrigger>
                <TooltipContent align="end" sideOffset={6} className="max-w-xs">
                  <p className="text-caption text-balance text-center flex flex-col gap-1">
                    <span className="text-red uppercase">
                      Rate limit exceeded!
                    </span>
                    <span>
                      Please wait a few seconds before switching time ranges.
                    </span>
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
      <div className="relative grid grow min-h-96 overflow-hidden rounded-16 bg-surface mt-4 md:mt-5">
        {(isLoading || isFetching) && (
          <div className="absolute inset-0 grid bg-surface/20 z-10">
            <CustomSpinner />
          </div>
        )}
        <Suspense
          fallback={
            <div className="size-full flex items-center justify-center">
              <CustomSpinner />
            </div>
          }
        >
          <HistoryChart />
        </Suspense>
      </div>
    </>
  )
}

export const HistorySection = () => (
  <HistoryProvider>
    <HistorySectionLayout />
  </HistoryProvider>
)
