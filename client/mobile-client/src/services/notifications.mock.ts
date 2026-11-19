import { store } from './store';
import { delay, simulateError } from './mockApi';
import type { Notification } from '@/src/types';

export async function listNotifications(userId: string): Promise<Notification[]> {
  await delay();
  await simulateError();
  return store.notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
}

export async function markNotificationRead(id: string): Promise<Notification> {
  await delay();
  await simulateError();
  const notification = store.notifications.find((n) => n.id === id);
  if (!notification) throw new Error('Notification not found.');
  notification.read = true;
  return notification;
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await delay();
  await simulateError();
  store.notifications.forEach((n) => {
    if (n.userId === userId) n.read = true;
  });
}
