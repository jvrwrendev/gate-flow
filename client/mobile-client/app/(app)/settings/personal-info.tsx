import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { StyledView, StyledText, StyledPressable } from '@/src/components/ui/core';
import { Button } from '@/src/components/ui/button';
import { H2 } from '@/src/components/ui/typography';
import { Input } from '@/src/components/ui/input';
import { FormField } from '@/src/components/layout/form-field';
import { Screen } from '@/src/components/layout/screen';
import { useAuth } from '@/src/context/AuthContext';
import { ChevronLeft, Check } from 'lucide-react-native';
import { Card } from '@/src/components/ui/card';

const schema = z.object({
  name: z.string().min(2, 'Name is required.'),
  phone: z.string().min(7, 'Please enter a valid phone number.'),
  unit: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function PersonalInfoScreen() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? '',
      phone: user?.phone ?? '',
      unit: user?.unit ?? '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setSaved(false);
    await updateUser(data);
    setSaved(true);
  };

  return (
    <Screen scroll keyboardShouldPersistTaps="handled">
      <StyledView className="gap-5 px-5 pt-4">
        <StyledPressable
          onPress={() => router.back()}
          className="flex-row items-center gap-1 self-start"
        >
          <ChevronLeft size={20} color="#0f766e" />
          <StyledText className="text-sm font-medium text-foreground">Back</StyledText>
        </StyledPressable>

        <StyledView>
          <H2>Personal information</H2>
          <StyledText className="mt-1 text-sm text-muted-foreground">
            View and update your profile details.
          </StyledText>
        </StyledView>

        <Card className="gap-4 p-4">
          <FormField label="Full name" error={errors.name?.message}>
            <ControlledInput control={control} name="name" invalid={!!errors.name} />
          </FormField>

          <FormField label="Phone" error={errors.phone?.message}>
            <ControlledInput control={control} name="phone" keyboardType="phone-pad" invalid={!!errors.phone} />
          </FormField>

          <FormField label="Unit (optional)" error={errors.unit?.message}>
            <ControlledInput control={control} name="unit" invalid={!!errors.unit} />
          </FormField>

          {saved ? (
            <StyledView className="flex-row items-center justify-center gap-2 rounded-xl border border-success/20 bg-success/10 py-2.5">
              <Check size={16} color="#16a34a" />
              <StyledText className="text-sm font-medium text-foreground">Saved successfully</StyledText>
            </StyledView>
          ) : null}

          <Button loading={isSubmitting} onPress={() => handleSubmit(onSubmit)()}>
            Save changes
          </Button>
        </Card>
      </StyledView>
    </Screen>
  );
}

function ControlledInput({
  control,
  name,
  ...props
}: {
  control: ReturnType<typeof useForm<FormData>>['control'];
  name: keyof FormData;
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
