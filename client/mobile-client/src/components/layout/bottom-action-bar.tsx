import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cn } from '@/src/lib/utils';

interface BottomActionBarProps {
  children: ReactNode;
  className?: string;
  /** Extra bottom offset for floating tab bars or custom layouts. */
  bottomOffset?: number;
}

export function BottomActionBar({ children, className, bottomOffset = 0 }: BottomActionBarProps) {
  const insets = useSafeAreaInsets();
  const paddingBottom = Math.max(insets.bottom, 16) + bottomOffset;

  return (
    <View
      className={cn('border-t border-border bg-background px-5 pt-3', className)}
      style={{ paddingBottom }}
    >
      {children}
    </View>
  );
}