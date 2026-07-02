import type { ConversionLog } from '#/types/currency'

function fmtTimestamp(ts: number): string {
  const d = new Date(ts)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

function escapeCsv(value: string | number): string {
  return `"${String(value).replace(/"/g, '""')}"`
}

function getFilename(ext: string): string {
  const date = new Date().toISOString().slice(0, 10)
  return `fx-checker-logs-${date}.${ext}`
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
