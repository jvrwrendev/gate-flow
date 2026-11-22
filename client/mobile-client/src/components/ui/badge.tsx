import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { StyledText, StyledView } from './core';
import { cn } from '@/src/lib/utils';

const badgeVariants = cva('rounded-full px-2.5 py-0.5 border', {
  variants: {
    variant: {
      default: 'border-transparent bg-primary text-primary-foreground',
      secondary: 'border-transparent bg-secondary text-secondary-foreground',
      outline: 'border-border text-foreground',
      destructive: 'border-transparent bg-destructive text-destructive-foreground',
      success: 'border-transparent bg-success text-success-foreground',
      warning: 'border-transparent bg-warning text-warning-foreground',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  className?: string;
}

function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <StyledView className={cn(badgeVariants({ variant }), className)}>
      <StyledText className="text-[13px] font-medium">{children}</StyledText>
    </StyledView>
  );
}

export { Badge, badgeVariants };
