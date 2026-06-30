export function getCrossRate({
  rates,
  base,
  quote,
}: {
  rates: Record<string, number>
  base: string
  quote: string
}): number | null {
  if (base === quote) return 1
  if (base !== 'EUR' && !(base in rates)) return null
  if (quote !== 'EUR' && !(quote in rates)) return null
  const rBase = base === 'EUR' ? 1 : rates[base]
  const rQuote = quote === 'EUR' ? 1 : rates[quote]
  return rQuote / rBase
}
