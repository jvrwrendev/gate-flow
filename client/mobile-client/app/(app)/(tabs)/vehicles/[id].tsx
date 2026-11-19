import { useCallback } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { StyledView, StyledText, StyledScrollView, StyledPressable } from '@/src/components/ui/core';
import { H2, H3, Muted } from '@/src/components/ui/typography';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Screen } from '@/src/components/layout/screen';
import { LoadingSkeleton } from '@/src/components/layout/loading-skeleton';
import { ErrorState } from '@/src/components/layout/error-state';
import { StatusPill } from '@/src/components/shared/status-pill';
import { ApprovalTimeline } from '@/src/components/shared/approval-timeline';
import { AvatarPlaceholder } from '@/src/components/shared/avatar';
import { useAsyncData } from '@/src/hooks/useAsyncData';
import * as vehiclesService from '@/src/services/vehicles.mock';
import type { Vehicle } from '@/src/types';
import { formatDate } from '@/src/lib/formatters';
import { ChevronLeft, Car } from 'lucide-react-native';

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: vehicle, loading, error, refetch } = useAsyncData<Vehicle>({
    fetcher: useCallback(() => vehiclesService.getVehicle(id), [id]),
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  if (loading || !vehicle) {
    return (
      <Screen>
        <LoadingSkeleton count={3} />
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

  return (
    <Screen scroll>
      <StyledView className="px-4 pt-6">
        <StyledPressable
          onPress={() => router.back()}
          className="mb-4 flex-row items-center gap-1 self-start"
        >
          <ChevronLeft size={20} color="#111827" />
          <StyledText className="text-sm font-medium text-foreground">Back</StyledText>
        </StyledPressable>

        <StyledView className="mb-6 items-center">
          {vehicle.photoUrl ? (
            <StyledView className="mb-4 h-32 w-32 items-center justify-center rounded-2xl bg-muted">
              <Car size={48} color="#737373" />
            </StyledView>
          ) : (
            <AvatarPlaceholder size="lg" className="mb-4" />
          )}
          <H2 className="text-center">{vehicle.plateNumber}</H2>
          <StyledView className="mt-2">
            <StatusPill status={vehicle.status} />
          </StyledView>
        </StyledView>

        <Card className="mb-4">
          <CardContent className="gap-3">
            <DetailRow label="Type" value={vehicle.type} />
            <DetailRow label="Brand" value={vehicle.brand} />
            <DetailRow label="Model" value={vehicle.model} />
            <DetailRow label="Color" value={vehicle.color} />
            <DetailRow label="Submitted" value={formatDate(vehicle.submittedAt)} />
            {vehicle.reviewedAt ? (
              <DetailRow label="Reviewed" value={formatDate(vehicle.reviewedAt)} />
            ) : null}
          </CardContent>
        </Card>

        <StyledView className="mt-2">
          <H3 className="mb-3">Approval status</H3>
          <Card>
            <CardContent>
              <ApprovalTimeline vehicle={vehicle} />
            </CardContent>
          </Card>
        </StyledView>

        <Button
          variant="outline"
          className="mt-6"
          onPress={() => router.push('/vehicles')}
        >
          Back to vehicles
        </Button>
      </StyledView>
    </Screen>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <StyledView className="flex-row justify-between">
      <Muted>{label}</Muted>
      <StyledText className="text-sm font-medium text-foreground">{value}</StyledText>
    </StyledView>
  );
}
