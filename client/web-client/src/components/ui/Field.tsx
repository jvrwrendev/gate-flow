import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import type { SelectOption } from '@/types'

export function Field({
  label,
  error,
  children,
  hint,
  className,
  layout = 'stack',
  htmlFor,
}: {
  label: string
  error?: string
  children: ReactNode
  hint?: string
  className?: string
  layout?: 'stack' | 'inline'
  htmlFor?: string
}) {
  if (layout === 'inline') {
    return (
      <div className={cn('grid items-start gap-2 sm:grid-cols-[160px_1fr] sm:gap-4', className)}>
        <label htmlFor={htmlFor} className="flex min-h-9 items-center text-sm font-medium text-slate-700">
          {label}
        </label>
        <div>
          {children}
          {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  )
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-none outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
      className
    )}
    {...props}
  />
))
Input.displayName = 'Input'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { options?: SelectOption[] }>(
  ({ options, className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'flex h-9 w-full cursor-pointer appearance-auto rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-50',
        className
      )}
      {...props}
    >
      {children || options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
)
Select.displayName = 'Select'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[96px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-50',
      className
    )}
    {...props}
  />
))
Textarea.displayName = 'Textarea'
