import { useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  StyledView,
  StyledText,
  StyledPressable,
} from '@/src/components/ui/core';
import { H2, Muted } from '@/src/components/ui/typography';
import { Card } from '@/src/components/ui/card';
import { Screen } from '@/src/components/layout/screen';
import { LoadingSkeleton } from '@/src/components/layout/loading-skeleton';
import { ErrorState } from '@/src/components/layout/error-state';
import { EmptyState } from '@/src/components/layout/empty-state';
import { AccessLogItem } from '@/src/components/shared/access-log-item';
import { Avatar } from '@/src/components/shared/avatar';
import { StatusPill } from '@/src/components/shared/status-pill';
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
  Car,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  FilePlus2,
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

  const approvedVehicles = vehicles.filter((v) => v.status === 'APPROVED');
  const pendingCount = vehicles.filter(
    (v) => v.status === 'PENDING_VERIFICATION' || v.status === 'PENDING_APPROVAL'
  ).length;
  const unreadCount = notifications.filter((n) => !n.read).length;
  const activePasses = passes.filter((p) => p.status === 'APPROVED' || p.status === 'PENDING').length;
  const primaryVehicle = approvedVehicles[0] ?? vehicles[0];
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <Screen scroll>
      <StyledView className="gap-5 px-5 pt-4">
        <StyledView className="flex-row items-center justify-between">
          <StyledView className="flex-1 pr-3">
            <Muted className="text-sm">Welcome back,</Muted>
            <H2 className="mt-0.5 text-[26px]">{firstName}</H2>
            <Muted className="mt-0.5">Manage your vehicle access with ease</Muted>
          </StyledView>
          <StyledView className="flex-row items-center gap-2">
            <StyledPressable
              onPress={() => router.push('/notifications')}
              className="h-11 w-11 items-center justify-center rounded-full border border-border bg-white"
              accessibilityRole="button"
              accessibilityLabel="Notifications"
            >
              <Bell size={20} color="#134e4a" />
              {unreadCount > 0 ? (
                <StyledView className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-primary" />
              ) : null}
            </StyledPressable>
            <StyledPressable onPress={() => router.push('/profile')} accessibilityRole="button">
              <Avatar name={user?.name ?? 'User'} />
            </StyledPressable>
          </StyledView>
        </StyledView>

        <Card
          className="overflow-hidden border-0 bg-primary p-0"
          style={{
            shadowColor: 'transparent',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0,
            shadowRadius: 0,
            elevation: 0,
          }}
        >
          <StyledView className="p-5">
            <StyledView className="flex-row items-start justify-between">
              <StyledView className="flex-1 pr-3">
                <StyledView className="flex-row items-center gap-2">
                  <StyledView className="h-9 w-9 items-center justify-center rounded-full bg-white/15">
                    <ShieldCheck size={18} color="#ffffff" />
                  </StyledView>
                  <StyledText className="text-sm font-medium text-primary-foreground/90">
                    Vehicle Access
                  </StyledText>
                </StyledView>
                <StyledText className="mt-3 text-2xl font-semibold text-primary-foreground">
                  {approvedVehicles.length > 0 ? 'Access Ready' : 'Setup in Progress'}
                </StyledText>
                <StyledText className="mt-1 text-sm text-primary-foreground/80">
                  {approvedVehicles.length > 0
                    ? `${approvedVehicles.length} approved vehicle${approvedVehicles.length > 1 ? 's' : ''} for gate entry`
                    : 'Register and verify your vehicles to enable gate access'}
                </StyledText>
              </StyledView>
              {primaryVehicle ? <StatusPill status={primaryVehicle.status} /> : null}
            </StyledView>

            {primaryVehicle ? (
              <StyledView className="mt-4 rounded-2xl bg-white/10 p-3.5">
                <StyledText className="text-[13px] font-medium uppercase tracking-wide text-primary-foreground/70">
                  Primary vehicle
                </StyledText>
                <StyledText className="mt-1 text-base font-semibold text-primary-foreground">
                  {primaryVehicle.plateNumber}
                </StyledText>
                <StyledText className="mt-0.5 text-sm text-primary-foreground/80">
                  {primaryVehicle.brand} {primaryVehicle.model} · {primaryVehicle.color}
                </StyledText>
              </StyledView>
            ) : null}

            <StyledView className="mt-4 flex-row gap-3">
              <HeroStat label="Approved" value={approvedVehicles.length} />
              <HeroStat label="Pending" value={pendingCount} />
              <HeroStat label="Active passes" value={activePasses} />
            </StyledView>
          </StyledView>
        </Card>

        {pendingCount > 0 ? (
          <StyledView className="flex-row items-start gap-3 rounded-2xl border border-warning/20 bg-warning/10 p-4">
            <AlertTriangle size={18} color="#b45309" style={{ marginTop: 1 }} />
            <StyledView className="flex-1">
              <StyledText className="text-sm font-semibold text-foreground">
                {pendingCount} vehicle{pendingCount > 1 ? 's' : ''} pending approval
              </StyledText>
              <Muted className="mt-0.5 text-[13px]">We’ll notify you once security reviews your request.</Muted>
            </StyledView>
          </StyledView>
        ) : null}

        <StyledView>
          <StyledView className="mb-3 flex-row items-center justify-between">
            <StyledText className="text-base font-semibold text-foreground">Quick access</StyledText>
            <Muted className="text-[13px]">{vehicles.length} vehicles total</Muted>
          </StyledView>
          <StyledView className="flex-row flex-wrap gap-3">
            <FeatureCard
              icon={<Car size={20} color="#0f766e" />}
              label="My Vehicles"
              value={`${vehicles.length}`}
              subtext={`${approvedVehicles.length} approved`}
              onPress={() => router.push('/vehicles')}
            />
            <FeatureCard
              icon={<Users size={20} color="#0f766e" />}
              label="Visitor Access"
              value={`${passes.length}`}
              subtext={`${activePasses} active`}
              onPress={() => router.push('/visitor')}
            />
            <FeatureCard
              icon={<History size={20} color="#0f766e" />}
              label="Access History"
              value={`${logs.length}`}
              subtext="recent records"
              onPress={() => router.push('/history')}
            />
            <FeatureCard
              icon={<Bell size={20} color="#0f766e" />}
              label="Notifications"
              value={`${unreadCount}`}
              subtext="unread alerts"
              onPress={() => router.push('/notifications')}
            />
          </StyledView>
        </StyledView>

        <StyledView className="flex-row gap-3">
          <CompactAction
            icon={<Plus size={18} color="#0f766e" />}
            label="Register vehicle"
            onPress={() => router.push('/vehicles/new')}
          />
          <CompactAction
            icon={<FilePlus2 size={18} color="#0f766e" />}
            label="New visitor pass"
            onPress={() => router.push('/visitor/new')}
          />
        </StyledView>

        <StyledView>
          <StyledView className="mb-3 flex-row items-center justify-between">
            <StyledText className="text-base font-semibold text-foreground">Recent activity</StyledText>
            <StyledPressable onPress={() => router.push('/history')} className="flex-row items-center gap-1">
              <StyledText className="text-sm font-medium text-primary">See all</StyledText>
              <ChevronRight size={16} color="#0f766e" />
            </StyledPressable>
          </StyledView>
          {logs.length === 0 ? (
            <EmptyState
              icon={<History size={24} color="#5f7a7a" />}
              title="No recent activity"
              description="Vehicle entries and exits will appear here."
            />
          ) : (
            <StyledView className="gap-3">
              {logs.slice(0, 5).map((log) => (
                <Card key={log.id} className="p-4">
                  <AccessLogItem log={log} variant="card" />
                </Card>
              ))}
            </StyledView>
          )}
        </StyledView>
      </StyledView>
    </Screen>
  );
}

function HeroStat({ label, value }: { label: string; value: number }) {
  return (
    <StyledView className="flex-1 rounded-xl bg-white/10 px-3 py-2.5">
      <StyledText className="text-lg font-semibold text-primary-foreground">{value}</StyledText>
      <StyledText className="text-[13px] text-primary-foreground/75">{label}</StyledText>
    </StyledView>
  );
}

function FeatureCard({
  icon,
  label,
  value,
  subtext,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
  onPress: () => void;
}) {
  return (
    <StyledPressable
      onPress={onPress}
      className="min-w-[46%] flex-1"
      accessibilityRole="button"
    >
      <Card className="gap-3 p-4">
        <StyledView className="flex-row items-start justify-between">
          <StyledView className="h-10 w-10 items-center justify-center rounded-xl bg-secondary">
            {icon}
          </StyledView>
          <StyledText className="text-lg font-semibold text-foreground">{value}</StyledText>
        </StyledView>
        <StyledView>
          <StyledText className="text-sm font-semibold text-foreground">{label}</StyledText>
          <StyledText className="mt-0.5 text-[13px] text-muted-foreground">{subtext}</StyledText>
        </StyledView>
      </Card>
    </StyledPressable>
  );
}

function CompactAction({
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
      className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-border bg-white px-3 py-3.5"
      accessibilityRole="button"
    >
      <StyledView className="h-8 w-8 items-center justify-center rounded-full bg-secondary">
        {icon}
      </StyledView>
      <StyledText className="text-sm font-medium text-foreground">{label}</StyledText>
    </StyledPressable>
  );
}
