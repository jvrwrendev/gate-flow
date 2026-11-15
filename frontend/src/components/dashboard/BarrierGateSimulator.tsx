import { useEffect, useRef, useState } from 'react'
import { DoorClosed, DoorOpen, ShieldCheck } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/components/ui/Toast'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Select } from '@/components/ui/Field'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { cn } from '@/lib/utils'

type Transition = 'idle' | 'opening' | 'closing'

export function BarrierGateSimulator() {
  const { data, setData, audit } = useApp()
  const { toast } = useToast()
  const [selectedGateId, setSelectedGateId] = useState(data.gates[0]?.id ?? '')
  const [transition, setTransition] = useState<Transition>('idle')
  const [confirm, setConfirm] = useState<'open' | 'close' | 'manual' | null>(null)
  const timerRef = useRef<number | null>(null)

  const selectedGate = data.gates.find(gate => gate.id === selectedGateId) ?? data.gates[0]
  const isOnline = selectedGate?.status === 'Online'
  const canManualEntry = data.admins.some(admin => admin.status === 'Active' && ['Super Admin', 'System Administrator', 'Gate Operator'].includes(admin.role))
  const displayStatus = transition === 'opening' ? 'OPENING' : transition === 'closing' ? 'CLOSING' : selectedGate?.barrier ?? 'CLOSED'

  useEffect(() => {
    if (!data.gates.some(gate => gate.id === selectedGateId)) {
      setSelectedGateId(data.gates[0]?.id ?? '')
    }
  }, [data.gates, selectedGateId])

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  const runTransition = (target: 'OPEN' | 'CLOSED', action: string) => {
    if (!selectedGate || !isOnline || transition !== 'idle') return
    const gateId = selectedGate.id
    setTransition(target === 'OPEN' ? 'opening' : 'closing')
    const timer = window.setTimeout(() => {
      setData(prev => ({
        ...prev,
        gates: prev.gates.map(gate => gate.id === gateId ? { ...gate, barrier: target, lastActivity: new Date().toISOString() } : gate),
      }))
      audit(action, 'Barrier Gates', gateId)
      toast(target === 'OPEN' ? 'Barrier opened' : 'Barrier closed', 'success', gateId)
      setTransition('idle')
      timerRef.current = null
    }, 750)
    timerRef.current = timer
  }

  const openBarrier = () => {
    if (selectedGate?.barrier === 'OPEN') {
      toast('Barrier is already open', 'info', selectedGate.id)
      return
    }
    runTransition('OPEN', 'Opened barrier (simulated)')
  }

  const closeBarrier = () => {
    if (selectedGate?.barrier === 'CLOSED') {
      toast('Barrier is already closed', 'info', selectedGate.id)
      return
    }
    runTransition('CLOSED', 'Closed barrier (simulated)')
  }

  const manualEntry = () => {
    if (!canManualEntry) return
    if (selectedGate?.barrier !== 'CLOSED') {
      toast('Barrier is already open', 'info', selectedGate?.id)
      return
    }
    runTransition('OPEN', 'Manual barrier entry (simulated)')
  }

  const confirmAction = () => {
    if (confirm === 'open') openBarrier()
    if (confirm === 'close') closeBarrier()
    if (confirm === 'manual') manualEntry()
    setConfirm(null)
  }

  const statusVariant = displayStatus === 'OPEN' ? 'success' : displayStatus === 'CLOSED' ? 'secondary' : 'warning'

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Barrier Gate Simulator</CardTitle>
          <p className="mt-1 text-xs text-slate-500">Interactive simulated barrier control</p>
        </div>
        <Badge value={displayStatus} variant={statusVariant} />
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedGateId} onChange={event => setSelectedGateId(event.target.value)} options={data.gates.map(gate => ({ value: gate.id, label: `${gate.id} · ${gate.name}` }))} />

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="relative mx-auto h-44 w-full max-w-[260px] overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="absolute bottom-4 left-1/2 h-28 w-1.5 -translate-x-1/2 rounded-full bg-slate-700" />
            <div className={cn('absolute bottom-4 left-1/2 h-2 w-28 origin-left rounded-full bg-slate-700 transition-transform duration-500', displayStatus === 'OPEN' && '-rotate-90')} />
            <div className="absolute bottom-2 left-1/2 h-8 w-8 -translate-x-1/2 rounded-full border-4 border-slate-300 bg-white" />
            <div className="absolute bottom-0 left-1/2 h-3 w-24 -translate-x-1/2 rounded-sm bg-slate-300" />
            <div className="absolute left-4 top-4 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">{selectedGate?.name ?? 'No gate selected'}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline" disabled={!isOnline || transition !== 'idle' || selectedGate?.barrier === 'OPEN'} onClick={() => setConfirm('open')}><DoorOpen className="h-4 w-4" />Open</Button>
          <Button size="sm" variant="outline" disabled={!isOnline || transition !== 'idle' || selectedGate?.barrier === 'CLOSED'} onClick={() => setConfirm('close')}><DoorClosed className="h-4 w-4" />Close</Button>
        </div>
        <Button className="w-full" disabled={!isOnline || transition !== 'idle' || !canManualEntry || selectedGate?.barrier !== 'CLOSED'} onClick={() => setConfirm('manual')}><ShieldCheck className="h-4 w-4" />Manual Entry</Button>

        <div className="rounded-lg border border-amber-100 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
          {canManualEntry ? 'Authorized administrator action. Simulated control only: no physical barrier, controller, or hardware connection is used.' : 'Manual entry requires an active authorized administrator account. Simulated control only: no physical hardware is connected.'}
        </div>
      </CardContent>

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={open => { if (!open) setConfirm(null) }}
        title={confirm === 'open' ? 'Open barrier' : confirm === 'close' ? 'Close barrier' : 'Manual barrier entry'}
        description={
          confirm === 'manual'
            ? `This simulates a manual entry command for ${selectedGate?.name ?? 'the selected gate'}. No physical hardware will move.`
            : `This simulates a ${confirm} command for ${selectedGate?.name ?? 'the selected gate'}. No physical hardware will move.`
        }
        confirmLabel={confirm === 'open' ? 'Open Barrier' : confirm === 'close' ? 'Close Barrier' : 'Trigger Entry'}
        onConfirm={confirmAction}
      />
    </Card>
  )
}
