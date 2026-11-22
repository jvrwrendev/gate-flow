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
        default: 'h-14 px-5',
        sm: 'h-14 px-4',
        lg: 'h-14 px-6',
        icon: 'h-14 w-14',
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
      default: 'text-[15px]',
      sm: 'text-[15px]',
      lg: 'text-[15px]',
      icon: 'text-[15px]',
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
