import { StyledView } from './core';
import { cn } from '@/src/lib/utils';

interface SeparatorProps extends React.ComponentPropsWithoutRef<typeof StyledView> {
  orientation?: 'horizontal' | 'vertical';
}

export function Separator({ className, orientation = 'horizontal', ...props }: SeparatorProps) {
  return (
    <StyledView
      className={cn(
        'bg-border shrink-0',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className
      )}
      {...props}
    />
  );
}
