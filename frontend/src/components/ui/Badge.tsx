import type { HTMLAttributes } from 'react'
import { cn, statusClass } from '@/lib/utils'
interface BadgeProps extends HTMLAttributes<HTMLSpanElement> { value?: string; variant?: 'success' | 'warning' | 'destructive' | 'secondary' | 'blue' | 'outline' }
const styles = { success: 'border-emerald-200 bg-emerald-50 text-emerald-700', warning: 'border-amber-200 bg-amber-50 text-amber-700', destructive: 'border-red-200 bg-red-50 text-red-700', secondary: 'border-slate-200 bg-slate-100 text-slate-600', blue: 'border-blue-200 bg-blue-50 text-blue-700', outline: 'border-slate-200 bg-white text-slate-600' }
export function Badge({ value, variant, className, children, ...props }: BadgeProps) {
  const v = variant || (value ? statusClass(value) as BadgeProps['variant'] : 'secondary')
  return <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-[11px] font-medium leading-4', styles[v || 'secondary'], className)} {...props}><span className={cn('h-1.5 w-1.5 rounded-full bg-current', v === 'outline' && 'hidden')} />{children || value}</span>
}
