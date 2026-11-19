import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, DoorClosed, DoorOpen, Settings2 } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/components/ui/Toast'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { PageHeader } from '@/components/shared/PageHeader'
import type { Gate } from '@/types'
import { usePermissions } from '@/hooks/usePermissions'

export function Gates() {
  const navigate = useNavigate()
  const { data, setData, audit } = useApp(); const { toast } = useToast()
  const { user: actor, hasPermission } = usePermissions()
  const canOperate = hasPermission('gateControl:operate')
  const canManage = hasPermission('gates:manage')
  const [confirm, setConfirm] = useState<{ gate: Gate; action: 'open' | 'close' } | null>(null)
  const [pending, setPending] = useState(false)
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
  return <div className="space-y-5">
    <PageHeader title="Barrier Gate Management" description="Monitor and simulate barrier gate operations. Controls are not connected to physical hardware." />
    <div className="grid gap-4 lg:grid-cols-2">
      {data.gates.map(gate => <Card key={gate.id}><CardHeader><div><CardTitle>{gate.name}</CardTitle><p className="mt-1 text-xs text-slate-500">{gate.location}</p></div><Badge value={gate.status} /></CardHeader><CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">{[['Gate ID',gate.id],['Controller',gate.controllerId],['Assigned Camera',gate.cameraId],['Entries Today',gate.entriesToday],['Barrier',gate.barrier],['Mode',gate.mode],['Last Activity',new Date(gate.lastActivity).toLocaleString('en-PH',{timeZone:'Asia/Manila',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})]].map(([k,v])=><div key={k} className="rounded-lg border border-slate-100 bg-slate-50/70 p-3"><p className="text-[11px] font-semibold uppercase tracking-[.08em] text-slate-500">{k}</p><p className="mt-1 font-medium text-slate-900">{v}</p></div>)}</div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" disabled={gate.status==='Offline' || !canOperate || pending} onClick={()=>setConfirm({gate,action:'open'})}><DoorOpen className="h-4 w-4" />Open</Button>
          <Button size="sm" variant="outline" disabled={gate.status==='Offline' || !canOperate || pending} onClick={()=>setConfirm({gate,action:'close'})}><DoorClosed className="h-4 w-4" />Close</Button>
          <Button size="sm" variant="secondary" onClick={()=>updateGate(gate.id,{mode:gate.mode==='AUTOMATIC'?'MANUAL':'AUTOMATIC'},`Changed ${gate.id} to ${gate.mode==='AUTOMATIC'?'MANUAL':'AUTOMATIC'} mode`)} disabled={gate.status==='Offline' || !canManage || pending}><Settings2 className="h-4 w-4" />Toggle mode</Button>
          <Button size="sm" variant="ghost" onClick={()=>updateGate(gate.id,{status:gate.status==='Online'?'Offline':'Online'},`${gate.status==='Online'?'Disabled':'Enabled'} ${gate.id}`)} disabled={!canManage || pending}>{gate.status==='Online'?'Disable gate':'Enable gate'}</Button>
          <Button size="sm" variant="ghost" onClick={()=>navigate(`/gates/${gate.id}`)}><Activity className="h-4 w-4" />Activity</Button>
        </div>
        <div className="rounded-lg border border-amber-100 bg-amber-50 p-3 text-xs leading-5 text-amber-800">Simulated control only. No physical barrier, controller, or ESP32 connection is used.</div>
      </CardContent></Card>)}
    </div>
    <ConfirmDialog open={!!confirm} onOpenChange={()=>setConfirm(null)} title={`${confirm?.action==='open'?'Open':'Close'} barrier`} description={`This simulates a ${confirm?.action} command for ${confirm?.gate.name}. No physical hardware will move.`} confirmLabel={confirm?.action==='open'?'Open Barrier':'Close Barrier'} onConfirm={()=>{if(confirm){updateGate(confirm.gate.id,{barrier:confirm.action==='open'?'OPEN':'CLOSED'},`${confirm.action==='open'?'Opened':'Closed'} ${confirm.gate.name} (simulated)`, true)}setConfirm(null)}} />
  </div>
}
