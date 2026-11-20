import { cva, type VariantProps } from 'class-variance-authority';
import { StyledPressable, StyledText, StyledActivityIndicator } from './core';
import { cn } from '@/src/lib/utils';

const buttonVariants = cva(
  'inline-flex flex-row items-center justify-center rounded-xl font-medium active:opacity-90',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        secondary: 'bg-secondary',
        outline: 'border border-border bg-background',
        ghost: 'bg-transparent',
        destructive: 'bg-destructive',
        link: 'bg-transparent underline-offset-4 underline',
      },
      size: {
        default: 'h-11 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-12 px-5',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const buttonTextVariants = cva('font-medium', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      secondary: 'text-secondary-foreground',
      outline: 'text-foreground',
      ghost: 'text-foreground',
      destructive: 'text-destructive-foreground',
      link: 'text-primary underline',
    },
    size: {
      default: 'text-sm',
      sm: 'text-xs',
      lg: 'text-base',
      icon: 'text-sm',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

export interface ButtonProps
  extends React.ComponentPropsWithoutRef<typeof StyledPressable>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export function Button({
  className,
  variant = 'default',
  size = 'default',
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <StyledPressable
      className={cn(buttonVariants({ variant, size }), isDisabled && 'opacity-50', className)}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <StyledActivityIndicator
          className={cn(buttonTextVariants({ variant, size }), 'opacity-100')}
          size="small"
        />
      ) : typeof children === 'string' ? (
        <StyledText className={cn(buttonTextVariants({ variant, size }))}>{children}</StyledText>
      ) : (
        children
      )}
    </StyledPressable>
  );
}
