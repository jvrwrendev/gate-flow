import { useEffect, useState, type ReactNode } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FullScreenDetailProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  actions?: ReactNode
  status?: ReactNode
}

export function FullScreenDetail({ open, onClose, title, description, children, actions, status }: FullScreenDetailProps) {
  const [mounted, setMounted] = useState(open)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true))
      })
      return () => cancelAnimationFrame(frame)
    }

    setVisible(false)
    const timeout = window.setTimeout(() => setMounted(false), 200)
    return () => window.clearTimeout(timeout)
  }, [open])

  useEffect(() => {
    if (!mounted) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [mounted])

  if (!mounted) return null

  return (
    <DialogPrimitive.Root open={visible} onOpenChange={(next) => !next && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-y-0 right-0 left-0 z-40 bg-slate-900/40 transition-opacity duration-200 ease-out lg:left-[var(--sidebar-offset,18rem)]',
            visible ? 'opacity-100' : 'opacity-0'
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            'fixed top-1/2 left-1/2 z-40 flex max-h-[85vh] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm outline-none transition-all duration-200 ease-out sm:w-[calc(100%-3rem)] lg:left-[calc(50%+var(--sidebar-offset,18rem)/2)]',
            visible ? 'scale-100 opacity-100' : 'pointer-events-none scale-[0.98] opacity-0'
          )}
        >
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2.5">
                <DialogPrimitive.Title className="truncate text-base font-semibold text-slate-900">
                  {title}
                </DialogPrimitive.Title>
                {status}
              </div>
              {description && (
                <DialogPrimitive.Description className="mt-0.5 truncate text-sm text-slate-500">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {actions}
              <DialogPrimitive.Close
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
                aria-label="Close details"
              >
                <X className="h-4 w-4" />
              </DialogPrimitive.Close>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto bg-white px-5 py-4 sm:px-6 sm:py-5">
            {children}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
