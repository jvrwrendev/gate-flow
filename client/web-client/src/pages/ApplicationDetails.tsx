import { useMemo, useState } from 'react'
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/components/ui/Toast'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/Dialog'
import { Field, Textarea } from '@/components/ui/Field'
import { PageHeader } from '@/components/shared/PageHeader'
import { VehicleImage } from '@/components/shared/VehicleImage'
import { DetailField, DetailGrid, DetailSection } from '@/components/shared/DetailField'
import type { Application } from '@/types'

export function ApplicationDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, setData, audit } = useApp()
  const { toast } = useToast()
  const [confirm, setConfirm] = useState<'approve' | 'reject' | null>(null)
  const [remarks, setRemarks] = useState('')

  const app = useMemo(() => data.applications.find(a => a.id === id), [data.applications, id])

  if (!app) {
    return (
      <div className="space-y-5">
        <PageHeader
          title="Application Not Found"
          description="The requested application could not be found."
          actions={<Button variant="outline" onClick={() => navigate('/applications')}><ArrowLeft className="h-4 w-4" />Back to Applications</Button>}
        />
        <Card>
          <CardContent className="py-10 text-center text-sm text-slate-500">
            This application may have been removed or the link is invalid.
          </CardContent>
        </Card>
      </div>
    )
  }

  const approve = (record: Application, remark: string) => {
    setData(prev => ({
      ...prev,
      applications: prev.applications.map(a => a.id === record.id ? { ...a, status: 'Approved', remarks: remark || 'Approved after document verification.' } : a),
      vehicles: prev.vehicles.some(v => v.plate === record.plate)
        ? prev.vehicles
        : [{ id: `VH-${Date.now().toString().slice(-5)}`, plate: record.plate, ownerId: record.ownerId, ownerName: record.ownerName, contact: record.phone, type: record.type, model: record.model, color: record.color, registrationDate: new Date().toISOString().slice(0, 10), status: 'Authorized' }, ...prev.vehicles],
    }))
    audit('Approved application', 'Vehicle Applications', record.reference)
    toast('Application approved', 'success', record.reference)
  }

  const reject = (record: Application, remark: string) => {
    setData(prev => ({ ...prev, applications: prev.applications.map(a => a.id === record.id ? { ...a, status: 'Rejected', remarks: remark || 'Application rejected.' } : a) }))
    audit('Rejected application', 'Vehicle Applications', record.reference)
    toast('Application rejected', 'error', record.reference)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Application Details"
        description={app.reference}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge value={app.status} />
            {app.status === 'Pending' && (
              <>
                <Button variant="success" onClick={() => setConfirm('approve')}>
                  <CheckCircle2 className="h-4 w-4" />Approve
                </Button>
                <Button variant="destructive" onClick={() => setConfirm('reject')}>
                  <XCircle className="h-4 w-4" />Reject
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => navigate('/applications')}>
              <ArrowLeft className="h-4 w-4" />Back
            </Button>
          </div>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <VehicleImage type={app.type} color={app.color} neutral className="aspect-[4/3] w-full" />
            <div className="grid gap-3 text-sm">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Plate Number</p>
                <p className="mt-1 font-mono font-semibold text-slate-900">{app.plate}</p>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</p>
                <div className="mt-2"><Badge value={app.status} /></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Applicant Information</CardTitle>
            </CardHeader>
            <CardContent>
              <DetailSection>
                <DetailGrid>
                  <DetailField label="Reference" value={app.reference} mono />
                  <DetailField label="Owner" value={app.ownerName} />
                  <DetailField label="Email" value={app.email} />
                  <DetailField label="Phone" value={app.phone} />
                  <DetailField label="Vehicle Type" value={app.type} />
                  <DetailField label="Model" value={app.model} />
                  <DetailField label="Color" value={app.color} />
                  <DetailField label="Purpose" value={app.purpose} />
                  <DetailField label="Submitted" value={new Date(app.submitted).toLocaleString('en-PH', { timeZone: 'Asia/Manila' })} />
                  <DetailField label="Status" value={<Badge value={app.status} />} />
                  <DetailField label="Remarks" value={app.remarks || 'No remarks'} className="sm:col-span-2" />
                </DetailGrid>
              </DetailSection>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!confirm} onOpenChange={(open) => !open && setConfirm(null)}>
        <DialogContent
          title={confirm === 'approve' ? 'Approve application' : 'Reject application'}
          description="Add review remarks before confirming."
        >
          <div className="space-y-4 p-6">
            <Field label="Review remarks">
              <Textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Enter remarks..." />
            </Field>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirm(null)}>Cancel</Button>
              <Button
                variant={confirm === 'approve' ? 'success' : 'destructive'}
                onClick={() => {
                  if (confirm === 'approve') approve(app, remarks)
                  else if (confirm === 'reject') reject(app, remarks)
                  setConfirm(null)
                  setRemarks('')
                }}
              >
                {confirm === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
