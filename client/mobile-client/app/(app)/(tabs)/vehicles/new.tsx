import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StyledView, StyledText, StyledPressable } from '@/src/components/ui/core';
import { Button } from '@/src/components/ui/button';
import { H2 } from '@/src/components/ui/typography';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { FormField } from '@/src/components/layout/form-field';
import { Screen } from '@/src/components/layout/screen';
import { useAuth } from '@/src/context/AuthContext';
import { vehicleSchema, type VehicleSchema } from '@/src/lib/schemas';
import { VEHICLE_TYPES } from '@/src/lib/constants';
import * as vehiclesService from '@/src/services/vehicles.mock';
import { ChevronLeft } from 'lucide-react-native';

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
      <StyledView className="px-4 pt-6">
        <StyledPressable
          onPress={() => router.back()}
          className="mb-4 flex-row items-center gap-1 self-start"
        >
          <ChevronLeft size={20} color="#111827" />
          <StyledText className="text-sm font-medium text-foreground">Back</StyledText>
        </StyledPressable>

        <H2 className="mb-6">Register vehicle</H2>

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

          {error ? (
            <StyledText className="text-center text-sm text-destructive">{error}</StyledText>
          ) : null}

          <Button loading={isSubmitting} onPress={() => handleSubmit(onSubmit)()}>
            Submit registration
          </Button>
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
