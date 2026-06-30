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
