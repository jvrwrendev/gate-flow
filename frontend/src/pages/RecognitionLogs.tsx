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
import { DetailField, DetailGrid, DetailSection } from '@/components/shared/DetailField'
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
    <FullScreenDetail
      open={!!selected}
      onClose={() => setSelected(null)}
      title="Recognition Record"
      description={selected ? `Record ID: ${selected.id}` : undefined}
      status={selected && <Badge value={selected.decision} />}
    >
      {selected && (
        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Vehicle Preview</p>
            <div className="aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-3">
              <VehicleImage type={selected.type} color={selected.color} neutral className="h-full w-full border-0" />
            </div>
          </div>
          <DetailSection title="Recognition Details">
            <DetailGrid>
              <DetailField label="Plate Number" value={selected.plate} mono />
              <DetailField label="Access Decision" value={<Badge value={selected.decision} />} />
              <DetailField label="Confidence Score" value={`${selected.confidence.toFixed(1)}%`} />
              <DetailField label="Timestamp" value={new Date(selected.timestamp).toLocaleString('en-PH', { timeZone: 'Asia/Manila' })} />
              <DetailField label="Vehicle Type" value={selected.type} />
              <DetailField label="Vehicle Color" value={selected.color} />
              <DetailField label="Camera" value={cameraName(selected.cameraId)} />
              <DetailField label="Gate" value={gateName(selected.gateId)} />
              <DetailField label="Reason / Remarks" value={selected.reason} className="sm:col-span-2" />
            </DetailGrid>
          </DetailSection>
        </div>
      )}
    </FullScreenDetail>  </div>
}
