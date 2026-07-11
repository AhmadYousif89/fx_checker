import type {
  FrankfurterApiRate,
  LatestRatesEntry,
  RateWithDiff,
} from '#/types/currency'

/**
 * Compute live cross rate from Frankfurter's latest EUR-anchored rates map.
 * E.g. base=USD, quote=EUR → EUR/USD = 1 / USD_rate.
 *
 * Each rate entry carries its own date. The function verifies both legs
 * share the same date to avoid combining observations from different
 * trading sessions (e.g. Friday rate ÷ Saturday rate).
 */
export function getCrossRate({
  rates,
  base,
  quote,
}: {
  rates: Map<string, LatestRatesEntry>
  base: string
  quote: string
}): number | null {
  if (base === quote) return 1

  const rBase = base === 'EUR' ? { rate: 1, date: '' } : rates.get(base)
  if (rBase == null) return null
  const rQuote = quote === 'EUR' ? { rate: 1, date: '' } : rates.get(quote)
  if (rQuote == null) return null

  // Only cross-rate from the same date to avoid stale-data mixing
  if (rBase.date && rQuote.date && rBase.date !== rQuote.date) return null

  return rQuote.rate / rBase.rate
}

/** Look up a single EUR-anchored quote rate at a specific date. */
export function getRateAtDate(
  rates: FrankfurterApiRate[],
  date: string,
  quote: string,
): number | null {
  if (quote === 'EUR') return 1
  const match = rates.find((r) => r.date === date && r.quote === quote)
  return match ? match.rate : null
}

/**
 * Compute a single cross rate at a specific date from the Frankfurter
 * EUR-anchored time series. E.g. for base=USD, quote=JPY:
 *   EUR/JPY ÷ EUR/USD = JPY per USD.
 */
export function getCrossRateAtDate(
  rates: FrankfurterApiRate[],
  date: string,
  baseCode: string,
  quoteCode: string,
): number | null {
  const rBase = getRateAtDate(rates, date, baseCode)
  const rQuote = getRateAtDate(rates, date, quoteCode)
  if (rBase === null || rQuote === null) return null
  return rQuote / rBase
}

/**
 * For a given base/quote pair, find the latest and previous dates from
 * `dates` (sorted descending) where both currencies have data.
 */
function getPairDates(
  rates: FrankfurterApiRate[],
  dates: string[],
  base: string,
  quote: string,
): { latest: string | null; previous: string | null } {
  let latest: string | null = null
  let previous: string | null = null

  for (const date of dates) {
    if (
      getRateAtDate(rates, date, base) !== null &&
      getRateAtDate(rates, date, quote) !== null
    ) {
      if (latest === null) {
        latest = date
      } else {
        previous = date
        break
      }
    }
  }

  return { latest, previous }
}

/**
 * Generate a list of fallback currency pairs with their latest rates and
 * differences from the previous date, based on the Frankfurter API data.
 * Each pair independently selects its best date window.
 */
export function generateFallbackPairs(
  rates: FrankfurterApiRate[],
  completeDates: string[],
): RateWithDiff[] {
  if (completeDates.length === 0) return []

  const result: RateWithDiff[] = []

  for (const [base, quote] of FALLBACK_PAIRS) {
    const { latest: latestDate, previous: previousDate } = getPairDates(
      rates,
      completeDates,
      base,
      quote,
    )
    if (!latestDate) continue

    const rBase = getRateAtDate(rates, latestDate, base)
    const rQuote = getRateAtDate(rates, latestDate, quote)
    if (rBase === null || rQuote === null) continue

    const latestRate = rQuote / rBase

    let difference: number | null = null
    let direction: 'up' | 'down' | 'flat' | 'unknown' = 'unknown'

    if (previousDate) {
      const pBase = getRateAtDate(rates, previousDate, base)
      const pQuote = getRateAtDate(rates, previousDate, quote)
      if (pBase !== null && pQuote !== null) {
        const previousRate = pQuote / pBase
        if (previousRate > 0) {
          difference = ((latestRate - previousRate) / previousRate) * 100
          direction =
            difference > 0.0001 ? 'up' : difference < -0.0001 ? 'down' : 'flat'
        }
      }
    }
    result.push({ base, quote, rate: latestRate, difference, direction })
  }

  return result
}

export const FALLBACK_PAIRS: [string, string][] = [
  ['USD', 'EGP'],
  ['USD', 'TRY'],
  ['USD', 'BRL'],
  ['USD', 'ZAR'],
  ['USD', 'KRW'],
  ['USD', 'NGN'],
  ['USD', 'PHP'],
  ['EUR', 'GBP'],
  ['EUR', 'JPY'],
  ['EUR', 'CHF'],
  ['EUR', 'AUD'],
  ['EUR', 'NZD'],
  ['EUR', 'CAD'],
  ['EUR', 'NOK'],
  ['EUR', 'SEK'],
  ['GBP', 'JPY'],
  ['GBP', 'USD'],
  ['GBP', 'AUD'],
  ['GBP', 'CHF'],
  ['JPY', 'KRW'],
  ['JPY', 'TWD'],
  ['JPY', 'SGD'],
  ['AUD', 'CAD'],
  ['AUD', 'JPY'],
  ['CHF', 'JPY'],
  ['CAD', 'JPY'],
  ['NZD', 'USD'],
]
