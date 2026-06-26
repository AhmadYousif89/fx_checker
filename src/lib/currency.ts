export const POPULAR_CODES = ['USD', 'EUR', 'GBP']

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

export const TICKER_CURRENCIES = [
  'USD',
  'GBP',
  'JPY',
  'CHF',
  'CAD',
  'AUD',
  'CNY',
  'NZD',
  'MXN',
  'SGD',
  'HKD',
  'NOK',
  'KRW',
  'TRY',
  'INR',
  'ZAR',
]

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

export function restrictNumeric(e: React.InputEvent<HTMLInputElement>) {
  e.currentTarget.value = e.currentTarget.value
    .replace(/[^\d.]/g, '')
    .replace(/(\..*)\./g, '$1')
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

export function getCrossRate(
  rates: Record<string, number>,
  base: string,
  quote: string,
): number | null {
  if (base === quote) return 1
  if (base !== 'EUR' && !(base in rates)) return null
  if (quote !== 'EUR' && !(quote in rates)) return null
  const rBase = base === 'EUR' ? 1 : rates[base]
  const rQuote = quote === 'EUR' ? 1 : rates[quote]
  return rQuote / rBase
}
