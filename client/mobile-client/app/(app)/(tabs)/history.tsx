import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { StyledView, StyledText, StyledScrollView, StyledPressable } from '@/src/components/ui/core';
import { H2 } from '@/src/components/ui/typography';
import { Screen } from '@/src/components/layout/screen';
import { LoadingSkeleton } from '@/src/components/layout/loading-skeleton';
import { ErrorState } from '@/src/components/layout/error-state';
import { EmptyState } from '@/src/components/layout/empty-state';
import { AccessLogItem } from '@/src/components/shared/access-log-item';
import { useAuth } from '@/src/context/AuthContext';
import { useAsyncData } from '@/src/hooks/useAsyncData';
import * as historyService from '@/src/services/history.mock';
import type { AccessLog, AccessDirection } from '@/src/types';
import { History } from 'lucide-react-native';

const filters: { label: string; value: 'ALL' | AccessDirection }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Entries', value: 'ENTRY' },
  { label: 'Exits', value: 'EXIT' },
];

export default function HistoryScreen() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'ALL' | AccessDirection>('ALL');

  const { data: logs, loading, error, refetch } = useAsyncData<AccessLog[]>({
    fetcher: useCallback(() => historyService.listAccessHistory(user!.id), [user]),
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  if (loading && !logs) {
    return (
      <Screen>
        <LoadingSkeleton count={5} />
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

  const allLogs = logs ?? [];
  const filtered =
    filter === 'ALL' ? allLogs : allLogs.filter((log) => log.direction === filter);

  return (
    <Screen scroll>
      <StyledView className="gap-4 px-4 pt-6">
        <H2>Access History</H2>

        <StyledView className="flex-row gap-2">
          {filters.map((f) => {
            const active = filter === f.value;
            return (
              <StyledPressable
                key={f.value}
                onPress={() => setFilter(f.value)}
                className={`rounded-full border px-4 py-2 ${
                  active
                    ? 'border-primary bg-primary'
                    : 'border-border bg-background'
                }`}
              >
                <StyledText
                  className={`text-sm font-medium ${
                    active ? 'text-primary-foreground' : 'text-foreground'
                  }`}
                >
                  {f.label}
                </StyledText>
              </StyledPressable>
            );
          })}
        </StyledView>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<History size={24} color="#737373" />}
            title="No records found"
            description="Access activity matching this filter will appear here."
          />
        ) : (
          <StyledView className="rounded-xl border border-border bg-background p-4">
            {filtered.map((log) => (
              <AccessLogItem key={log.id} log={log} />
            ))}
          </StyledView>
        )}
      </StyledView>
    </Screen>
  );
}
