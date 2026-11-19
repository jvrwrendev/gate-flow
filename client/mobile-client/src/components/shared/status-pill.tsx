import { Badge } from '@/src/components/ui/badge';
import type { ApprovalStatus, PassStatus, AccessResult } from '@/src/types';

interface StatusPillProps {
  status: ApprovalStatus | PassStatus | AccessResult;
}

const approvalMap: Record<ApprovalStatus, { label: string; variant: React.ComponentProps<typeof Badge>['variant'] }> = {
  PENDING_VERIFICATION: { label: 'Pending Verification', variant: 'warning' },
  PENDING_APPROVAL: { label: 'Pending Approval', variant: 'secondary' },
  APPROVED: { label: 'Approved', variant: 'success' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
};

const passMap: Record<PassStatus, { label: string; variant: React.ComponentProps<typeof Badge>['variant'] }> = {
  PENDING: { label: 'Pending', variant: 'warning' },
  APPROVED: { label: 'Approved', variant: 'success' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
  USED: { label: 'Used', variant: 'secondary' },
  EXPIRED: { label: 'Expired', variant: 'outline' },
};

const accessMap: Record<AccessResult, { label: string; variant: React.ComponentProps<typeof Badge>['variant'] }> = {
  GRANTED: { label: 'Granted', variant: 'success' },
  DENIED: { label: 'Denied', variant: 'destructive' },
};

export function StatusPill({ status }: StatusPillProps) {
  let config = approvalMap[status as ApprovalStatus];
  if (!config) config = passMap[status as PassStatus];
  if (!config) config = accessMap[status as AccessResult];
  if (!config) config = { label: status, variant: 'outline' };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
