import { useMemo, useState } from 'react'
import { Plus, Search, Shield, UserCog } from 'lucide-react'
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
import { FullScreenDetail } from '@/components/shared/FullScreenDetail'
import type { AdminUser } from '@/types'

const roles = ['Super Admin','System Administrator','Security Personnel','Gate Operator','Viewer'] as const
const schema = z.object({ name: z.string().min(2), email: z.string().email(), contactNumber: z.string().min(9, 'Contact number is required'), password: z.string().min(6, 'Password must be at least 6 characters').optional(), role: z.string(), status: z.string() })
type V = z.infer<typeof schema>
export function AdminUsers() {
  const { data, setData, audit } = useApp(); const { toast } = useToast()
  const [search, setSearch] = useState(''); const [modal, setModal] = useState<'add'|'edit'|null>(null); const [selected, setSelected] = useState<AdminUser | null>(null); const [detailsOpen, setDetailsOpen] = useState(false); const [deleteId, setDeleteId] = useState<string | null>(null)
  const form = useForm<V>({ resolver: zodResolver(schema), defaultValues: { name: '', email: '', contactNumber: '+63 ', password: '', role: 'Viewer', status: 'Active' } })
  const filtered = useMemo(() => data.admins.filter(a => !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase()) || a.role.toLowerCase().includes(search.toLowerCase())), [data.admins, search])
  const openAdd = () => { form.reset({ name: '', email: '', contactNumber: '+63 ', password: '', role: 'Viewer', status: 'Active' }); setModal('add') }
  const openEdit = (a: AdminUser) => { setSelected(a); form.reset({ name: a.name, email: a.email, contactNumber: a.contactNumber, password: '', role: a.role, status: a.status }); setModal('edit') }
  const onSubmit = (values: V) => {
    if (modal === 'add' && !values.password) { toast('Password is required', 'error'); return }
    if (modal === 'add') { const record: AdminUser = { id: `ADM-${Date.now().toString().slice(-3)}`, name: values.name, email: values.email, contactNumber: values.contactNumber, password: values.password, role: values.role as AdminUser['role'], status: values.status as AdminUser['status'], lastLogin: new Date().toISOString() }; setData(prev => ({ ...prev, admins: [record, ...prev.admins] })); audit('Created admin user','Admin Users',record.name); toast('Admin user added','success',record.name) }
    else if (selected) { setData(prev => ({ ...prev, admins: prev.admins.map(a => a.id === selected.id ? { ...a, name: values.name, email: values.email, contactNumber: values.contactNumber, password: values.password || selected.password, role: values.role as AdminUser['role'], status: values.status as AdminUser['status'] } : a) })); audit('Updated admin user','Admin Users',values.name); toast('Admin user updated','success',values.name) }
    setModal(null)
  }
  return <div className="space-y-5">
    <PageHeader title="Admin Users" description="Manage dashboard administrators, roles, account status, and access levels." actions={<Button onClick={openAdd}><Plus className="h-4 w-4" />Add Admin</Button>} />
    <Card><CardContent className="space-y-4"><div className="relative max-w-md"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search admins..." className="pl-9" /></div>
      <DataTable data={filtered} onRowClick={a => { setSelected(a); setDetailsOpen(true) }} columns={[
        { key:'name', header:'Admin', render:a=><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600"><UserCog className="h-4 w-4" /></div><div><p className="font-medium text-slate-900">{a.name}</p><p className="text-xs text-slate-500">{a.email}</p><p className="text-xs text-slate-500">{a.contactNumber}</p></div></div>, value:a=>a.name },
        { key:'role', header:'Role', render:a=><Badge value={a.role} variant="blue" />, value:a=>a.role },
        { key:'status', header:'Status', render:a=><Badge value={a.status} />, value:a=>a.status },
        { key:'lastLogin', header:'Last Login', render:a=>new Date(a.lastLogin).toLocaleString('en-PH',{timeZone:'Asia/Manila',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}), value:a=>a.lastLogin },
        { key:'actions', header:'Actions', sortable:false, render:a=><div className="flex gap-1" onClick={e=>e.stopPropagation()}><Button size="icon" variant="ghost" onClick={()=>openEdit(a)}><EditIcon/></Button><Button size="icon" variant="ghost" onClick={()=>{setData(prev=>({...prev,admins:prev.admins.map(x=>x.id===a.id?{...x,status:x.status==='Active'?'Inactive':'Active'}:x)}));audit('Changed admin status','Admin Users',a.name);toast('Status updated','success',a.name)}}><Shield className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={()=>{setSelected(a);setDeleteId(a.id)}}><TrashIcon/></Button></div> },
      ]} />
    </CardContent></Card>
    <Dialog open={modal==='add'||modal==='edit'} onOpenChange={()=>setModal(null)}><DialogContent title={modal==='add'?'Add Admin User':'Edit Admin User'}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-6"><Field label="Full Name" error={form.formState.errors.name?.message}><Input {...form.register('name')} placeholder="John Doe" /></Field><Field label="Email" error={form.formState.errors.email?.message}><Input {...form.register('email')} type="email" placeholder="johndoe@gmail.com" /></Field><Field label="Contact Number" error={form.formState.errors.contactNumber?.message}><Input {...form.register('contactNumber')} placeholder="+63 917 123 4567" /></Field><Field label="Password" error={form.formState.errors.password?.message} hint={modal==='edit' ? 'Leave blank to keep the current password.' : 'Minimum 6 characters.'}><Input {...form.register('password')} type="password" placeholder={modal==='edit' ? 'Leave blank to keep current password' : 'Enter password'} /></Field><Field label="Role"><Select {...form.register('role')} options={roles.map(v=>({value:v,label:v}))} /></Field><Field label="Status"><Select {...form.register('status')} options={['Active','Inactive'].map(v=>({value:v,label:v}))} /></Field><DialogFooter><Button type="button" variant="outline" onClick={()=>setModal(null)}>Cancel</Button><Button type="submit">Save</Button></DialogFooter></form></DialogContent></Dialog>
    <FullScreenDetail open={detailsOpen && !!selected} onClose={() => setDetailsOpen(false)} title="Admin User Details" description={selected?.id}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {selected && [['Admin ID', selected.id], ['Full Name', selected.name], ['Email', selected.email], ['Contact Number', selected.contactNumber], ['Role', selected.role], ['Status', selected.status], ['Last Login', new Date(selected.lastLogin).toLocaleString('en-PH', { timeZone: 'Asia/Manila', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })], ['Password', selected.password ? 'Configured' : 'Not set']].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-slate-500">Password values are never displayed for security.</p>
    </FullScreenDetail>
    <ConfirmDialog open={!!deleteId} onOpenChange={()=>setDeleteId(null)} title="Deactivate admin" description="This removes the simulated admin account." destructive confirmLabel="Delete" onConfirm={()=>{const a=data.admins.find(x=>x.id===deleteId); setData(prev=>({...prev,admins:prev.admins.filter(x=>x.id!==deleteId)})); audit('Deleted admin user','Admin Users',a?.name||''); toast('Admin deleted','success'); setDeleteId(null)}} />
  </div>
}
function EditIcon(){return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20h4l10-10-4-4L4 16v4z"/></svg>}
function TrashIcon(){return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>}
