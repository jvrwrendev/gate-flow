import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function formatDate(isoString: string): string {
  const date = parseISO(isoString);
  return format(date, 'MMM d, yyyy');
}

export function formatDateTime(isoString: string): string {
  const date = parseISO(isoString);
  return format(date, "MMM d, yyyy 'at' h:mm a");
}

export function formatTime(isoString: string): string {
  const date = parseISO(isoString);
  return format(date, 'h:mm a');
}

export function formatRelative(isoString: string): string {
  const date = parseISO(isoString);
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatShortDateTime(isoString: string): string {
  const date = parseISO(isoString);
  return format(date, 'MMM d, h:mm a');
}
