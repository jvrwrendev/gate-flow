import * as React from 'react';
import { Modal } from 'react-native';
import { StyledView, StyledText, StyledPressable } from './core';
import { Button } from './button';
import { cn } from '@/src/lib/utils';
import { ChevronDown, Check } from 'lucide-react-native';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  value?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  error?: string;
}

export function Select({
  label,
  placeholder = 'Select an option',
  value,
  options,
  onChange,
  error,
}: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <>
      {label ? (
        <StyledText className="mb-1.5 text-sm font-medium text-foreground">{label}</StyledText>
      ) : null}
      <StyledPressable
        onPress={() => setOpen(true)}
        className={cn(
          'h-14 flex-row items-center justify-between rounded-xl border border-input bg-background px-4',
          error ? 'border-destructive' : ''
        )}
      >
        <StyledText
          className={cn('text-[15px]', selected ? 'text-foreground' : 'text-muted-foreground')}
        >
          {selected?.label ?? placeholder}
        </StyledText>
        <ChevronDown size={16} color="#737373" />
      </StyledPressable>
      {error ? <StyledText className="mt-1 text-[13px] text-destructive">{error}</StyledText> : null}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <StyledView className="flex-1 justify-end bg-black/40">
          <StyledView className="rounded-t-2xl bg-background p-4 pb-8">
            <StyledView className="mb-3 flex-row items-center justify-between">
              <StyledText className="text-base font-semibold text-foreground">
                {label ?? 'Select'}
              </StyledText>
              <Button variant="ghost" size="sm" onPress={() => setOpen(false)}>
                Close
              </Button>
            </StyledView>
            {options.map((option) => (
              <StyledPressable
                key={option.value}
                onPress={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className="flex-row items-center justify-between border-b border-border py-3 last:border-b-0"
              >
                <StyledText className="text-sm text-foreground">{option.label}</StyledText>
                {value === option.value ? <Check size={18} color="#111827" /> : null}
              </StyledPressable>
            ))}
          </StyledView>
        </StyledView>
      </Modal>
    </>
  );
}
