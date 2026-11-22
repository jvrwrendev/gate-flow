import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyledSafeAreaView, StyledView, StyledScrollView } from '@/src/components/ui/core';
import { cn } from '@/src/lib/utils';

interface ScreenProps extends React.ComponentPropsWithoutRef<typeof StyledSafeAreaView> {
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  footer?: ReactNode;
}

export function Screen({
  className,
  scroll,
  children,
  contentContainerStyle,
  keyboardShouldPersistTaps,
  footer,
  ...props
}: ScreenProps) {
  const scrollPaddingBottom = footer ? 24 : 120;

  const content = scroll ? (
    <StyledScrollView
      className="flex-1"
      contentContainerStyle={[{ paddingBottom: scrollPaddingBottom }, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
    >
      {children}
    </StyledScrollView>
  ) : (
    <StyledView className={cn('flex-1', !footer && 'pb-24')}>{children}</StyledView>
  );

  return (
    <StyledSafeAreaView
      className={cn('flex-1 bg-background', className)}
      {...props}
    >
      {content}
      {footer}
    </StyledSafeAreaView>
  );
}
