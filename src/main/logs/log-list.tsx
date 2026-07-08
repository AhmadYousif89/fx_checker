import { useEffect, useState } from 'react'
import { useElementMaxHeight } from '#/hooks/use-element-max-height'
import type { ConversionLog } from '#/types/currency'
import { ScrollArea } from '@/components/ui/scroll-area'
import { LogRow } from './log-row'

// const mockedLogs = Array.from({ length: 50 }, (_, i) => ({
//   sender: 'USD',
//   receiver: 'EUR',
//   amount: 100 + i * 10,
//   result: 90 + i * 9,
//   baseRate: 0.9,
//   timestamp: Date.now() - i * 60000,
// }))

export const LogList = ({ logs }: { logs: ConversionLog[] }) => {
  const [paddingBottom, setPaddingBottom] = useState(68)
  const [listRef, maxHeight] = useElementMaxHeight(paddingBottom)

  useEffect(() => {
    const pb = (window.innerWidth >= 768 ? 48 : 32) + 20
    setPaddingBottom(pb)
  }, [])

  return (
    <ScrollArea
      ref={listRef}
      style={maxHeight != null ? { maxHeight } : undefined}
    >
      <ul className="space-y-3 p-2">
        {logs.map((log, index) => (
          <LogRow key={log.timestamp} log={log} index={index} />
        ))}
      </ul>
    </ScrollArea>
  )
}
