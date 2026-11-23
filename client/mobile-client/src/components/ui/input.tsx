import * as React from 'react';
import { StyledTextInput, StyledView } from './core';
import { cn } from '@/src/lib/utils';

export interface InputProps
  extends React.ComponentPropsWithoutRef<typeof StyledTextInput> {
  invalid?: boolean;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  containerClassName?: string;
}

export function Input({
  className,
  containerClassName,
  invalid,
  leading,
  trailing,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [focused, setFocused] = React.useState(false);
  const hasAdornment = !!leading || !!trailing;

  const borderClass = invalid ? 'border-destructive' : focused ? 'border-ring' : 'border-input';

  if (hasAdornment) {
    return (
      <StyledView
        className={cn(
          'h-14 flex-row items-center rounded-xl border bg-background px-4',
          borderClass,
          props.editable === false && 'opacity-50',
          containerClassName
        )}
      >
        {leading ? <StyledView className="mr-3">{leading}</StyledView> : null}
        <StyledTextInput
          className={cn(
            'flex-1 py-0 text-[15px] leading-tight text-foreground',
            className
          )}
          placeholderTextColor="#64748B"
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
        {trailing ? <StyledView className="ml-2">{trailing}</StyledView> : null}
      </StyledView>
    );
  }

  return (
    <StyledTextInput
      className={cn(
        'h-14 rounded-xl border bg-background px-4 text-[15px] leading-tight text-foreground',
        'placeholder:text-muted-foreground',
        borderClass,
        props.editable === false && 'opacity-50',
        className
      )}
      placeholderTextColor="#64748B"
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
