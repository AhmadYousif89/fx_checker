export type SeriesData = {
  key: string
  name: string
  data: { time: string; close: number; indexed: number }[]
  latestClose: number
}

export const MAX_CHART_PICKS = 5

export const CHART_COLORS = [
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
]
