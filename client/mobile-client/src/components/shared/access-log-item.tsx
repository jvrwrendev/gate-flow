import { ArrowRightLeft, LogIn, LogOut } from 'lucide-react-native';
import { StyledView, StyledText } from '@/src/components/ui/core';
import { StatusPill } from './status-pill';
import { formatDateTime } from '@/src/lib/formatters';
import type { AccessLog } from '@/src/types';

interface AccessLogItemProps {
  log: AccessLog;
}

export function AccessLogItem({ log }: AccessLogItemProps) {
  const DirectionIcon = log.direction === 'ENTRY' ? LogIn : LogOut;
  return (
    <StyledView className="flex-row items-start gap-3 border-b border-border py-3 last:border-b-0">
      <StyledView className="mt-0.5 rounded-full bg-muted p-2">
        <DirectionIcon size={16} color="#171717" />
      </StyledView>
      <StyledView className="flex-1 gap-0.5">
        <StyledView className="flex-row items-center justify-between">
          <StyledText className="text-sm font-semibold text-foreground">
            {log.direction === 'ENTRY' ? 'Entry' : 'Exit'} · {log.plateNumber}
          </StyledText>
          <StatusPill status={log.result} />
        </StyledView>
        <StyledText className="text-xs text-muted-foreground">
          {log.gate}
        </StyledText>
        <StyledText className="text-xs text-muted-foreground">
          {formatDateTime(log.timestamp)}
        </StyledText>
        {log.notes ? (
          <StyledText className="mt-1 text-xs text-muted-foreground">
            {log.notes}
          </StyledText>
        ) : null}
      </StyledView>
    </StyledView>
  );
}
