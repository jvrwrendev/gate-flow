import { useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { StyledView, StyledText } from '@/src/components/ui/core';
import { Button } from '@/src/components/ui/button';
import { H2 } from '@/src/components/ui/typography';
import { Screen } from '@/src/components/layout/screen';
import { LoadingSkeleton } from '@/src/components/layout/loading-skeleton';
import { ErrorState } from '@/src/components/layout/error-state';
import { EmptyState } from '@/src/components/layout/empty-state';
import { NotificationItem } from '@/src/components/shared/notification-item';
import { useAuth } from '@/src/context/AuthContext';
import { useAsyncData } from '@/src/hooks/useAsyncData';
import * as notificationsService from '@/src/services/notifications.mock';
import type { Notification } from '@/src/types';
import { Bell } from 'lucide-react-native';

export default function NotificationsScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const {
    data: notifications,
    loading,
    error,
    refetch,
  } = useAsyncData<Notification[]>({
    fetcher: useCallback(() => notificationsService.listNotifications(user!.id), [user]),
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  const markAllRead = async () => {
    await notificationsService.markAllNotificationsRead(user!.id);
    refetch();
  };

  const markRead = async (id: string) => {
    await notificationsService.markNotificationRead(id);
    refetch();
  };

  if (loading && !notifications) {
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

  const list = notifications ?? [];
  const unreadCount = list.filter((n) => !n.read).length;

  return (
    <Screen scroll>
      <StyledView className="gap-4 px-4 pt-6">
        <StyledView className="flex-row items-center justify-between">
          <H2>Notifications</H2>
          {unreadCount > 0 ? (
            <Button variant="ghost" size="sm" onPress={markAllRead}>
              Mark all read
            </Button>
          ) : null}
        </StyledView>

        {list.length === 0 ? (
          <EmptyState
            icon={<Bell size={24} color="#737373" />}
            title="No notifications"
            description="Approval alerts, entry/exit updates, and security notices will appear here."
          />
        ) : (
          <StyledView className="rounded-xl border border-border bg-background p-4">
            {list.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onPress={() => markRead(notification.id)}
              />
            ))}
          </StyledView>
        )}
      </StyledView>
    </Screen>
  );
}
