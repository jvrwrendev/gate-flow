import { StyledView } from './core';
import { cn } from '@/src/lib/utils';

interface CardProps extends React.ComponentPropsWithoutRef<typeof StyledView> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <StyledView
      className={cn('rounded-xl border border-border bg-background p-4', className)}
      {...props}
    />
  );
}

interface CardContentProps extends React.ComponentPropsWithoutRef<typeof StyledView> {}

export function CardContent({ className, ...props }: CardContentProps) {
  return <StyledView className={cn('', className)} {...props} />;
}
