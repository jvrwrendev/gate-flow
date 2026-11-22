import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, addHours } from 'date-fns';
import { StyledView, StyledText, StyledPressable } from '@/src/components/ui/core';
import { Button } from '@/src/components/ui/button';
import { H2 } from '@/src/components/ui/typography';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { FormField } from '@/src/components/layout/form-field';
import { Screen } from '@/src/components/layout/screen';
import { useAuth } from '@/src/context/AuthContext';
import { visitorPassSchema, type VisitorPassSchema } from '@/src/lib/schemas';
import { VEHICLE_TYPES } from '@/src/lib/constants';
import * as visitorsService from '@/src/services/visitors.mock';
import { ChevronLeft } from 'lucide-react-native';

const typeOptions = VEHICLE_TYPES.map((t) => ({ label: t, value: t }));

function toLocalInputValue(date: Date) {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export default function NewVisitorPassScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const defaultStart = toLocalInputValue(addHours(now, 2));
  const defaultEnd = toLocalInputValue(addHours(now, 6));

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VisitorPassSchema>({
    resolver: zodResolver(visitorPassSchema),
    defaultValues: {
      visitorName: '',
      visitorPhone: '',
      purpose: '',
      vehiclePlate: '',
      scheduledStart: defaultStart,
      scheduledEnd: defaultEnd,
      notes: '',
    },
  });

  const onSubmit = async (data: VisitorPassSchema) => {
    setError(null);
    try {
      const pass = await visitorsService.createVisitorPass(user!.id, data);
      router.replace(`/visitor/${pass.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to request visitor pass');
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

        <H2 className="mb-6">Request visitor pass</H2>

        <StyledView className="gap-4">
          <FormField label="Visitor name" error={errors.visitorName?.message}>
            <ControlledInput
              control={control}
              name="visitorName"
              placeholder="Jane Smith"
            />
          </FormField>

          <FormField label="Visitor phone (optional)" error={errors.visitorPhone?.message}>
            <ControlledInput
              control={control}
              name="visitorPhone"
              placeholder="+1 555 0000"
              keyboardType="phone-pad"
            />
          </FormField>

          <FormField label="Purpose of visit" error={errors.purpose?.message}>
            <ControlledInput
              control={control}
              name="purpose"
              placeholder="Dinner, delivery, maintenance..."
            />
          </FormField>

          <FormField label="Vehicle plate (optional)" error={errors.vehiclePlate?.message}>
            <ControlledInput
              control={control}
              name="vehiclePlate"
              placeholder="TMP-1234"
              autoCapitalize="characters"
            />
          </FormField>

          <FormField label="Vehicle type (optional)" error={errors.vehicleType?.message}>
            <Controller
              control={control}
              name="vehicleType"
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

          <FormField label="Start" error={errors.scheduledStart?.message}>
            <ControlledInput
              control={control}
              name="scheduledStart"
              placeholder="YYYY-MM-DDTHH:MM"
            />
          </FormField>

          <FormField label="End" error={errors.scheduledEnd?.message}>
            <ControlledInput
              control={control}
              name="scheduledEnd"
              placeholder="YYYY-MM-DDTHH:MM"
            />
          </FormField>

          <FormField label="Notes (optional)" error={errors.notes?.message}>
            <ControlledInput
              control={control}
              name="notes"
              placeholder="Any special instructions"
            />
          </FormField>

          {error ? (
            <StyledText className="text-center text-sm text-destructive">{error}</StyledText>
          ) : null}

          <Button loading={isSubmitting} onPress={() => handleSubmit(onSubmit)()}>
            Request pass
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
  control: ReturnType<typeof useForm<VisitorPassSchema>>['control'];
  name: keyof VisitorPassSchema;
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
