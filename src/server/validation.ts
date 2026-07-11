import { z } from 'zod'

export const currencyCode = z.string().length(3).toUpperCase()

export const daysParam = z.number().int().min(1).max(1825)

export const pairArray = z
  .array(z.object({ sender: currencyCode, receiver: currencyCode }))
  .min(1)
  .max(50)
