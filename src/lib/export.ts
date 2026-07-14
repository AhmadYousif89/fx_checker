import { format } from 'date-fns'
import type { ConversionLog } from '#/types/currency'

function fmtTimestamp(ts: number): string {
  return format(new Date(ts), 'yyyy-MM-dd HH:mm:ss')
}

function escapeCsv(value: string | number): string {
  return `"${String(value).replace(/"/g, '""')}"`
}

function getFilename(ext: string): string {
  return `fx-checker-logs-${format(new Date(), 'yyyy-MM-dd')}.${ext}`
}

function download(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportLogsAsCsv(logs: ConversionLog[]) {
  const headers = ['Timestamp', 'From', 'To', 'Amount', 'Rate', 'Result']
  const rows = logs.map((l) => [
    fmtTimestamp(l.timestamp),
    l.sender,
    l.receiver,
    String(l.amount),
    String(l.baseRate),
    String(l.result),
  ])

  const csv = [
    headers.map(escapeCsv).join(','),
    ...rows.map((r) => r.map(escapeCsv).join(',')),
  ].join('\n')

  download('\uFEFF' + csv, getFilename('csv'), 'text/csv')
}

export function exportLogsAsJson(logs: ConversionLog[]) {
  const json = JSON.stringify(logs, null, 2)
  download(json, getFilename('json'), 'application/json')
}
