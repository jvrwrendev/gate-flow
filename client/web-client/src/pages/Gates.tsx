import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, DoorClosed, DoorOpen, Edit } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/components/ui/Toast'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/Dialog'
import { Field, Input, Select } from '@/components/ui/Field'
import { PageHeader } from '@/components/shared/PageHeader'
import type { Gate } from '@/types'
import { usePermissions } from '@/hooks/usePermissions'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  location: z.string().min(2, 'Location is required'),
  controllerId: z.string().min(2, 'Controller ID is required'),
  cameraId: z.string().min(1, 'Camera is required'),
})

type GateForm = z.infer<typeof schema>

export function Gates() {
  const navigate = useNavigate()
  const { data, setData, audit } = useApp(); const { toast } = useToast()
  const { user: actor, hasPermission } = usePermissions()
  const canOperate = hasPermission('gateControl:operate')
  const canManage = hasPermission('gates:manage')
  const [confirm, setConfirm] = useState<{ gate: Gate; action: 'open' | 'close' } | null>(null)
  const [editingGate, setEditingGate] = useState<Gate | null>(null)
  const [pending, setPending] = useState(false)
  const form = useForm<GateForm>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', location: '', controllerId: '', cameraId: '' },
  })

  const updateGate = (id: string, patch: Partial<Gate>, action: string, requireOperate = false) => {
    if (requireOperate ? !canOperate : !canManage) {
      toast('Permission denied', 'error', 'You are not authorized to perform this action.')
      return
    }
    if (pending) return
    setPending(true)
    setData(prev => ({ ...prev, gates: prev.gates.map(g => g.id === id ? { ...g, ...patch, lastActivity: new Date().toISOString() } : g) }))
    audit(action, 'Barrier Gates', `${id} by ${actor?.name || 'Unknown user'}`, 'Success', id)
    toast(action, 'success', id)
    window.setTimeout(() => setPending(false), 400)
  }

  const openEdit = (gate: Gate) => {
    setEditingGate(gate)
    form.reset({ name: gate.name, location: gate.location, controllerId: gate.controllerId, cameraId: gate.cameraId })
  }

  const onEditSubmit = (values: GateForm) => {
    if (!editingGate) return
    if (!canManage) {
      toast('Permission denied', 'error', 'You are not authorized to perform this action.')
      return
    }
    setData(prev => ({
      ...prev,
      gates: prev.gates.map(g => g.id === editingGate.id ? { ...g, ...values, lastActivity: new Date().toISOString() } : g),
    }))
    audit('Updated gate', 'Barrier Gates', `${editingGate.id} by ${actor?.name || 'Unknown user'}`, 'Success', editingGate.id)
    toast('Gate updated', 'success', values.name)
    setEditingGate(null)
  }

  return <div className="space-y-5">
    <PageHeader title="Barrier Gate Management" description="Monitor and manage barrier gate operations." />
    <div className="grid gap-4 lg:grid-cols-2">
      {data.gates.map(gate => <Card key={gate.id}><CardHeader><div><CardTitle>{gate.name}</CardTitle><p className="mt-1 text-xs text-slate-500">{gate.location}</p></div><Badge value={gate.status} /></CardHeader><CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">{[['Gate ID',gate.id],['Controller',gate.controllerId],['Assigned Camera',gate.cameraId],['Entries Today',gate.entriesToday],['Barrier',gate.barrier],['Mode',gate.mode],['Last Activity',new Date(gate.lastActivity).toLocaleString('en-PH',{timeZone:'Asia/Manila',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})]].map(([k,v])=><div key={k} className="rounded-lg border border-slate-100 bg-slate-50/70 p-3"><p className="text-[11px] font-semibold uppercase tracking-[.08em] text-slate-500">{k}</p><p className="mt-1 font-medium text-slate-900">{v}</p></div>)}</div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" disabled={gate.status==='Offline' || !canOperate || pending} onClick={()=>setConfirm({gate,action:'open'})}><DoorOpen className="h-4 w-4" />Open</Button>
          <Button size="sm" variant="outline" disabled={gate.status==='Offline' || !canOperate || pending} onClick={()=>setConfirm({gate,action:'close'})}><DoorClosed className="h-4 w-4" />Close</Button>
          <Button size="sm" variant="ghost" onClick={()=>updateGate(gate.id,{status:gate.status==='Online'?'Offline':'Online'},`${gate.status==='Online'?'Disabled':'Enabled'} ${gate.id}`)} disabled={!canManage || pending}>{gate.status==='Online'?'Disable gate':'Enable gate'}</Button>
          <Button size="sm" variant="ghost" disabled={!canManage} onClick={()=>openEdit(gate)}><Edit className="h-4 w-4" />Edit</Button>
          <Button size="sm" variant="ghost" onClick={()=>navigate(`/gates/${gate.id}`)}><Activity className="h-4 w-4" />Activity</Button>
        </div>
      </CardContent></Card>)}
    </div>

    <Dialog open={!!editingGate} onOpenChange={(open) => !open && setEditingGate(null)}>
      <DialogContent title="Edit Gate" description="Update barrier gate details.">
        <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4 p-6">
          <Field label="Gate Name" error={form.formState.errors.name?.message}><Input {...form.register('name')} /></Field>
          <Field label="Location" error={form.formState.errors.location?.message}><Input {...form.register('location')} /></Field>
          <Field label="Controller ID" error={form.formState.errors.controllerId?.message}><Input {...form.register('controllerId')} /></Field>
          <Field label="Assigned Camera" error={form.formState.errors.cameraId?.message}>
            <Select {...form.register('cameraId')} options={data.cameras.map(c => ({ value: c.id, label: `${c.id} · ${c.name}` }))} />
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditingGate(null)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <ConfirmDialog open={!!confirm} onOpenChange={()=>setConfirm(null)} title={`${confirm?.action==='open'?'Open':'Close'} barrier`} description={`Are you sure you want to ${confirm?.action} the barrier for ${confirm?.gate.name}?`} confirmLabel={confirm?.action==='open'?'Open Barrier':'Close Barrier'} onConfirm={()=>{if(confirm){updateGate(confirm.gate.id,{barrier:confirm.action==='open'?'OPEN':'CLOSED'},`${confirm.action==='open'?'Opened':'Closed'} ${confirm.gate.name}`, true)}setConfirm(null)}} />
  </div>
}