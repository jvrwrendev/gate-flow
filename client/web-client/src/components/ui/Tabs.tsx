import { cn } from '@/lib/utils'

export function Tabs({
  items,
  value,
  onChange,
  className,
}: {
  items: { value: string; label: string; count?: number }[]
  value: string
  onChange: (value: string) => void
  className?: string
}) {
  return (
    <div className={cn('inline-flex h-9 items-center gap-1 rounded-md bg-slate-100 p-1', className)} role="tablist">
      {items.map(item => (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={value === item.value}
          onClick={() => onChange(item.value)}
          className={cn(
            'inline-flex h-7 items-center gap-2 whitespace-nowrap rounded px-3 text-sm font-medium text-slate-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30',
            value === item.value && 'bg-white text-slate-900 shadow-sm'
          )}
        >
          {item.label}
          {item.count !== undefined && (
            <span
              className={cn(
                'rounded-full bg-slate-200 px-1.5 text-[11px] font-medium text-slate-600',
                value === item.value && 'bg-blue-100 text-blue-700'
              )}
            >
              {item.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
