import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }
export const uid = (prefix = 'ID') => `${prefix}-${Date.now().toString(36).toUpperCase()}`
export function formatDate(date: string | Date, includeTime = false) {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric', ...(includeTime ? { hour: 'numeric', minute: '2-digit' } : {}), timeZone: 'Asia/Manila' }).format(d)
}
export function formatTime(date: string | Date) {
  return new Intl.DateTimeFormat('en-PH', { hour: 'numeric', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Manila' }).format(typeof date === 'string' ? new Date(date) : date)
}
export function relativeTime(date: string) {
  const minutes = Math.round((new Date(date).getTime() - Date.now()) / 60000)
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute')
  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour')
  return rtf.format(Math.round(hours / 24), 'day')
}
export function downloadCSV(filename: string, rows: Record<string, string | number>[]) {
  if (!rows.length) return
  const keys = Object.keys(rows[0])
  const escape = (v: string | number) => `"${String(v).replaceAll('"', '""')}"`
  const csv = [keys.map(escape).join(','), ...rows.map(r => keys.map(k => escape(r[k])).join(','))].join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url)
}
export const statusClass = (status: string) => {
  const s = status.toLowerCase()
  if (['authorized', 'active', 'online', 'approved', 'resolved', 'automatic'].includes(s)) return 'success'
  if (['denied', 'critical', 'high', 'suspended', 'rejected', 'inactive', 'expired'].includes(s)) return 'destructive'
  if (['pending', 'needs review', 'under review', 'investigating', 'medium', 'manual'].includes(s)) return 'warning'
  if (['completed'].includes(s)) return 'blue'
  return 'secondary'
}
