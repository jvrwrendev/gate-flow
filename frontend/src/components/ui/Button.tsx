import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva('inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50', {
  variants: {
    variant: {
      default: 'bg-blue-600 text-white hover:bg-blue-700',
      destructive: 'bg-red-600 text-white hover:bg-red-700',
      outline: 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
      secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
      ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
      success: 'bg-emerald-600 text-white hover:bg-emerald-700',
      link: 'p-0 text-blue-600 hover:text-blue-700 hover:underline',
    },
    size: { default: 'h-10 px-4', sm: 'h-9 rounded-md px-3 text-xs', lg: 'h-11 px-5', icon: 'h-9 w-9 p-0' },
  }, defaultVariants: { variant: 'default', size: 'default' },
})
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { loading?: boolean }
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, loading, children, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} disabled={loading || props.disabled} {...props}>
    {loading && <Loader2 className="h-4 w-4 animate-spin" />}{children}
  </button>
))
Button.displayName = 'Button'
