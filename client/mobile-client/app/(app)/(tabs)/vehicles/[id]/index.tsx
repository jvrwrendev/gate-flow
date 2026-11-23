import { useCallback, useState, type ReactNode } from 'react';
import { Image, Modal, Pressable } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import {
  Calendar,
  CarFront,
  Palette,
  ShieldCheck,
  Tag,
  X,
} from 'lucide-react-native';
import { StyledView, StyledText, StyledPressable } from '@/src/components/ui/core';
import { H2, H3, Muted } from '@/src/components/ui/typography';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Screen } from '@/src/components/layout/screen';
import { ScreenHeader } from '@/src/components/layout/screen-header';
import { LoadingSkeleton } from '@/src/components/layout/loading-skeleton';
import { ErrorState } from '@/src/components/layout/error-state';
import { StatusPill } from '@/src/components/shared/status-pill';
import { ApprovalTimeline } from '@/src/components/shared/approval-timeline';
import { useAsyncData } from '@/src/hooks/useAsyncData';
import { useAuth } from '@/src/context/AuthContext';
import * as vehiclesService from '@/src/services/vehicles.mock';
import type { Vehicle } from '@/src/types';
import { formatDate, formatDateTime } from '@/src/lib/formatters';

const EDITABLE_STATUSES = new Set<Vehicle['status']>(['PENDING_VERIFICATION', 'REJECTED']);

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [previewOpen, setPreviewOpen] = useState(false);

  const { data: vehicle, loading, error, refetch } = useAsyncData<Vehicle>({
    fetcher: useCallback(() => vehiclesService.getVehicle(id), [id]),
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  if (loading || !vehicle) {
    return (
      <Screen>
        <LoadingSkeleton count={4} />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <ErrorState onRetry={refetch} />
      </Screen>
    );
  }

  const canEdit = vehicle.ownerId === user?.id && EDITABLE_STATUSES.has(vehicle.status);
  const statusInfo = getStatusInfo(vehicle);

  return (
    <Screen scroll>
      <StyledView className="px-5 pt-4">
        <ScreenHeader
          title="Vehicle details"
          subtitle="Review registration information and status"
          showBack
          className="mb-5"
          rightAction={
            canEdit ? (
              <Button size="sm" className="px-4" onPress={() => router.push(`/vehicles/${vehicle.id}/edit`)}>
                Edit Vehicle
              </Button>
            ) : undefined
          }
        />

        <StyledView className="mb-6 overflow-hidden rounded-2xl border border-border bg-muted/20">
          {vehicle.photoUrl ? (
            <Pressable onPress={() => setPreviewOpen(true)} accessibilityRole="button" accessibilityLabel="Preview vehicle image">
              <Image source={{ uri: vehicle.photoUrl }} style={{ width: '100%', height: 220 }} resizeMode="cover" />
              <StyledView className="absolute bottom-3 right-3 rounded-full bg-background/90 px-3 py-1.5 border border-border">
                <StyledText className="text-[13px] font-medium text-foreground">Tap to preview</StyledText>
              </StyledView>
            </Pressable>
          ) : (
            <StyledView className="h-[220px] items-center justify-center gap-3 px-6">
              <StyledView className="h-16 w-16 items-center justify-center rounded-full bg-accent">
                <CarFront size={30} color="#087FE8" />
              </StyledView>
              <StyledText className="text-sm font-medium text-foreground">No vehicle image</StyledText>
              <Muted className="text-center text-[13px] leading-5">Add an image when registering or editing this vehicle.</Muted>
            </StyledView>
          )}
        </StyledView>

        <StyledView className="mb-6 gap-2">
          <StyledView className="flex-row items-start justify-between gap-3">
            <StyledView className="flex-1">
              <Muted className="mb-1 text-[13px] uppercase tracking-wide">Plate number</Muted>
              <H2>{vehicle.plateNumber}</H2>
            </StyledView>
            <StatusPill status={vehicle.status} />
          </StyledView>
          <Muted>
            {vehicle.brand} {vehicle.model} • {vehicle.type}
          </Muted>
        </StyledView>

        <StyledView className="gap-4">
          <Card>
            <CardContent className="gap-4 p-4">
              <SectionTitle icon={<CarFront size={18} color="#087FE8" />} title="Vehicle information" />
              <DetailRow icon={<Tag size={16} color="#64748B" />} label="Plate number" value={vehicle.plateNumber} />
              <DetailRow icon={<CarFront size={16} color="#64748B" />} label="Vehicle type" value={vehicle.type} />
              <DetailRow icon={<ShieldCheck size={16} color="#64748B" />} label="Brand" value={vehicle.brand} />
              <DetailRow icon={<Tag size={16} color="#64748B" />} label="Model" value={vehicle.model} />
              <DetailRow icon={<Palette size={16} color="#64748B" />} label="Color" value={vehicle.color} />
              <DetailRow icon={<Calendar size={16} color="#64748B" />} label="Registration date" value={formatDate(vehicle.submittedAt)} />
              {vehicle.reviewedAt ? (
                <DetailRow icon={<Calendar size={16} color="#64748B" />} label="Reviewed date" value={formatDate(vehicle.reviewedAt)} />
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="gap-4 p-4">
              <SectionTitle icon={<ShieldCheck size={18} color="#087FE8" />} title="Registration status" />
              <StyledView className="rounded-xl border border-border bg-muted/20 p-3">
                <StyledView className="mb-2 flex-row items-center justify-between gap-3">
                  <StyledText className="text-sm font-medium text-foreground">Current status</StyledText>
                  <StatusPill status={vehicle.status} />
                </StyledView>
                <StyledText className="text-sm text-muted-foreground">{statusInfo.description}</StyledText>
                {statusInfo.detail ? (
                  <StyledText className="mt-2 text-[13px] text-muted-foreground">{statusInfo.detail}</StyledText>
                ) : null}
              </StyledView>

              {vehicle.status === 'REJECTED' && vehicle.rejectionReason ? (
                <StyledView className="rounded-xl border border-destructive/20 bg-destructive/5 p-3">
                  <StyledText className="text-sm font-medium text-destructive">Rejection reason</StyledText>
                  <StyledText className="mt-1 text-sm text-foreground">{vehicle.rejectionReason}</StyledText>
                </StyledView>
              ) : null}

              <StyledView className="pt-1">
                <H3 className="mb-3 text-base">Approval timeline</H3>
                <ApprovalTimeline vehicle={vehicle} />
              </StyledView>
            </CardContent>
          </Card>
        </StyledView>
      </StyledView>

      <Modal visible={previewOpen} transparent animationType="fade" onRequestClose={() => setPreviewOpen(false)}>
        <StyledView className="flex-1 bg-black/95 px-5 pt-14 pb-10">
          <StyledView className="mb-4 flex-row items-center justify-between">
            <StyledText className="text-base font-semibold text-white">Vehicle image</StyledText>
            <StyledPressable
              onPress={() => setPreviewOpen(false)}
              className="h-11 w-11 items-center justify-center rounded-full bg-white/10"
              accessibilityRole="button"
              accessibilityLabel="Close image preview"
            >
              <X size={20} color="#ffffff" />
            </StyledPressable>
          </StyledView>
          <StyledView className="flex-1 items-center justify-center">
            {vehicle.photoUrl ? (
              <Image
                source={{ uri: vehicle.photoUrl }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            ) : null}
          </StyledView>
        </StyledView>
      </Modal>
    </Screen>
  );
}

function getStatusInfo(vehicle: Vehicle) {
  switch (vehicle.status) {
    case 'PENDING_VERIFICATION':
      return {
        description: 'Your vehicle details are being verified by the management team.',
        detail: `Submitted on ${formatDateTime(vehicle.submittedAt)}.`,
      };
    case 'PENDING_APPROVAL':
      return {
        description: 'Verification is complete. Your vehicle is awaiting final approval.',
        detail: vehicle.reviewedAt ? `Last updated on ${formatDateTime(vehicle.reviewedAt)}.` : undefined,
      };
    case 'APPROVED':
      return {
        description: 'Your vehicle is approved and authorized for gate access.',
        detail: vehicle.reviewedAt ? `Approved on ${formatDateTime(vehicle.reviewedAt)}.` : undefined,
      };
    case 'REJECTED':
      return {
        description: 'This vehicle registration was reviewed and requires attention.',
        detail: vehicle.reviewedAt ? `Reviewed on ${formatDateTime(vehicle.reviewedAt)}.` : undefined,
      };
    default:
      return { description: 'Status information is unavailable.', detail: undefined };
  }
}

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <StyledView className="flex-row items-center gap-2">
      {icon}
      <StyledText className="text-base font-semibold text-foreground">{title}</StyledText>
    </StyledView>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <StyledView className="flex-row items-start justify-between gap-4 border-b border-border/60 pb-3 last:border-b-0 last:pb-0">
      <StyledView className="flex-row items-center gap-2">
        {icon}
        <Muted className="text-sm">{label}</Muted>
      </StyledView>
      <StyledText className="flex-1 text-right text-sm font-medium text-foreground">{value}</StyledText>
    </StyledView>
  );
}
