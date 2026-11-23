import { useMemo, useState } from 'react'
import { Download, Search } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/components/ui/Toast'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { DataTable } from '@/components/shared/DataTable'
import { Input, Select } from '@/components/ui/Field'
import { Tabs } from '@/components/ui/Tabs'
import { PageHeader } from '@/components/shared/PageHeader'
import { downloadCSV } from '@/lib/utils'
import { typeData } from '@/data/mock'

type Period = 'daily' | 'weekly' | 'monthly'

interface ChartPoint {
  label: string
  fullLabel: string
  authorized: number
  denied: number
  review: number
  total: number
}

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function addDays(d: Date, days: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + days)
  return x
}

function startOfWeek(d: Date) {
  const x = startOfDay(d)
  const day = x.getDay() // 0 Sun
  const diff = (day + 6) % 7 // Monday start
  x.setDate(x.getDate() - diff)
  return x
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function formatDayLabel(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'short' })
}

function formatDayFull(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatWeekLabel(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatMonthLabel(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short' })
}

function formatMonthFull(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function parseDateInput(value: string, endOfDay = false) {
  if (!value) return null
  const d = new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00'}`)
  return Number.isNaN(d.getTime()) ? null : d
}

function buildChartData(logs: { timestamp: string; decision: string }[], period: Period, from: string, to: string): ChartPoint[] {
  const validLogs = logs
    .map(l => ({ ...l, time: new Date(l.timestamp) }))
    .filter(l => !Number.isNaN(l.time.getTime()))

  const now = new Date()
  const latestLogTime = validLogs.length ? new Date(Math.max(...validLogs.map(l => l.time.getTime()))) : now
  const referenceEnd = parseDateInput(to, true) ?? (parseDateInput(from) ? new Date(now.setHours(23, 59, 59, 999)) : latestLogTime)
  const normalizedReferenceEnd = new Date(referenceEnd)
  normalizedReferenceEnd.setHours(23, 59, 59, 999)

  const fromDate = parseDateInput(from)
  const toDate = parseDateInput(to, true)

  const inRange = validLogs.filter(l => (!fromDate || l.time >= fromDate) && (!toDate || l.time <= toDate))

  const buckets: { start: Date; end: Date; label: string; fullLabel: string }[] = []

  if (period === 'daily') {
    const end = startOfDay(toDate ?? normalizedReferenceEnd)
    let start = fromDate ? startOfDay(fromDate) : addDays(end, -6)
    const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1)
    if (days > 14) start = addDays(end, -13)
    for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
      const dayStart = startOfDay(d)
      const dayEnd = addDays(dayStart, 1)
      buckets.push({ start: dayStart, end: dayEnd, label: formatDayLabel(dayStart), fullLabel: formatDayFull(dayStart) })
    }
  } else if (period === 'weekly') {
    const end = startOfWeek(toDate ?? normalizedReferenceEnd)
    let start = fromDate ? startOfWeek(fromDate) : addDays(end, -7 * 7)
    const weeks = Math.max(1, Math.round((end.getTime() - start.getTime()) / (7 * 86400000)) + 1)
    if (weeks > 10) start = addDays(end, -9 * 7)
    for (let d = new Date(start); d <= end; d = addDays(d, 7)) {
      const ws = startOfWeek(d)
      const we = addDays(ws, 7)
      buckets.push({ start: ws, end: we, label: formatWeekLabel(ws), fullLabel: `${formatDayFull(ws)} – ${formatDayFull(addDays(we, -1))}` })
    }
  } else {
    const end = startOfMonth(toDate ?? normalizedReferenceEnd)
    let start = fromDate ? startOfMonth(fromDate) : new Date(end.getFullYear(), end.getMonth() - 5, 1)
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1
    if (months > 12) start = new Date(end.getFullYear(), end.getMonth() - 11, 1)
    for (let d = new Date(start); d <= end; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
      const ms = startOfMonth(d)
      const me = new Date(ms.getFullYear(), ms.getMonth() + 1, 1)
      buckets.push({ start: ms, end: me, label: formatMonthLabel(ms), fullLabel: formatMonthFull(ms) })
    }
  }

  return buckets.map(b => {
    const bucketLogs = inRange.filter(l => l.time >= b.start && l.time < b.end)
    const authorized = bucketLogs.filter(l => l.decision === 'AUTHORIZED').length
    const denied = bucketLogs.filter(l => l.decision === 'DENIED').length
    const review = bucketLogs.filter(l => l.decision === 'NEEDS REVIEW').length
    return { label: b.label, fullLabel: b.fullLabel, authorized, denied, review, total: authorized + denied + review }
  })
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartPoint }> }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3.5 py-3 shadow-sm">
      <p className="text-xs font-semibold text-slate-900">{d.fullLabel}</p>
      <div className="mt-2 space-y-1.5 text-xs">
        <div className="flex items-center justify-between gap-6"><span className="flex items-center gap-2 text-slate-600"><span className="h-2.5 w-2.5 rounded-sm bg-[#3b82f6]" />Authorized</span><span className="font-semibold text-slate-900">{d.authorized.toLocaleString()}</span></div>
        <div className="flex items-center justify-between gap-6"><span className="flex items-center gap-2 text-slate-600"><span className="h-2.5 w-2.5 rounded-sm bg-[#e07a5f]" />Denied</span><span className="font-semibold text-slate-900">{d.denied.toLocaleString()}</span></div>
        <div className="flex items-center justify-between gap-6"><span className="flex items-center gap-2 text-slate-600"><span className="h-2.5 w-2.5 rounded-sm bg-[#f59e0b]" />Needs Review</span><span className="font-semibold text-slate-900">{d.review.toLocaleString()}</span></div>
        <div className="flex items-center justify-between gap-6 border-t border-slate-100 pt-1.5"><span className="text-slate-600">Total</span><span className="font-semibold text-slate-900">{d.total.toLocaleString()}</span></div>
      </div>
    </div>
  )
}

export function Reports() {
  const { data } = useApp()
  const { toast } = useToast()
  const [tab, setTab] = useState<Period>('daily')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [search, setSearch] = useState('')
  const [gate, setGate] = useState('')

  const filtered = useMemo(() => data.recognitionLogs.filter(l => {
    const ts = new Date(l.timestamp)
    if (Number.isNaN(ts.getTime())) return false
    const fromDate = parseDateInput(from)
    const toDate = parseDateInput(to, true)
    return (!search || l.plate.toLowerCase().includes(search.toLowerCase())) && (!gate || l.gateId === gate) && (!fromDate || ts >= fromDate) && (!toDate || ts <= toDate)
  }), [data.recognitionLogs, search, gate, from, to])

  const authorized = filtered.filter(l => l.decision === 'AUTHORIZED').length
  const denied = filtered.filter(l => l.decision === 'DENIED').length
  const review = filtered.filter(l => l.decision === 'NEEDS REVIEW').length
  const total = filtered.length
  const authRate = total > 0 ? ((authorized / total) * 100).toFixed(1) : '0.0'

  const chartData = useMemo(() => buildChartData(filtered, tab, from, to), [filtered, tab, from, to])
  const hasChartData = chartData.some(d => d.total > 0)
  const gateActivity = useMemo(() => data.gates.map(g => ({ name: g.name, entries: g.entriesToday })), [data.gates])

  const exportCsv = () => {
    downloadCSV('entry-history.csv', filtered.map(l => ({ timestamp: l.timestamp, plate: l.plate, type: l.type, color: l.color, confidence: l.confidence.toFixed(1), gate: l.gateId, decision: l.decision })))
    toast('CSV exported', 'success', `${filtered.length} records`)
  }

  const periodDescription = tab === 'daily'
    ? 'Daily authorized, denied, and needs-review vehicle entries for the selected period.'
    : tab === 'weekly'
      ? 'Weekly authorized, denied, and needs-review vehicle entries for the selected period.'
      : 'Monthly authorized, denied, and needs-review vehicle entries for the selected period.'

  return (
    <div className="space-y-5">
      <PageHeader
        title="Entry History and Reports"
        description="Daily, weekly, and monthly vehicle access reports with export."
        actions={<Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4" />Export CSV</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[['Entries', total.toLocaleString(), 'text-slate-900'], ['Authorized', authorized.toLocaleString(), 'text-blue-600'], ['Denied', denied.toLocaleString(), 'text-rose-600'], ['Needs Review', review.toLocaleString(), 'text-amber-600']].map(([label, value, cls]) => (
          <Card key={label as string}>
            <CardContent className="p-4 sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</p>
              <p className={`mt-2 text-2xl font-semibold tracking-tight ${cls as string}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
        <Card className="flex h-full flex-col">
          <CardHeader className="flex-col items-stretch gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">Vehicle Access Analytics</CardTitle>
              <p className="text-sm text-slate-500">{periodDescription}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Tabs
                items={[{ value: 'daily', label: 'Daily' }, { value: 'weekly', label: 'Weekly' }, { value: 'monthly', label: 'Monthly' }]}
                value={tab}
                onChange={(v) => setTab(v as Period)}
              />
            </div>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col space-y-5 p-4 sm:p-5">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">From</label>
                <Input type="date" value={from} onChange={e => setFrom(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">To</label>
                <Input type="date" value={to} onChange={e => setTo(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">Gate</label>
                <Select value={gate} onChange={e => setGate(e.target.value)} options={[{ value: '', label: 'All gates' }, ...data.gates.map(g => ({ value: g.id, label: g.name }))]} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">Plate Search</label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search plate..." className="pl-9" />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/70 px-4 py-3">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-[#3b82f6]" /><span className="text-slate-600">Authorized</span></div>
                <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-[#e07a5f]" /><span className="text-slate-600">Denied</span></div>
                <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-[#f59e0b]" /><span className="text-slate-600">Needs Review</span></div>
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-600">
                <span>Total: <span className="font-semibold text-slate-900">{total.toLocaleString()}</span></span>
                <span>Auth rate: <span className="font-semibold text-slate-900">{authRate}%</span></span>
              </div>
            </div>

            <div className="min-h-[320px] flex-1 sm:min-h-[360px]">
              {!hasChartData ? (
                <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 text-center">
                  <div>
                    <p className="text-sm font-medium text-slate-700">No chart data available</p>
                    <p className="mt-1 text-sm text-slate-500">Try adjusting the date range, gate, or plate filters.</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }} barCategoryGap="24%">
                    <CartesianGrid stroke="#edf2f7" strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
                    <Bar dataKey="authorized" name="Authorized" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} animationDuration={450} />
                    <Bar dataKey="denied" name="Denied" fill="#e07a5f" radius={[6, 6, 0, 0]} maxBarSize={40} animationDuration={450} />
                    <Bar dataKey="review" name="Needs Review" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={40} animationDuration={450} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="flex h-full flex-col">
          <CardHeader>
            <CardTitle className="text-base">Gate Activity</CardTitle>
            <p className="mt-1 text-sm text-slate-500">Entries recorded today by gate.</p>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <div className="min-h-[320px] flex-1 sm:min-h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gateActivity} margin={{ top: 8, right: 8, left: -12, bottom: 0 }} barCategoryGap="28%">
                  <CartesianGrid stroke="#edf2f7" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={8} interval={0} angle={-12} textAnchor="end" height={44} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'rgba(148,163,184,0.08)' }} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: 'none' }} />
                  <Bar dataKey="entries" name="Entries" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={48} animationDuration={450} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
              {gateActivity.map(g => (
                <div key={g.name} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-slate-600">{g.name}</span>
                  <span className="shrink-0 font-medium text-slate-900">{g.entries.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vehicle Type Distribution</CardTitle>
          <p className="mt-1 text-sm text-slate-500">Registered vehicle composition by type.</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="h-56 w-full sm:w-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={typeData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={2}>
                    {typeData.map((item, i) => <Cell key={i} fill={item.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid w-full flex-1 grid-cols-2 gap-x-3 gap-y-2 text-sm sm:grid-cols-4">
              {typeData.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.fill }} />
                  <span className="truncate text-slate-600">{item.name}</span>
                  <span className="ml-auto font-medium text-slate-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <DataTable data={filtered} columns={[
            { key: 'timestamp', header: 'Timestamp', render: l => new Date(l.timestamp).toLocaleString('en-PH', { timeZone: 'Asia/Manila', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }), value: l => l.timestamp },
            { key: 'plate', header: 'Plate', render: l => <span className="font-mono font-semibold">{l.plate}</span>, value: l => l.plate },
            { key: 'type', header: 'Type', render: l => l.type, value: l => l.type },
            { key: 'gate', header: 'Gate', render: l => l.gateId, value: l => l.gateId },
            { key: 'decision', header: 'Decision', render: l => <Badge value={l.decision} /> },
          ]} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recognition Failure Report</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">
            Denied or review-required recognition attempts: <span className="font-semibold text-slate-900">{data.recognitionLogs.filter(l => l.decision !== 'AUTHORIZED').length}</span>. Review camera positioning, lighting, and model confidence thresholds.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}