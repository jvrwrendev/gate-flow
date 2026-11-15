import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
export function Dropdown({ trigger, children, align = 'end', className }: { trigger: ReactNode; children: ReactNode; align?: 'start' | 'center' | 'end'; className?: string }) {
  return <DropdownPrimitive.Root><DropdownPrimitive.Trigger asChild>{trigger}</DropdownPrimitive.Trigger><DropdownPrimitive.Portal><DropdownPrimitive.Content align={align} sideOffset={6} className={cn('z-50 min-w-44 rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg outline-none', className)}>{children}</DropdownPrimitive.Content></DropdownPrimitive.Portal></DropdownPrimitive.Root>
}
export function DropdownItem({ children, destructive, ...props }: DropdownPrimitive.DropdownMenuItemProps & { destructive?: boolean }) { return <DropdownPrimitive.Item className={cn('flex cursor-pointer select-none items-center gap-2 rounded-md px-2.5 py-2 text-sm text-slate-700 outline-none hover:bg-slate-50 focus:bg-slate-50', destructive && 'text-red-600 hover:bg-red-50 focus:bg-red-50')} {...props}>{children}</DropdownPrimitive.Item> }
export function DropdownLabel({ children }: { children: ReactNode }) { return <DropdownPrimitive.Label className="px-2.5 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{children}</DropdownPrimitive.Label> }
export const DropdownSeparator = () => <DropdownPrimitive.Separator className="my-1.5 h-px bg-slate-100" />
