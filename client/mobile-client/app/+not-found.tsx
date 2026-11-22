import { Link, Stack } from 'expo-router';
import { StyledView, StyledText } from '@/src/components/ui/core';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <StyledView className="flex-1 items-center justify-center bg-background px-6">
        <StyledText className="mb-2 text-lg font-semibold text-foreground">Screen not found</StyledText>
        <Link href="/" className="text-sm font-medium text-primary">
          Go home
        </Link>
      </StyledView>
    </>
  );
}
