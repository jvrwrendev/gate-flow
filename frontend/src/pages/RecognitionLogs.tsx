import { useMemo, useState } from 'react'
import { Download, Search } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/components/ui/Toast'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { DataTable } from '@/components/shared/DataTable'

import { Input, Select } from '@/components/ui/Field'
import { PageHeader } from '@/components/shared/PageHeader'
import { FullScreenDetail } from '@/components/shared/FullScreenDetail'
import { VehicleImage } from '@/components/shared/VehicleImage'
import { downloadCSV } from '@/lib/utils'
import { vehicleTypes } from '@/data/options'
import type { RecognitionLog } from '@/types'

export function RecognitionLogs() {
  const { data } = useApp(); const { toast } = useToast()
  const [search, setSearch] = useState(''); const [type, setType] = useState(''); const [decision, setDecision] = useState(''); const [gate, setGate] = useState(''); const [from, setFrom] = useState(''); const [to, setTo] = useState('')
  const [selected, setSelected] = useState<RecognitionLog | null>(null)
  const filtered = useMemo(() => data.recognitionLogs.filter(l => {
    const ts = new Date(l.timestamp)
    return (!search || l.plate.toLowerCase().includes(search.toLowerCase())) && (!type || l.type === type) && (!decision || l.decision === decision) && (!gate || l.gateId === gate) && (!from || ts >= new Date(from)) && (!to || ts <= new Date(to + 'T23:59:59'))
  }), [data.recognitionLogs, search, type, decision, gate, from, to])
  const cameraName = (id: string) => data.cameras.find(c => c.id === id)?.name || id
  const gateName = (id: string) => data.gates.find(g => g.id === id)?.name || id
  const exportCsv = () => { downloadCSV('recognition-logs.csv', filtered.map(l => ({ timestamp: l.timestamp, plate: l.plate, type: l.type, color: l.color, confidence: l.confidence.toFixed(1), camera: cameraName(l.cameraId), gate: gateName(l.gateId), decision: l.decision }))); toast('CSV exported','success',`${filtered.length} records`) }
  return <div className="space-y-5">
    <PageHeader title="Recognition Logs" description="Searchable history of license plate recognition events and access decisions." actions={<Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4" />Export CSV</Button>} />
    <Card><CardContent className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Plate..." className="pl-9" /></div>
        <Select value={type} onChange={e=>setType(e.target.value)} options={[{value:'',label:'All types'},...vehicleTypes.map(v=>({value:v,label:v}))]} />
        <Select value={decision} onChange={e=>setDecision(e.target.value)} options={[{value:'',label:'All decisions'},{value:'AUTHORIZED',label:'Authorized'},{value:'DENIED',label:'Denied'},{value:'NEEDS REVIEW',label:'Needs Review'}]} />
        <Select value={gate} onChange={e=>setGate(e.target.value)} options={[{value:'',label:'All gates'},...data.gates.map(g=>({value:g.id,label:g.name}))]} />
        <Input type="date" value={from} onChange={e=>setFrom(e.target.value)} />
        <Input type="date" value={to} onChange={e=>setTo(e.target.value)} />
      </div>
      <DataTable data={filtered} onRowClick={r=>setSelected(r)} columns={[
        { key:'timestamp', header:'Timestamp', render:l=>new Date(l.timestamp).toLocaleString('en-PH',{timeZone:'Asia/Manila',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}), value:l=>l.timestamp },
        { key:'image', header:'Image', sortable:false, render:()=> <div className="h-10 w-14"><VehicleImage className="h-full w-full" /></div> },
        { key:'plate', header:'Plate', render:l=><span className="font-mono font-semibold">{l.plate}</span>, value:l=>l.plate },
        { key:'type', header:'Type', render:l=>l.type, value:l=>l.type },
        { key:'color', header:'Color', render:l=>l.color, value:l=>l.color },
        { key:'confidence', header:'Confidence', render:l=>`${l.confidence.toFixed(1)}%`, value:l=>l.confidence },
        { key:'camera', header:'Camera', render:l=>cameraName(l.cameraId), value:l=>l.cameraId },
        { key:'gate', header:'Gate', render:l=>gateName(l.gateId), value:l=>l.gateId },
        { key:'decision', header:'Decision', render:l=><Badge value={l.decision} /> },
      ]} />
    </CardContent></Card>
    <FullScreenDetail open={!!selected} onClose={() => setSelected(null)} title="Recognition Record" description={selected?.id}>
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <VehicleImage type={selected?.type} color={selected?.color} className="aspect-[4/3] w-full" />
        <div className="grid gap-4 sm:grid-cols-2">
          {selected && [['Timestamp', new Date(selected.timestamp).toLocaleString('en-PH', { timeZone: 'Asia/Manila' })], ['Plate', selected.plate], ['Type', selected.type], ['Color', selected.color], ['Confidence', `${selected.confidence.toFixed(1)}%`], ['Camera', cameraName(selected.cameraId)], ['Gate', gateName(selected.gateId)], ['Decision', selected.decision], ['Reason', selected.reason]].map(([k, v]) => (
            <div key={k} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">{k}</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </FullScreenDetail>  </div>
}
