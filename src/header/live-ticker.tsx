import { useActivePair } from '#/hooks/use-active-pair'
import { useLiveTicker } from '#/hooks/use-live-ticker'
import { useMarqueeDrag } from '#/hooks/use-marquee-drag'

export const LiveTicker = () => {
  const { sender } = useActivePair()
  const ratesQuery = useLiveTicker(sender)

  const {
    scrollerRef,
    handlePointerEnter,
    handlePointerLeave,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  } = useMarqueeDrag()

  const tickerRates = ratesQuery.data || []

  return (
    <div className="grid items-center">
      <div className="z-10 col-end-1 row-end-1 w-fit flex items-center justify-center gap-2 bg-accent px-2 py-3 md:px-4">
        <span className="size-1.5 rounded-full bg-[black] animate-pulse" />
        <p className="text-accent-foreground uppercase text-overline md:text-caption-medium">
          live markets
        </p>
      </div>

      <div className="bg-surface h-full col-end-1 row-end-1 overflow-hidden relative flex items-center ml-25.5 md:ml-[138.5px]">
        {/* Side fades */}
        <div className="absolute inset-y-0 left-0 w-12 bg-linear-to-r from-surface to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-12 bg-linear-to-l from-surface to-transparent z-10 pointer-events-none" />

        {ratesQuery.isLoading ? (
          <div className="flex items-center size-full animate-pulse bg-muted/10" />
        ) : ratesQuery.isError ? (
          <p className="text-caption text-red text-center px-6 w-full">
            Failed to load market rates
          </p>
        ) : (
          <div
            ref={scrollerRef}
            className="flex h-full whitespace-nowrap cursor-grab touch-pan-y"
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <ul className="flex items-center h-full divide-x divide-border">
              {tickerRates.map((rate) => {
                return (
                  <li
                    key={`${rate.base}/${rate.quote}`}
                    className="flex items-center gap-2.5 h-full px-3.5 select-none"
                  >
                    <span className="text-muted text-overline md:text-caption">
                      {rate.base}/{rate.quote}
                    </span>
                    <span className="text-overline md:text-caption-medium">
                      {rate.rate.toLocaleString(undefined, {
                        minimumFractionDigits: rate.rate < 10 ? 4 : 2,
                        maximumFractionDigits: rate.rate < 10 ? 4 : 2,
                      })}
                    </span>
                    <span
                      className={`flex items-center gap-0.5 text-overline md:text-caption-medium ${
                        rate.direction === 'up'
                          ? 'text-green'
                          : rate.direction === 'down'
                            ? 'text-red'
                            : 'text-muted'
                      }`}
                    >
                      <span>
                        {rate.direction === 'up'
                          ? '▲'
                          : rate.direction === 'down'
                            ? '▼'
                            : ''}
                      </span>
                      <span>
                        {rate.difference >= 0 ? '+' : ''}
                        {rate.difference.toFixed(3)}%
                      </span>
                    </span>
                  </li>
                )
              })}
            </ul>

            <div className="h-full w-px border-r" />
            {/* Duplicate list for infinite, seamless marquee scroll */}
            <ul
              aria-hidden
              className="flex items-center h-full divide-x divide-border"
            >
              {tickerRates.map((rate) => {
                return (
                  <li
                    key={`${rate.base}/${rate.quote}-dup`}
                    className="flex items-center gap-2.5 h-full px-3.5 select-none"
                  >
                    <span className="text-muted text-overline md:text-caption">
                      {rate.base}/{rate.quote}
                    </span>
                    <span className="text-overline md:text-caption-medium">
                      {rate.rate.toLocaleString(undefined, {
                        minimumFractionDigits: rate.rate < 10 ? 4 : 2,
                        maximumFractionDigits: rate.rate < 10 ? 4 : 2,
                      })}
                    </span>
                    <span
                      className={`flex items-center gap-0.5 text-overline md:text-caption-medium ${
                        rate.direction === 'up'
                          ? 'text-green'
                          : rate.direction === 'down'
                            ? 'text-red'
                            : 'text-muted'
                      }`}
                    >
                      <span>
                        {rate.direction === 'up'
                          ? '▲'
                          : rate.direction === 'down'
                            ? '▼'
                            : ''}
                      </span>
                      <span>
                        {rate.difference >= 0 ? '+' : ''}
                        {rate.difference.toFixed(3)}%
                      </span>
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
