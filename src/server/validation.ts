import { z } from 'zod'

export const currencyCode = z.string().length(3).toUpperCase()

export const daysParam = z.number().int().min(1).max(1825)

export const pairArray = z
  .array(z.object({ sender: currencyCode, receiver: currencyCode }))
  .min(1)
  .max(50)

const rateNumber = z.number().positive()

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

export const FrankfurterRateSchema = z.object({
  date: isoDate,
  base: currencyCode,
  quote: currencyCode,
  rate: rateNumber,
})

export const CurrencyDetailsSchema = z.object({
  name: z.string().min(1),
  symbol: z.string(),
  iso_code: currencyCode,
  iso_numeric: z.string(),
  start_date: z.string(),
  end_date: z.string(),
})

const ohlcString = z.string().transform((v) => {
  const n = parseFloat(v)
  if (!Number.isFinite(n) || n <= 0) return 0
  return n
})

export const TwelveDataValueSchema = z
  .object({
    datetime: z.string().min(1),
    open: ohlcString,
    high: ohlcString,
    low: ohlcString,
    close: ohlcString,
  })
  .refine((v) => v.high >= v.low, { message: 'high must be >= low' })

export const TwelveDataResponseSchema = z.object({
  meta: z.object({
    symbol: z.string().min(1),
    interval: z.string().min(1),
    currency_base: z.string(),
    currency_quote: z.string(),
    type: z.string(),
  }),
  values: z.array(TwelveDataValueSchema).min(1),
  status: z.literal('ok'),
})
