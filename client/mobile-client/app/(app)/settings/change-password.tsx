import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react-native';
import { StyledView, StyledText, StyledPressable } from '@/src/components/ui/core';
import { Button } from '@/src/components/ui/button';
import { Muted } from '@/src/components/ui/typography';
import { Input } from '@/src/components/ui/input';
import { FormField } from '@/src/components/layout/form-field';
import { Screen } from '@/src/components/layout/screen';
import { BottomActionBar } from '@/src/components/layout/bottom-action-bar';
import { ScreenHeader } from '@/src/components/layout/screen-header';
import { Card } from '@/src/components/ui/card';

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters.')
      .regex(/[A-Z]/, 'Include at least one uppercase letter.')
      .regex(/[0-9]/, 'Include at least one number.'),
    confirmPassword: z.string().min(1, 'Please confirm your new password.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password.',
    path: ['newPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (_data: FormData) => {
    setSaved(false);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setSaved(true);
    reset();
  };

  return (
    <Screen
      scroll
      footer={
        <BottomActionBar>
          <Button className="w-full" loading={isSubmitting} onPress={() => handleSubmit(onSubmit)()}>
            Update password
          </Button>
        </BottomActionBar>
      }
    >
      <StyledView className="gap-5 px-5 pt-4">
        <ScreenHeader
          title="Change password"
          subtitle="Update your password to keep your account secure"
          showBack
        />

        {saved ? (
          <StyledView className="flex-row items-center gap-2 rounded-2xl border border-success/20 bg-success/10 p-4">
            <CheckCircle2 size={18} color="#16a34a" />
            <StyledText className="flex-1 text-sm font-medium text-foreground">
              Password updated successfully (mock).
            </StyledText>
          </StyledView>
        ) : null}

        <Card className="gap-4 p-4">
          <FormField label="Current password" error={errors.currentPassword?.message}>
            <PasswordInput
              control={control}
              name="currentPassword"
              placeholder="Enter current password"
              visible={showCurrent}
              onToggle={() => setShowCurrent((v) => !v)}
              invalid={!!errors.currentPassword}
            />
          </FormField>

          <FormField label="New password" error={errors.newPassword?.message}>
            <PasswordInput
              control={control}
              name="newPassword"
              placeholder="Enter new password"
              visible={showNew}
              onToggle={() => setShowNew((v) => !v)}
              invalid={!!errors.newPassword}
            />
          </FormField>

          <FormField label="Confirm new password" error={errors.confirmPassword?.message}>
            <PasswordInput
              control={control}
              name="confirmPassword"
              placeholder="Re-enter new password"
              visible={showConfirm}
              onToggle={() => setShowConfirm((v) => !v)}
              invalid={!!errors.confirmPassword}
            />
          </FormField>

          <Muted className="text-[13px] leading-5">
            Use at least 8 characters, including an uppercase letter and a number.
          </Muted>
        </Card>
      </StyledView>
    </Screen>
  );
}

function PasswordInput({
  control,
  name,
  placeholder,
  visible,
  onToggle,
  invalid,
}: {
  control: ReturnType<typeof useForm<FormData>>['control'];
  name: keyof FormData;
  placeholder: string;
  visible: boolean;
  onToggle: () => void;
  invalid?: boolean;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <StyledView className="relative justify-center">
          <Input
            value={value}
            onChangeText={(v) => {
              onChange(v);
            }}
            onBlur={onBlur}
            placeholder={placeholder}
            secureTextEntry={!visible}
            autoCapitalize="none"
            autoCorrect={false}
            invalid={invalid}
            className="pr-14"
          />
          <StyledPressable
            onPress={onToggle}
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Hide password' : 'Show password'}
            hitSlop={8}
            className="absolute right-0 h-14 w-14 items-center justify-center"
          >
            {visible ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}
          </StyledPressable>
        </StyledView>
      )}
    />
  );
}
