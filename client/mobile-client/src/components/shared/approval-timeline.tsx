import { Check, Clock, FileSearch, X } from 'lucide-react-native';
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

const stepIndex: Record<ApprovalStep['status'] | 'REJECTED', number> = {
  PENDING_VERIFICATION: 0,
  PENDING_APPROVAL: 1,
  APPROVED: 2,
  REJECTED: 1,
};

export function ApprovalTimeline({ vehicle }: ApprovalTimelineProps) {
  const current = stepIndex[vehicle.status] ?? 0;
  const isRejected = vehicle.status === 'REJECTED';

  return (
    <StyledView className="gap-0">
      {steps.map((step, idx) => {
        const isCompleted = !isRejected && idx < current;
        const isCurrent = !isRejected && idx === current;
        const isRejectedStep = isRejected && idx === 1;
        const isPending = !isCompleted && !isCurrent && !isRejectedStep;
        const isLast = idx === steps.length - 1;

        const nodeClass = isRejectedStep
          ? 'border-destructive bg-destructive'
          : isCompleted || isCurrent
            ? 'border-primary bg-primary'
            : 'border-border bg-background';

        const lineClass =
          !isLast && (isCompleted || (isCurrent && idx < current))
            ? 'bg-primary'
            : 'bg-border';

        const title =
          isRejectedStep ? 'Rejected' : isCurrent && step.status !== 'APPROVED' ? step.label : step.label;
        const description =
          isRejectedStep && vehicle.rejectionReason ? vehicle.rejectionReason : step.description;

        return (
          <StyledView key={step.status} className="flex-row gap-4">
            <StyledView className="items-center">
              <StyledView className={`h-10 w-10 items-center justify-center rounded-full border-2 ${nodeClass}`}>
                {isRejectedStep ? (
                  <X size={16} color="#ffffff" />
                ) : isCompleted || (isCurrent && step.status === 'APPROVED') ? (
                  <Check size={16} color="#ffffff" />
                ) : isCurrent && step.status === 'PENDING_VERIFICATION' ? (
                  <FileSearch size={16} color="#ffffff" />
                ) : isCurrent && step.status === 'PENDING_APPROVAL' ? (
                  <Clock size={16} color="#ffffff" />
                ) : (
                  <StyledText className="text-[13px] font-semibold text-muted-foreground">{idx + 1}</StyledText>
                )}
              </StyledView>
              {!isLast ? <StyledView className={`mt-1 min-h-[44px] w-[2px] flex-1 ${lineClass}`} /> : null}
            </StyledView>

            <StyledView className={`flex-1 ${isLast ? 'pb-0' : 'pb-6'}`}>
              <StyledView className="flex-row flex-wrap items-center gap-2">
                <StyledText
                  className={`text-[15px] font-semibold ${
                    isPending ? 'text-muted-foreground' : 'text-foreground'
                  }`}
                >
                  {title}
                </StyledText>
                {isCurrent ? (
                  <StyledView className="rounded-full bg-primary/10 px-2.5 py-1">
                    <StyledText className="text-[12px] font-medium text-primary">Current</StyledText>
                  </StyledView>
                ) : null}
                {isRejectedStep ? (
                  <StyledView className="rounded-full bg-destructive/10 px-2.5 py-1">
                    <StyledText className="text-[12px] font-medium text-destructive">Action needed</StyledText>
                  </StyledView>
                ) : null}
                {isCompleted ? (
                  <StyledView className="rounded-full bg-success/10 px-2.5 py-1">
                    <StyledText className="text-[12px] font-medium text-success">Completed</StyledText>
                  </StyledView>
                ) : null}
              </StyledView>

              <StyledText
                className={`mt-1 text-[14px] leading-6 ${
                  isRejectedStep ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {description}
              </StyledText>

              {step.status === 'PENDING_VERIFICATION' ? (
                <StyledText className="mt-2 text-[13px] text-muted-foreground">
                  Submitted {formatDateTime(vehicle.submittedAt)}
                </StyledText>
              ) : null}

              {isRejectedStep && vehicle.reviewedAt ? (
                <StyledText className="mt-2 text-[13px] text-muted-foreground">
                  Reviewed {formatDateTime(vehicle.reviewedAt)}
                </StyledText>
              ) : null}

              {!isRejected && isCurrent && vehicle.reviewedAt && step.status !== 'PENDING_VERIFICATION' ? (
                <StyledText className="mt-2 text-[13px] text-muted-foreground">
                  Updated {formatDateTime(vehicle.reviewedAt)}
                </StyledText>
              ) : null}

              {!isRejected && step.status === 'APPROVED' && vehicle.status === 'APPROVED' && vehicle.reviewedAt ? (
                <StyledText className="mt-2 text-[13px] text-muted-foreground">
                  Approved {formatDateTime(vehicle.reviewedAt)}
                </StyledText>
              ) : null}
            </StyledView>
          </StyledView>
        );
      })}
    </StyledView>
  );
}