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
