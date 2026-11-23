import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyledImage, StyledPressable, StyledText, StyledView } from '@/src/components/ui/core';
import { Button } from '@/src/components/ui/button';
import { H1, Muted } from '@/src/components/ui/typography';
import { Input } from '@/src/components/ui/input';
import { FormField } from '@/src/components/layout/form-field';
import { Screen } from '@/src/components/layout/screen';
import { useAuth } from '@/src/context/AuthContext';
import { loginSchema, type LoginSchema } from '@/src/lib/schemas';
import { colors } from '@/src/theme/colors';

const logo = require('@/assets/app-image/logo.png');

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    if (isLoading) return;
    setError(null);
    try {
      await login(data);
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to sign in. Please try again.');
    }
  };

  return (
    <Screen
      scroll
      avoidKeyboard
      className="bg-background"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        flexGrow: 1,
        paddingTop: 24,
        paddingBottom: Math.max(insets.bottom, 16) + 24,
      }}
    >
      <StyledView className="w-full max-w-[440px] flex-1 self-center px-6">
        <StyledView className="flex-1 justify-center py-6">
          <StyledView className="items-center">
            <StyledImage
              source={logo}
              resizeMode="contain"
              className="h-14 w-40"
              accessibilityLabel="GATEGUARD logo"
            />
            <H1 className="mt-6 text-center text-[30px] leading-tight text-foreground">
              Welcome back
            </H1>
            <Muted className="mt-2 text-center text-[15px] leading-6">
              Sign in to manage your gate access
            </Muted>
            <StyledView className="mt-4 flex-row items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5">
              <ShieldCheck size={14} color={colors.primary} strokeWidth={2.2} />
              <StyledText className="text-[12px] font-medium text-muted-foreground">
                Secure sign-in
              </StyledText>
            </StyledView>
          </StyledView>

          <StyledView className="mt-8 gap-5">
            {error ? (
              <StyledView
                className="flex-row items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3"
                accessibilityRole="alert"
              >
                <AlertCircle size={18} color={colors.destructive} style={{ marginTop: 1 }} />
                <StyledView className="flex-1">
                  <StyledText className="text-[14px] font-semibold text-foreground">
                    Sign-in failed
                  </StyledText>
                  <StyledText className="mt-0.5 text-[13px] leading-5 text-muted-foreground">
                    {error}
                  </StyledText>
                </StyledView>
              </StyledView>
            ) : null}

            <FormField label="Email address" error={errors.email?.message}>
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
                    editable={!isLoading}
                    returnKeyType="next"
                    accessibilityLabel="Email address"
                    leading={<Mail size={18} color={colors.mutedForeground} />}
                  />
                )}
              />
            </FormField>

            <FormField label="Password" error={errors.password?.message}>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
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
                    editable={!isLoading}
                    returnKeyType="done"
                    onSubmitEditing={() => handleSubmit(onSubmit)()}
                    accessibilityLabel="Password"
                    leading={<Lock size={18} color={colors.mutedForeground} />}
                    trailing={
                      <StyledPressable
                        onPress={() => setShowPassword((v) => !v)}
                        accessibilityRole="button"
                        accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                        hitSlop={8}
                        className="h-11 w-11 items-center justify-center -mr-2"
                      >
                        {showPassword ? (
                          <EyeOff size={20} color={colors.mutedForeground} />
                        ) : (
                          <Eye size={20} color={colors.mutedForeground} />
                        )}
                      </StyledPressable>
                    }
                  />
                )}
              />
            </FormField>

            <StyledView className="items-end -mt-1">
              <Link href="/forgot-password" asChild>
                <StyledPressable
                  accessibilityRole="link"
                  accessibilityLabel="Forgot password"
                  hitSlop={8}
                  className="min-h-11 justify-center px-1"
                >
                  <StyledText className="text-[14px] font-medium text-primary">
                    Forgot password?
                  </StyledText>
                </StyledPressable>
              </Link>
            </StyledView>

            <Button
              size="lg"
              loading={isLoading}
              disabled={isLoading}
              onPress={() => handleSubmit(onSubmit)()}
              className="w-full"
              accessibilityLabel="Sign in"
            >
              Sign in
            </Button>

            <StyledView className="flex-row items-center justify-center gap-1.5 pt-1">
              <Muted className="text-[14px]">Don’t have an account?</Muted>
              <Link href="/register" asChild>
                <StyledPressable
                  accessibilityRole="link"
                  accessibilityLabel="Create an account"
                  hitSlop={8}
                  className="min-h-11 justify-center px-1"
                >
                  <StyledText className="text-[14px] font-semibold text-primary">
                    Sign up
                  </StyledText>
                </StyledPressable>
              </Link>
            </StyledView>
          </StyledView>
        </StyledView>
      </StyledView>
    </Screen>
  );
}
