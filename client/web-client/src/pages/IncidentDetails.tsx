import { ArrowLeft } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/components/ui/Toast'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Field, Textarea } from '@/components/ui/Field'
import { PageHeader } from '@/components/shared/PageHeader'
import { DetailField, DetailGrid, DetailSection } from '@/components/shared/DetailField'
import type { Incident } from '@/types'

export function IncidentDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, setData, audit } = useApp()
  const { toast } = useToast()
  const incident = useMemo(() => data.incidents.find(i => i.id === id), [data.incidents, id])
  const [remarks, setRemarks] = useState(incident?.remarks || '')

  useEffect(() => {
    setRemarks(incident?.remarks || '')
  }, [incident?.id, incident?.remarks])

  const gateName = (gateId: string) => data.gates.find(g => g.id === gateId)?.name || gateId

  const updateStatus = (next: Incident['status']) => {
    if (!incident) return
    setData(prev => ({
      ...prev,
      incidents: prev.incidents.map(i => i.id === incident.id ? { ...i, status: next, remarks: remarks || i.remarks } : i),
    }))
    audit(`Changed incident to ${next}`, 'Security Incidents', incident.id)
    toast('Incident updated', 'success', incident.id)
  }

  if (!incident) {
    return (
      <div className="space-y-5">
        <PageHeader title="Incident Not Found" description="The requested incident could not be found." actions={<Button variant="outline" onClick={() => navigate('/security/incidents')}><ArrowLeft className="h-4 w-4" />Back to Incidents</Button>} />
        <Card><CardContent className="py-10 text-center text-sm text-slate-500">This incident may have been removed or the link is invalid.</CardContent></Card>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Incident Details"
        description={incident.id}
        actions={
          <div className="flex items-center gap-2">
            <Badge value={incident.status} />
            <Button variant="outline" onClick={() => navigate('/security/incidents')}><ArrowLeft className="h-4 w-4" />Back</Button>
          </div>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader><CardTitle>Incident Information</CardTitle></CardHeader>
          <CardContent>
            <DetailSection>
              <DetailGrid>
                <DetailField label="Incident Type" value={incident.type} />
                <DetailField label="Severity" value={incident.severity} />
                <DetailField label="Timestamp" value={new Date(incident.timestamp).toLocaleString('en-PH', { timeZone: 'Asia/Manila' })} />
                <DetailField label="Gate" value={gateName(incident.gateId)} />
                <DetailField label="Status" value={<Badge value={incident.status} />} />
                <DetailField label="Description" value={incident.description} className="sm:col-span-2" />
              </DetailGrid>
            </DetailSection>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Admin Remarks & Status</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field label="Admin remarks">
              <Textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Add remarks..." />
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => updateStatus('Investigating')}>Mark Investigating</Button>
              <Button variant="success" onClick={() => updateStatus('Resolved')}>Resolve</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
