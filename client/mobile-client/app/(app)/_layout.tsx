import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { StyledView, StyledActivityIndicator } from '@/src/components/ui/core';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, segments, router]);

  if (isLoading) {
    return (
      <StyledView className="flex-1 items-center justify-center bg-background">
        <StyledActivityIndicator size="large" color="#0B2348" />
      </StyledView>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="visitor" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
