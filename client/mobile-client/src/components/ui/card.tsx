import { StyledView } from './core';
import { cn } from '@/src/lib/utils';

interface CardProps extends React.ComponentPropsWithoutRef<typeof StyledView> {
  elevated?: boolean;
}

export function Card({ className, style, elevated = false, ...props }: CardProps) {
  return (
    <StyledView
      className={cn('rounded-2xl border border-border bg-card p-4', className)}
      style={[
        elevated
          ? {
              shadowColor: '#0f172a',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.06,
              shadowRadius: 12,
              elevation: 2,
            }
          : {
              shadowColor: 'transparent',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0,
              shadowRadius: 0,
              elevation: 0,
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
