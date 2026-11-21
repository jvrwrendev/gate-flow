import { Redirect } from 'expo-router';
import { StyledView, StyledActivityIndicator } from '@/src/components/ui/core';
import { useAuth } from '@/src/context/AuthContext';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <StyledView className="flex-1 items-center justify-center bg-background">
        <StyledActivityIndicator size="large" color="#0f766e" />
      </StyledView>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
