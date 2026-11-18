import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

export function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md">
        <CardContent className="p-8 text-center">
          <h1 className="font-display text-3xl font-extrabold text-slate-950">404</h1>
          <p className="mt-2 text-sm text-slate-500">The requested page could not be found.</p>
          <Button className="mt-5" onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</Button>
        </CardContent>
      </Card>
    </div>
  )
}
