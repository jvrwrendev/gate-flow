import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StyledView, StyledText } from '@/src/components/ui/core';
import { Button } from '@/src/components/ui/button';
import { H2, Muted } from '@/src/components/ui/typography';
import { Input } from '@/src/components/ui/input';
import { FormField } from '@/src/components/layout/form-field';
import { Screen } from '@/src/components/layout/screen';
import { BottomActionBar } from '@/src/components/layout/bottom-action-bar';
import { useAuth } from '@/src/context/AuthContext';
import { registerSchema, type RegisterSchema } from '@/src/lib/schemas';
import { UserPlus } from 'lucide-react-native';

export default function RegisterScreen() {
  const { register, isLoading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterSchema) => {
    setError(null);
    try {
      await register(data);
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed');
    }
  };

  return (
    <Screen
      scroll
      className="px-6"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingTop: 32, paddingBottom: 24 }}
      footer={
        <BottomActionBar>
          <Button className="w-full" loading={isLoading} onPress={() => handleSubmit(onSubmit)()}>
            Sign up
          </Button>
          <StyledView className="mt-3 flex-row justify-center gap-1">
            <Muted>Already have an account?</Muted>
            <Link href="/login" asChild>
              <StyledText className="text-sm font-medium text-primary underline">
                Sign in
              </StyledText>
            </Link>
          </StyledView>
        </BottomActionBar>
      }
    >
      <StyledView className="items-center gap-2 pt-8">
        <StyledView className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
          <UserPlus size={32} color="#111827" />
        </StyledView>
        <H2 className="text-center">Create account</H2>
        <Muted className="text-center">Register to access your community gates</Muted>
      </StyledView>

      <StyledView className="mt-8 gap-4">
        <FormField label="Full name" error={errors.name?.message}>
          <ControlledInput control={control} name="name" placeholder="Jane Doe" />
        </FormField>

        <FormField label="Email" error={errors.email?.message}>
          <ControlledInput
            control={control}
            name="email"
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </FormField>

        <FormField label="Phone" error={errors.phone?.message}>
          <ControlledInput
            control={control}
            name="phone"
            placeholder="+1 555 0000"
            keyboardType="phone-pad"
          />
        </FormField>

        <FormField label="Unit (optional)" error={errors.unit?.message}>
          <ControlledInput control={control} name="unit" placeholder="A-101" />
        </FormField>

        <FormField label="Password" error={errors.password?.message}>
          <ControlledInput
            control={control}
            name="password"
            placeholder="••••••••"
            secureTextEntry
          />
        </FormField>

        <FormField label="Confirm password" error={errors.confirmPassword?.message}>
          <ControlledInput
            control={control}
            name="confirmPassword"
            placeholder="••••••••"
            secureTextEntry
          />
        </FormField>

        {error ? (
          <StyledText className="text-center text-sm text-destructive">{error}</StyledText>
        ) : null}
      </StyledView>
    </Screen>
  );
}

function ControlledInput({
  control,
  name,
  ...props
}: {
  control: ReturnType<typeof useForm<RegisterSchema>>['control'];
  name: keyof RegisterSchema;
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
