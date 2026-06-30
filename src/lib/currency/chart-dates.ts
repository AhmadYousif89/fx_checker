function parseUTCDate(dateStr: string): Date {
  const normalized = dateStr.includes(' ')
    ? dateStr.replace(' ', 'T') + 'Z'
    : dateStr
  return new Date(normalized)
}

export function formatTooltipDate(dateStr: string, rangeKey: string) {
  if (!dateStr) return ''
  const d = parseUTCDate(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  if (rangeKey === '1d' || rangeKey === '1w') {
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    })
  }
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function formatAxisDate(dateStr: string, rangeKey: string) {
  if (!dateStr) return ''
  const d = parseUTCDate(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  if (rangeKey === '1d') {
    return d.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    })
  }
  if (
    rangeKey === '1w' ||
    rangeKey === '1m' ||
    rangeKey === '3m' ||
    rangeKey === '6m'
  ) {
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    })
  }
  return d.toLocaleDateString('en-US', {
    month: 'short',
    year: '2-digit',
    timeZone: 'UTC',
  })
}
