import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StyledView, StyledText } from '@/src/components/ui/core';
import { Button } from '@/src/components/ui/button';
import { Muted } from '@/src/components/ui/typography';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { FormField } from '@/src/components/layout/form-field';
import { Screen } from '@/src/components/layout/screen';
import { ScreenHeader } from '@/src/components/layout/screen-header';
import { LoadingSkeleton } from '@/src/components/layout/loading-skeleton';
import { ErrorState } from '@/src/components/layout/error-state';
import { ImageUploadField } from '@/src/components/shared/image-upload-field';
import { useAuth } from '@/src/context/AuthContext';
import { useAsyncData } from '@/src/hooks/useAsyncData';
import { vehicleSchema, type VehicleSchema } from '@/src/lib/schemas';
import { VEHICLE_TYPES } from '@/src/lib/constants';
import * as vehiclesService from '@/src/services/vehicles.mock';
import type { Vehicle } from '@/src/types';

const typeOptions = VEHICLE_TYPES.map((t) => ({ label: t, value: t }));
const EDITABLE_STATUSES = new Set<Vehicle['status']>(['PENDING_VERIFICATION', 'REJECTED']);

export default function EditVehicleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { data: vehicle, loading, error: loadError, refetch } = useAsyncData<Vehicle>({
    fetcher: () => vehiclesService.getVehicle(id),
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VehicleSchema>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      plateNumber: '',
      type: 'Car',
      brand: '',
      model: '',
      color: '',
      photoUrl: '',
    },
  });

  useEffect(() => {
    if (!vehicle) return;
    reset({
      plateNumber: vehicle.plateNumber,
      type: vehicle.type,
      brand: vehicle.brand,
      model: vehicle.model,
      color: vehicle.color,
      photoUrl: vehicle.photoUrl ?? '',
    });
  }, [vehicle, reset]);

  const onSubmit = async (data: VehicleSchema) => {
    if (!user || !vehicle) return;
    setError(null);
    try {
      const updated = await vehiclesService.updateVehicle(vehicle.id, user.id, data);
      router.replace(`/vehicles/${updated.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update vehicle');
    }
  };

  if (loading || !vehicle) {
    return (
      <Screen>
        <LoadingSkeleton count={4} />
      </Screen>
    );
  }

  if (loadError) {
    return (
      <Screen>
        <ErrorState onRetry={refetch} />
      </Screen>
    );
  }

  const canEdit = vehicle.ownerId === user?.id && EDITABLE_STATUSES.has(vehicle.status);

  return (
    <Screen scroll keyboardShouldPersistTaps="handled">
      <StyledView className="px-5 pt-4">
        <ScreenHeader
          title="Edit vehicle"
          subtitle="Update your vehicle details and image"
          showBack
          className="mb-6"
          rightAction={
            canEdit ? (
              <Button size="sm" className="px-4" loading={isSubmitting} onPress={() => handleSubmit(onSubmit)()}>
                Save
              </Button>
            ) : undefined
          }
        />

        {!canEdit ? (
          <StyledView className="rounded-xl border border-border bg-muted/20 p-4">
            <StyledText className="text-sm text-foreground">
              This vehicle cannot be edited in its current status.
            </StyledText>
          </StyledView>
        ) : (
          <StyledView className="gap-4">
            <FormField label="Plate number" error={errors.plateNumber?.message}>
              <ControlledInput
                control={control}
                name="plateNumber"
                placeholder="ABC-1234"
                autoCapitalize="characters"
              />
            </FormField>

            <FormField label="Vehicle type" error={errors.type?.message}>
              <Controller
                control={control}
                name="type"
                render={({ field: { onChange, value } }) => (
                  <Select placeholder="Select type" value={value} options={typeOptions} onChange={onChange} />
                )}
              />
            </FormField>

            <FormField label="Brand" error={errors.brand?.message}>
              <ControlledInput control={control} name="brand" placeholder="Toyota" />
            </FormField>

            <FormField label="Model" error={errors.model?.message}>
              <ControlledInput control={control} name="model" placeholder="Camry" />
            </FormField>

            <FormField label="Color" error={errors.color?.message}>
              <ControlledInput control={control} name="color" placeholder="Silver" />
            </FormField>

            <FormField label="Vehicle image" error={errors.photoUrl?.message}>
              <Controller
                control={control}
                name="photoUrl"
                render={({ field: { onChange, value } }) => (
                  <ImageUploadField
                    value={value || undefined}
                    onChange={(uri) => onChange(uri ?? '')}
                    error={errors.photoUrl?.message}
                  />
                )}
              />
            </FormField>

            {error ? <StyledText className="text-center text-sm text-destructive">{error}</StyledText> : null}
          </StyledView>
        )}
      </StyledView>
    </Screen>
  );
}

function ControlledInput({
  control,
  name,
  ...props
}: {
  control: ReturnType<typeof useForm<VehicleSchema>>['control'];
  name: keyof VehicleSchema;
} & React.ComponentPropsWithoutRef<typeof Input>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <Input onBlur={onBlur} onChangeText={onChange} value={value ?? ''} {...props} />
      )}
    />
  );
}
