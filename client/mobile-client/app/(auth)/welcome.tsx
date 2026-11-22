import { useRouter } from 'expo-router';
import { ArrowRight, BellRing, CarFront, CheckCircle2, ShieldCheck, UserRoundCheck } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StyledText, StyledView } from '@/src/components/ui/core';
import { Button } from '@/src/components/ui/button';
import { Screen } from '@/src/components/layout/screen';

const PRIMARY = '#0F766E';

const features = [
  {
    icon: CarFront,
    title: 'Vehicle management',
    description: 'Register vehicles and track approval status in one place.',
  },
  {
    icon: UserRoundCheck,
    title: 'Visitor access',
    description: 'Create and monitor temporary visitor passes with ease.',
  },
  {
    icon: BellRing,
    title: 'Real-time updates',
    description: 'Receive important gate, approval, and security notifications.',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <Screen
      scroll
      className="bg-background"
      contentContainerStyle={{ flexGrow: 1, paddingTop: 28, paddingBottom: 32 }}
    >
      <StyledView className="w-full max-w-[440px] flex-1 self-center px-6">
        <Animated.View entering={FadeInDown.duration(450)}>
          <StyledView className="flex-row items-center justify-between">
            <StyledView className="flex-row items-center gap-3">
              <StyledView className="h-12 w-12 items-center justify-center rounded-2xl bg-primary">
                <ShieldCheck size={24} color="#FFFFFF" strokeWidth={2.1} />
              </StyledView>
              <StyledView>
                <StyledText className="text-[18px] font-bold tracking-wide text-foreground">GATEGUARD</StyledText>
                <StyledText className="text-[12px] font-semibold tracking-widest text-muted-foreground">
                  SECURE ACCESS
                </StyledText>
              </StyledView>
            </StyledView>
          </StyledView>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(450)} className="mt-10">
          <StyledView className="items-center justify-center rounded-[28px] border border-border bg-secondary/50 px-6 py-10">
            <StyledView className="h-28 w-28 items-center justify-center rounded-full border border-primary/10 bg-background">
              <CarFront size={52} color={PRIMARY} strokeWidth={1.5} />
            </StyledView>
            <StyledView className="mt-5 flex-row items-center gap-2 rounded-full border border-primary/10 bg-background px-4 py-2">
              <CheckCircle2 size={16} color={PRIMARY} />
              <StyledText className="text-[13px] font-semibold text-primary">Smart vehicle access</StyledText>
            </StyledView>
          </StyledView>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(140).duration(450)} className="mt-10">
          <StyledText className="text-[34px] font-bold leading-[42px] tracking-tight text-foreground">
            Smarter access.{'\n'}Safer community.
          </StyledText>
          <StyledText className="mt-3 text-[16px] leading-7 text-muted-foreground">
            Manage vehicles, visitor passes, and gate notifications in one secure, easy-to-use app.
          </StyledText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(450)} className="mt-8 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <StyledView
                key={feature.title}
                className="flex-row items-center gap-4 rounded-2xl border border-border bg-background px-4 py-4"
              >
                <StyledView className="h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
                  <Icon size={22} color={PRIMARY} strokeWidth={1.9} />
                </StyledView>
                <StyledView className="flex-1">
                  <StyledText className="text-[15px] font-semibold text-foreground">{feature.title}</StyledText>
                  <StyledText className="mt-1 text-[14px] leading-6 text-muted-foreground">
                    {feature.description}
                  </StyledText>
                </StyledView>
              </StyledView>
            );
          })}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(260).duration(450)} className="mt-10 gap-3">
          <Button
            size="lg"
            className="h-14 w-full"
            onPress={() => router.push('/(auth)/login')}
          >
            <StyledView className="flex-row items-center gap-2">
              <StyledText className="text-[15px] font-semibold text-primary-foreground">Get Started</StyledText>
              <ArrowRight size={18} color="#FFFFFF" />
            </StyledView>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-14 w-full"
            onPress={() => router.push('/(auth)/register')}
          >
            <StyledText className="text-[15px] font-semibold text-foreground">Create Account</StyledText>
          </Button>

          <StyledText className="pt-2 text-center text-[13px] text-muted-foreground">
            Secure and reliable community access
          </StyledText>
        </Animated.View>
      </StyledView>
    </Screen>
  );
}
