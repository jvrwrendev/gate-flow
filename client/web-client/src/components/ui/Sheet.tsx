import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Sheet({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: ReactNode }) {
  return <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>{children}</DialogPrimitive.Root>
}

export function SheetContent({
  children,
  className,
  title,
  description,
  side = 'right',
}: {
  children: ReactNode
  className?: string
  title: string
  description?: string
  side?: 'right' | 'left'
}) {
  const isRight = side === 'right'

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/40 data-[state=open]:animate-sheet-overlay-in data-[state=closed]:animate-sheet-overlay-out" />
      <DialogPrimitive.Content
        className={cn(
          'fixed inset-y-0 z-50 flex h-full w-full flex-col border-slate-200 bg-white shadow-xl outline-none will-change-transform sm:max-w-md md:max-w-lg',
          isRight
            ? 'right-0 border-l data-[state=open]:animate-sheet-in-right data-[state=closed]:animate-sheet-out-right'
            : 'left-0 border-r data-[state=open]:animate-sheet-in-left data-[state=closed]:animate-sheet-out-left',
          className
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="min-w-0 space-y-1">
            <DialogPrimitive.Title className="text-base font-semibold text-slate-900">{title}</DialogPrimitive.Title>
            {description && <DialogPrimitive.Description className="text-sm text-slate-500">{description}</DialogPrimitive.Description>}
          </div>
          <DialogPrimitive.Close
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </DialogPrimitive.Close>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function SheetFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6', className)}>
      {children}
    </div>
  )
}
