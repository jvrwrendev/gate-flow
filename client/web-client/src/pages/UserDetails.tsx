import { ArrowLeft } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageHeader } from '@/components/shared/PageHeader'
import { DetailField, DetailGrid, DetailSection } from '@/components/shared/DetailField'

function formatDate(value?: string) {
  if (!value || value === '—') return '—'
  return new Date(value).toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function UserDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data } = useApp()

  const user = useMemo(() => data.admins.find(u => u.id === id), [data.admins, id])

  if (!user) {
    return (
      <div className="space-y-5">
        <PageHeader
          title="User Not Found"
          description="The requested user account could not be found."
          actions={<Button variant="outline" onClick={() => navigate('/system/admins')}><ArrowLeft className="h-4 w-4" />Back to User Management</Button>}
        />
        <Card>
          <CardContent className="py-10 text-center text-sm text-slate-500">
            This user may have been removed or the link is invalid.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="User Details"
        description={user.id}
        actions={
          <div className="flex items-center gap-2">
            <Badge value={user.status} />
            <Button variant="outline" onClick={() => navigate('/system/admins')}>
              <ArrowLeft className="h-4 w-4" />Back
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DetailSection>
            <DetailGrid>
              <DetailField label="User ID" value={user.id} mono />
              <DetailField label="Full Name" value={user.name} />
              <DetailField label="Email Address" value={user.email} />
              <DetailField label="Contact Number" value={user.contactNumber} />
              <DetailField label="Role" value={<Badge value={user.role} variant="blue" />} />
              <DetailField label="Account Status" value={<Badge value={user.status} />} />
              <DetailField label="Last Login" value={formatDate(user.lastLogin)} />
              <DetailField label="Date Created" value={formatDate(user.createdAt)} />
              <DetailField label="Password" value={user.password ? 'Configured' : 'Not set'} />
            </DetailGrid>
          </DetailSection>
          <p className="text-xs text-slate-500">
            Password values are never displayed for security. Password reset is simulated in this frontend-only environment.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
