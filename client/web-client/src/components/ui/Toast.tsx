import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'info'
interface Toast { id: number; message: string; description?: string; type: ToastType }

const ToastContext = createContext<{ toast: (message: string, type?: ToastType, description?: string) => void } | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'success', description?: string) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, description, type }])
    window.setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="fixed bottom-4 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {toasts.map(t => (
          <div
            key={t.id}
            className={cn(
              'flex items-start gap-3 rounded-lg border bg-white p-4 shadow-lg',
              t.type === 'success' && 'border-emerald-200',
              t.type === 'error' && 'border-red-200',
              t.type === 'info' && 'border-blue-200'
            )}
          >
            {t.type === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
            ) : t.type === 'error' ? (
              <XCircle className="mt-0.5 h-5 w-5 text-red-600" />
            ) : (
              <Info className="mt-0.5 h-5 w-5 text-blue-600" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900">{t.message}</p>
              {t.description && <p className="mt-0.5 text-sm text-slate-500">{t.description}</p>}
            </div>
            <button
              type="button"
              onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
              className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export const toastColor = (type: ToastType) => cn(type)
