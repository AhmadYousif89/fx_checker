import { lazy, Suspense } from 'react'
import { InfoIcon } from 'lucide-react'

import { rangeKeys } from '#/lib/history/config'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/components/ui/tooltip'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { CustomSpinner } from '#/components/custom-spinner'
import { ScreenshotAction } from './screenshot'
import { HistoryStats } from './stats'
import { HistoryProvider, useHistoryData, useHistoryUI } from './history-context'

const HistoryChart = lazy(() =>
  import('./chart').then((m) => ({ default: m.HistoryChart })),
)

const HistorySectionLayout = () => {
  const { isLoading, isError, hasData, isFetching } = useHistoryData()
  const {
    sender,
    receiver,
    selectedTime,
    updateUrl,
    onResetZoom,
    prefetchRange,
    isWaiting,
  } = useHistoryUI()

  if (isLoading && !hasData) {
    return <CustomSpinner />
  }

  if (isError && !hasData) {
    return (
      <div className="flex items-center justify-center py-10">
        <p className="text-red text-center">
          Something went wrong, try again later
        </p>
      </div>
    )
  }

  if (!hasData) {
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
            <div className="flex items-center gap-2">
              <ToggleGroup
                type="single"
                spacing={0.25}
                value={selectedTime}
                disabled={isWaiting}
                onValueChange={(value) => {
                  if (value) {
                    onResetZoom()
                    updateUrl({ view: value })
                  }
                }}
                className="bg-surface p-0.5"
              >
                {rangeKeys.map((rk) => (
                  <ToggleGroupItem
                    key={rk}
                    value={rk}
                    onPointerOver={() => prefetchRange(rk)}
                  >
                    {rk.toUpperCase()}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              {isWaiting && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="size-4 text-red" />
                  </TooltipTrigger>
                  <TooltipContent
                    align="end"
                    sideOffset={6}
                    className="max-w-xs"
                  >
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
            <ScreenshotAction />
          </div>
        </div>
      </div>
      <div className="relative flex grow overflow-hidden mt-4 md:mt-5">
        {isFetching && (
          <div className="absolute inset-0 bg-surface/25 flex items-center justify-center z-10">
            <CustomSpinner />
          </div>
        )}
        <Suspense fallback={<ChartSkeleton />}>
          <HistoryChart />
        </Suspense>
      </div>
    </>
  )
}

const ChartSkeleton = () => {
  return (
    <div className="w-full bg-surface flex flex-col gap-5 py-4 px-3 md:p-5 rounded-16">
      <div className="flex items-center justify-between h-5">
        <span className="h-full w-18.5 bg-muted/10 rounded-full animate-pulse" />
        <span className="h-full w-57.5 bg-muted/10 rounded-full animate-pulse" />
      </div>
      <div className="size-full bg-muted/10 animate-pulse rounded-16" />
    </div>
  )
}

export const HistorySection = () => (
  <HistoryProvider>
    <HistorySectionLayout />
  </HistoryProvider>
)
