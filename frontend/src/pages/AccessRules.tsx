import { useState } from 'react'
import { AlertTriangle, Plus } from 'lucide-react'
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
import { Switch } from '@/components/ui/Switch'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { weekdays } from '@/data/options'
import type { AccessRule } from '@/types'

const schema = z.object({ name: z.string().min(2), vehicleId: z.string().min(1), gateId: z.string().min(1), startTime: z.string(), endTime: z.string(), expires: z.string(), active: z.boolean(), autoApproval: z.boolean() })
type V = z.infer<typeof schema>
export function AccessRules() {
  const { data, setData, audit } = useApp(); const { toast } = useToast()
  const [modal, setModal] = useState<'add'|'edit'|null>(null); const [selected, setSelected] = useState<AccessRule | null>(null); const [deleteId, setDeleteId] = useState<string | null>(null)
  const [days, setDays] = useState<string[]>(['Mon','Tue','Wed','Thu','Fri'])
  const form = useForm<V>({ resolver: zodResolver(schema), defaultValues: { name: '', vehicleId: data.vehicles[0]?.id || '', gateId: data.gates[0]?.id || '', startTime: '06:00', endTime: '20:00', expires: new Date(Date.now()+90*86400000).toISOString().slice(0,10), active: true, autoApproval: true } })
  const expired = (rule: AccessRule) => new Date(rule.expires) < new Date()
  const openAdd = () => { setDays(['Mon','Tue','Wed','Thu','Fri']); form.reset({ name: '', vehicleId: data.vehicles[0]?.id || '', gateId: data.gates[0]?.id || '', startTime: '06:00', endTime: '20:00', expires: new Date(Date.now()+90*86400000).toISOString().slice(0,10), active: true, autoApproval: true }); setModal('add') }
  const openEdit = (r: AccessRule) => { setSelected(r); setDays(r.days); form.reset({ name: r.name, vehicleId: r.vehicleId, gateId: r.gateId, startTime: r.startTime, endTime: r.endTime, expires: r.expires, active: r.active, autoApproval: r.autoApproval }); setModal('edit') }
  const onSubmit = (values: V) => {
    const payload = { name: values.name, vehicleId: values.vehicleId, gateId: values.gateId, days, startTime: values.startTime, endTime: values.endTime, expires: values.expires, active: values.active, autoApproval: values.autoApproval }
    if (modal === 'add') { const record: AccessRule = { id: `AR-${Date.now().toString().slice(-4)}`, ...payload }; setData(prev => ({ ...prev, accessRules: [record, ...prev.accessRules] })); audit('Created access rule','Access Rules',record.name); toast('Access rule created','success',record.name) }
    else if (selected) { setData(prev => ({ ...prev, accessRules: prev.accessRules.map(r => r.id === selected.id ? { ...r, ...payload } : r) })); audit('Updated access rule','Access Rules',payload.name); toast('Access rule updated','success',payload.name) }
    setModal(null)
  }
  const vehicleLabel = (id: string) => data.vehicles.find(v => v.id === id)?.plate || id
  return <div className="space-y-5">
    <PageHeader title="Access Rules" description="Configure vehicle authorization, gate assignment, schedules, expiration, and automatic approval." actions={<Button onClick={openAdd}><Plus className="h-4 w-4" />Add Rule</Button>} />
    <div className="space-y-3">{data.accessRules.filter(r => !r.active || expired(r)).map(r => <div key={r.id} className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="font-semibold">{r.name} is {expired(r) ? 'expired' : 'inactive'}</p><p className="mt-0.5 text-xs">Vehicle {vehicleLabel(r.vehicleId)} · Gate {r.gateId}. Automatic access may be denied until this rule is updated.</p></div></div>)}</div>
    <Card><CardContent className="space-y-4">
      <DataTable data={data.accessRules} columns={[
        { key:'name', header:'Rule', render:r=><div><p className="font-medium text-slate-900">{r.name}</p><p className="text-xs text-slate-500">{r.id}</p></div>, value:r=>r.name },
        { key:'vehicle', header:'Vehicle', render:r=>vehicleLabel(r.vehicleId), value:r=>vehicleLabel(r.vehicleId) },
        { key:'gate', header:'Gate', render:r=>r.gateId, value:r=>r.gateId },
        { key:'days', header:'Days', render:r=>r.days.join(', '), value:r=>r.days.join(',') },
        { key:'schedule', header:'Schedule', render:r=>`${r.startTime}–${r.endTime}`, value:r=>r.startTime },
        { key:'expires', header:'Expires', render:r=><span className={expired(r)?'font-semibold text-red-600':''}>{r.expires}</span>, value:r=>r.expires },
        { key:'active', header:'Active', render:r=><Switch checked={r.active} onCheckedChange={checked=>{setData(prev=>({...prev,accessRules:prev.accessRules.map(x=>x.id===r.id?{...x,active:checked}:x)}));audit(`${checked?'Activated':'Deactivated'} access rule`,'Access Rules',r.name);toast('Rule updated','success',r.name)}} label={`Toggle ${r.name}`} /> },
        { key:'auto', header:'Auto Approval', render:r=><Badge value={r.autoApproval?'Enabled':'Disabled'} variant={r.autoApproval?'success':'secondary'} /> },
        { key:'actions', header:'Actions', sortable:false, render:r=><div className="flex gap-1"><Button size="icon" variant="ghost" onClick={()=>openEdit(r)}><EditIcon/></Button><Button size="icon" variant="ghost" onClick={()=>{setSelected(r);setDeleteId(r.id)}}><TrashIcon/></Button></div> },
      ]} />
    </CardContent></Card>
    <Dialog open={modal==='add'||modal==='edit'} onOpenChange={()=>setModal(null)}><DialogContent title={modal==='add'?'Add Access Rule':'Edit Access Rule'}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-6">
      <Field label="Rule Name" error={form.formState.errors.name?.message}><Input {...form.register('name')} /></Field>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Vehicle"><Select {...form.register('vehicleId')} options={data.vehicles.map(v=>({value:v.id,label:`${v.plate} · ${v.ownerName}`}))} /></Field><Field label="Gate"><Select {...form.register('gateId')} options={data.gates.map(g=>({value:g.id,label:`${g.id} · ${g.name}`}))} /></Field></div>
      <div><p className="form-label">Days of operation</p><div className="flex flex-wrap gap-2">{weekdays.map(d=><button type="button" key={d} onClick={()=>setDays(prev=>prev.includes(d)?prev.filter(x=>x!==d):[...prev,d])} className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${days.includes(d)?'border-blue-200 bg-blue-50 text-blue-700':'border-slate-200 bg-white text-slate-500'}`}>{d}</button>)}</div></div>
      <div className="grid gap-4 sm:grid-cols-3"><Field label="Start Time"><Input type="time" {...form.register('startTime')} /></Field><Field label="End Time"><Input type="time" {...form.register('endTime')} /></Field><Field label="Expiration Date"><Input type="date" {...form.register('expires')} /></Field></div>
      <div className="flex flex-wrap gap-6"><label className="flex items-center gap-3 text-sm font-medium text-slate-700"><Switch checked={form.watch('active')} onCheckedChange={v=>form.setValue('active',v)} label="Active rule" />Active</label><label className="flex items-center gap-3 text-sm font-medium text-slate-700"><Switch checked={form.watch('autoApproval')} onCheckedChange={v=>form.setValue('autoApproval',v)} label="Automatic approval" />Automatic approval</label></div>
      <DialogFooter><Button type="button" variant="outline" onClick={()=>setModal(null)}>Cancel</Button><Button type="submit">Save Rule</Button></DialogFooter>
    </form></DialogContent></Dialog>
    <ConfirmDialog open={!!deleteId} onOpenChange={()=>setDeleteId(null)} title="Delete access rule" description="This removes the simulated access rule." destructive confirmLabel="Delete" onConfirm={()=>{const r=data.accessRules.find(x=>x.id===deleteId); setData(prev=>({...prev,accessRules:prev.accessRules.filter(x=>x.id!==deleteId)})); audit('Deleted access rule','Access Rules',r?.name||''); toast('Rule deleted','success'); setDeleteId(null)}} />
  </div>
}
function EditIcon(){return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20h4l10-10-4-4L4 16v4z"/></svg>}
function TrashIcon(){return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>}
