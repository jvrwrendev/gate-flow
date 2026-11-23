import { useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { StyledView, StyledText } from '@/src/components/ui/core';
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { Screen } from '@/src/components/layout/screen';
import { ScreenHeader } from '@/src/components/layout/screen-header';
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
      <StyledView className="gap-5 px-5 pt-4">
        <ScreenHeader
          title="Notifications"
          subtitle="Stay updated on approvals and gate activity"
          rightAction={
            unreadCount > 0 ? (
              <Button variant="ghost" size="sm" onPress={markAllRead}>
                Mark all read
              </Button>
            ) : undefined
          }
        />

        {list.length === 0 ? (
          <EmptyState
            icon={<Bell size={24} color="#64748B" />}
            title="No notifications"
            description="Approval alerts, entry/exit updates, and security notices will appear here."
          />
        ) : (
          <StyledView className="gap-3">
            {list.map((notification) => (
              <Card key={notification.id} className="p-4">
                <NotificationItem
                  notification={notification}
                  onPress={() => markRead(notification.id)}
                  variant="card"
                />
              </Card>
            ))}
          </StyledView>
        )}
      </StyledView>
    </Screen>
  );
}
