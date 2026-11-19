import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Dropdown({
  trigger,
  children,
  align = 'end',
  className,
}: {
  trigger: ReactNode
  children: ReactNode
  align?: 'start' | 'center' | 'end'
  className?: string
}) {
  return (
    <DropdownPrimitive.Root>
      <DropdownPrimitive.Trigger asChild>{trigger}</DropdownPrimitive.Trigger>
      <DropdownPrimitive.Portal>
        <DropdownPrimitive.Content
          align={align}
          sideOffset={6}
          className={cn(
            'z-50 min-w-48 rounded-md border border-slate-200 bg-white p-1 shadow-md outline-none',
            className
          )}
        >
          {children}
        </DropdownPrimitive.Content>
      </DropdownPrimitive.Portal>
    </DropdownPrimitive.Root>
  )
}

export function DropdownItem({
  children,
  destructive,
  className,
  ...props
}: DropdownPrimitive.DropdownMenuItemProps & { destructive?: boolean }) {
  return (
    <DropdownPrimitive.Item
      className={cn(
        'flex cursor-pointer select-none items-center gap-2 rounded-sm px-2.5 py-2 text-sm text-slate-700 outline-none transition-colors focus:bg-slate-100 focus:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        destructive && 'text-red-600 focus:bg-red-50 focus:text-red-700',
        className
      )}
      {...props}
    >
      {children}
    </DropdownPrimitive.Item>
  )
}

export function DropdownLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <DropdownPrimitive.Label className={cn('px-2.5 py-1.5 text-xs font-medium text-slate-500', className)}>
      {children}
    </DropdownPrimitive.Label>
  )
}

export function DropdownSeparator({ className }: { className?: string }) {
  return <DropdownPrimitive.Separator className={cn('my-1 h-px bg-slate-100', className)} />
}
