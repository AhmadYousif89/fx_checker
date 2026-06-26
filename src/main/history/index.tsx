import { useState } from 'react'

import { cn } from '#/lib/utils'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useQuery } from '@tanstack/react-query'
import { getHistory } from '#/server/functions/history'
import { useCurrencyStore } from '#/store/currencies.store'

export const HistorySection = ({
  className,
  ...props
}: React.ComponentProps<'section'>) => {
  const [selectedTime, setSelectedTime] = useState('1m')
  const activePair = useCurrencyStore((s) => s.activePair)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['history', activePair.sender, activePair.receiver, 30],
    queryFn: () =>
      getHistory({
        data: {
          base: activePair.sender,
          quote: activePair.receiver,
          days: 30,
        },
      }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
  })

  let content = (
    <section
      className={cn('hidden data-[state=active]:block', className)}
      {...props}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">
        <div className="w-full lg:max-w-[608px] grid grid-cols-[repeat(auto-fit,minmax(140px,1fr)minmax(140px,1fr))] items-center gap-2.5 md:gap-4 uppercase">
          <div className="aspect-square h-20 w-full px-5 py-3 border border-surface-600 bg-surface flex flex-col gap-4 rounded-16">
            <span className="text-foreground-darker text-body">open</span>
            <span className="text-heading"></span>
          </div>
          <div className="aspect-square h-20 w-full px-5 py-3 border border-surface-600 bg-surface flex flex-col gap-4 rounded-16">
            <span className="text-foreground-darker text-body">last</span>
            <span className="text-heading"></span>
          </div>
          <div className="aspect-square h-20 w-full px-5 py-3 border border-surface-600 bg-surface flex flex-col gap-4 rounded-16">
            <span className="text-foreground-darker text-body">change</span>
            <span className="text-heading"></span>
          </div>
          <div className="aspect-square h-20 w-full px-5 py-3 border border-surface-600 bg-surface flex flex-col gap-4 rounded-16">
            <span className="text-foreground-darker text-body">% change</span>
            <span className="text-heading"></span>
          </div>
        </div>
        <ToggleGroup
          type="single"
          spacing={0.25}
          value={selectedTime}
          onValueChange={(value) => {
            if (value) setSelectedTime(value)
          }}
          className="mt-5 bg-surface p-0.5 lg:self-end"
        >
          <ToggleGroupItem value="1d">1D</ToggleGroupItem>
          <ToggleGroupItem value="1w">1W</ToggleGroupItem>
          <ToggleGroupItem value="1m">1M</ToggleGroupItem>
          <ToggleGroupItem value="3m">3M</ToggleGroupItem>
          <ToggleGroupItem value="1y">1Y</ToggleGroupItem>
          <ToggleGroupItem value="5y">5Y</ToggleGroupItem>
        </ToggleGroup>
      </div>
    </section>
  )

  if (!data) {
    content = (
      <div className="flex flex-col items-center justify-center gap-4 py-10">
        <h3 className="text-heading text-foreground-darker">
          No chart data available
        </h3>
        <p className="text-body text-muted max-w-[508px] text-center">
          We couldn't load rate history for USD/EUR right now. This usually
          clears up in a minute.
        </p>
      </div>
    )
  }

  if (isLoading) {
    content = (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin rounded-full size-20 border-b-2 border-t-2 border-primary"></div>
      </div>
    )
  }

  if (isError) {
    content = (
      <div className="flex items-center justify-center py-10">
        <p className="text-red text-center">
          Something went wrong, try again later
        </p>
      </div>
    )
  }

  return content
}
