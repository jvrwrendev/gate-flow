import { ArrowLeft } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageHeader } from '@/components/shared/PageHeader'
import { VehicleImage } from '@/components/shared/VehicleImage'
import { DetailField, DetailGrid, DetailSection } from '@/components/shared/DetailField'

export function RecognitionLogDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data } = useApp()
  const log = useMemo(() => data.recognitionLogs.find(l => l.id === id), [data.recognitionLogs, id])
  const cameraName = (cameraId: string) => data.cameras.find(c => c.id === cameraId)?.name || cameraId
  const gateName = (gateId: string) => data.gates.find(g => g.id === gateId)?.name || gateId

  if (!log) {
    return (
      <div className="space-y-5">
        <PageHeader title="Recognition Record Not Found" description="The requested recognition record could not be found." actions={<Button variant="outline" onClick={() => navigate('/ai/logs')}><ArrowLeft className="h-4 w-4" />Back to Recognition Logs</Button>} />
        <Card><CardContent className="py-10 text-center text-sm text-slate-500">This record may have been removed or the link is invalid.</CardContent></Card>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Recognition Record"
        description={`Record ID: ${log.id}`}
        actions={
          <div className="flex items-center gap-2">
            <Badge value={log.decision} />
            <Button variant="outline" onClick={() => navigate('/ai/logs')}><ArrowLeft className="h-4 w-4" />Back</Button>
          </div>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader><CardTitle>Vehicle Preview</CardTitle></CardHeader>
          <CardContent>
            <div className="aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-3">
              <VehicleImage type={log.type} color={log.color} neutral className="h-full w-full border-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recognition Details</CardTitle></CardHeader>
          <CardContent>
            <DetailSection>
              <DetailGrid>
                <DetailField label="Plate Number" value={log.plate} mono />
                <DetailField label="Access Decision" value={<Badge value={log.decision} />} />
                <DetailField label="Confidence Score" value={`${log.confidence.toFixed(1)}%`} />
                <DetailField label="Timestamp" value={new Date(log.timestamp).toLocaleString('en-PH', { timeZone: 'Asia/Manila' })} />
                <DetailField label="Vehicle Type" value={log.type} />
                <DetailField label="Vehicle Color" value={log.color} />
                <DetailField label="Camera" value={cameraName(log.cameraId)} />
                <DetailField label="Gate" value={gateName(log.gateId)} />
                <DetailField label="Reason / Remarks" value={log.reason} className="sm:col-span-2" />
              </DetailGrid>
            </DetailSection>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
