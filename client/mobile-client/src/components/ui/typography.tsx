import { StyledText } from './core';
import { cn } from '@/src/lib/utils';

interface TypographyProps extends React.ComponentPropsWithoutRef<typeof StyledText> {}

export function H1({ className, ...props }: TypographyProps) {
  return (
    <StyledText
      className={cn('text-3xl font-semibold tracking-tight text-foreground', className)}
      {...props}
    />
  );
}

export function H2({ className, ...props }: TypographyProps) {
  return (
    <StyledText
      className={cn('text-2xl font-semibold tracking-tight text-foreground', className)}
      {...props}
    />
  );
}

export function H3({ className, ...props }: TypographyProps) {
  return (
    <StyledText
      className={cn('text-lg font-semibold text-foreground', className)}
      {...props}
    />
  );
}

export function Muted({ className, ...props }: TypographyProps) {
  return (
    <StyledText
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export function Paragraph({ className, ...props }: TypographyProps) {
  return (
    <StyledText
      className={cn('text-sm leading-relaxed text-foreground', className)}
      {...props}
    />
  );
}
