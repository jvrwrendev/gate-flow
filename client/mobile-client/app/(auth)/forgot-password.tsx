import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StyledView, StyledText, StyledScrollView } from '@/src/components/ui/core';
import { Button } from '@/src/components/ui/button';
import { H2, Muted } from '@/src/components/ui/typography';
import { Input } from '@/src/components/ui/input';
import { FormField } from '@/src/components/layout/form-field';
import { Screen } from '@/src/components/layout/screen';
import { forgotPasswordSchema, type ForgotPasswordSchema } from '@/src/lib/schemas';
import * as authService from '@/src/services/auth.mock';
import { MailCheck } from 'lucide-react-native';

export default function ForgotPasswordScreen() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordSchema) => {
    setLoading(true);
    setError(null);
    try {
      await authService.forgotPassword(data.email);
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll className="px-6">
      <StyledScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {submitted ? (
          <StyledView className="items-center gap-3">
            <StyledView className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
              <MailCheck size={32} color="#111827" />
            </StyledView>
            <H2 className="text-center">Check your email</H2>
            <Muted className="text-center">
              If an account exists, we’ve sent password reset instructions.
            </Muted>
            <Link href="/login" asChild>
              <StyledText className="mt-6 text-sm font-medium text-primary underline">
                Back to sign in
              </StyledText>
            </Link>
          </StyledView>
        ) : (
          <>
            <StyledView className="items-center gap-2">
              <H2 className="text-center">Reset password</H2>
              <Muted className="text-center">
                Enter your email and we’ll send you reset instructions.
              </Muted>
            </StyledView>

            <StyledView className="mt-8 gap-4">
              <FormField label="Email" error={errors.email?.message}>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      placeholder="you@example.com"
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  )}
                />
              </FormField>

              {error ? (
                <StyledText className="text-center text-sm text-destructive">{error}</StyledText>
              ) : null}

              <Button loading={loading} onPress={() => handleSubmit(onSubmit)()}>
                Send instructions
              </Button>
            </StyledView>

            <StyledView className="mt-8 items-center">
              <Link href="/login" asChild>
                <StyledText className="text-sm font-medium text-primary underline">
                  Back to sign in
                </StyledText>
              </Link>
            </StyledView>
          </>
        )}
      </StyledScrollView>
    </Screen>
  );
}
