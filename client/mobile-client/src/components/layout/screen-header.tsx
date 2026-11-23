import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { StyledPressable, StyledText, StyledView } from '@/src/components/ui/core';
import { cn } from '@/src/lib/utils';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: ReactNode;
  className?: string;
  align?: 'left' | 'center';
}

export function ScreenHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  className,
  align = 'left',
}: ScreenHeaderProps) {
  const router = useRouter();
  const handleBack = onBack ?? (() => router.back());

  return (
    <StyledView className={cn('gap-3', className)}>
      {(showBack || rightAction) && (
        <StyledView className="flex-row items-center justify-between">
          {showBack ? (
            <StyledPressable
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={8}
              className="h-11 min-w-11 flex-row items-center gap-1.5 self-start pr-2"
            >
              <ChevronLeft size={24} color="#0f766e" />
              <StyledText className="text-base font-semibold text-foreground">Back</StyledText>
            </StyledPressable>
          ) : (
            <StyledView />
          )}
          {rightAction ? <StyledView className="ml-3 shrink-0">{rightAction}</StyledView> : <StyledView />}
        </StyledView>
      )}

      <StyledView className={cn('gap-1', align === 'center' && 'items-center')}>
        <StyledText
          className={cn(
            'text-[30px] font-semibold tracking-tight text-foreground',
            align === 'center' && 'text-center'
          )}
        >
          {title}
        </StyledText>
        {subtitle ? (
          <StyledText
            className={cn(
              'text-[15px] leading-6 text-muted-foreground',
              align === 'center' && 'text-center'
            )}
          >
            {subtitle}
          </StyledText>
        ) : null}
      </StyledView>
    </StyledView>
  );
}