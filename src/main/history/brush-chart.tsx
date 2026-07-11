import { memo, useMemo } from 'react'
import { Area, AreaChart, Brush, ResponsiveContainer, YAxis } from 'recharts'

import { computeHistoryYAxisDomain } from '#/lib/history/helpers'
import { useHistoryData, useHistoryUI } from './history-context'

export const BrushChart = memo(() => {
  const { fullData: data } = useHistoryData()
  const { zoomStart, zoomEnd, onBrushZoom } = useHistoryUI()

  const yDomain = useMemo(() => computeHistoryYAxisDomain(data), [data])
  const endIndex = zoomEnd ?? Math.max(data.length - 1, 0)

  return (
    <div className="h-12 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        >
          <Brush
            dataKey="time"
            startIndex={zoomStart ?? 0}
            endIndex={endIndex}
            onChange={(range: { startIndex?: number; endIndex?: number }) => {
              if (range.startIndex != null && range.endIndex != null) {
                onBrushZoom({
                  startIndex: range.startIndex,
                  endIndex: range.endIndex,
                })
              }
            }}
            fill="transparent"
            stroke="var(--muted)"
            travellerWidth={8}
            height={48}
          >
            <AreaChart>
              <YAxis domain={yDomain} hide />
              <defs>
                <linearGradient id="brushGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--accent)"
                    stopOpacity={0.5}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--accent)"
                    stopOpacity={0.5}
                  />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="close"
                stroke="var(--accent)"
                strokeWidth={1}
                fill="url(#brushGrad)"
                isAnimationActive={false}
              />
            </AreaChart>
          </Brush>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
})
