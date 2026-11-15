import { useMemo, useState } from 'react'
import { Eye, Search } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/components/ui/Toast'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { DataTable } from '@/components/shared/DataTable'
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/Dialog'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { PageHeader } from '@/components/shared/PageHeader'
import type { Incident } from '@/types'

export function Incidents() {
  const { data, setData, audit } = useApp(); const { toast } = useToast()
  const [search, setSearch] = useState(''); const [severity, setSeverity] = useState(''); const [status, setStatus] = useState(''); const [selected, setSelected] = useState<Incident | null>(null)
  const [remarks, setRemarks] = useState('')
  const filtered = useMemo(() => data.incidents.filter(i => (!search || i.type.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase())) && (!severity || i.severity === severity) && (!status || i.status === status)), [data.incidents, search, severity, status])
  const gateName = (id: string) => data.gates.find(g => g.id === id)?.name || id
  const updateStatus = (id: string, status: Incident['status']) => { setData(prev => ({ ...prev, incidents: prev.incidents.map(i => i.id === id ? { ...i, status, remarks: remarks || i.remarks } : i) })); audit(`Changed incident to ${status}`,'Security Incidents',id); toast('Incident updated','success',id); setSelected(null); setRemarks('') }
  return <div className="space-y-5">
    <PageHeader title="Security Incidents" description="Track unauthorized attempts, recognition failures, disconnections, and barrier events." />
    <Card><CardContent className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4"><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search incidents..." className="pl-9" /></div>
        <Select value={severity} onChange={e=>setSeverity(e.target.value)} options={[{value:'',label:'All severities'},{value:'Critical',label:'Critical'},{value:'High',label:'High'},{value:'Medium',label:'Medium'},{value:'Low',label:'Low'}]} />
        <Select value={status} onChange={e=>setStatus(e.target.value)} options={[{value:'',label:'All statuses'},{value:'Open',label:'Open'},{value:'Investigating',label:'Investigating'},{value:'Resolved',label:'Resolved'}]} />
        <div className="text-sm text-slate-500 self-center">{filtered.length} incidents</div></div>
      <DataTable data={filtered} onRowClick={i=>{setSelected(i);setRemarks(i.remarks)}} columns={[
        { key:'id', header:'Incident', render:i=><div><p className="font-mono font-semibold">{i.id}</p><p className="text-xs text-slate-500">{i.type}</p></div>, value:i=>i.id },
        { key:'severity', header:'Severity', render:i=><Badge value={i.severity} /> },
        { key:'timestamp', header:'Timestamp', render:i=>new Date(i.timestamp).toLocaleString('en-PH',{timeZone:'Asia/Manila',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}), value:i=>i.timestamp },
        { key:'gate', header:'Gate', render:i=>gateName(i.gateId), value:i=>i.gateId },
        { key:'description', header:'Description', render:i=>i.description, value:i=>i.description },
        { key:'status', header:'Status', render:i=><Badge value={i.status} /> },
        { key:'actions', header:'Actions', sortable:false, render:i=><Button size="icon" variant="ghost" onClick={e=>{e.stopPropagation();setSelected(i);setRemarks(i.remarks)}}><Eye className="h-4 w-4" /></Button> },
      ]} />
    </CardContent></Card>
    <Dialog open={!!selected} onOpenChange={()=>setSelected(null)}><DialogContent title="Incident Details" description={selected?.id}><div className="space-y-4 p-6">
      {selected && [['Type',selected.type],['Severity',selected.severity],['Timestamp',new Date(selected.timestamp).toLocaleString('en-PH',{timeZone:'Asia/Manila'})],['Gate',gateName(selected.gateId)],['Status',selected.status],['Description',selected.description]].map(([k,v])=><div key={k}><p className="text-[11px] font-semibold uppercase tracking-[.08em] text-slate-500">{k}</p><p className="mt-1 text-sm font-medium text-slate-900">{v}</p></div>)}
      <Field label="Admin remarks"><Textarea value={remarks} onChange={e=>setRemarks(e.target.value)} /></Field>
      <DialogFooter><Button variant="outline" onClick={()=>setSelected(null)}>Close</Button><Button variant="secondary" onClick={()=>updateStatus(selected!.id,'Investigating')}>Mark Investigating</Button><Button variant="success" onClick={()=>updateStatus(selected!.id,'Resolved')}>Resolve</Button></DialogFooter>
    </div></DialogContent></Dialog>
  </div>
}
