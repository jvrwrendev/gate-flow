import { useEffect, useMemo, useState } from 'react'
import { Circle, Pause, Play, RefreshCw, ShieldCheck } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/components/ui/Toast'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { CameraSimulation } from '@/components/shared/CameraSimulation'
import { PageHeader } from '@/components/shared/PageHeader'
import { formatTime } from '@/lib/utils'

export function LiveMonitor() {
  const { data } = useApp(); const { toast } = useToast()
  const [cameraId, setCameraId] = useState(data.cameras[0]?.id ?? '')
  const [running, setRunning] = useState(false)
  const [current, setCurrent] = useState(data.recognitionLogs[0])
  const [history, setHistory] = useState(data.recognitionLogs.slice(0, 6))
  const currentCameraIndex = data.cameras.findIndex(c => c.id === cameraId)
  const camera = currentCameraIndex >= 0 ? data.cameras[currentCameraIndex] : data.cameras[0]
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
    <PageHeader
      title="Live Monitoring"
      description="Simulated surveillance interface for operator review. No camera stream or AI inference is active."
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant={running ? 'outline' : 'default'} onClick={() => setRunning(v => !v)}>
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {running ? 'Pause simulation' : 'Start simulation'}
          </Button>
          <Button variant="outline" onClick={() => { const next = cameraLogs[Math.floor(Math.random() * cameraLogs.length)] || data.recognitionLogs[0]; setCurrent(next); setHistory(prev => [next, ...prev].slice(0, 8)); toast('Detection simulated', 'info', next.plate) }}>
            <RefreshCw className="h-4 w-4" />Simulate detection
          </Button>
        </div>
      }
    />
    <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
      <div className="space-y-4"><div className="flex items-center gap-2 text-sm text-slate-500"><Circle className={`h-2.5 w-2.5 ${camera?.status === 'Online' ? 'fill-emerald-500 text-emerald-500' : 'fill-red-500 text-red-500'}`} />{camera?.status} · {camera?.location}</div><div className="relative"><CameraSimulation title={camera?.name || 'Camera'} /><button type="button" onClick={() => { if (!data.cameras.length) return; const nextIndex = (currentCameraIndex + 1) % data.cameras.length; setCameraId(data.cameras[nextIndex].id) }} aria-label="Switch camera" className="absolute right-4 top-4 z-10 inline-flex items-center rounded-md bg-black/70 px-3 py-1.5 text-[11px] font-medium text-slate-100 shadow-sm backdrop-blur-sm transition-colors hover:bg-black/80">Camera {data.cameras.length > 0 ? `${(currentCameraIndex >= 0 ? currentCameraIndex : 0) + 1}/${data.cameras.length}` : '1/2'}</button></div><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-lg border border-slate-200 bg-white p-3"><p className="text-[11px] font-bold uppercase tracking-[.08em] text-slate-500">Current Date</p><p className="mt-1 text-sm font-semibold text-slate-900">{now.toLocaleDateString('en-PH', { timeZone: 'Asia/Manila', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p></div><div className="rounded-lg border border-slate-200 bg-white p-3"><p className="text-[11px] font-bold uppercase tracking-[.08em] text-slate-500">Current Time</p><p className="mt-1 font-mono text-sm font-semibold text-slate-900">{formatTime(now.toISOString())}</p></div><div className="rounded-lg border border-slate-200 bg-white p-3"><p className="text-[11px] font-bold uppercase tracking-[.08em] text-slate-500">Assigned Gate</p><p className="mt-1 text-sm font-semibold text-slate-900">{gate?.name || 'Unassigned'}</p></div></div></div>
      <Card><CardHeader><CardTitle>Detected Vehicle Information</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[.08em] text-slate-500">Recognized Plate</p><Badge value={current?.decision} variant={decisionColor} /></div><p className="mt-2 font-mono text-3xl font-extrabold tracking-widest text-slate-950">{current?.plate}</p><p className="mt-1 text-sm text-slate-500">{current?.reason}</p></div>
        <div className="grid grid-cols-2 gap-3 text-sm">{[['Vehicle Type', current?.type], ['Vehicle Color', current?.color], ['Confidence', `${current?.confidence.toFixed(1)}%`], ['Camera', current?.cameraId], ['Gate', current?.gateId], ['Detected', formatTime(current?.timestamp || new Date().toISOString())]].map(([k,v]) => <div key={k} className="rounded-lg border border-slate-100 bg-white p-3"><p className="text-[11px] font-semibold uppercase tracking-[.08em] text-slate-500">{k}</p><p className="mt-1 font-medium text-slate-900">{v}</p></div>)}</div>
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs leading-5 text-blue-800"><ShieldCheck className="mb-1 h-4 w-4" /> Access decision is simulated from mock recognition logs and local access state.</div>
      </CardContent></Card>
    </div>
    <Card>
      <CardHeader><CardTitle>Recent Detection History</CardTitle></CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Plate</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Color</th>
                <th className="px-4 py-3 font-medium">Confidence</th>
                <th className="px-4 py-3 font-medium">Decision</th>
              </tr>
            </thead>
            <tbody>
              {history.map((r, i) => (
                <tr key={`${r.id}-${i}`} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 text-slate-500">{formatTime(r.timestamp)}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{r.plate}</td>
                  <td className="px-4 py-3 text-slate-700">{r.type}</td>
                  <td className="px-4 py-3 text-slate-700">{r.color}</td>
                  <td className="px-4 py-3 text-slate-700">{r.confidence.toFixed(1)}%</td>
                  <td className="px-4 py-3"><Badge value={r.decision} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
}
