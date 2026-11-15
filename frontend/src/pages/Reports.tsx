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
import { typeData, weeklyData } from '@/data/mock'

export function Reports() {
  const { data } = useApp(); const { toast } = useToast()
  const [tab, setTab] = useState('daily'); const [from, setFrom] = useState(''); const [to, setTo] = useState(''); const [search, setSearch] = useState(''); const [gate, setGate] = useState('')
  const filtered = useMemo(() => data.recognitionLogs.filter(l => {
    const ts = new Date(l.timestamp)
    return (!search || l.plate.toLowerCase().includes(search.toLowerCase())) && (!gate || l.gateId === gate) && (!from || ts >= new Date(from)) && (!to || ts <= new Date(to + 'T23:59:59'))
  }), [data.recognitionLogs, search, gate, from, to])
  const authorized = filtered.filter(l => l.decision === 'AUTHORIZED').length
  const denied = filtered.filter(l => l.decision === 'DENIED').length
  const review = filtered.filter(l => l.decision === 'NEEDS REVIEW').length
  const exportCsv = () => { downloadCSV('entry-history.csv', filtered.map(l => ({ timestamp: l.timestamp, plate: l.plate, type: l.type, color: l.color, confidence: l.confidence.toFixed(1), gate: l.gateId, decision: l.decision }))); toast('CSV exported','success',`${filtered.length} records`) }
  const gateActivity = data.gates.map(g => ({ name: g.name, entries: g.entriesToday }))
  return <div className="space-y-5">
    <PageHeader title="Entry History and Reports" description="Daily, weekly, and monthly vehicle access reports with simulated export." actions={<Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4" />Export CSV</Button>} />
    <div className="grid gap-4 md:grid-cols-4">{[['Entries', filtered.length, 'blue'],['Authorized', authorized, 'emerald'],['Denied', denied, 'red'],['Needs Review', review, 'amber']].map(([label,value,tone]) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-[11px] font-bold uppercase tracking-[.08em] text-slate-500">{label}</p><p className={`mt-2 font-display text-2xl font-extrabold ${tone==='red'?'text-red-600':tone==='emerald'?'text-emerald-600':tone==='amber'?'text-amber-600':'text-slate-950'}`}>{value}</p></div>)}</div>
    <Card><CardContent className="space-y-4"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><Tabs items={[{value:'daily',label:'Daily'},{value:'weekly',label:'Weekly'},{value:'monthly',label:'Monthly'}]} value={tab} onChange={setTab} /><div className="grid gap-2 sm:grid-cols-4"><Input type="date" value={from} onChange={e=>setFrom(e.target.value)} /><Input type="date" value={to} onChange={e=>setTo(e.target.value)} /><Select value={gate} onChange={e=>setGate(e.target.value)} options={[{value:'',label:'All gates'},...data.gates.map(g=>({value:g.id,label:g.name}))]} /><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Plate..." className="pl-9" /></div></div></div>
      {tab === 'daily' && <div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={weeklyData}><CartesianGrid strokeDasharray="3 3" stroke="#e8edf4" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Bar dataKey="authorized" fill="#10b981" radius={[5,5,0,0]} /><Bar dataKey="denied" fill="#ef4444" radius={[5,5,0,0]} /></BarChart></ResponsiveContainer></div>}
      {tab === 'weekly' && <div className="grid gap-4 lg:grid-cols-2"><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={gateActivity}><CartesianGrid strokeDasharray="3 3" stroke="#e8edf4" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="entries" fill="#2563eb" radius={[5,5,0,0]} /></BarChart></ResponsiveContainer></div><div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={typeData} dataKey="value" nameKey="name" outerRadius={90}>{typeData.map((item,i)=><Cell key={i} fill={item.fill} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div></div>}
      {tab === 'monthly' && <div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={weeklyData}><CartesianGrid strokeDasharray="3 3" stroke="#e8edf4" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Bar dataKey="authorized" fill="#2563eb" radius={[5,5,0,0]} /><Bar dataKey="denied" fill="#94a3b8" radius={[5,5,0,0]} /></BarChart></ResponsiveContainer></div>}
    </CardContent></Card>
    <Card><CardContent className="p-0"><DataTable data={filtered} columns={[
      { key:'timestamp', header:'Timestamp', render:l=>new Date(l.timestamp).toLocaleString('en-PH',{timeZone:'Asia/Manila',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}), value:l=>l.timestamp },
      { key:'plate', header:'Plate', render:l=><span className="font-mono font-semibold">{l.plate}</span>, value:l=>l.plate },
      { key:'type', header:'Type', render:l=>l.type, value:l=>l.type },
      { key:'gate', header:'Gate', render:l=>l.gateId, value:l=>l.gateId },
      { key:'decision', header:'Decision', render:l=><Badge value={l.decision} /> },
    ]} /></CardContent></Card>
    <Card><CardHeader><CardTitle>Recognition Failure Report</CardTitle></CardHeader><CardContent><p className="text-sm text-slate-500">Denied or review-required recognition attempts: <span className="font-semibold text-slate-900">{data.recognitionLogs.filter(l=>l.decision!=='AUTHORIZED').length}</span>. Review camera positioning, lighting, and model confidence thresholds.</p></CardContent></Card>
  </div>
}
