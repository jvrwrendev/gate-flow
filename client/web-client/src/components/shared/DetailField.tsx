import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface DetailFieldProps {
  label: string
  value?: ReactNode
  mono?: boolean
  className?: string
}

export function DetailField({ label, value, mono, className }: DetailFieldProps) {
  return (
    <div className={cn('border-b border-slate-100 py-3 last:border-0', className)}>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className={cn('mt-1 text-sm text-slate-900', mono && 'font-mono')}>
        {value ?? <span className="text-slate-400">—</span>}
      </dd>
    </div>
  )
}

export function DetailGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <dl className={cn('grid gap-x-8 sm:grid-cols-2', className)}>{children}</dl>
}

export function DetailSection({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn('space-y-3', className)}>
      {title && <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h3>}
      {children}
    </section>
  )
}
