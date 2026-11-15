import * as SwitchPrimitive from '@radix-ui/react-switch'
export function Switch({ checked, onCheckedChange, label }: { checked: boolean; onCheckedChange: (checked: boolean) => void; label: string }) {
  return <SwitchPrimitive.Root checked={checked} onCheckedChange={onCheckedChange} aria-label={label} className="relative h-5 w-9 shrink-0 cursor-pointer rounded-full bg-slate-300 transition-colors data-[state=checked]:bg-blue-600"><SwitchPrimitive.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-[18px]" /></SwitchPrimitive.Root>
}
