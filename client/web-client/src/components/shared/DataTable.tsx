import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, ChevronDown, SearchX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'

interface Column<T> {
  key: string
  header: string
  render: (item: T) => React.ReactNode
  sortable?: boolean
  value?: (item: T) => string | number
  className?: string
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  pageSize = 7,
  loading,
  emptyTitle = 'No records found',
  emptyDescription = 'Adjust your filters or add a new record.',
  onRowClick,
  rowClassName,
}: {
  data: T[]
  columns: Column<T>[]
  pageSize?: number
  loading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  onRowClick?: (item: T) => void
  rowClassName?: (item: T) => string
}) {
  const [page, setPage] = useState(0)
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null)

  const sorted = useMemo(() => {
    if (!sort) return data
    const col = columns.find(c => c.key === sort.key)
    const getter = col?.value || ((item: T) => String((item as any)[col?.key ?? '']))
    return [...data].sort((a, b) => {
      const av = getter(a)
      const bv = getter(b)
      const result = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))
      return sort.dir === 'asc' ? result : -result
    })
  }, [data, columns, sort])

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const current = Math.min(page, pages - 1)
  const pageData = sorted.slice(current * pageSize, current * pageSize + pageSize)

  if (loading) {
    return (
      <div className="space-y-3 p-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <SearchX className="h-5 w-5" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">{emptyTitle}</h3>
        <p className="mt-1 max-w-sm text-sm text-slate-500">{emptyDescription}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/60">
              {columns.map(col => (
                <th key={col.key} className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <button
                    type="button"
                    className={cn('inline-flex items-center gap-1', col.sortable !== false && 'hover:text-slate-900')}
                    onClick={() => {
                      if (col.sortable === false) return
                      setSort(prev =>
                        prev?.key === col.key
                          ? { key: col.key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
                          : { key: col.key, dir: 'asc' }
                      )
                    }}
                  >
                    {col.header}
                    {col.sortable !== false &&
                      (sort?.key === col.key ? (
                        sort.dir === 'asc' ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
                      ))}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map(item => (
              <tr
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  'border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/70',
                  onRowClick && 'cursor-pointer',
                  rowClassName?.(item)
                )}
              >
                {columns.map(col => (
                  <td key={col.key} className={cn('px-4 py-3 text-sm text-slate-700 align-middle', col.className)}>
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row">
        <span className="text-xs text-slate-500">
          Showing {current * pageSize + 1}–{Math.min((current + 1) * pageSize, sorted.length)} of {sorted.length}
        </span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(0, current - 1))}
            disabled={current === 0}
            aria-label="Previous page"
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs font-medium text-slate-600">
            {current + 1} / {pages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.min(pages - 1, current + 1))}
            disabled={current === pages - 1}
            aria-label="Next page"
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
