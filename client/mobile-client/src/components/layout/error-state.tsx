import * as React from 'react';
import { StyledView, StyledText } from '@/src/components/ui/core';
import { Button } from '@/src/components/ui/button';
import { AlertCircle } from 'lucide-react-native';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load the requested information. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <StyledView className="flex-1 items-center justify-center px-8 py-12">
      <AlertCircle size={32} color="#737373" />
      <StyledText className="mt-4 text-center text-base font-semibold text-foreground">
        {title}
      </StyledText>
      <StyledText className="mt-2 text-center text-sm text-muted-foreground">
        {message}
      </StyledText>
      {onRetry ? (
        <Button className="mt-6" variant="outline" onPress={onRetry}>
          Try again
        </Button>
      ) : null}
    </StyledView>
  );
}
