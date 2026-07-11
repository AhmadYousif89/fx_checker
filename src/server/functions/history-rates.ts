import { OPEN_API_URL } from '../config'
import type { FrankfurterApiRate } from '#/types/currency'

// Fetch historical rates from the Frankfurter API for the last 5 days
export async function getHistoricalRates() {
  const now = new Date()
  const endDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  )
  const startDate = new Date(endDate)
  startDate.setUTCDate(endDate.getUTCDate() - 5)

  const format = (d: Date) => d.toISOString().split('T')[0]

  const url = new URL(`${OPEN_API_URL}/v2/rates`)
  url.searchParams.set('from', format(startDate))
  url.searchParams.set('to', format(endDate))
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Failed to fetch historical rates')
  }

  const result = await response.json()
  return result as FrankfurterApiRate[]
}
