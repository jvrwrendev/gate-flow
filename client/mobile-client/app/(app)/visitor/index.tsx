import { useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { StyledView, StyledText, StyledPressable } from '@/src/components/ui/core';
import { Button } from '@/src/components/ui/button';
import { H2 } from '@/src/components/ui/typography';
import { Card, CardContent } from '@/src/components/ui/card';
import { Screen } from '@/src/components/layout/screen';
import { LoadingSkeleton } from '@/src/components/layout/loading-skeleton';
import { ErrorState } from '@/src/components/layout/error-state';
import { EmptyState } from '@/src/components/layout/empty-state';
import { StatusPill } from '@/src/components/shared/status-pill';
import { useAuth } from '@/src/context/AuthContext';
import { useAsyncData } from '@/src/hooks/useAsyncData';
import * as visitorsService from '@/src/services/visitors.mock';
import type { VisitorPass } from '@/src/types';
import { formatDateTime } from '@/src/lib/formatters';
import { Plus, Users, ChevronRight } from 'lucide-react-native';

export default function VisitorPassesScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const { data: passes, loading, error, refetch } = useAsyncData<VisitorPass[]>({
    fetcher: useCallback(() => visitorsService.listVisitorPasses(user!.id), [user]),
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  if (loading && !passes) {
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

  const list = passes ?? [];

  return (
    <Screen scroll>
      <StyledView className="gap-4 px-4 pt-6">
        <StyledView className="flex-row items-center justify-between">
          <H2>Visitor Access</H2>
          <Button size="sm" onPress={() => router.push('/visitor/new')}>
            <Plus size={16} color="#ffffff" />
            <StyledText className="ml-1 text-sm font-medium text-primary-foreground">
              New
            </StyledText>
          </Button>
        </StyledView>

        {list.length === 0 ? (
          <EmptyState
            icon={<Users size={24} color="#737373" />}
            title="No visitor passes"
            description="Request a temporary pass for guests and deliveries."
            actionLabel="Request pass"
            onAction={() => router.push('/visitor/new')}
          />
        ) : (
          <StyledView>
            {list.map((pass) => (
              <Card key={pass.id} className="mb-3 p-0">
                <StyledPressable onPress={() => router.push(`/visitor/${pass.id}`)}>
                  <CardContent className="flex-row items-center justify-between p-4">
                    <StyledView className="flex-1 gap-1">
                      <StyledView className="flex-row flex-wrap items-center gap-2">
                        <StyledText className="text-base font-semibold text-foreground">
                          {pass.visitorName}
                        </StyledText>
                        <StatusPill status={pass.status} />
                      </StyledView>
                      <StyledText className="text-sm text-muted-foreground">
                        {pass.purpose}
                      </StyledText>
                      <StyledText className="text-xs text-muted-foreground">
                        {formatDateTime(pass.scheduledStart)} –{' '}
                        {formatDateTime(pass.scheduledEnd)}
                      </StyledText>
                    </StyledView>
                    <ChevronRight size={20} color="#737373" />
                  </CardContent>
                </StyledPressable>
              </Card>
            ))}
          </StyledView>
        )}
      </StyledView>
    </Screen>
  );
}
