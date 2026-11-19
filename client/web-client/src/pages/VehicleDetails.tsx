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

export function VehicleDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data } = useApp()
  const vehicle = useMemo(() => data.vehicles.find(v => v.id === id), [data.vehicles, id])

  if (!vehicle) {
    return (
      <div className="space-y-5">
        <PageHeader title="Vehicle Not Found" description="The requested vehicle could not be found." actions={<Button variant="outline" onClick={() => navigate('/vehicles')}><ArrowLeft className="h-4 w-4" />Back to Vehicles</Button>} />
        <Card><CardContent className="py-10 text-center text-sm text-slate-500">This vehicle may have been removed or the link is invalid.</CardContent></Card>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Vehicle Details"
        description={vehicle.plate}
        actions={
          <div className="flex items-center gap-2">
            <Badge value={vehicle.status} />
            <Button variant="outline" onClick={() => navigate('/vehicles')}><ArrowLeft className="h-4 w-4" />Back</Button>
          </div>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader><CardTitle>Vehicle Preview</CardTitle></CardHeader>
          <CardContent>
            <VehicleImage type={vehicle.type} color={vehicle.color} neutral className="aspect-[4/3] w-full" />
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle>Vehicle Information</CardTitle></CardHeader>
            <CardContent>
              <DetailSection>
                <DetailGrid>
                  <DetailField label="Plate Number" value={vehicle.plate} mono />
                  <DetailField label="Vehicle Type" value={vehicle.type} />
                  <DetailField label="Model" value={vehicle.model} />
                  <DetailField label="Color" value={vehicle.color} />
                  <DetailField label="Authorization" value={<Badge value={vehicle.status} />} />
                  <DetailField label="Registered" value={vehicle.registrationDate} />
                </DetailGrid>
              </DetailSection>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Ownership &amp; Contact</CardTitle></CardHeader>
            <CardContent>
              <DetailSection>
                <DetailGrid>
                  <DetailField label="Owner" value={vehicle.ownerName} />
                  <DetailField label="Contact Number" value={vehicle.contact} />
                </DetailGrid>
              </DetailSection>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
