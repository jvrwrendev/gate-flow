import * as React from 'react';
import { StyledView, StyledText } from '@/src/components/ui/core';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <StyledView className={cn('flex-1 items-center justify-center px-8 py-12', className)}>
      {icon && (
        <StyledView className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-muted">
          {icon}
        </StyledView>
      )}
      <StyledText className="text-center text-base font-semibold text-foreground">
        {title}
      </StyledText>
      {description ? (
        <StyledText className="mt-2 text-center text-sm text-muted-foreground">
          {description}
        </StyledText>
      ) : null}
      {actionLabel && onAction ? (
        <Button className="mt-6" onPress={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </StyledView>
  );
}
