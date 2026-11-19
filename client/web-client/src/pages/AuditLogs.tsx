import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { DataTable } from '@/components/shared/DataTable'
import { Input, Select } from '@/components/ui/Field'
import { PageHeader } from '@/components/shared/PageHeader'

export function AuditLogs() {
  const { data } = useApp()
  const [search, setSearch] = useState(''); const [module, setModule] = useState('')
  const modules = Array.from(new Set(data.auditLogs.map(l => l.module)))
  const filtered = useMemo(() => data.auditLogs.filter(l => (!search || l.action.toLowerCase().includes(search.toLowerCase()) || l.details.toLowerCase().includes(search.toLowerCase()) || l.admin.toLowerCase().includes(search.toLowerCase())) && (!module || l.module === module)), [data.auditLogs, search, module])
  return <div className="space-y-5">
    <PageHeader title="Audit Logs" description="Simulated administrative activity trail for accountability and review." />
    <Card><CardContent className="space-y-4"><div className="grid gap-3 md:grid-cols-3"><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search actions, details, admins..." className="pl-9" /></div><Select value={module} onChange={e=>setModule(e.target.value)} options={[{value:'',label:'All modules'},...modules.map(m=>({value:m,label:m}))]} /><div className="text-sm text-slate-500 self-center">{filtered.length} events</div></div>
      <DataTable data={filtered} columns={[
        { key:'timestamp', header:'Timestamp', render:l=>new Date(l.timestamp).toLocaleString('en-PH',{timeZone:'Asia/Manila',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}), value:l=>l.timestamp },
        { key:'admin', header:'Admin', render:l=>l.admin, value:l=>l.admin },
        { key:'action', header:'Action', render:l=>l.action, value:l=>l.action },
        { key:'module', header:'Module', render:l=><Badge value={l.module} variant="blue" />, value:l=>l.module },
        { key:'details', header:'Details', render:l=>l.details, value:l=>l.details },
        { key:'ip', header:'IP Address', render:l=>l.ipAddress, value:l=>l.ipAddress },
      ]} />
    </CardContent></Card>
  </div>
}
