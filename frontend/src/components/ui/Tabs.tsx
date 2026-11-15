import { cn } from '@/lib/utils'
export function Tabs({ items, value, onChange }: { items: { value: string; label: string; count?: number }[]; value: string; onChange: (value: string) => void }) {
  return <div className="flex gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1">{items.map(item => <button key={item.value} onClick={() => onChange(item.value)} className={cn('flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium text-slate-500 transition-colors', value === item.value && 'bg-white text-slate-900 shadow-sm')}>{item.label}{item.count !== undefined && <span className={cn('rounded-full bg-slate-200 px-1.5 text-[11px]', value === item.value && 'bg-blue-100 text-blue-700')}>{item.count}</span>}</button>)}</div>
}
