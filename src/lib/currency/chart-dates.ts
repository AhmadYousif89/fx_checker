function parseUTCDate(dateStr: string): Date {
  const normalized = dateStr.includes(' ')
    ? dateStr.replace(' ', 'T') + 'Z'
    : dateStr
  return new Date(normalized)
}

const TIMEZONE = 'UTC'

export function formatTooltipDate(dateStr: string, rangeKey: string) {
  if (!dateStr) return ''
  const d = parseUTCDate(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  if (rangeKey === '1d' || rangeKey === '1w') {
    return d.toLocaleString('en-US', {
      timeZone: TIMEZONE,
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }
  return d.toLocaleDateString('en-US', {
    timeZone: TIMEZONE,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatAxisDate(dateStr: string, rangeKey: string) {
  if (!dateStr) return ''
  const d = parseUTCDate(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  if (rangeKey === '1d') {
    return d.toLocaleString('en-US', {
      timeZone: TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }
  if (
    rangeKey === '1w' ||
    rangeKey === '1m' ||
    rangeKey === '3m' ||
    rangeKey === '6m'
  ) {
    return d.toLocaleDateString('en-US', {
      timeZone: TIMEZONE,
      month: 'short',
      day: 'numeric',
    })
  }
  return d.toLocaleDateString('en-US', {
    timeZone: TIMEZONE,
    month: 'short',
    year: '2-digit',
  })
}
