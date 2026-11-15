import { useMemo, useState } from 'react'
import { Plus, Search, User } from 'lucide-react'
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
import { Field, Input, Select } from '@/components/ui/Field'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { PageHeader } from '@/components/shared/PageHeader'
import type { Owner } from '@/types'

const schema = z.object({ name: z.string().min(2), email: z.string().email(), phone: z.string().min(9), address: z.string().min(5), status: z.string() })
type V = z.infer<typeof schema>
export function Owners() {
  const { data, setData, audit } = useApp(); const { toast } = useToast()
  const [search, setSearch] = useState(''); const [modal, setModal] = useState<'add'|'edit'|'view'|null>(null); const [selected, setSelected] = useState<Owner | null>(null); const [deleteId, setDeleteId] = useState<string | null>(null)
  const form = useForm<V>({ resolver: zodResolver(schema), defaultValues: { name: '', email: '', phone: '+63 ', address: '', status: 'Active' } })
  const filtered = useMemo(() => data.owners.filter(o => !search || o.name.toLowerCase().includes(search.toLowerCase()) || o.email.toLowerCase().includes(search.toLowerCase()) || o.phone.includes(search)), [data.owners, search])
  const openAdd = () => { form.reset({ name: '', email: '', phone: '+63 ', address: '', status: 'Active' }); setModal('add') }
  const openEdit = (o: Owner) => { setSelected(o); form.reset({ name: o.name, email: o.email, phone: o.phone, address: o.address, status: o.status }); setModal('edit') }
  const onSubmit = (values: V) => {
    if (modal === 'add') { const record: Owner = { id: `OW-${Date.now().toString().slice(-4)}`, ...values, status: values.status as Owner['status'], joined: new Date().toISOString().slice(0,10) }; setData(prev => ({...prev, owners: [record,...prev.owners]})); audit('Created owner','Vehicle Owners',record.name); toast('Owner added','success',record.name) }
    else if (selected) { setData(prev => ({...prev, owners: prev.owners.map(o => o.id === selected.id ? {...o, ...values, status: values.status as Owner['status']} : o)})); audit('Updated owner','Vehicle Owners',values.name); toast('Owner updated','success',values.name) }
    setModal(null)
  }
  const linkedCount = (id: string) => data.vehicles.filter(v => v.ownerId === id).length
  return <div className="space-y-5">
    <PageHeader title="Vehicle Owners" description="Manage vehicle owners, contact information, and linked vehicle records." actions={<Button onClick={openAdd}><Plus className="h-4 w-4" />Add Owner</Button>} />
    <Card><CardContent className="space-y-4"><div className="relative max-w-md"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search owners..." className="pl-9" /></div>
      <DataTable data={filtered} columns={[
        { key:'name', header:'Owner', render:o=><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600"><User className="h-4 w-4" /></div><div><p className="font-medium text-slate-900">{o.name}</p><p className="text-xs text-slate-500">{o.email}</p></div></div>, value:o=>o.name },
        { key:'phone', header:'Contact', render:o=>o.phone, value:o=>o.phone },
        { key:'address', header:'Address', render:o=>o.address, value:o=>o.address },
        { key:'vehicles', header:'Vehicles', render:o=><span className="font-semibold text-slate-700">{linkedCount(o.id)}</span>, value:o=>linkedCount(o.id) },
        { key:'joined', header:'Joined', render:o=>o.joined, value:o=>o.joined },
        { key:'status', header:'Status', render:o=><Badge value={o.status} /> },
        { key:'actions', header:'Actions', sortable:false, render:o=><div className="flex gap-1"><Button size="icon" variant="ghost" onClick={()=>openEdit(o)}><EditIcon/></Button><Button size="icon" variant="ghost" onClick={()=>{setSelected(o);setDeleteId(o.id)}}><TrashIcon/></Button></div> },
      ]} />
    </CardContent></Card>
    <Dialog open={modal==='add'||modal==='edit'} onOpenChange={()=>setModal(null)}><DialogContent title={modal==='add'?'Add Owner':'Edit Owner'}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-6"><Field label="Full Name" error={form.formState.errors.name?.message}><Input {...form.register('name')} /></Field><Field label="Email" error={form.formState.errors.email?.message}><Input {...form.register('email')} type="email" /></Field><Field label="Phone" error={form.formState.errors.phone?.message}><Input {...form.register('phone')} /></Field><Field label="Address" error={form.formState.errors.address?.message}><Input {...form.register('address')} /></Field><Field label="Status"><Select {...form.register('status')} options={[{value:'Active',label:'Active'},{value:'Inactive',label:'Inactive'}]} /></Field><DialogFooter><Button type="button" variant="outline" onClick={()=>setModal(null)}>Cancel</Button><Button type="submit">Save</Button></DialogFooter></form></DialogContent></Dialog>
    <Dialog open={modal==='view'&&!!selected} onOpenChange={()=>setModal(null)}><DialogContent title="Owner Details"><div className="space-y-4 p-6">{selected && [['Name',selected.name],['Email',selected.email],['Phone',selected.phone],['Address',selected.address],['Joined',selected.joined],['Status',selected.status],['Linked vehicles',linkedCount(selected.id)]].map(([k,v])=><div key={k}><p className="text-[11px] font-semibold uppercase tracking-[.08em] text-slate-500">{k}</p><p className="mt-1 text-sm font-medium text-slate-900">{v}</p></div>)}</div></DialogContent></Dialog>
    <ConfirmDialog open={!!deleteId} onOpenChange={()=>setDeleteId(null)} title="Delete owner" description="This removes the simulated owner record." destructive confirmLabel="Delete" onConfirm={()=>{const o=data.owners.find(x=>x.id===deleteId); setData(prev=>({...prev,owners:prev.owners.filter(x=>x.id!==deleteId)})); audit('Deleted owner','Vehicle Owners',o?.name||''); toast('Owner deleted','success'); setDeleteId(null)}} />
  </div>
}
function EditIcon(){return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20h4l10-10-4-4L4 16v4z"/></svg>}
function TrashIcon(){return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>}
