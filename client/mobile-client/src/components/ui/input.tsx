import * as React from 'react';
import { StyledTextInput } from './core';
import { cn } from '@/src/lib/utils';

export interface InputProps
  extends React.ComponentPropsWithoutRef<typeof StyledTextInput> {
  invalid?: boolean;
}

export function Input({ className, invalid, onFocus, onBlur, ...props }: InputProps) {
  const [focused, setFocused] = React.useState(false);

  return (
    <StyledTextInput
      className={cn(
        'h-11 rounded-md border bg-background px-3.5 text-[15px] leading-tight text-foreground',
        'placeholder:text-muted-foreground',
        invalid ? 'border-destructive' : focused ? 'border-ring' : 'border-input',
        props.editable === false && 'opacity-50',
        className
      )}
      placeholderTextColor="#737373"
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      {...props}
    />
  );
}
