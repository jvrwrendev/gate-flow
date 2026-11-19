import { ArrowLeft } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageHeader } from '@/components/shared/PageHeader'
import { DetailField, DetailGrid, DetailSection } from '@/components/shared/DetailField'

export function OwnerDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data } = useApp()
  const owner = useMemo(() => data.owners.find(o => o.id === id), [data.owners, id])
  const linkedCount = useMemo(() => data.vehicles.filter(v => v.ownerId === id).length, [data.vehicles, id])

  if (!owner) {
    return (
      <div className="space-y-5">
        <PageHeader title="Owner Not Found" description="The requested owner could not be found." actions={<Button variant="outline" onClick={() => navigate('/owners')}><ArrowLeft className="h-4 w-4" />Back to Owners</Button>} />
        <Card><CardContent className="py-10 text-center text-sm text-slate-500">This owner may have been removed or the link is invalid.</CardContent></Card>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Owner Details"
        description={owner.name}
        actions={
          <div className="flex items-center gap-2">
            <Badge value={owner.status} />
            <Button variant="outline" onClick={() => navigate('/owners')}><ArrowLeft className="h-4 w-4" />Back</Button>
          </div>
        }
      />

      <Card>
        <CardHeader><CardTitle>Owner Information</CardTitle></CardHeader>
        <CardContent>
          <DetailSection>
            <DetailGrid>
              <DetailField label="Full Name" value={owner.name} />
              <DetailField label="Email" value={owner.email} />
              <DetailField label="Phone" value={owner.phone} />
              <DetailField label="Address" value={owner.address} className="sm:col-span-2" />
              <DetailField label="Joined" value={owner.joined} />
              <DetailField label="Status" value={<Badge value={owner.status} />} />
              <DetailField label="Linked Vehicles" value={linkedCount} />
            </DetailGrid>
          </DetailSection>
        </CardContent>
      </Card>
    </div>
  )
}
