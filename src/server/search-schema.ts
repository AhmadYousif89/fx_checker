import { rangeKeys } from '#/lib/currency/time-ranges'
import type { RangeKey } from '#/lib/currency/time-ranges'
import z from 'zod'

export const searchSchema = z.object({
  from: z.preprocess((v) => {
    if (typeof v !== 'string') return v
    if (!rangeKeys.includes(v as RangeKey)) return 'USD'
    if (v.length !== 3) return 'USD'
    return v.toUpperCase()
  }, z.string().optional()),
  to: z.preprocess((v) => {
    if (typeof v !== 'string') return v
    if (!rangeKeys.includes(v as RangeKey)) return 'EUR'
    if (v.length !== 3) return 'EUR'
    return v.toUpperCase()
  }, z.string().optional()),
  amount: z.preprocess((v) => {
    if (typeof v !== 'string' || v.length === 0) return '1'
    const n = Number(v)
    return !isNaN(n) && n >= 0 ? v : '1'
  }, z.string().optional()),
  view: z.preprocess((v) => {
    if (typeof v !== 'string') return v
    return rangeKeys.includes(v as RangeKey) ? v : '3m'
  }, z.string().optional()),
})
