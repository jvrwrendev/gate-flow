import { AlertTriangle } from 'lucide-react'
import { Dialog, DialogContent, DialogFooter } from './Dialog'
import { Button } from './Button'
export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = 'Confirm', destructive, onConfirm }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description: string; confirmLabel?: string; destructive?: boolean; onConfirm: () => void }) {
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent title={title}><div className="flex gap-3 px-6 py-5"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${destructive ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}><AlertTriangle className="h-5 w-5" /></div><p className="pt-1 text-sm leading-6 text-slate-600">{description}</p></div><DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button variant={destructive ? 'destructive' : 'default'} onClick={() => { onConfirm(); onOpenChange(false) }}>{confirmLabel}</Button></DialogFooter></DialogContent></Dialog>
}
