import { useEffect, useRef, useState } from 'react'
import { DoorClosed, DoorOpen, ShieldCheck } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/components/ui/Toast'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { cn } from '@/lib/utils'
import { usePermissions } from '@/hooks/usePermissions'

type Transition = 'idle' | 'opening' | 'closing'

export function BarrierGateSimulator() {
  const { data, setData, audit } = useApp()
  const { toast } = useToast()
  const [selectedGateId, setSelectedGateId] = useState(data.gates.some(gate => gate.id === 'GT-01') ? 'GT-01' : (data.gates[0]?.id ?? ''))
  const [transition, setTransition] = useState<Transition>('idle')
  const [confirm, setConfirm] = useState<'open' | 'close' | 'manual' | null>(null)
  const timerRef = useRef<number | null>(null)

  const selectedGate = data.gates.find(gate => gate.id === selectedGateId) ?? data.gates[0]
  const { user: currentUser, hasPermission } = usePermissions()
  const isOnline = selectedGate?.status === 'Online'
  const canOperateGate = hasPermission('gateControl:operate')
  const canManualEntry = canOperateGate
  const displayStatus = transition === 'opening' ? 'OPENING' : transition === 'closing' ? 'CLOSING' : selectedGate?.barrier ?? 'CLOSED'
  const armOpen = displayStatus === 'OPEN' || displayStatus === 'OPENING'

  useEffect(() => {
    if (!data.gates.some(gate => gate.id === selectedGateId)) {
      setSelectedGateId(data.gates.some(gate => gate.id === 'GT-01') ? 'GT-01' : (data.gates[0]?.id ?? ''))
    }
  }, [data.gates, selectedGateId])

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  const runTransition = (target: 'OPEN' | 'CLOSED', action: string) => {
    if (!selectedGate || !isOnline || transition !== 'idle' || !canOperateGate) return
    const gateId = selectedGate.id
    setTransition(target === 'OPEN' ? 'opening' : 'closing')
    const timer = window.setTimeout(() => {
      setData(prev => ({
        ...prev,
        gates: prev.gates.map(gate => gate.id === gateId ? { ...gate, barrier: target, lastActivity: new Date().toISOString() } : gate),
      }))
      audit(action, 'Barrier Gates', `${gateId} by ${currentUser?.name || 'Unknown user'}`, 'Success', gateId)
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
    if (!canManualEntry) {
      toast('Permission denied', 'error', 'You are not authorized to operate this gate.')
      return
    }
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
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div>
          <CardTitle>Barrier Gate Simulator</CardTitle>
          <p className="mt-1 text-xs text-slate-500">Interactive simulated barrier control</p>
        </div>
        <Badge value={displayStatus} variant={statusVariant} />
      </CardHeader>
      <CardContent className="flex flex-1 flex-col space-y-4">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          Controlling: <span className="font-medium text-slate-900">{selectedGate?.name ?? 'No gate selected'} ({selectedGate?.id ?? '—'})</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="relative mx-auto min-h-[288px] w-full max-w-[300px] flex-1 overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="absolute bottom-0 left-3 h-44 w-12 rounded-t-lg border border-slate-300 bg-slate-200">
              <div className="absolute inset-x-2 top-3 space-y-1">
                <div className="h-1 rounded bg-slate-400/70" />
                <div className="h-1 rounded bg-slate-400/70" />
                <div className="h-1 rounded bg-slate-400/70" />
              </div>
              <div className="absolute bottom-0 left-1/2 h-32 w-1.5 -translate-x-1/2 rounded-full bg-slate-500" />
            </div>
            <div className="absolute bottom-0 left-0 h-3 w-full bg-slate-300" />
            <div
              className={cn(
                'absolute bottom-[11px] left-[46px] h-3 w-[210px] origin-left rounded-full border border-slate-300 bg-white transition-transform duration-500 ease-out',
                armOpen && '-rotate-90'
              )}
            >
              <div
                className="h-full w-full rounded-full"
                style={{
                  backgroundImage: 'repeating-linear-gradient(135deg, #dc2626 0px, #dc2626 12px, #ffffff 12px, #ffffff 24px)',
                }}
              />
              <div className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-slate-300 bg-slate-700" />
            </div>
            <div className="absolute bottom-[3px] left-[34px] h-8 w-8 -translate-x-1/2 rounded-full border-4 border-slate-300 bg-white" />
            <div className="absolute left-4 top-4 rounded-md bg-white/80 px-2 py-1 text-[11px] font-medium text-slate-600">{selectedGate?.name ?? 'No gate selected'}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={!isOnline || transition !== 'idle' || !canOperateGate}
            onClick={() => setConfirm(selectedGate?.barrier === 'OPEN' ? 'close' : 'open')}
          >
            {transition === 'opening' ? (
              <>
                <DoorOpen className="h-4 w-4" /> Opening
              </>
            ) : transition === 'closing' ? (
              <>
                <DoorClosed className="h-4 w-4" /> Closing
              </>
            ) : selectedGate?.barrier === 'OPEN' ? (
              <>
                <DoorClosed className="h-4 w-4" /> Close
              </>
            ) : (
              <>
                <DoorOpen className="h-4 w-4" /> Open
              </>
            )}
          </Button>
          <Button className="w-full" size="sm" disabled={!isOnline || transition !== 'idle' || !canManualEntry || selectedGate?.barrier !== 'CLOSED'} onClick={() => setConfirm('manual')}><ShieldCheck className="h-4 w-4" />Manual Entry</Button>
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
