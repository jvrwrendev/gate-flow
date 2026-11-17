import { useEffect, useRef, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FullScreenDetailProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  actions?: ReactNode
}

export function FullScreenDetail({ open, onClose, title, description, children, actions }: FullScreenDetailProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
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
    if (open) closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [mounted, open, onClose])

  if (!mounted) return null

  return (
    <div className="fixed inset-y-0 right-0 left-0 z-40 flex items-center justify-center p-4 sm:p-6 lg:left-[var(--sidebar-offset,18rem)]" role="dialog" aria-modal="true" aria-labelledby="detail-modal-title">
      <button
        type="button"
        aria-label="Close details"
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-slate-900/40 transition-opacity duration-200 ease-out',
          visible ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />
      <div
        className={cn(
          'relative flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl transition-all duration-200 ease-out',
          visible ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-2 scale-[0.98] opacity-0'
        )}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id="detail-modal-title" className="truncate text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
            {description && <p className="mt-1 truncate text-sm text-slate-500">{description}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {actions}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              aria-label="Close details"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-5 py-5 sm:px-6 sm:py-6">
          {children}
        </div>
      </div>
    </div>
  )
}
