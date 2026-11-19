import { useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  StyledView,
  StyledText,
  StyledScrollView,
  StyledPressable,
} from '@/src/components/ui/core';
import { Button } from '@/src/components/ui/button';
import { H2, Muted } from '@/src/components/ui/typography';
import { Screen } from '@/src/components/layout/screen';
import { LoadingSkeleton } from '@/src/components/layout/loading-skeleton';
import { ErrorState } from '@/src/components/layout/error-state';
import { EmptyState } from '@/src/components/layout/empty-state';
import { StatCard } from '@/src/components/shared/stat-card';
import { AccessLogItem } from '@/src/components/shared/access-log-item';
import { Avatar } from '@/src/components/shared/avatar';
import { useAuth } from '@/src/context/AuthContext';
import { useAsyncData } from '@/src/hooks/useAsyncData';
import * as vehiclesService from '@/src/services/vehicles.mock';
import * as historyService from '@/src/services/history.mock';
import * as notificationsService from '@/src/services/notifications.mock';
import * as visitorsService from '@/src/services/visitors.mock';
import type { Vehicle, AccessLog, Notification, VisitorPass } from '@/src/types';
import {
  Plus,
  Users,
  Bell,
  History,
  Shield,
  Car,
  AlertTriangle,
} from 'lucide-react-native';

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const vehiclesQuery = useAsyncData<Vehicle[]>({
    fetcher: useCallback(() => vehiclesService.listVehicles(user!.id), [user]),
  });
  const historyQuery = useAsyncData<AccessLog[]>({
    fetcher: useCallback(() => historyService.listAccessHistory(user!.id), [user]),
  });
  const notificationsQuery = useAsyncData<Notification[]>({
    fetcher: useCallback(() => notificationsService.listNotifications(user!.id), [user]),
  });
  const visitorsQuery = useAsyncData<VisitorPass[]>({
    fetcher: useCallback(() => visitorsService.listVisitorPasses(user!.id), [user]),
  });

  useFocusEffect(
    useCallback(() => {
      vehiclesQuery.refetch();
      historyQuery.refetch();
      notificationsQuery.refetch();
      visitorsQuery.refetch();
    }, [])
  );

  const loading =
    vehiclesQuery.loading || historyQuery.loading || notificationsQuery.loading || visitorsQuery.loading;
  const hasError =
    vehiclesQuery.error || historyQuery.error || notificationsQuery.error || visitorsQuery.error;

  if (loading && !vehiclesQuery.data) {
    return (
      <Screen>
        <LoadingSkeleton count={4} />
      </Screen>
    );
  }

  if (hasError) {
    return (
      <Screen>
        <ErrorState
          onRetry={() => {
            vehiclesQuery.refetch();
            historyQuery.refetch();
            notificationsQuery.refetch();
            visitorsQuery.refetch();
          }}
        />
      </Screen>
    );
  }

  const vehicles = vehiclesQuery.data ?? [];
  const logs = historyQuery.data ?? [];
  const notifications = notificationsQuery.data ?? [];
  const passes = visitorsQuery.data ?? [];

  const approvedCount = vehicles.filter((v) => v.status === 'APPROVED').length;
  const pendingCount = vehicles.filter(
    (v) => v.status === 'PENDING_VERIFICATION' || v.status === 'PENDING_APPROVAL'
  ).length;
  const unreadCount = notifications.filter((n) => !n.read).length;
  const activePasses = passes.filter(
    (p) => p.status === 'APPROVED' || p.status === 'PENDING'
  ).length;

  return (
    <Screen scroll>
      <StyledView className="gap-6 px-4 pt-6">
        <StyledView className="flex-row items-center justify-between">
          <StyledView className="flex-1">
            <Muted>Good day,</Muted>
            <H2 className="mt-0.5">{user?.name}</H2>
          </StyledView>
          <Avatar name={user?.name ?? 'User'} />
        </StyledView>

        <StyledView className="flex-row flex-wrap gap-3">
          <StatCard label="Registered" value={vehicles.length} subtext={`${approvedCount} approved`} />
          <StatCard label="Pending" value={pendingCount} subtext="awaiting action" />
          <StatCard label="Unread alerts" value={unreadCount} />
          <StatCard label="Active passes" value={activePasses} />
        </StyledView>

        {pendingCount > 0 ? (
          <StyledView className="rounded-xl border border-warning bg-warning/10 p-4">
            <StyledView className="flex-row items-center gap-2">
              <AlertTriangle size={18} color="#f59e0b" />
              <StyledText className="text-sm font-semibold text-foreground">
                {pendingCount} vehicle{pendingCount > 1 ? 's' : ''} pending approval
              </StyledText>
            </StyledView>
            <Muted className="mt-1">We’ll notify you once security reviews your request.</Muted>
          </StyledView>
        ) : null}

        <StyledView>
          <StyledText className="mb-3 text-base font-semibold text-foreground">
            Quick actions
          </StyledText>
          <StyledView className="flex-row flex-wrap gap-3">
            <QuickAction
              icon={<Plus size={20} color="#111827" />}
              label="Add vehicle"
              onPress={() => router.push('/vehicles/new')}
            />
            <QuickAction
              icon={<Users size={20} color="#111827" />}
              label="Visitor pass"
              onPress={() => router.push('/visitor/new')}
            />
            <QuickAction
              icon={<History size={20} color="#111827" />}
              label="History"
              onPress={() => router.push('/history')}
            />
            <QuickAction
              icon={<Bell size={20} color="#111827" />}
              label="Notifications"
              onPress={() => router.push('/notifications')}
            />
          </StyledView>
        </StyledView>

        <StyledView>
          <StyledView className="mb-3 flex-row items-center justify-between">
            <StyledText className="text-base font-semibold text-foreground">
              Recent activity
            </StyledText>
            <StyledPressable onPress={() => router.push('/history')}>
              <StyledText className="text-sm text-primary">See all</StyledText>
            </StyledPressable>
          </StyledView>
          {logs.length === 0 ? (
            <EmptyState
              icon={<History size={24} color="#737373" />}
              title="No recent activity"
              description="Vehicle entries and exits will appear here."
            />
          ) : (
            <StyledView className="rounded-xl border border-border bg-background p-4">
              {logs.slice(0, 5).map((log) => (
                <AccessLogItem key={log.id} log={log} />
              ))}
            </StyledView>
          )}
        </StyledView>
      </StyledView>
    </Screen>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <StyledPressable
      onPress={onPress}
      className="flex-1 min-w-[45%] items-center gap-2 rounded-xl border border-border bg-background p-4 active:bg-muted"
    >
      <StyledView className="rounded-full bg-secondary p-2">{icon}</StyledView>
      <StyledText className="text-sm font-medium text-foreground">{label}</StyledText>
    </StyledPressable>
  );
}
