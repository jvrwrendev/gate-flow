import { ArrowLeft } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageHeader } from '@/components/shared/PageHeader'
import { CameraPlaceholder } from '@/components/shared/VehicleImage'
import { DetailField, DetailGrid, DetailSection } from '@/components/shared/DetailField'

export function CameraDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data } = useApp()
  const camera = useMemo(() => data.cameras.find(c => c.id === id), [data.cameras, id])

  if (!camera) {
    return (
      <div className="space-y-5">
        <PageHeader title="Camera Not Found" description="The requested camera could not be found." actions={<Button variant="outline" onClick={() => navigate('/cameras')}><ArrowLeft className="h-4 w-4" />Back to Cameras</Button>} />
        <Card><CardContent className="py-10 text-center text-sm text-slate-500">This camera may have been removed or the link is invalid.</CardContent></Card>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Camera Details"
        description={camera.id}
        actions={
          <div className="flex items-center gap-2">
            <Badge value={camera.status} />
            <Button variant="outline" onClick={() => navigate('/cameras')}><ArrowLeft className="h-4 w-4" />Back</Button>
          </div>
        }
      />

      <div className="space-y-5">
        <Card>
          <CardHeader><CardTitle>Live Preview</CardTitle></CardHeader>
          <CardContent>
            <CameraPlaceholder title={camera.name} online={camera.status === 'Online'} className="aspect-video w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Camera Information</CardTitle></CardHeader>
          <CardContent>
            <DetailSection>
              <DetailGrid>
                <DetailField label="Camera ID" value={camera.id} mono />
                <DetailField label="Name" value={camera.name} />
                <DetailField label="Location" value={camera.location} />
                <DetailField label="Model" value={camera.model} />
                <DetailField label="Type" value={camera.type} />
                <DetailField label="Protocol" value={camera.protocol} />
                <DetailField label="Assigned Gate" value={camera.gateId} />
                <DetailField label="IP Address" value={camera.ipAddress} mono />
                <DetailField label="Status" value={<Badge value={camera.status} />} />
                <DetailField label="Last Connection" value={new Date(camera.lastConnection).toLocaleString('en-PH', { timeZone: 'Asia/Manila' })} />
              </DetailGrid>
            </DetailSection>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
