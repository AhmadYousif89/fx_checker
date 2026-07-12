import z from 'zod'
import { rangeKeys } from '#/lib/history/config'
import { MAX_INPUT_AMOUNT } from '#/lib/currency/format'
import type { RangeKey } from '#/lib/history/config'
import type { CurrencyDetails, CurrencySearch } from '#/types/currency'

const FALLBACK_FROM = 'USD'
const FALLBACK_TO = 'EUR'

export function sanitizeCurrencySearch(
  search: CurrencySearch,
  currencies: CurrencyDetails[],
) {
  const validCodes = new Set(currencies.map((currency) => currency.iso_code))

  const from =
    typeof search.from === 'string' && validCodes.has(search.from.toUpperCase())
      ? search.from.toUpperCase()
      : FALLBACK_FROM
  let to =
    typeof search.to === 'string' && validCodes.has(search.to.toUpperCase())
      ? search.to.toUpperCase()
      : FALLBACK_TO

  if (from === to) {
    to = from === FALLBACK_FROM ? FALLBACK_TO : FALLBACK_FROM
  }

  return { from, to }
}

const TAB_VALUES = ['history', 'favorites', 'compare', 'logs'] as const

export const searchSchema = z.object({
  from: z.preprocess((v) => {
    if (v == null) return
    if (typeof v !== 'string' || v.length !== 3) return 'USD'
    return v.toUpperCase()
  }, z.string().optional()),
  to: z.preprocess((v) => {
    if (v == null) return
    if (typeof v !== 'string' || v.length !== 3) return 'EUR'
    return v.toUpperCase()
  }, z.string().optional()),
  amount: z.preprocess((v) => {
    if (v == null) return
    if (typeof v !== 'string' || v.length === 0) return '1'
    const n = Number(v)
    if (isNaN(n) || n < 0) return '1'
    return n > MAX_INPUT_AMOUNT ? String(MAX_INPUT_AMOUNT) : v
  }, z.string().optional()),
  view: z.preprocess((v) => {
    if (v == null) return
    if (typeof v !== 'string') return '3m'
    return rangeKeys.includes(v as RangeKey) ? v : '3m'
  }, z.string().optional()),
  tab: z.preprocess((v) => {
    if (v == null) return
    if (typeof v !== 'string') return 'history'
    return TAB_VALUES.includes(v as (typeof TAB_VALUES)[number]) ? v : 'history'
  }, z.string().optional()),
  sma: z.preprocess((v) => {
    if (v == null) return undefined
    return v === 'true' || v === '1' || v === true
  }, z.boolean().optional()),
})
