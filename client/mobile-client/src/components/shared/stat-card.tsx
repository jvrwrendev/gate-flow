import { StyledView, StyledText } from '@/src/components/ui/core';
import { cn } from '@/src/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  className?: string;
}

export function StatCard({ label, value, subtext, className }: StatCardProps) {
  return (
    <StyledView
      className={cn(
        'flex-1 min-w-[45%] rounded-xl border border-border bg-background p-4',
        className
      )}
    >
      <StyledText className="text-2xl font-semibold text-foreground">{value}</StyledText>
      <StyledText className="mt-1 text-xs text-muted-foreground">{label}</StyledText>
      {subtext ? (
        <StyledText className="mt-1 text-xs text-muted-foreground">{subtext}</StyledText>
      ) : null}
    </StyledView>
  );
}
