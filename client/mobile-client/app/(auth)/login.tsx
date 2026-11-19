import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StyledView, StyledText, StyledScrollView } from '@/src/components/ui/core';
import { Button } from '@/src/components/ui/button';
import { H2, Muted } from '@/src/components/ui/typography';
import { Input } from '@/src/components/ui/input';
import { FormField } from '@/src/components/layout/form-field';
import { Screen } from '@/src/components/layout/screen';
import { useAuth } from '@/src/context/AuthContext';
import { loginSchema, type LoginSchema } from '@/src/lib/schemas';
import { Shield } from 'lucide-react-native';

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'demo@gateguard.app', password: 'password' },
  });

  const onSubmit = async (data: LoginSchema) => {
    setError(null);
    try {
      await login(data);
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
    }
  };

  return (
    <Screen scroll className="justify-center px-6">
      <StyledScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <StyledView className="items-center gap-2">
          <StyledView className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
            <Shield size={32} color="#111827" />
          </StyledView>
          <H2 className="text-center">Welcome back</H2>
          <Muted className="text-center">Sign in to manage your gate access</Muted>
        </StyledView>

        <StyledView className="mt-10 gap-4">
          <FormField label="Email" error={errors.email?.message}>
            <ControllerInput
              control={control}
              name="email"
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </FormField>

          <FormField label="Password" error={errors.password?.message}>
            <ControllerInput
              control={control}
              name="password"
              placeholder="••••••••"
              secureTextEntry
            />
          </FormField>

          {error ? (
            <StyledText className="text-center text-sm text-destructive">{error}</StyledText>
          ) : null}

          <Button loading={isLoading} onPress={() => handleSubmit(onSubmit)()}>
            Sign in
          </Button>

          <StyledView className="items-center">
            <Link href="/forgot-password" asChild>
              <StyledText className="text-sm text-primary underline">
                Forgot password?
              </StyledText>
            </Link>
          </StyledView>
        </StyledView>

        <StyledView className="mt-8 flex-row justify-center gap-1">
          <Muted>Don’t have an account?</Muted>
          <Link href="/register" asChild>
            <StyledText className="text-sm font-medium text-primary underline">
              Sign up
            </StyledText>
          </Link>
        </StyledView>

        <StyledView className="mt-8 rounded-lg bg-muted p-3">
          <Muted className="text-center text-xs">
            Demo account: demo@gateguard.app / password
          </Muted>
        </StyledView>
      </StyledScrollView>
    </Screen>
  );
}

import { Control, Controller } from 'react-hook-form';

function ControllerInput({
  control,
  name,
  ...props
}: {
  control: Control<LoginSchema>;
  name: keyof LoginSchema;
} & React.ComponentPropsWithoutRef<typeof Input>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <Input onBlur={onBlur} onChangeText={onChange} value={value} {...props} />
      )}
    />
  );
}
