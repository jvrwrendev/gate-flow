import { Bell, Shield, Car, Users } from 'lucide-react-native';
import { StyledView, StyledText, StyledPressable } from '@/src/components/ui/core';
import { formatRelative } from '@/src/lib/formatters';
import type { Notification, NotificationType } from '@/src/types';

interface NotificationItemProps {
  notification: Notification;
  onPress?: () => void;
}

const iconMap: Record<NotificationType, typeof Bell> = {
  APPROVAL: Car,
  ENTRY_EXIT: Car,
  SECURITY: Shield,
  VISITOR: Users,
};

export function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const Icon = iconMap[notification.type] ?? Bell;
  return (
    <StyledPressable onPress={onPress}>
      <StyledView
        className={`flex-row items-start gap-3 border-b border-border py-3.5 last:border-b-0 ${
          notification.read ? 'opacity-75' : ''
        }`}
      >
        <StyledView className="mt-0.5 h-9 w-9 items-center justify-center rounded-xl bg-secondary">
          <Icon size={17} color="#0f766e" strokeWidth={2} />
        </StyledView>
        <StyledView className="flex-1 gap-0.5">
          <StyledView className="flex-row items-center justify-between gap-2">
            <StyledText className="flex-1 text-sm font-semibold text-foreground">
              {notification.title}
            </StyledText>
            {!notification.read ? (
              <StyledView className="h-2 w-2 rounded-full bg-primary" />
            ) : null}
          </StyledView>
          <StyledText className="text-sm leading-snug text-muted-foreground">
            {notification.body}
          </StyledText>
          <StyledText className="mt-0.5 text-xs text-muted-foreground">
            {formatRelative(notification.timestamp)}
          </StyledText>
        </StyledView>
      </StyledView>
    </StyledPressable>
  );
}
