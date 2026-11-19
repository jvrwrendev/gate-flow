import { StyledTextInput } from './core';
import { cn } from '@/src/lib/utils';

export interface InputProps
  extends React.ComponentPropsWithoutRef<typeof StyledTextInput> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <StyledTextInput
      className={cn(
        'h-11 rounded-md border border-input bg-background px-3 text-sm text-foreground',
        'placeholder:text-muted-foreground',
        props.editable === false && 'opacity-50',
        className
      )}
      placeholderTextColor="#737373"
      {...props}
    />
  );
}
