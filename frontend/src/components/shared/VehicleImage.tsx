import { cn } from '@/lib/utils'
const palettes = ['#dbeafe,#2563eb', '#fee2e2,#dc2626', '#dcfce7,#16a34a', '#f3f4f6,#4b5563', '#fef3c7,#d97706', '#e9d5ff,#9333ea']
export function VehicleImage({ type, color, className }: { type?: string; color?: string; className?: string }) {
  const [bg, stroke] = palettes[(type?.length || 1) % palettes.length].split(',')
  return <div className={cn('relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100', className)} style={{ backgroundColor: bg }}>
    <svg viewBox="0 0 120 72" className="h-full w-full" aria-hidden="true"><path d="M10 48h100l-3 6H13z" fill="#111827" opacity=".12" /><path d="M18 46c0-12 10-20 24-20h36c14 0 24 8 24 20Z" fill={stroke} opacity=".9" /><rect x="34" y="28" width="52" height="18" rx="6" fill="#ffffff" opacity=".7" /><circle cx="36" cy="46" r="8" fill="#111827" opacity=".7" /><circle cx="84" cy="46" r="8" fill="#111827" opacity=".7" /><circle cx="36" cy="46" r="4" fill="#ffffff" /><circle cx="84" cy="46" r="4" fill="#ffffff" /></svg>
    <span className="absolute bottom-1 right-1 rounded bg-white/80 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600">{color || type || 'Vehicle'}</span>
  </div>
}
export function CameraPlaceholder({ title, online, className }: { title: string; online: boolean; className?: string }) {
  return <div className={cn('relative overflow-hidden rounded-xl border border-slate-300 bg-slate-900 text-white', className || 'aspect-video')}><div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(148,163,184,.06)_1px,transparent_1px)] bg-[length:40px_40px]" /><div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center"><div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-600 bg-slate-800/80"><span className="h-2 w-2 rounded-full bg-emerald-400" /></div><p className="text-sm font-semibold">{title}</p><p className="max-w-xs text-xs text-slate-300">Simulated surveillance preview. No live camera stream is connected.</p></div><div className="absolute left-3 top-3 flex items-center gap-2 px-2 py-1 text-[11px] text-white"><span className={`h-2 w-2 rounded-full ${online ? 'bg-emerald-400' : 'bg-red-500'}`} />{online ? 'LIVE GATE' : 'OFFLINE'}</div><div className="absolute bottom-3 right-3 rounded-md bg-black/50 px-2 py-1 text-[11px] text-slate-300">Asia/Manila</div></div>
}
