import { useMemo, useState } from 'react'
import { Edit, Plus, Search, Trash2, Video } from 'lucide-react'
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
import { CameraPlaceholder } from '@/components/shared/VehicleImage'
import { PageHeader } from '@/components/shared/PageHeader'
import type { Camera as CameraType } from '@/types'

const schema = z.object({ name: z.string().min(2), location: z.string().min(2), model: z.string().min(2), type: z.string(), gateId: z.string().min(1), protocol: z.string(), ipAddress: z.string().min(7), status: z.string() })
type V = z.infer<typeof schema>
export function Cameras() {
  const { data, setData, audit } = useApp(); const { toast } = useToast()
  const [search, setSearch] = useState(''); const [modal, setModal] = useState<'add'|'edit'|'view'|null>(null); const [selected, setSelected] = useState<CameraType | null>(null); const [deleteId, setDeleteId] = useState<string | null>(null)
  const form = useForm<V>({ resolver: zodResolver(schema), defaultValues: { name: '', location: '', model: 'TP-Link Tapo C320WS', type: 'Bullet', gateId: '', protocol: 'RTSP', ipAddress: '192.168.10.50', status: 'Online' } })
  const filtered = useMemo(() => data.cameras.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.location.toLowerCase().includes(search.toLowerCase()) || c.model.toLowerCase().includes(search.toLowerCase())), [data.cameras, search])
  const openAdd = () => { form.reset({ name: '', location: '', model: 'TP-Link Tapo C320WS', type: 'Bullet', gateId: data.gates[0]?.id || '', protocol: 'RTSP', ipAddress: '192.168.10.50', status: 'Online' }); setModal('add') }
  const openEdit = (c: CameraType) => { setSelected(c); form.reset({ name: c.name, location: c.location, model: c.model, type: c.type, gateId: c.gateId, protocol: c.protocol, ipAddress: c.ipAddress, status: c.status }); setModal('edit') }
  const onSubmit = (values: V) => {
    const payload = { name: values.name, location: values.location, model: values.model, type: values.type as CameraType['type'], gateId: values.gateId, protocol: values.protocol as CameraType['protocol'], ipAddress: values.ipAddress, status: values.status as CameraType['status'] }
    if (modal === 'add') { const record: CameraType = { id: `CAM-${Date.now().toString().slice(-3)}`, ...payload, lastConnection: new Date().toISOString() }; setData(prev => ({ ...prev, cameras: [record, ...prev.cameras] })); audit('Added camera','Camera Management',record.name); toast('Camera added','success',record.name) }
    else if (selected) { setData(prev => ({ ...prev, cameras: prev.cameras.map(c => c.id === selected.id ? { ...c, ...payload } : c) })); audit('Updated camera','Camera Management',payload.name); toast('Camera updated','success',payload.name) }
    setModal(null)
  }
  return <div className="space-y-5">
    <PageHeader title="Camera Management" description="Manage Tapo and ONVIF-compatible IP cameras. Mock previews and connection states only." actions={<Button onClick={openAdd}><Plus className="h-4 w-4" />Add Camera</Button>} />
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{data.cameras.map(c => <Card key={c.id}><CardContent className="p-4"><CameraPlaceholder title={c.name} online={c.status==='Online'} /><div className="mt-3 flex items-center justify-between"><div><p className="text-sm font-semibold text-slate-900">{c.name}</p><p className="text-xs text-slate-500">{c.model} · {c.protocol}</p></div><Badge value={c.status} /></div></CardContent></Card>)}</div>
    <Card><CardContent className="space-y-4"><div className="relative max-w-md"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search cameras..." className="pl-9" /></div>
      <DataTable data={filtered} onRowClick={c=>{setSelected(c);setModal('view')}} columns={[
        { key:'name', header:'Camera', render:c=><div><p className="font-medium text-slate-900">{c.name}</p><p className="text-xs text-slate-500">{c.id}</p></div>, value:c=>c.name },
        { key:'location', header:'Location', render:c=>c.location, value:c=>c.location },
        { key:'model', header:'Model', render:c=>c.model, value:c=>c.model },
        { key:'type', header:'Type', render:c=>c.type, value:c=>c.type },
        { key:'protocol', header:'Protocol', render:c=>c.protocol, value:c=>c.protocol },
        { key:'gate', header:'Gate', render:c=>c.gateId, value:c=>c.gateId },
        { key:'status', header:'Status', render:c=><Badge value={c.status} /> },
        { key:'last', header:'Last Connection', render:c=>new Date(c.lastConnection).toLocaleString('en-PH',{timeZone:'Asia/Manila',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}), value:c=>c.lastConnection },
        { key:'actions', header:'Actions', sortable:false, render:c=><div className="flex gap-1" onClick={e=>e.stopPropagation()}><Button size="icon" variant="ghost" onClick={()=>openEdit(c)}><Edit className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={()=>{setData(prev=>({...prev,cameras:prev.cameras.map(x=>x.id===c.id?{...x,status:x.status==='Online'?'Offline':'Online',lastConnection:new Date().toISOString()}:x)}));audit('Changed camera status','Camera Management',c.name);toast('Camera status updated','success',c.name)}}><Video className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={()=>{setSelected(c);setDeleteId(c.id)}}><Trash2 className="h-4 w-4 text-red-600" /></Button></div> },
      ]} />
    </CardContent></Card>
    <Dialog open={modal==='add'||modal==='edit'} onOpenChange={()=>setModal(null)}><DialogContent title={modal==='add'?'Add Camera':'Edit Camera'}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-6">
      <Field label="Camera Name" error={form.formState.errors.name?.message}><Input {...form.register('name')} /></Field>
      <Field label="Location" error={form.formState.errors.location?.message}><Input {...form.register('location')} /></Field>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Model"><Select {...form.register('model')} options={['TP-Link Tapo C320WS','TP-Link Tapo C520WS','Generic ONVIF-compatible IP camera'].map(v=>({value:v,label:v}))} /></Field><Field label="Type"><Select {...form.register('type')} options={['Bullet','PTZ','Dome'].map(v=>({value:v,label:v}))} /></Field></div>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Assigned Gate"><Select {...form.register('gateId')} options={data.gates.map(g=>({value:g.id,label:`${g.id} · ${g.name}`}))} /></Field><Field label="Protocol"><Select {...form.register('protocol')} options={['RTSP','ONVIF'].map(v=>({value:v,label:v}))} /></Field></div>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="IP Address" error={form.formState.errors.ipAddress?.message}><Input {...form.register('ipAddress')} /></Field><Field label="Status"><Select {...form.register('status')} options={['Online','Offline'].map(v=>({value:v,label:v}))} /></Field></div>
      <DialogFooter><Button type="button" variant="outline" onClick={()=>setModal(null)}>Cancel</Button><Button type="submit">Save Camera</Button></DialogFooter>
    </form></DialogContent></Dialog>
    <Dialog open={modal==='view'&&!!selected} onOpenChange={()=>setModal(null)}><DialogContent title="Camera Details"><div className="space-y-4 p-6"><CameraPlaceholder title={selected?.name||'Camera'} online={selected?.status==='Online'} /><div className="grid gap-3 sm:grid-cols-2">{selected && [['ID',selected.id],['Name',selected.name],['Location',selected.location],['Model',selected.model],['Type',selected.type],['Protocol',selected.protocol],['Gate',selected.gateId],['IP Address',selected.ipAddress],['Status',selected.status],['Last Connection',new Date(selected.lastConnection).toLocaleString('en-PH',{timeZone:'Asia/Manila'})]].map(([k,v])=><div key={k}><p className="text-[11px] font-semibold uppercase tracking-[.08em] text-slate-500">{k}</p><p className="mt-1 text-sm font-medium text-slate-900">{v}</p></div>)}</div></div></DialogContent></Dialog>
    <ConfirmDialog open={!!deleteId} onOpenChange={()=>setDeleteId(null)} title="Delete camera" description="This removes the simulated camera record." destructive confirmLabel="Delete" onConfirm={()=>{const c=data.cameras.find(x=>x.id===deleteId); setData(prev=>({...prev,cameras:prev.cameras.filter(x=>x.id!==deleteId)})); audit('Deleted camera','Camera Management',c?.name||''); toast('Camera deleted','success'); setDeleteId(null)}} />
  </div>
}
