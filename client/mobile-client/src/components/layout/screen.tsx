import { StyledSafeAreaView, StyledView, StyledScrollView } from '@/src/components/ui/core';
import { cn } from '@/src/lib/utils';

interface ScreenProps extends React.ComponentPropsWithoutRef<typeof StyledSafeAreaView> {
  scroll?: boolean;
}

export function Screen({ className, scroll, children, ...props }: ScreenProps) {
  const content = scroll ? (
    <StyledScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </StyledScrollView>
  ) : (
    <StyledView className="flex-1 pb-24">{children}</StyledView>
  );

  return (
    <StyledSafeAreaView
      className={cn('flex-1 bg-background', className)}
      {...props}
    >
      {content}
    </StyledSafeAreaView>
  );
}
