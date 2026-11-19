import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/Card'

const colors = {
  blue: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-600',
  slate: 'bg-slate-100 text-slate-600',
}

export function MetricCard({
  label,
  value,
  helper,
  icon,
  tone = 'blue',
  trend,
  compact = false,
  className,
}: {
  label: string
  value: string | number
  helper?: string
  icon: ReactNode
  tone?: keyof typeof colors
  trend?: string
  compact?: boolean
  className?: string
}) {
  return (
    <Card className={className}>
      <CardContent className={cn(compact ? 'p-4' : 'p-5')}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
            <p className={cn('font-semibold tracking-tight text-slate-900', compact ? 'text-xl' : 'text-2xl')}>{value}</p>
            {helper && <p className="text-xs text-slate-500">{helper}</p>}
          </div>
          <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-md', colors[tone])}>{icon}</div>
        </div>
        {trend && <p className="mt-3 border-t border-slate-100 pt-3 text-xs font-medium text-emerald-600">{trend}</p>}
      </CardContent>
    </Card>
  )
}
