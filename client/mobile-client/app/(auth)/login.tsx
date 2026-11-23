import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Eye, EyeOff } from 'lucide-react-native';
import { StyledImage, StyledPressable, StyledText, StyledView } from '@/src/components/ui/core';
import { Button } from '@/src/components/ui/button';
import { H1, Muted } from '@/src/components/ui/typography';
import { Input } from '@/src/components/ui/input';
import { FormField } from '@/src/components/layout/form-field';
import { Screen } from '@/src/components/layout/screen';
import { useAuth } from '@/src/context/AuthContext';
import { loginSchema, type LoginSchema } from '@/src/lib/schemas';

const logo = require('@/assets/app-image/logo.png');

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
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
    <Screen
      scroll
      className="bg-background"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1, paddingTop: 24, paddingBottom: 32 }}
    >
      <StyledView className="w-full max-w-[440px] flex-1 self-center px-6">
        <StyledView className="flex-1 justify-center">
          <StyledView className="items-center">
            <StyledImage
              source={logo}
              resizeMode="contain"
              className="h-16 w-44"
              accessibilityLabel="GATEGUARD logo"
            />
            <H1 className="mt-6 text-center text-[30px] leading-tight">Welcome back</H1>
            <Muted className="mt-2 text-center text-[15px] leading-6">
              Sign in to manage your gate access
            </Muted>
          </StyledView>

          <StyledView className="mt-10 gap-5">
            {error ? (
              <StyledView className="flex-row items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
                <AlertCircle size={18} color="#dc2626" style={{ marginTop: 1 }} />
                <StyledText className="flex-1 text-[14px] leading-5 text-foreground">{error}</StyledText>
              </StyledView>
            ) : null}

            <FormField label="Email" error={errors.email?.message}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="name@example.com"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    autoComplete="email"
                    invalid={!!errors.email}
                    returnKeyType="next"
                  />
                )}
              />
            </FormField>

            <FormField label="Password" error={errors.password?.message}>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <StyledView className="relative justify-center">
                    <Input
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Enter your password"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      textContentType="password"
                      autoComplete="password"
                      invalid={!!errors.password}
                      returnKeyType="done"
                      onSubmitEditing={() => handleSubmit(onSubmit)()}
                      className="pr-14"
                    />
                    <StyledPressable
                      onPress={() => setShowPassword((v) => !v)}
                      accessibilityRole="button"
                      accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                      hitSlop={8}
                      className="absolute right-0 h-14 w-14 items-center justify-center"
                    >
                      {showPassword ? <EyeOff size={20} color="#64748B" /> : <Eye size={20} color="#64748B" />}
                    </StyledPressable>
                  </StyledView>
                )}
              />
            </FormField>

            <StyledView className="items-end">
              <Link href="/forgot-password" asChild>
                <StyledPressable accessibilityRole="link" hitSlop={6}>
                  <StyledText className="text-[14px] font-medium text-primary">Forgot password?</StyledText>
                </StyledPressable>
              </Link>
            </StyledView>

            <Button
              size="lg"
              loading={isLoading}
              onPress={() => handleSubmit(onSubmit)()}
              className="mt-2 w-full"
            >
              Sign in
            </Button>

            <StyledView className="flex-row items-center justify-center gap-1.5 pt-1">
              <Muted className="text-[14px]">Don’t have an account?</Muted>
              <Link href="/register" asChild>
                <StyledPressable accessibilityRole="link" hitSlop={6}>
                  <StyledText className="text-[14px] font-semibold text-primary">Sign up</StyledText>
                </StyledPressable>
              </Link>
            </StyledView>
          </StyledView>
        </StyledView>
      </StyledView>
    </Screen>
  );
}
