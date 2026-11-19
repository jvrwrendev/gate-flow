import { ArrowLeft } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageHeader } from '@/components/shared/PageHeader'
import { DetailField, DetailGrid, DetailSection } from '@/components/shared/DetailField'

export function GateDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data } = useApp()
  const gate = useMemo(() => data.gates.find(g => g.id === id), [data.gates, id])
  const history = useMemo(() => data.recognitionLogs.filter(l => l.gateId === id).slice(0, 20), [data.recognitionLogs, id])

  if (!gate) {
    return (
      <div className="space-y-5">
        <PageHeader title="Gate Not Found" description="The requested gate could not be found." actions={<Button variant="outline" onClick={() => navigate('/gates')}><ArrowLeft className="h-4 w-4" />Back to Gates</Button>} />
        <Card><CardContent className="py-10 text-center text-sm text-slate-500">This gate may have been removed or the link is invalid.</CardContent></Card>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={`${gate.name} Activity`}
        description={gate.id}
        actions={
          <div className="flex items-center gap-2">
            <Badge value={gate.status} />
            <Button variant="outline" onClick={() => navigate('/gates')}><ArrowLeft className="h-4 w-4" />Back</Button>
          </div>
        }
      />

      <Card>
        <CardHeader><CardTitle>Gate Information</CardTitle></CardHeader>
        <CardContent>
          <DetailSection>
            <DetailGrid>
              <DetailField label="Gate ID" value={gate.id} mono />
              <DetailField label="Name" value={gate.name} />
              <DetailField label="Location" value={gate.location} />
              <DetailField label="Controller" value={gate.controllerId} />
              <DetailField label="Assigned Camera" value={gate.cameraId} />
              <DetailField label="Entries Today" value={gate.entriesToday} />
              <DetailField label="Barrier" value={gate.barrier} />
              <DetailField label="Mode" value={gate.mode} />
              <DetailField label="Status" value={<Badge value={gate.status} />} />
              <DetailField label="Last Activity" value={new Date(gate.lastActivity).toLocaleString('en-PH', { timeZone: 'Asia/Manila' })} />
            </DetailGrid>
          </DetailSection>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Access Events</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Plate</th>
                  <th className="px-4 py-3 font-medium">Decision</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr><td colSpan={3} className="px-4 py-10 text-center text-sm text-slate-500">No activity recorded for this gate.</td></tr>
                ) : history.map(r => (
                  <tr key={r.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 text-slate-500">{new Date(r.timestamp).toLocaleString('en-PH', { timeZone: 'Asia/Manila', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</td>
                    <td className="px-4 py-3 font-mono font-medium text-slate-900">{r.plate}</td>
                    <td className="px-4 py-3"><Badge value={r.decision} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
