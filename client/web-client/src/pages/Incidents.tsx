import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Search } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { DataTable } from '@/components/shared/DataTable'

import { Input, Select } from '@/components/ui/Field'
import { PageHeader } from '@/components/shared/PageHeader'

export function Incidents() {
  const navigate = useNavigate()
  const { data } = useApp(); const [search, setSearch] = useState(''); const [severity, setSeverity] = useState(''); const [status, setStatus] = useState('')
  const filtered = useMemo(() => data.incidents.filter(i => (!search || i.type.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase())) && (!severity || i.severity === severity) && (!status || i.status === status)), [data.incidents, search, severity, status])
  const gateName = (id: string) => data.gates.find(g => g.id === id)?.name || id
  return <div className="space-y-5">
    <PageHeader title="Security Incidents" description="Track unauthorized attempts, recognition failures, disconnections, and barrier events." />
    <Card><CardContent className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4"><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search incidents..." className="pl-9" /></div>
        <Select value={severity} onChange={e=>setSeverity(e.target.value)} options={[{value:'',label:'All severities'},{value:'Critical',label:'Critical'},{value:'High',label:'High'},{value:'Medium',label:'Medium'},{value:'Low',label:'Low'}]} />
        <Select value={status} onChange={e=>setStatus(e.target.value)} options={[{value:'',label:'All statuses'},{value:'Open',label:'Open'},{value:'Investigating',label:'Investigating'},{value:'Resolved',label:'Resolved'}]} />
        <div className="text-sm text-slate-500 self-center">{filtered.length} incidents</div></div>
      <DataTable data={filtered} onRowClick={i=>navigate(`/security/incidents/${i.id}`)} columns={[
        { key:'id', header:'Incident', render:i=><div><p className="font-mono font-semibold">{i.id}</p><p className="text-xs text-slate-500">{i.type}</p></div>, value:i=>i.id },
        { key:'severity', header:'Severity', render:i=><Badge value={i.severity} /> },
        { key:'timestamp', header:'Timestamp', render:i=>new Date(i.timestamp).toLocaleString('en-PH',{timeZone:'Asia/Manila',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}), value:i=>i.timestamp },
        { key:'gate', header:'Gate', render:i=>gateName(i.gateId), value:i=>i.gateId },
        { key:'description', header:'Description', render:i=>i.description, value:i=>i.description },
        { key:'status', header:'Status', render:i=><Badge value={i.status} /> },
        { key:'actions', header:'Actions', sortable:false, render:i=><Button size="icon" variant="ghost" onClick={e=>{e.stopPropagation();navigate(`/security/incidents/${i.id}`)}}><Eye className="h-4 w-4" /></Button> },
      ]} />
    </CardContent></Card>

  </div>
}
