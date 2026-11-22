import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { StyledView, StyledActivityIndicator } from '@/src/components/ui/core';
import { useAuth } from '@/src/context/AuthContext';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    router.replace(isAuthenticated ? '/(app)/(tabs)' : '/(auth)/welcome');
  }, [isAuthenticated, isLoading, router]);

  return (
    <StyledView className="flex-1 items-center justify-center bg-background">
      <StyledActivityIndicator size="large" color="#0f766e" />
    </StyledView>
  );
}
