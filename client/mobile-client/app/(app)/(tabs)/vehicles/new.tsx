import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StyledView, StyledText } from '@/src/components/ui/core';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { FormField } from '@/src/components/layout/form-field';
import { Screen } from '@/src/components/layout/screen';
import { ScreenHeader } from '@/src/components/layout/screen-header';
import { ImageUploadField } from '@/src/components/shared/image-upload-field';
import { useAuth } from '@/src/context/AuthContext';
import { vehicleSchema, type VehicleSchema } from '@/src/lib/schemas';
import { VEHICLE_TYPES } from '@/src/lib/constants';
import * as vehiclesService from '@/src/services/vehicles.mock';


const typeOptions = VEHICLE_TYPES.map((t) => ({ label: t, value: t }));

export default function NewVehicleScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VehicleSchema>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      type: 'Car',
      photoUrl: '',
    },
  });

  const onSubmit = async (data: VehicleSchema) => {
    setError(null);
    try {
      const vehicle = await vehiclesService.createVehicle(user!.id, data);
      router.replace(`/vehicles/${vehicle.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to register vehicle');
    }
  };

  return (
    <Screen scroll keyboardShouldPersistTaps="handled">
      <StyledView className="px-5 pt-4">
        <ScreenHeader
          title="Register vehicle"
          subtitle="Add a vehicle for gate access approval"
          showBack
          className="mb-6"
          rightAction={
            <Button size="sm" className="px-4" loading={isSubmitting} onPress={() => handleSubmit(onSubmit)()}>
              Submit
            </Button>
          }
        />

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
                <Select
                  placeholder="Select type"
                  value={value}
                  options={typeOptions}
                  onChange={onChange}
                />
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

          {error ? (
            <StyledText className="text-center text-sm text-destructive">{error}</StyledText>
          ) : null}
        </StyledView>
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
