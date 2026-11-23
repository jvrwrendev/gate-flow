import { useCallback } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { StyledView, StyledText } from '@/src/components/ui/core';
import { Button } from '@/src/components/ui/button';
import { H3 } from '@/src/components/ui/typography';
import { Card, CardContent } from '@/src/components/ui/card';
import { Screen } from '@/src/components/layout/screen';
import { ScreenHeader } from '@/src/components/layout/screen-header';
import { LoadingSkeleton } from '@/src/components/layout/loading-skeleton';
import { ErrorState } from '@/src/components/layout/error-state';
import { StatusPill } from '@/src/components/shared/status-pill';
import { useAsyncData } from '@/src/hooks/useAsyncData';
import * as visitorsService from '@/src/services/visitors.mock';
import type { VisitorPass } from '@/src/types';
import { formatDateTime } from '@/src/lib/formatters';
import { Users } from 'lucide-react-native';

export default function VisitorPassDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: pass, loading, error, refetch } = useAsyncData<VisitorPass>({
    fetcher: useCallback(() => visitorsService.getVisitorPass(id), [id]),
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  if (loading || !pass) {
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
      <StyledView className="px-5 pt-4">
        <ScreenHeader title="Visitor pass details" subtitle="Review visitor access information" showBack className="mb-5" />

        <StyledView className="mb-6 items-center">
          <StyledView className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-accent">
            <Users size={36} color="#0B2348" />
          </StyledView>
          <StyledText className="text-center text-2xl font-semibold tracking-tight text-foreground">{pass.visitorName}</StyledText>
          <StyledView className="mt-2">
            <StatusPill status={pass.status} />
          </StyledView>
        </StyledView>

        <Card className="mb-4">
          <CardContent className="gap-3">
            <DetailRow label="Purpose" value={pass.purpose} />
            {pass.visitorPhone ? (
              <DetailRow label="Phone" value={pass.visitorPhone} />
            ) : null}
            {pass.vehiclePlate ? (
              <DetailRow label="Vehicle plate" value={pass.vehiclePlate} />
            ) : null}
            {pass.vehicleType ? (
              <DetailRow label="Vehicle type" value={pass.vehicleType} />
            ) : null}
            <DetailRow label="Start" value={formatDateTime(pass.scheduledStart)} />
            <DetailRow label="End" value={formatDateTime(pass.scheduledEnd)} />
            <DetailRow label="Requested" value={formatDateTime(pass.requestedAt)} />
            {pass.reviewedAt ? (
              <DetailRow label="Reviewed" value={formatDateTime(pass.reviewedAt)} />
            ) : null}
            {pass.notes ? <DetailRow label="Notes" value={pass.notes} /> : null}
          </CardContent>
        </Card>

        <Button variant="outline" onPress={() => router.push('/visitor')}>
          Back to visitor passes
        </Button>
      </StyledView>
    </Screen>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <StyledView className="flex-row justify-between">
      <StyledText className="text-sm text-muted-foreground">{label}</StyledText>
      <StyledText className="max-w-[60%] text-right text-sm font-medium text-foreground">
        {value}
      </StyledText>
    </StyledView>
  );
}
