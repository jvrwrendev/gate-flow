import { StyledView } from './core';
import { cn } from '@/src/lib/utils';

interface CardProps extends React.ComponentPropsWithoutRef<typeof StyledView> {}

export function Card({ className, style, ...props }: CardProps) {
  return (
    <StyledView
      className={cn('rounded-2xl border border-border bg-card p-4', className)}
      style={[
        {
          shadowColor: '#0f172a',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 2,
        },
        style,
      ]}
      {...props}
    />
  );
}

interface CardContentProps extends React.ComponentPropsWithoutRef<typeof StyledView> {}

export function CardContent({ className, ...props }: CardContentProps) {
  return <StyledView className={cn('', className)} {...props} />;
}
