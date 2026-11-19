import * as React from 'react';
import { StyledView } from '@/src/components/ui/core';
import { cn } from '@/src/lib/utils';

interface LoadingSkeletonProps {
  count?: number;
  className?: string;
}

export function LoadingSkeleton({ count = 3, className }: LoadingSkeletonProps) {
  return (
    <StyledView className={cn('gap-4 p-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <StyledView
          key={i}
          className="h-24 rounded-xl border border-border bg-muted"
        />
      ))}
    </StyledView>
  );
}
