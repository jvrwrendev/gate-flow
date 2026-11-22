import { useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { StyledView, StyledText } from '@/src/components/ui/core';
import { Button } from '@/src/components/ui/button';
import { Screen } from '@/src/components/layout/screen';
import { ScreenHeader } from '@/src/components/layout/screen-header';
import { LoadingSkeleton } from '@/src/components/layout/loading-skeleton';
import { ErrorState } from '@/src/components/layout/error-state';
import { EmptyState } from '@/src/components/layout/empty-state';
import { VehicleCard } from '@/src/components/shared/vehicle-card';
import { useAuth } from '@/src/context/AuthContext';
import { useAsyncData } from '@/src/hooks/useAsyncData';
import * as vehiclesService from '@/src/services/vehicles.mock';
import type { Vehicle } from '@/src/types';
import { Plus, Car } from 'lucide-react-native';

export default function VehiclesScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const { data: vehicles, loading, error, refetch } = useAsyncData<Vehicle[]>({
    fetcher: useCallback(() => vehiclesService.listVehicles(user!.id), [user]),
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  if (loading && !vehicles) {
    return (
      <Screen>
        <LoadingSkeleton count={4} />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <ErrorState onRetry={refetch} />
      </Screen>
    );
  }

  const list = vehicles ?? [];

  return (
    <Screen scroll>
      <StyledView className="gap-5 px-5 pt-4">
        <ScreenHeader
          title="My Vehicles"
          subtitle="Register and manage vehicles for gate access"
          rightAction={
            <Button size="sm" onPress={() => router.push('/vehicles/new')}>
              <Plus size={16} color="#ffffff" />
              <StyledText className="ml-1 text-sm font-medium text-primary-foreground">Add</StyledText>
            </Button>
          }
        />

        {list.length === 0 ? (
          <EmptyState
            icon={<Car size={24} color="#5f7a7a" />}
            title="No vehicles yet"
            description="Register your vehicle to start using gate access."
            actionLabel="Register vehicle"
            onAction={() => router.push('/vehicles/new')}
          />
        ) : (
          <StyledView>
            {list.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onPress={() => router.push(`/vehicles/${vehicle.id}`)}
              />
            ))}
          </StyledView>
        )}
      </StyledView>
    </Screen>
  );
}
