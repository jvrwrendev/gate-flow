import { useEffect, useMemo, useState } from 'react'
import { Circle, Pause, Play, RefreshCw, ShieldCheck } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/components/ui/Toast'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Select } from '@/components/ui/Field'
import { CameraPlaceholder } from '@/components/shared/VehicleImage'
import { formatTime } from '@/lib/utils'

export function LiveMonitor() {
  const { data } = useApp(); const { toast } = useToast()
  const [cameraId, setCameraId] = useState(data.cameras[0]?.id ?? '')
  const [running, setRunning] = useState(false)
  const [current, setCurrent] = useState(data.recognitionLogs[0])
  const [history, setHistory] = useState(data.recognitionLogs.slice(0, 6))
  const camera = data.cameras.find(c => c.id === cameraId)
  const gate = data.gates.find(g => g.id === camera?.gateId)
  const [now, setNow] = useState(new Date())
  useEffect(() => { const t = window.setInterval(() => setNow(new Date()), 1000); return () => window.clearInterval(t) }, [])
  const cameraLogs = useMemo(() => data.recognitionLogs.filter(l => l.cameraId === cameraId), [data.recognitionLogs, cameraId])
  useEffect(() => { if (cameraLogs.length) setCurrent(cameraLogs[0]) }, [cameraId, cameraLogs])
  useEffect(() => {
    if (!running || !cameraLogs.length) return
    const timer = window.setInterval(() => {
      const next = cameraLogs[Math.floor(Math.random() * cameraLogs.length)]
      setCurrent(next); setHistory(prev => [next, ...prev].slice(0, 8))
      toast(next.decision === 'DENIED' ? 'Denied detection simulated' : 'Detection simulated', 'info', next.plate)
    }, 4200)
    return () => window.clearInterval(timer)
  }, [running, cameraLogs, toast])
  const decisionColor = current?.decision === 'AUTHORIZED' ? 'success' : current?.decision === 'DENIED' ? 'destructive' : 'warning'
  return <div className="space-y-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="font-display text-[24px] font-extrabold tracking-tight text-slate-950">Live Monitoring</h1><p className="mt-1 text-sm text-slate-500">Simulated surveillance interface for operator review. No camera stream or AI inference is active.</p></div><div className="flex flex-wrap gap-2"><Button variant={running ? 'outline' : 'default'} onClick={() => setRunning(v => !v)}>{running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}{running ? 'Pause simulation' : 'Start simulation'}</Button><Button variant="outline" onClick={() => { const next = cameraLogs[Math.floor(Math.random() * cameraLogs.length)] || data.recognitionLogs[0]; setCurrent(next); setHistory(prev => [next, ...prev].slice(0, 8)); toast('Detection simulated', 'info', next.plate) }}><RefreshCw className="h-4 w-4" />Simulate detection</Button></div></div>
    <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
      <div className="space-y-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center"><Select value={cameraId} onChange={e => setCameraId(e.target.value)} options={data.cameras.map(c => ({ value: c.id, label: `${c.name} · ${c.status}` }))} className="sm:max-w-md" /><div className="flex items-center gap-2 text-sm text-slate-500"><Circle className={`h-2.5 w-2.5 ${camera?.status === 'Online' ? 'fill-emerald-500 text-emerald-500' : 'fill-red-500 text-red-500'}`} />{camera?.status} · {camera?.location}</div></div><CameraPlaceholder title={camera?.name || 'Camera'} online={camera?.status === 'Online'} /><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-lg border border-slate-200 bg-white p-3"><p className="text-[11px] font-bold uppercase tracking-[.08em] text-slate-500">Current Date</p><p className="mt-1 text-sm font-semibold text-slate-900">{now.toLocaleDateString('en-PH', { timeZone: 'Asia/Manila', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p></div><div className="rounded-lg border border-slate-200 bg-white p-3"><p className="text-[11px] font-bold uppercase tracking-[.08em] text-slate-500">Current Time</p><p className="mt-1 font-mono text-sm font-semibold text-slate-900">{formatTime(now.toISOString())}</p></div><div className="rounded-lg border border-slate-200 bg-white p-3"><p className="text-[11px] font-bold uppercase tracking-[.08em] text-slate-500">Assigned Gate</p><p className="mt-1 text-sm font-semibold text-slate-900">{gate?.name || 'Unassigned'}</p></div></div></div>
      <Card><CardHeader><CardTitle>Detected Vehicle Information</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[.08em] text-slate-500">Recognized Plate</p><Badge value={current?.decision} variant={decisionColor} /></div><p className="mt-2 font-mono text-3xl font-extrabold tracking-widest text-slate-950">{current?.plate}</p><p className="mt-1 text-sm text-slate-500">{current?.reason}</p></div>
        <div className="grid grid-cols-2 gap-3 text-sm">{[['Vehicle Type', current?.type], ['Vehicle Color', current?.color], ['Confidence', `${current?.confidence.toFixed(1)}%`], ['Camera', current?.cameraId], ['Gate', current?.gateId], ['Detected', formatTime(current?.timestamp || new Date().toISOString())]].map(([k,v]) => <div key={k} className="rounded-lg border border-slate-100 bg-white p-3"><p className="text-[11px] font-semibold uppercase tracking-[.08em] text-slate-500">{k}</p><p className="mt-1 font-medium text-slate-900">{v}</p></div>)}</div>
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs leading-5 text-blue-800"><ShieldCheck className="mb-1 h-4 w-4" /> Access decision is simulated from mock recognition logs and local access state.</div>
      </CardContent></Card>
    </div>
    <Card><CardHeader><CardTitle>Recent Detection History</CardTitle></CardHeader><CardContent className="p-0"><table className="w-full text-left text-sm"><thead className="bg-slate-50/80 text-[11px] uppercase tracking-[.08em] text-slate-500"><tr><th className="px-5 py-3">Time</th><th className="px-5 py-3">Plate</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Color</th><th className="px-5 py-3">Confidence</th><th className="px-5 py-3">Decision</th></tr></thead><tbody>{history.map((r, i) => <tr key={`${r.id}-${i}`} className="border-t border-slate-100"><td className="px-5 py-3 text-slate-500">{formatTime(r.timestamp)}</td><td className="px-5 py-3 font-semibold">{r.plate}</td><td className="px-5 py-3">{r.type}</td><td className="px-5 py-3">{r.color}</td><td className="px-5 py-3">{r.confidence.toFixed(1)}%</td><td className="px-5 py-3"><Badge value={r.decision} /></td></tr>)}</tbody></table></CardContent></Card>
  </div>
}
