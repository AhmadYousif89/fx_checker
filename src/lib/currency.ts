export const POPULAR_CODES = ['USD', 'EUR', 'GBP']

export const GLOBAL_PRIORITY = [
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'CHF',
  'CAD',
  'AUD',
  'CNY',
  'NZD',
  'SEK',
  'KRW',
  'NOK',
  'MXN',
  'SGD',
  'INR',
  'BRL',
]

export const TIME_RANGES: Record<string, number> = {
  '1d': 1,
  '1w': 7,
  '1m': 30,
  '3m': 90,
  '1y': 365,
  '5y': 1825,
}

export const FLAG_CODES = [
  'ae',
  'ar',
  'au',
  'bd',
  'bg',
  'bh',
  'br',
  'ca',
  'ch',
  'cl',
  'cn',
  'co',
  'cy',
  'cz',
  'dk',
  'eg',
  'eu',
  'gb',
  'hk',
  'hn',
  'hr',
  'ht',
  'hu',
  'id',
  'in',
  'is',
  'jo',
  'jp',
  'ke',
  'kr',
  'kw',
  'lb',
  'lc',
  'lk',
  'ma',
  'mx',
  'my',
  'ng',
  'no',
  'np',
  'nz',
  'om',
  'pe',
  'ph',
  'pk',
  'pl',
  'qa',
  'ro',
  'ru',
  'sa',
  'se',
  'sg',
  'th',
  'tr',
  'tw',
  'ua',
  'us',
  'vn',
  'za',
]

export const FLAG_CODE_SET = new Set(FLAG_CODES)

export function getFlagUrl(isoCode: string) {
  const code = isoCode.slice(0, 2).toLowerCase()
  if (!FLAG_CODE_SET.has(code)) return ''
  return `/assets/images/flags/${code}.webp`
}

export const TICKER_PAIRS = [
  { base: 'USD', quote: 'JPY' },
  { base: 'GBP', quote: 'USD' },
  { base: 'USD', quote: 'EGP' },
  { base: 'USD', quote: 'CHF' },
  { base: 'EUR', quote: 'GBP' },
  { base: 'EUR', quote: 'USD' },
  { base: 'AUD', quote: 'USD' },
  { base: 'USD', quote: 'CAD' },
  { base: 'NZD', quote: 'USD' },
  { base: 'EGP', quote: 'USD' },
]

export function parseCurrency(value: string) {
  const [code, ...rest] = value.split('-')
  return { code, name: rest.join(' ') }
}

export function abbreviateCurrencyName(name: string): string {
  const words = name.split(' ')
  if (words.length < 3) return name

  const initials = words
    .slice(0, -1)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return `${initials} ${words[words.length - 1]}`
}

export function restrictNumeric(value: string) {
  return value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 5) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 1) return '<1 min ago'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

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

/**
 * Format an amount for display using commas for thousands.
 * Uses up to `maxDecimals` fraction digits, but trims trailing zeros.
 * Examples: 1000 → "1,000"  |  853.02 → "853.02"  |  157910 → "157,910"
 */
export function formatAmount(value: number, maxDecimals = 2): string {
  const decimals = value < 10 ? 4 : maxDecimals
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Format a rate for display. Rates below 10 get 4 decimals, otherwise 2.
 * Examples: 0.853 → "0.8530"  |  157.91 → "157.91"
 */
export function formatRate(value: number): string {
  const decimals = value < 10 ? 4 : 2
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Short relative time for log entries.
 * Examples: "20M" | "1H" | "13 May"
 */
export function shortTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  const minutes = Math.floor(seconds / 60)
  if (minutes < 1) return '<1M'
  if (minutes < 60) return `${minutes}M`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}H`
  const d = new Date(timestamp)
  const day = d.getDate()
  const month = d.toLocaleString('en-US', { month: 'short' })
  return `${day} ${month}`
}
