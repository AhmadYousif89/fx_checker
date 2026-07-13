export type SeriesData = {
  key: string
  data: { time: string; close: number; indexed: number }[]
  latestClose: number
}

export const CHART_COLORS = [
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
]
