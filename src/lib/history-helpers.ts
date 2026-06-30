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
