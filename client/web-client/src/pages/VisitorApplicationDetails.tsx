import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CheckCircle2, Clock3, QrCode, XCircle } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/components/ui/Toast'
import { usePermissions } from '@/hooks/usePermissions'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/Dialog'
import { Field, Textarea } from '@/components/ui/Field'
import { PageHeader } from '@/components/shared/PageHeader'
import { DetailField, DetailGrid, DetailSection } from '@/components/shared/DetailField'
import type { VisitorApplication } from '@/types'

function uid(prefix: string) { return `${prefix}-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 90 + 10)}` }

export function VisitorApplicationDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, setData, audit } = useApp()
  const { toast } = useToast()
  const { can } = usePermissions()
  const canManage = can('visitorApplications:manage')
  const [confirm, setConfirm] = useState<'approve' | 'reject' | 'review' | 'complete' | null>(null)
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

  const app = useMemo(() => data.visitorApplications.find(a => a.id === id), [data.visitorApplications, id])

  const patchApp = (target: VisitorApplication, updater: (a: VisitorApplication) => VisitorApplication, notification?: { title: string; description: string; severity: 'info' | 'warning' | 'critical' }) => {
    setData(prev => ({
      ...prev,
      visitorApplications: prev.visitorApplications.map(a => a.id === target.id ? updater(a) : a),
      notifications: notification ? [{ id: uid('NTF'), title: notification.title, description: notification.description, timestamp: new Date().toISOString(), read: false, severity: notification.severity }, ...prev.notifications] : prev.notifications,
    }))
  }

  if (!app) {
    return <div className="space-y-5">
      <PageHeader title="Visitor Application Not Found" description="The requested visitor application could not be found." actions={<Button variant="outline" onClick={() => navigate('/visitor-applications')}><ArrowLeft className="h-4 w-4" />Back</Button>} />
      <Card><CardContent className="py-10 text-center text-sm text-slate-500">This application may have been removed or the link is invalid.</CardContent></Card>
    </div>
  }

  const act = () => {
    const ts = new Date().toISOString()
    if (confirm === 'review') {
      patchApp(app, a => ({ ...a, status: 'Under Review', reviewedAt: ts, remarks: remarks || a.remarks, timeline: [...a.timeline, { id: uid('VAT'), status: 'Under Review', label: 'Marked under review', description: remarks || 'Application is being reviewed by admin.', timestamp: ts, actor: 'System Admin' }] }))
      audit('Marked visitor application under review', 'Visitor Applications', app.reference)
      toast('Application under review', 'info', app.reference)
    }
    if (confirm === 'approve') {
      const passReference = app.passReference || `VP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
      const qrCodeValue = app.qrCodeValue || `GATEGUARD-${passReference}`
      patchApp(app, a => ({ ...a, status: 'Approved', reviewedAt: a.reviewedAt || ts, approvedAt: ts, passReference, qrCodeValue, remarks: remarks || 'Approved for scheduled visit.', timeline: [...a.timeline, { id: uid('VAT'), status: 'Approved', label: 'Application approved', description: `Temporary visitor pass ${passReference} generated.`, timestamp: ts, actor: 'System Admin' }] }), { title: 'Visitor application approved', description: `${app.visitorName} (${app.reference}) was approved. Pass ${passReference} issued.`, severity: 'info' })
      audit('Approved visitor application', 'Visitor Applications', `${app.reference} · ${passReference}`)
      toast('Visitor application approved', 'success', passReference)
    }
    if (confirm === 'reject') {
      patchApp(app, a => ({ ...a, status: 'Rejected', reviewedAt: a.reviewedAt || ts, rejectedAt: ts, rejectionReason: remarks || undefined, remarks: remarks || a.remarks || 'Application rejected.', timeline: [...a.timeline, { id: uid('VAT'), status: 'Rejected', label: 'Application rejected', description: remarks || 'Request rejected by admin.', timestamp: ts, actor: 'System Admin' }] }), { title: 'Visitor application rejected', description: `${app.visitorName} (${app.reference}) was rejected.`, severity: 'warning' })
      audit('Rejected visitor application', 'Visitor Applications', app.reference)
      toast('Visitor application rejected', 'error', app.reference)
    }
    if (confirm === 'complete') {
      patchApp(app, a => ({ ...a, status: 'Completed', completedAt: ts, currentlyInside: false, exitRecordedAt: a.exitRecordedAt || ts, remarks: remarks || a.remarks, timeline: [...a.timeline, { id: uid('VAT'), status: 'Completed', label: 'Visit completed', description: remarks || 'Visitor exit recorded and pass closed.', timestamp: ts, actor: 'System Admin' }] }))
      audit('Completed visitor application', 'Visitor Applications', app.reference)
      toast('Visit marked completed', 'success', app.reference)
    }
    setConfirm(null)
    setRemarks('')
  }

  const actionMeta = {
    approve: { title: 'Approve application', desc: 'Add remarks before approving. A temporary visitor pass will be generated.', label: 'Approve', variant: 'success' as const },
    reject: { title: 'Reject application', desc: 'Provide an optional rejection reason.', label: 'Reject', variant: 'destructive' as const },
    review: { title: 'Mark under review', desc: 'Add remarks before marking this application as under review.', label: 'Mark Under Review', variant: 'default' as const },
    complete: { title: 'Mark completed', desc: 'Add remarks before closing this visit.', label: 'Mark Completed', variant: 'default' as const },
  }

  return <div className="space-y-5">
    <PageHeader
      title="Visitor Application Details"
      description={app.reference}
      actions={<div className="flex flex-wrap items-center gap-2">
        <Badge value={app.status} />
        {canManage && app.status === 'Pending' && <Button variant="outline" onClick={() => setConfirm('review')}><Clock3 className="h-4 w-4" />Under Review</Button>}
        {canManage && (app.status === 'Pending' || app.status === 'Under Review') && <>
          <Button variant="success" onClick={() => setConfirm('approve')}><CheckCircle2 className="h-4 w-4" />Approve</Button>
          <Button variant="destructive" onClick={() => setConfirm('reject')}><XCircle className="h-4 w-4" />Reject</Button>
        </>}
        {canManage && app.status === 'Approved' && <Button variant="outline" onClick={() => setConfirm('complete')}>Mark Completed</Button>}
        <Button variant="outline" onClick={() => navigate('/visitor-applications')}><ArrowLeft className="h-4 w-4" />Back</Button>
      </div>}
    />

    <div className="grid gap-5 xl:grid-cols-[340px_1fr]">
      <div className="space-y-5">
        <Card>
          <CardHeader><CardTitle>Pass & Access</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Pass Reference</p>
              <p className="mt-1 font-mono font-semibold text-slate-900">{app.passReference || 'Not generated'}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">QR / Plate Verification</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{app.gateAccess}</p>
              {app.qrCodeValue && <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><QrCode className="h-3.5 w-3.5" />{app.qrCodeValue}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md border border-slate-200 p-3"><p className="text-xs text-slate-500">Currently Inside</p><p className="mt-1 font-medium">{app.currentlyInside ? 'Yes' : 'No'}</p></div>
              <div className="rounded-md border border-slate-200 p-3"><p className="text-xs text-slate-500">Status</p><div className="mt-1"><Badge value={app.status} /></div></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Application Timeline</CardTitle></CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {app.timeline.map((event, i) => (
                <li key={event.id} className="relative pl-6">
                  {i !== app.timeline.length - 1 && <span className="absolute left-[7px] top-5 h-[calc(100%-4px)] w-px bg-slate-200" />}
                  <span className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-blue-600 bg-white" />
                  <p className="text-sm font-medium text-slate-900">{event.label}</p>
                  <p className="text-xs text-slate-500">{event.description}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{new Date(event.timestamp).toLocaleString('en-PH', { timeZone: 'Asia/Manila' })} · {event.actor}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-5">
        <Card>
          <CardHeader><CardTitle>Visitor & Request Details</CardTitle></CardHeader>
          <CardContent>
            <DetailSection>
              <DetailGrid>
                <DetailField label="Reference" value={app.reference} mono />
                <DetailField label="Status" value={<Badge value={app.status} />} />
                <DetailField label="Visitor Name" value={app.visitorName} />
                <DetailField label="Visitor Phone" value={app.visitorPhone || '—'} />
                <DetailField label="Visitor Email" value={app.visitorEmail || '—'} />
                <DetailField label="Requested By" value={app.requestedByName} />
                <DetailField label="Requester Email" value={app.requestedByEmail} />
                <DetailField label="Purpose" value={app.purpose} className="sm:col-span-2" />
              </DetailGrid>
            </DetailSection>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Vehicle & Visit Schedule</CardTitle></CardHeader>
          <CardContent>
            <DetailGrid>
              <DetailField label="Vehicle Plate" value={app.vehiclePlate} mono />
              <DetailField label="Vehicle Type" value={app.vehicleType} />
              <DetailField label="Vehicle Model" value={app.vehicleModel || '—'} />
              <DetailField label="Vehicle Color" value={app.vehicleColor || '—'} />
              <DetailField label="Visit Start" value={new Date(app.visitStart).toLocaleString('en-PH', { timeZone: 'Asia/Manila' })} />
              <DetailField label="Visit End" value={new Date(app.visitEnd).toLocaleString('en-PH', { timeZone: 'Asia/Manila' })} />
              <DetailField label="Submitted" value={new Date(app.submittedAt).toLocaleString('en-PH', { timeZone: 'Asia/Manila' })} />
              <DetailField label="Reviewed" value={app.reviewedAt ? new Date(app.reviewedAt).toLocaleString('en-PH', { timeZone: 'Asia/Manila' }) : '—'} />
              <DetailField label="Entry Recorded" value={app.entryRecordedAt ? new Date(app.entryRecordedAt).toLocaleString('en-PH', { timeZone: 'Asia/Manila' }) : '—'} />
              <DetailField label="Exit Recorded" value={app.exitRecordedAt ? new Date(app.exitRecordedAt).toLocaleString('en-PH', { timeZone: 'Asia/Manila' }) : '—'} />
              <DetailField label="Remarks" value={app.remarks || '—'} className="sm:col-span-2" />
              <DetailField label="Rejection Reason" value={app.rejectionReason || '—'} className="sm:col-span-2" />
            </DetailGrid>
          </CardContent>
        </Card>
      </div>
    </div>

    <Dialog open={!!confirm} onOpenChange={(open) => !open && setConfirm(null)}>
      <DialogContent title={confirm ? actionMeta[confirm].title : ''} description={confirm ? actionMeta[confirm].desc : ''}>
        <div className="space-y-4 p-6">
          <Field label={confirm === 'reject' ? 'Rejection reason (optional)' : 'Remarks'}>
            <Textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder={confirm === 'reject' ? 'Enter rejection reason...' : 'Enter remarks...'} />
          </Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button variant={confirm ? actionMeta[confirm].variant : 'default'} onClick={act}>{confirm ? actionMeta[confirm].label : 'Confirm'}</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  </div>
}