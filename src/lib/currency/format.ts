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

export function formatInputAmount(value: string): string {
  if (!value) return value
  const dot = value.indexOf('.')
  if (dot === -1) return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const integer = value.slice(0, dot)
  const decimal = value.slice(dot + 1)
  return `${integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${decimal}`
}

export function formatAmount(value: number, maxDecimals = 2): string {
  const decimals = value < 10 ? 4 : maxDecimals
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatRate(value: number): string {
  const decimals = value < 10 ? 4 : 2
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

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
