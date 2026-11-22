import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Clock3, Eye, Search, XCircle } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/components/ui/Toast'
import { usePermissions } from '@/hooks/usePermissions'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { DataTable } from '@/components/shared/DataTable'
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/Dialog'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { PageHeader } from '@/components/shared/PageHeader'
import type { VisitorApplication, VisitorApplicationStatus } from '@/types'

const STATUS_TABS: VisitorApplicationStatus[] = ['Pending', 'Under Review', 'Approved', 'Rejected', 'Completed', 'Expired']
const TABS = ['All', ...STATUS_TABS] as const
type TabValue = typeof TABS[number]

function uid(prefix: string) { return `${prefix}-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 90 + 10)}` }

export function VisitorApplications() {
  const navigate = useNavigate()
  const { data, setData, audit } = useApp()
  const { toast } = useToast()
  const { can } = usePermissions()
  const canManage = can('visitorApplications:manage')
  const [tab, setTab] = useState<TabValue>('All')
  const [search, setSearch] = useState('')
  const [confirm, setConfirm] = useState<{ id: string; action: 'approve' | 'reject' | 'review' | 'complete' } | null>(null)
  const [remarks, setRemarks] = useState('')

  useEffect(() => {
    const now = Date.now()
    setData(prev => {
      let changed = false
      const visitorApplications = prev.visitorApplications.map(app => {
        if (app.status === 'Approved' && new Date(app.visitEnd).getTime() < now) {
          changed = true
          const ts = new Date().toISOString()
          return {
            ...app,
            status: 'Expired' as const,
            expiredAt: app.expiredAt || ts,
            currentlyInside: false,
            timeline: [...app.timeline, { id: uid('VAT'), status: 'Expired' as const, label: 'Pass expired', description: 'Authorized schedule ended; pass automatically expired.', timestamp: ts, actor: 'System' }],
          }
        }
        return app
      })
      return changed ? { ...prev, visitorApplications } : prev
    })
  }, [setData])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return data.visitorApplications.filter(a =>
      (tab === 'All' || a.status === tab) &&
      (!q || a.reference.toLowerCase().includes(q) || a.visitorName.toLowerCase().includes(q) || a.requestedByName.toLowerCase().includes(q) || a.vehiclePlate.toLowerCase().includes(q))
    )
  }, [data.visitorApplications, tab, search])

  const counts = useMemo(() => {
    const map = { All: data.visitorApplications.length } as Record<TabValue, number>
    for (const t of STATUS_TABS) map[t] = data.visitorApplications.filter(a => a.status === t).length
    return map
  }, [data.visitorApplications])

  const patchApp = (id: string, updater: (app: VisitorApplication) => VisitorApplication, notification?: { title: string; description: string; severity: 'info' | 'warning' | 'critical' }) => {
    setData(prev => ({
      ...prev,
      visitorApplications: prev.visitorApplications.map(a => a.id === id ? updater(a) : a),
      notifications: notification ? [{ id: uid('NTF'), title: notification.title, description: notification.description, timestamp: new Date().toISOString(), read: false, severity: notification.severity }, ...prev.notifications] : prev.notifications,
    }))
  }

  const markUnderReview = (app: VisitorApplication, note: string) => {
    const ts = new Date().toISOString()
    patchApp(app.id, a => ({
      ...a, status: 'Under Review', reviewedAt: ts, remarks: note || a.remarks,
      timeline: [...a.timeline, { id: uid('VAT'), status: 'Under Review', label: 'Marked under review', description: note || 'Application is being reviewed by admin.', timestamp: ts, actor: 'System Admin' }],
    }))
    audit('Marked visitor application under review', 'Visitor Applications', app.reference)
    toast('Application under review', 'info', app.reference)
  }

  const approve = (app: VisitorApplication, note: string) => {
    const ts = new Date().toISOString()
    const passReference = app.passReference || `VP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
    const qrCodeValue = app.qrCodeValue || `GATEGUARD-${passReference}`
    patchApp(app.id, a => ({
      ...a,
      status: 'Approved', reviewedAt: a.reviewedAt || ts, approvedAt: ts, remarks: note || 'Approved for scheduled visit.',
      passReference, qrCodeValue,
      timeline: [...a.timeline, { id: uid('VAT'), status: 'Approved', label: 'Application approved', description: `Temporary visitor pass ${passReference} generated.`, timestamp: ts, actor: 'System Admin' }],
    }), { title: 'Visitor application approved', description: `${app.visitorName} (${app.reference}) was approved. Pass ${passReference} issued.`, severity: 'info' })
    audit('Approved visitor application', 'Visitor Applications', `${app.reference} · ${passReference}`)
    toast('Visitor application approved', 'success', passReference)
  }

  const reject = (app: VisitorApplication, reason: string) => {
    const ts = new Date().toISOString()
    patchApp(app.id, a => ({
      ...a,
      status: 'Rejected', reviewedAt: a.reviewedAt || ts, rejectedAt: ts, rejectionReason: reason || undefined, remarks: reason || a.remarks || 'Application rejected.',
      timeline: [...a.timeline, { id: uid('VAT'), status: 'Rejected', label: 'Application rejected', description: reason || 'Request rejected by admin.', timestamp: ts, actor: 'System Admin' }],
    }), { title: 'Visitor application rejected', description: `${app.visitorName} (${app.reference}) was rejected.`, severity: 'warning' })
    audit('Rejected visitor application', 'Visitor Applications', app.reference)
    toast('Visitor application rejected', 'error', app.reference)
  }

  const complete = (app: VisitorApplication, note: string) => {
    const ts = new Date().toISOString()
    patchApp(app.id, a => ({
      ...a, status: 'Completed', completedAt: ts, currentlyInside: false, exitRecordedAt: a.exitRecordedAt || ts, remarks: note || a.remarks,
      timeline: [...a.timeline, { id: uid('VAT'), status: 'Completed', label: 'Visit completed', description: note || 'Visitor exit recorded and pass closed.', timestamp: ts, actor: 'System Admin' }],
    }))
    audit('Completed visitor application', 'Visitor Applications', app.reference)
    toast('Visit marked completed', 'success', app.reference)
  }

  const confirmAction = () => {
    if (!confirm) return
    const app = data.visitorApplications.find(a => a.id === confirm.id)
    if (!app) { setConfirm(null); return }
    if (confirm.action === 'approve') approve(app, remarks)
    if (confirm.action === 'reject') reject(app, remarks)
    if (confirm.action === 'review') markUnderReview(app, remarks)
    if (confirm.action === 'complete') complete(app, remarks)
    setConfirm(null)
    setRemarks('')
  }

  const actionLabel = { approve: 'Approve', reject: 'Reject', review: 'Mark Under Review', complete: 'Mark Completed' } as const
  const actionVariant = { approve: 'success', reject: 'destructive', review: 'default', complete: 'default' } as const

  return <div className="space-y-5">
    <PageHeader title="Visitor Applications" description="Review and manage visitor access requests submitted from the GATEGUARD mobile application." />
    <Card><CardContent className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-56">
          <Select
            value={tab}
            onChange={e => setTab(e.target.value as TabValue)}
            options={TABS.map(t => ({ value: t, label: `${t} (${counts[t] ?? 0})` }))}
            aria-label="Filter by status"
          />
        </div>
        <div className="relative w-full max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search visitor, reference, plate..." className="pl-9" /></div>
      </div>
      <DataTable data={filtered} onRowClick={a => navigate(`/visitor-applications/${a.id}`)} columns={[
        { key: 'reference', header: 'Reference', render: a => <span className="font-mono font-semibold">{a.reference}</span>, value: a => a.reference },
        { key: 'visitor', header: 'Visitor', render: a => <div><p className="font-medium">{a.visitorName}</p><p className="text-xs text-slate-500">{a.visitorPhone || a.visitorEmail || '—'}</p></div>, value: a => a.visitorName },
        { key: 'requestedBy', header: 'Requested By', render: a => <div><p className="font-medium">{a.requestedByName}</p><p className="text-xs text-slate-500">{a.requestedByEmail}</p></div>, value: a => a.requestedByName },
        { key: 'vehicle', header: 'Vehicle', render: a => <div><p className="font-mono text-xs font-semibold">{a.vehiclePlate}</p><p className="text-xs text-slate-500">{a.vehicleType}</p></div>, value: a => a.vehiclePlate },
        { key: 'purpose', header: 'Purpose', render: a => <span className="line-clamp-2 max-w-[220px] text-sm">{a.purpose}</span>, value: a => a.purpose },
        { key: 'schedule', header: 'Visit Schedule', render: a => <div className="text-xs text-slate-600"><div>{new Date(a.visitStart).toLocaleString('en-PH', { timeZone: 'Asia/Manila', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</div><div className="text-slate-400">to {new Date(a.visitEnd).toLocaleString('en-PH', { timeZone: 'Asia/Manila', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</div></div>, value: a => a.visitStart },
        { key: 'status', header: 'Status', render: a => <Badge value={a.status} /> },
        { key: 'actions', header: 'Actions', sortable: false, render: a => <div className="flex gap-1" onClick={e => e.stopPropagation()}>
          {canManage && a.status === 'Pending' && <Button size="sm" variant="outline" onClick={() => setConfirm({ id: a.id, action: 'review' })}><Clock3 className="h-3.5 w-3.5" />Review</Button>}
          {canManage && (a.status === 'Pending' || a.status === 'Under Review') && <>
            <Button size="sm" variant="success" onClick={() => setConfirm({ id: a.id, action: 'approve' })}><CheckCircle2 className="h-3.5 w-3.5" />Approve</Button>
            <Button size="sm" variant="destructive" onClick={() => setConfirm({ id: a.id, action: 'reject' })}><XCircle className="h-3.5 w-3.5" />Reject</Button>
          </>}
          {canManage && a.status === 'Approved' && <Button size="sm" variant="outline" onClick={() => setConfirm({ id: a.id, action: 'complete' })}>Complete</Button>}
          <Button size="icon" variant="ghost" onClick={() => navigate(`/visitor-applications/${a.id}`)}><Eye className="h-4 w-4" /></Button>
        </div> },
      ]} />
    </CardContent></Card>

    <Dialog open={!!confirm} onOpenChange={() => setConfirm(null)}>
      <DialogContent title={confirm ? actionLabel[confirm.action] : 'Update application'} description={confirm?.action === 'reject' ? 'Provide an optional rejection reason.' : 'Add remarks before confirming this action.'}>
        <div className="space-y-4 p-6">
          <Field label={confirm?.action === 'reject' ? 'Rejection reason (optional)' : 'Remarks'}>
            <Textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder={confirm?.action === 'reject' ? 'Enter rejection reason...' : 'Enter remarks...'} />
          </Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button variant={confirm ? actionVariant[confirm.action] as any : 'default'} onClick={confirmAction}>{confirm ? actionLabel[confirm.action] : 'Confirm'}</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  </div>
}