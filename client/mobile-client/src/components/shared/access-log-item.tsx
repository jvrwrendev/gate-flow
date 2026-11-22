import { ArrowRightLeft, LogIn, LogOut } from 'lucide-react-native';
import { StyledView, StyledText } from '@/src/components/ui/core';
import { StatusPill } from './status-pill';
import { formatDateTime } from '@/src/lib/formatters';
import type { AccessLog } from '@/src/types';

interface AccessLogItemProps {
  log: AccessLog;
  variant?: 'row' | 'card';
}

export function AccessLogItem({ log, variant = 'row' }: AccessLogItemProps) {
  const DirectionIcon = log.direction === 'ENTRY' ? LogIn : LogOut;
  const isEntry = log.direction === 'ENTRY';
  const isRow = variant === 'row';

  return (
    <StyledView
      className={
        isRow
          ? 'flex-row items-start gap-3 border-b border-border py-4 last:border-b-0'
          : 'flex-row items-start gap-3'
      }
    >
      <StyledView className="mt-0.5 h-10 w-10 items-center justify-center rounded-xl bg-secondary">
        <DirectionIcon size={18} color="#0f766e" strokeWidth={2.1} />
      </StyledView>

      <StyledView className="flex-1">
        <StyledView className="flex-row items-start justify-between gap-3">
          <StyledView className="flex-1">
            <StyledText className="text-sm font-semibold text-foreground">
              {log.plateNumber}
            </StyledText>
            <StyledText className="mt-0.5 text-[13px] font-medium text-primary">
              {isEntry ? 'Vehicle entry' : 'Vehicle exit'}
            </StyledText>
          </StyledView>
          <StatusPill status={log.result} />
        </StyledView>

        <StyledView className="mt-2 gap-1">
          <StyledText className="text-[13px] text-muted-foreground">{log.gate}</StyledText>
          <StyledText className="text-[13px] font-medium text-foreground/80">
            {formatDateTime(log.timestamp)}
          </StyledText>
          {log.notes ? (
            <StyledText className="text-[13px] text-muted-foreground">{log.notes}</StyledText>
          ) : null}
        </StyledView>
      </StyledView>
    </StyledView>
  );
}
