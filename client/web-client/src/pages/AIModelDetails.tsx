import { ArrowLeft } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageHeader } from '@/components/shared/PageHeader'
import { DetailField, DetailGrid, DetailSection } from '@/components/shared/DetailField'

export function AIModelDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data } = useApp()
  const model = useMemo(() => data.models.find(m => m.id === id), [data.models, id])

  if (!model) {
    return (
      <div className="space-y-5">
        <PageHeader title="Model Not Found" description="The requested AI model could not be found." actions={<Button variant="outline" onClick={() => navigate('/ai/models')}><ArrowLeft className="h-4 w-4" />Back to AI Models</Button>} />
        <Card><CardContent className="py-10 text-center text-sm text-slate-500">This model may have been removed or the link is invalid.</CardContent></Card>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Model Details"
        description={model.id}
        actions={
          <div className="flex items-center gap-2">
            <Badge value={model.status} />
            <Button variant="outline" onClick={() => navigate('/ai/models')}><ArrowLeft className="h-4 w-4" />Back</Button>
          </div>
        }
      />

      <Card>
        <CardHeader><CardTitle>Model Information</CardTitle></CardHeader>
        <CardContent>
          <DetailSection>
            <DetailGrid>
              <DetailField label="Model ID" value={model.id} mono />
              <DetailField label="Name" value={model.name} />
              <DetailField label="Category" value={model.category} />
              <DetailField label="Version" value={model.version} />
              <DetailField label="Status" value={<Badge value={model.status} />} />
              <DetailField label="Accuracy" value={`${model.accuracy}%`} />
              <DetailField label={model.metricLabel} value={`${model.accuracy}%`} />
              <DetailField label="Size" value={model.size} />
              <DetailField label="Last Updated" value={model.lastUpdated} />
              <DetailField label="Description" value={model.description} className="sm:col-span-2" />
            </DetailGrid>
          </DetailSection>
        </CardContent>
      </Card>
    </div>
  )
}
