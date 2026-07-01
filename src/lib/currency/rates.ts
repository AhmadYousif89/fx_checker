export function getCrossRate({
  rates,
  base,
  quote,
}: {
  rates: Map<string, number>
  base: string
  quote: string
}): number | null {
  if (base === quote) return 1
  if (base !== 'EUR' && !rates.has(base)) return null
  if (quote !== 'EUR' && !rates.has(quote)) return null
  const rBase = base === 'EUR' ? 1 : rates.get(base)
  if (rBase == null) return null
  const rQuote = quote === 'EUR' ? 1 : rates.get(quote)
  if (rQuote == null) return null
  return rQuote / rBase
}
