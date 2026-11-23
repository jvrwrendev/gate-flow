import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { StyledView, StyledText } from '@/src/components/ui/core';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { FormField } from '@/src/components/layout/form-field';
import { Screen } from '@/src/components/layout/screen';
import { BottomActionBar } from '@/src/components/layout/bottom-action-bar';
import { ScreenHeader } from '@/src/components/layout/screen-header';
import { useAuth } from '@/src/context/AuthContext';
import { Check } from 'lucide-react-native';

const schema = z.object({
  name: z.string().min(2, 'Name is required.'),
  phone: z.string().min(7, 'Please enter a valid phone number.'),
  unit: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function PersonalInfoScreen() {
  const { user, updateUser } = useAuth();
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
    <Screen
      scroll
      keyboardShouldPersistTaps="handled"
      footer={
        <BottomActionBar>
          <Button className="w-full" loading={isSubmitting} onPress={() => handleSubmit(onSubmit)()}>
            Save changes
          </Button>
        </BottomActionBar>
      }
    >
      <StyledView className="gap-5 px-5 pt-4">
        <ScreenHeader
          title="Personal information"
          subtitle="View and update your profile details"
          showBack
        />

        <StyledView className="gap-5">
          <FormField label="Email">
            <Input value={user?.email ?? ''} editable={false} className="bg-muted/30 text-muted-foreground" />
          </FormField>

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
