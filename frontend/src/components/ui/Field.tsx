import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import type { SelectOption } from '@/types'

export function Field({ label, error, children, hint, className, layout = 'stack' }: { label: string; error?: string; children: ReactNode; hint?: string; className?: string; layout?: 'stack' | 'inline' }) {
  if (layout === 'inline') {
    return (
      <label className={cn('grid items-start gap-2 sm:grid-cols-[140px_1fr] sm:gap-4', className)}>
        <span className="flex min-h-10 items-center text-[13px] font-medium leading-5 text-slate-700">{label}</span>
        <span className="block">
          {children}
          {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : hint ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}
        </span>
      </label>
    )
  }

  return <label className={cn('block', className)}><span className="mb-1.5 block min-h-5 text-[13px] font-medium leading-5 text-slate-700">{label}</span>{children}{error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : hint ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}</label>
}
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => <input ref={ref} className={cn('flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50', className)} {...props} />)
Input.displayName = 'Input'
export function Select({ options, className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { options?: SelectOption[] }) {
  return <select className={cn('flex h-10 w-full cursor-pointer appearance-auto rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100', className)} {...props}>{children || options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
}
export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea className={cn('flex min-h-[96px] w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100', className)} {...props} /> }
