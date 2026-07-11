export function computePointsPerDay(interval: string): number {
  if (interval === '1week') return 1 / 7
  if (interval === '1month') return 1 / 30
  if (interval.endsWith('min')) return (24 * 60) / parseInt(interval)
  if (interval.endsWith('h')) return 24 / parseInt(interval)
  return 1
}

export function computeOutputSize(days: number, interval: string): number {
  const pointsPerDay = computePointsPerDay(interval)
  return Math.min(5000, Math.max(1, Math.ceil(days * pointsPerDay)))
}

export function computeHistoryYAxisDomain(
  data: { close: number }[] | undefined,
): [number, number] {
  if (!data || data.length === 0) return [0, 1]

  const closes = data.map((point) => point.close)
  const min = Math.min(...closes)
  const max = Math.max(...closes)

  if (min === max) {
    const padding = Math.max(Math.abs(min) * 0.0001, 0.0005)
    return [min - padding, max + padding]
  }

  const range = max - min
  const minimumSpan = 0.0015
  const paddedSpan = Math.max(range * 1.4, minimumSpan)
  const padding = (paddedSpan - range) / 2

  return [min - padding, max + padding]
}

export type HistoryEntry = {
  time: string
  close: number
  open: number
  high: number
  low: number
}

export function invertData(data: HistoryEntry[]): HistoryEntry[] {
  return data.map((d) => ({
    ...d,
    close: 1 / d.close,
    open: 1 / d.open,
    high: 1 / d.low,
    low: 1 / d.high,
  }))
}

export function computeHistoryCrossRate(
  baseData: HistoryEntry[],
  quoteData: HistoryEntry[],
): HistoryEntry[] {
  const map = new Map<
    string,
    { base: HistoryEntry | null; quote: HistoryEntry | null }
  >()

  for (const b of baseData) {
    map.set(b.time, { base: b, quote: map.get(b.time)?.quote ?? null })
  }

  for (const q of quoteData) {
    const existing = map.get(q.time)
    if (existing) {
      existing.quote = q
    } else {
      map.set(q.time, { base: null, quote: q })
    }
  }

  const times = Array.from(map.keys()).sort()
  const result: HistoryEntry[] = []

  for (const time of times) {
    const { base, quote } = map.get(time)!
    if (!base || !quote) continue

    const close = base.close / quote.close
    const open = base.open / quote.open
    const high = base.high / quote.low
    const low = base.low / quote.high

    result.push({
      time,
      close,
      open,
      high: Math.max(high, low),
      low: Math.min(high, low),
    })
  }

  return result
}

export function computeSMA(
  data: { close: number }[],
  period: number,
): (number | null)[] {
  if (data.length < period) return data.map(() => null)

  const result: (number | null)[] = []
  let sum = 0

  for (let i = 0; i < data.length; i++) {
    sum += data[i].close
    if (i >= period - 1) {
      result.push(sum / period)
      sum -= data[i - period + 1].close
    } else {
      result.push(null)
    }
  }

  return result
}

export function computeHistoryStats(
  data: { open: number; close: number }[] | undefined,
): {
  open: number
  close: number
  change: number
  percentChange: number
} | null {
  if (!data || data.length === 0) return null
  const open = data[0].open
  const close = data[data.length - 1].close
  const change = close - open
  const percentChange = open !== 0 ? (change / open) * 100 : 0
  return { open, close, change, percentChange }
}
