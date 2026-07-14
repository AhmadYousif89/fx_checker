import { parseISO, isValid, format } from 'date-fns'
import { TZDate } from '@date-fns/tz'

const TIMEZONE = 'UTC'

function parseUTCDate(dateStr: string): Date {
  const normalized = dateStr.includes(' ')
    ? dateStr.replace(' ', 'T') + 'Z'
    : `${dateStr}T00:00:00Z`
  return parseISO(normalized)
}

export function formatTooltipDate(dateStr: string, rangeKey: string) {
  if (!dateStr) return ''
  const d = parseUTCDate(dateStr)
  if (!isValid(d)) return dateStr
  const tzDate = new TZDate(d, TIMEZONE)
  if (rangeKey === '1d' || rangeKey === '1w') {
    return format(tzDate, 'MMM d, yyyy HH:mm')
  }
  return format(tzDate, 'MMM d, yyyy')
}

export function formatAxisDate(dateStr: string, rangeKey: string) {
  if (!dateStr) return ''
  const d = parseUTCDate(dateStr)
  if (!isValid(d)) return dateStr
  const tzDate = new TZDate(d, TIMEZONE)
  if (rangeKey === '1d') {
    return format(tzDate, 'HH:mm')
  }
  if (
    rangeKey === '1w' ||
    rangeKey === '1m' ||
    rangeKey === '3m' ||
    rangeKey === '6m'
  ) {
    return format(tzDate, 'MMM d')
  }
  return format(tzDate, 'MMM yy')
}
