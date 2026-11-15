import { useMemo, useState } from 'react'
import { CheckCircle2, Eye, Plus, Search, XCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/components/ui/Toast'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { DataTable } from '@/components/shared/DataTable'
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/Dialog'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Tabs } from '@/components/ui/Tabs'
import { VehicleImage } from '@/components/shared/VehicleImage'
import { PageHeader } from '@/components/shared/PageHeader'
import { vehicleTypes, vehicleColors } from '@/data/options'
import type { Application } from '@/types'

const schema = z.object({ ownerName: z.string().min(2), email: z.string().email(), phone: z.string().min(9), plate: z.string().min(6), type: z.string(), model: z.string().min(2), color: z.string(), purpose: z.string().min(3), remarks: z.string() })
type V = z.infer<typeof schema>
export function Applications() {
  const { data, setData, audit } = useApp(); const { toast } = useToast()
  const [tab, setTab] = useState('Pending'); const [search, setSearch] = useState(''); const [selected, setSelected] = useState<Application | null>(null); const [viewOpen, setViewOpen] = useState(false); const [addOpen, setAddOpen] = useState(false)
  const [confirm, setConfirm] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null); const [remarks, setRemarks] = useState('')
  const form = useForm<V>({ resolver: zodResolver(schema), defaultValues: { ownerName: '', email: '', phone: '+63 ', plate: '', type: 'Sedan', model: '', color: 'White', purpose: 'Resident vehicle registration', remarks: '' } })
  const filtered = useMemo(() => data.applications.filter(a => a.status === tab && (!search || a.reference.toLowerCase().includes(search.toLowerCase()) || a.plate.toLowerCase().includes(search.toLowerCase()) || a.ownerName.toLowerCase().includes(search.toLowerCase()))), [data.applications, tab, search])
  const counts = { Pending: data.applications.filter(a=>a.status==='Pending').length, Approved: data.applications.filter(a=>a.status==='Approved').length, Rejected: data.applications.filter(a=>a.status==='Rejected').length }
  const approve = (app: Application, remark: string) => {
    setData(prev => ({ ...prev, applications: prev.applications.map(a => a.id === app.id ? { ...a, status: 'Approved', remarks: remark || 'Approved after document verification.' } : a), vehicles: prev.vehicles.some(v => v.plate === app.plate) ? prev.vehicles : [{ id: `VH-${Date.now().toString().slice(-5)}`, plate: app.plate, ownerId: app.ownerId, ownerName: app.ownerName, contact: app.phone, type: app.type, model: app.model, color: app.color, registrationDate: new Date().toISOString().slice(0,10), status: 'Authorized' }, ...prev.vehicles] }))
    audit('Approved application','Vehicle Applications',app.reference); toast('Application approved','success',app.reference)
  }
  const reject = (app: Application, remark: string) => { setData(prev => ({ ...prev, applications: prev.applications.map(a => a.id === app.id ? { ...a, status: 'Rejected', remarks: remark || 'Application rejected.' } : a) })); audit('Rejected application','Vehicle Applications',app.reference); toast('Application rejected','error',app.reference) }
  const submitAdd = (values: V) => {
    const record: Application = { id: `APP-${Date.now().toString().slice(-4)}`, reference: `VA-2026-${Math.floor(1000+Math.random()*9000)}`, ownerId: `OW-${Date.now().toString().slice(-3)}`, ownerName: values.ownerName, email: values.email, phone: values.phone, plate: values.plate.toUpperCase(), type: values.type as any, model: values.model, color: values.color as any, submitted: new Date().toISOString(), status: 'Pending', remarks: values.remarks, purpose: values.purpose }
    setData(prev => ({ ...prev, applications: [record, ...prev.applications] })); audit('Submitted application','Vehicle Applications',record.reference); toast('Application submitted','success',record.reference); setAddOpen(false)
  }
  return <div className="space-y-5">
    <PageHeader title="Vehicle Applications" description="Review, approve, or reject vehicle registration and access applications." actions={<Button onClick={() => { form.reset(); setAddOpen(true) }}><Plus className="h-4 w-4" />New Application</Button>} />
    <Card><CardContent className="space-y-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><Tabs items={[{value:'Pending',label:'Pending',count:counts.Pending},{value:'Approved',label:'Approved',count:counts.Approved},{value:'Rejected',label:'Rejected',count:counts.Rejected}]} value={tab} onChange={setTab} /><div className="relative max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search applications..." className="pl-9" /></div></div>
      <DataTable data={filtered} onRowClick={a=>{setSelected(a);setViewOpen(true)}} columns={[
        { key:'reference', header:'Reference', render:a=><span className="font-mono font-semibold">{a.reference}</span>, value:a=>a.reference },
        { key:'owner', header:'Owner', render:a=><div><p className="font-medium">{a.ownerName}</p><p className="text-xs text-slate-500">{a.email}</p></div>, value:a=>a.ownerName },
        { key:'plate', header:'Plate', render:a=>a.plate, value:a=>a.plate },
        { key:'vehicle', header:'Vehicle', render:a=>`${a.type} · ${a.color}`, value:a=>a.type },
        { key:'submitted', header:'Submitted', render:a=>new Date(a.submitted).toLocaleString('en-PH',{timeZone:'Asia/Manila',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}), value:a=>a.submitted },
        { key:'status', header:'Status', render:a=><Badge value={a.status} /> },
        { key:'actions', header:'Actions', sortable:false, render:a=><div className="flex gap-1" onClick={e=>e.stopPropagation()}>{a.status==='Pending' && <><Button size="sm" variant="success" onClick={()=>setConfirm({id:a.id,action:'approve'})}><CheckCircle2 className="h-3.5 w-3.5" />Approve</Button><Button size="sm" variant="destructive" onClick={()=>setConfirm({id:a.id,action:'reject'})}><XCircle className="h-3.5 w-3.5" />Reject</Button></>}<Button size="icon" variant="ghost" onClick={()=>{setSelected(a);setViewOpen(true)}}><Eye className="h-4 w-4" /></Button></div> },
      ]} />
    </CardContent></Card>
    <Dialog open={viewOpen && !!selected} onOpenChange={setViewOpen}><DialogContent title="Application Details" description={selected?.reference}><div className="grid gap-4 p-6 sm:grid-cols-[140px_1fr]"><VehicleImage type={selected?.type} color={selected?.color} className="aspect-[4/3]" /><div className="grid gap-3 sm:grid-cols-2">{selected && [['Owner',selected.ownerName],['Email',selected.email],['Phone',selected.phone],['Plate',selected.plate],['Type',selected.type],['Model',selected.model],['Color',selected.color],['Purpose',selected.purpose],['Submitted',new Date(selected.submitted).toLocaleString('en-PH',{timeZone:'Asia/Manila'})],['Status',selected.status],['Remarks',selected.remarks||'No remarks']].map(([k,v])=><div key={k}><p className="text-[11px] font-semibold uppercase tracking-[.08em] text-slate-500">{k}</p><p className="mt-1 text-sm font-medium text-slate-900">{v}</p></div>)}</div></div><DialogFooter><Button variant="outline" onClick={()=>setViewOpen(false)}>Close</Button></DialogFooter></DialogContent></Dialog>
    <Dialog open={addOpen} onOpenChange={setAddOpen}><DialogContent title="New Vehicle Application"><form onSubmit={form.handleSubmit(submitAdd)} className="space-y-4 p-6"><div className="grid gap-4 sm:grid-cols-2"><Field label="Owner Name" error={form.formState.errors.ownerName?.message}><Input {...form.register('ownerName')} /></Field><Field label="Email" error={form.formState.errors.email?.message}><Input {...form.register('email')} type="email" /></Field><Field label="Phone" error={form.formState.errors.phone?.message}><Input {...form.register('phone')} /></Field><Field label="Plate" error={form.formState.errors.plate?.message}><Input {...form.register('plate')} /></Field><Field label="Vehicle Type"><Select {...form.register('type')} options={vehicleTypes.map(v=>({value:v,label:v}))} /></Field><Field label="Color"><Select {...form.register('color')} options={vehicleColors.map(v=>({value:v,label:v}))} /></Field></div><Field label="Brand / Model" error={form.formState.errors.model?.message}><Input {...form.register('model')} /></Field><Field label="Purpose"><Input {...form.register('purpose')} /></Field><Field label="Remarks"><Textarea {...form.register('remarks')} /></Field><DialogFooter><Button type="button" variant="outline" onClick={()=>setAddOpen(false)}>Cancel</Button><Button type="submit">Submit Application</Button></DialogFooter></form></DialogContent></Dialog>
    <Dialog open={!!confirm} onOpenChange={()=>setConfirm(null)}><DialogContent title={confirm?.action==='approve'?'Approve application':'Reject application'} description="Add review remarks before confirming."><div className="space-y-4 p-6"><Field label="Review remarks"><Textarea value={remarks} onChange={e=>setRemarks(e.target.value)} placeholder="Enter remarks..." /></Field><DialogFooter><Button variant="outline" onClick={()=>setConfirm(null)}>Cancel</Button><Button variant={confirm?.action==='approve'?'success':'destructive'} onClick={()=>{const app=data.applications.find(a=>a.id===confirm?.id); if(app && confirm){ if(confirm.action==='approve') approve(app,remarks); else reject(app,remarks)} setConfirm(null); setRemarks('') }}>{confirm?.action==='approve'?'Approve':'Reject'}</Button></DialogFooter></div></DialogContent></Dialog>
  </div>
}
