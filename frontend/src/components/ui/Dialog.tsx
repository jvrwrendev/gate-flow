import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Dialog({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: ReactNode }) { return <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>{children}</DialogPrimitive.Root> }
export function DialogContent({ children, className, title, description }: { children: ReactNode; className?: string; title: string; description?: string }) {
  return <DialogPrimitive.Portal><DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-900/35" /><DialogPrimitive.Content className={cn('fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-slate-200 bg-white outline-none', className)}>
    <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5"><div><DialogPrimitive.Title className="text-lg font-semibold text-slate-900">{title}</DialogPrimitive.Title>{description && <DialogPrimitive.Description className="mt-1 text-sm leading-5 text-slate-500">{description}</DialogPrimitive.Description>}</div><DialogPrimitive.Close className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close"><X className="h-4 w-4" /></DialogPrimitive.Close></div>
    {children}
  </DialogPrimitive.Content></DialogPrimitive.Portal>
}
export function DialogFooter({ children }: { children: ReactNode }) { return <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">{children}</div> }
