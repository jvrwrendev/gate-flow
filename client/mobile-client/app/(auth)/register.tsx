import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ChevronLeft, Eye, EyeOff, UserPlus } from 'lucide-react-native';
import { StyledPressable, StyledText, StyledView } from '@/src/components/ui/core';
import { Button } from '@/src/components/ui/button';
import { H1, Muted } from '@/src/components/ui/typography';
import { Input } from '@/src/components/ui/input';
import { FormField } from '@/src/components/layout/form-field';
import { Screen } from '@/src/components/layout/screen';
import { useAuth } from '@/src/context/AuthContext';
import { registerSchema, type RegisterSchema } from '@/src/lib/schemas';

export default function RegisterScreen() {
  const { register, isLoading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      className="bg-background"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1, paddingTop: 24, paddingBottom: 32 }}
    >
      <StyledView className="w-full max-w-[440px] flex-1 self-center px-6">
        <StyledPressable
          onPress={() => router.back()}
          className="mb-8 h-11 min-w-11 flex-row items-center gap-1.5 self-start pr-2"
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
        >
          <ChevronLeft size={24} color="#0f766e" />
          <StyledText className="text-base font-semibold text-foreground">Back</StyledText>
        </StyledPressable>

        <StyledView className="flex-1">
          <StyledView className="items-center">
            <StyledView className="mb-5 h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
              <UserPlus size={30} color="#0f766e" />
            </StyledView>
            <H1 className="text-center text-[30px] leading-tight">Create account</H1>
            <Muted className="mt-2 text-center text-[15px] leading-6">
              Register to access your community gates
            </Muted>
          </StyledView>

          <StyledView className="mt-10 gap-5">
            {error ? (
              <StyledView className="flex-row items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
                <AlertCircle size={18} color="#dc2626" style={{ marginTop: 1 }} />
                <StyledText className="flex-1 text-[14px] leading-5 text-foreground">{error}</StyledText>
              </StyledView>
            ) : null}

            <FormField label="Full name" error={errors.name?.message}>
              <ControlledInput control={control} name="name" placeholder="Jane Doe" />
            </FormField>

            <FormField label="Email" error={errors.email?.message}>
              <ControlledInput
                control={control}
                name="email"
                placeholder="you@example.com"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
              />
            </FormField>

            <FormField label="Phone" error={errors.phone?.message}>
              <ControlledInput
                control={control}
                name="phone"
                placeholder="+1 555 0000"
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                autoComplete="tel"
              />
            </FormField>

            <FormField label="Unit (optional)" error={errors.unit?.message}>
              <ControlledInput control={control} name="unit" placeholder="A-101" />
            </FormField>

            <FormField label="Password" error={errors.password?.message}>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <StyledView className="relative justify-center">
                    <Input
                      value={value ?? ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Create a password"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      textContentType="newPassword"
                      invalid={!!errors.password}
                      className="pr-14"
                    />
                    <StyledPressable
                      onPress={() => setShowPassword((v) => !v)}
                      accessibilityRole="button"
                      accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                      hitSlop={8}
                      className="absolute right-0 h-14 w-14 items-center justify-center"
                    >
                      {showPassword ? <EyeOff size={20} color="#5f7a7a" /> : <Eye size={20} color="#5f7a7a" />}
                    </StyledPressable>
                  </StyledView>
                )}
              />
            </FormField>

            <FormField label="Confirm password" error={errors.confirmPassword?.message}>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <StyledView className="relative justify-center">
                    <Input
                      value={value ?? ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Re-enter your password"
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      textContentType="newPassword"
                      invalid={!!errors.confirmPassword}
                      className="pr-14"
                    />
                    <StyledPressable
                      onPress={() => setShowConfirmPassword((v) => !v)}
                      accessibilityRole="button"
                      accessibilityLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
                      hitSlop={8}
                      className="absolute right-0 h-14 w-14 items-center justify-center"
                    >
                      {showConfirmPassword ? <EyeOff size={20} color="#5f7a7a" /> : <Eye size={20} color="#5f7a7a" />}
                    </StyledPressable>
                  </StyledView>
                )}
              />
            </FormField>

            <Button
              size="lg"
              loading={isLoading}
              onPress={() => handleSubmit(onSubmit)()}
              className="mt-2 w-full"
            >
              Create account
            </Button>

            <StyledView className="flex-row items-center justify-center gap-1.5 pt-1">
              <Muted className="text-[14px]">Already have an account?</Muted>
              <Link href="/login" asChild>
                <StyledPressable accessibilityRole="link" hitSlop={6}>
                  <StyledText className="text-[14px] font-semibold text-primary">Sign in</StyledText>
                </StyledPressable>
              </Link>
            </StyledView>
          </StyledView>
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
