import { Check, X, Clock, FileSearch } from 'lucide-react-native';
import { StyledView, StyledText } from '@/src/components/ui/core';
import { formatDateTime } from '@/src/lib/formatters';
import type { Vehicle, ApprovalStep } from '@/src/types';

interface ApprovalTimelineProps {
  vehicle: Vehicle;
}

const steps: ApprovalStep[] = [
  {
    status: 'PENDING_VERIFICATION',
    label: 'Pending Verification',
    description: 'Documents and plate details are being verified.',
  },
  {
    status: 'PENDING_APPROVAL',
    label: 'Pending Approval',
    description: 'Awaiting final approval from security management.',
  },
  {
    status: 'APPROVED',
    label: 'Approved',
    description: 'Vehicle is authorized for gate access.',
  },
];

const stepIndex: Record<typeof steps[number]['status'], number> = {
  PENDING_VERIFICATION: 0,
  PENDING_APPROVAL: 1,
  APPROVED: 2,
  REJECTED: 1,
};

export function ApprovalTimeline({ vehicle }: ApprovalTimelineProps) {
  const current = stepIndex[vehicle.status] ?? 0;
  const isRejected = vehicle.status === 'REJECTED';

  return (
    <StyledView className="gap-6">
      {steps.map((step, idx) => {
        const active = idx <= current && !isRejected;
        const isCurrentStep = idx === current;
        const isRejectedStep = isRejected && step.status === 'PENDING_APPROVAL';

        return (
          <StyledView key={step.status} className="flex-row gap-4">
            <StyledView className="items-center">
              <StyledView
                className={`h-8 w-8 items-center justify-center rounded-full border ${
                  active || isRejectedStep
                    ? 'border-primary bg-primary'
                    : 'border-border bg-background'
                }`}
              >
                {isRejectedStep ? (
                  <X size={14} color="#ffffff" />
                ) : active ? (
                  step.status === 'PENDING_VERIFICATION' ? (
                    <FileSearch size={14} color="#ffffff" />
                  ) : step.status === 'PENDING_APPROVAL' ? (
                    <Clock size={14} color="#ffffff" />
                  ) : (
                    <Check size={14} color="#ffffff" />
                  )
                ) : (
                  <StyledText className="text-xs text-muted-foreground">{idx + 1}</StyledText>
                )}
              </StyledView>
              {idx < steps.length - 1 ? (
                <StyledView
                  className={`mt-1 h-full w-px ${
                    active && idx < current ? 'bg-primary' : 'bg-border'
                  }`}
                />
              ) : null}
            </StyledView>
            <StyledView className="flex-1 pb-6">
              <StyledText
                className={`text-sm font-semibold ${
                  active || isRejectedStep ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {isRejectedStep ? 'Rejected' : step.label}
              </StyledText>
              <StyledText className="mt-0.5 text-xs text-muted-foreground">
                {isRejectedStep && vehicle.rejectionReason
                  ? vehicle.rejectionReason
                  : step.description}
              </StyledText>
              {isCurrentStep && vehicle.reviewedAt && !isRejected ? (
                <StyledText className="mt-1 text-xs text-muted-foreground">
                  Updated {formatDateTime(vehicle.reviewedAt)}
                </StyledText>
              ) : null}
              {isRejected && vehicle.reviewedAt ? (
                <StyledText className="mt-1 text-xs text-muted-foreground">
                  Reviewed {formatDateTime(vehicle.reviewedAt)}
                </StyledText>
              ) : null}
            </StyledView>
          </StyledView>
        );
      })}
    </StyledView>
  );
}
