import { Bell, Shield, Car, Users } from 'lucide-react-native';
import { StyledView, StyledText, StyledPressable } from '@/src/components/ui/core';
import { formatRelative } from '@/src/lib/formatters';
import type { Notification, NotificationType } from '@/src/types';

interface NotificationItemProps {
  notification: Notification;
  onPress?: () => void;
  variant?: 'row' | 'card';
}

const iconMap: Record<NotificationType, typeof Bell> = {
  APPROVAL: Car,
  ENTRY_EXIT: Car,
  SECURITY: Shield,
  VISITOR: Users,
};

export function NotificationItem({ notification, onPress, variant = 'row' }: NotificationItemProps) {
  const Icon = iconMap[notification.type] ?? Bell;
  const isRow = variant === 'row';
  const unreadStyle = notification.read ? '' : 'bg-accent/40';

  return (
    <StyledPressable onPress={onPress}>
      <StyledView
        className={`flex-row items-start gap-3 ${
          isRow ? `border-b border-border py-4 last:border-b-0 ${unreadStyle}` : unreadStyle
        } ${!isRow && !notification.read ? 'rounded-xl -m-2 p-2' : ''}`}
      >
        <StyledView className="mt-0.5 h-10 w-10 items-center justify-center rounded-xl bg-accent">
          <Icon size={18} color="#087FE8" strokeWidth={2.1} />
        </StyledView>
        <StyledView className="flex-1">
          <StyledView className="flex-row items-start justify-between gap-3">
            <StyledText className="flex-1 text-sm font-semibold text-foreground">
              {notification.title}
            </StyledText>
            <StyledView className="items-end gap-1">
              {!notification.read ? (
                <StyledView className="h-2.5 w-2.5 rounded-full bg-primary" />
              ) : (
                <StyledView className="h-2.5 w-2.5 rounded-full bg-transparent" />
              )}
            </StyledView>
          </StyledView>
          <StyledText className="mt-1 text-sm leading-snug text-muted-foreground">
            {notification.body}
          </StyledText>
          <StyledText className="mt-1.5 text-[13px] font-medium text-foreground/70">
            {formatRelative(notification.timestamp)}
          </StyledText>
        </StyledView>
      </StyledView>
    </StyledPressable>
  );
}
