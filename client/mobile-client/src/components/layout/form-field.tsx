import * as React from 'react';
import { StyledView, StyledText } from '@/src/components/ui/core';
import { Label } from '@/src/components/ui/label';
import { cn } from '@/src/lib/utils';

interface FormFieldProps {
  label?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, error, children, className }: FormFieldProps) {
  return (
    <StyledView className={cn('gap-1.5', className)}>
      {label ? <Label>{label}</Label> : null}
      {children}
      {error ? <StyledText className="text-[13px] text-destructive">{error}</StyledText> : null}
    </StyledView>
  );
}
