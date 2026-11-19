import { StyledText } from './core';
import { cn } from '@/src/lib/utils';

export interface LabelProps extends React.ComponentPropsWithoutRef<typeof StyledText> {}

export function Label({ className, ...props }: LabelProps) {
  return (
    <StyledText
      className={cn('text-sm font-medium text-foreground', className)}
      {...props}
    />
  );
}
