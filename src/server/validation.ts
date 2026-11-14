import { z } from 'zod'

export const currencyCode = z
  .string()
  .trim()
  .length(3)
  .regex(/^[A-Za-z]{3}$/)
  .toUpperCase()

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
  symbol: z.string().nullable(),
  iso_code: currencyCode,
  iso_numeric: z.string().nullable(),
  start_date: z.string(),
  end_date: z.string(),
})

export const CurrencyDetailsResponseSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'object' || value === null) {
      return value
    }

    const entries = Array.isArray(value) ? value : Object.values(value)

    return entries.filter((entry) => {
      if (typeof entry !== 'object' || entry === null) return false

      const currency = entry as Record<string, unknown>
      return (
        currency.type === 'currency' &&
        currencyCode.safeParse(currency.iso_code).success
      )
    })
  },
  z.array(CurrencyDetailsSchema),
)

const isFiatRate = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== 'object' || value === null) return false

  const rate = value as Record<string, unknown>
  return currencyCode.safeParse(rate.base).success &&
    currencyCode.safeParse(rate.quote).success
}

export const FrankfurterRatesSchema = z.preprocess(
  (value) => (Array.isArray(value) ? value.filter(isFiatRate) : value),
  z.array(FrankfurterRateSchema),
)

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
