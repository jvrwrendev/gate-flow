
import { useRouter } from 'expo-router';
import {
  ShieldCheck,
  CarFront,
  BellRing,
  UserRoundCheck,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react-native';

import {
  StyledView,
  StyledText,
} from '@/src/components/ui/core';
import { Button } from '@/src/components/ui/button';
import { Screen } from '@/src/components/layout/screen';
import { BottomActionBar } from '@/src/components/layout/bottom-action-bar';

const PRIMARY = '#0F766E';

const features = [
  {
    icon: CarFront,
    title: 'Vehicle Management',
    description: 'Register and manage your vehicles',
  },
  {
    icon: UserRoundCheck,
    title: 'Visitor Access',
    description: 'Request and monitor visitor passes',
  },
  {
    icon: BellRing,
    title: 'Real-time Updates',
    description: 'Receive gate alerts and notifications',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <Screen
      scroll
      className="bg-[#F8FAF9]"
      footer={
        <BottomActionBar className="bg-[#F8FAF9]">
          <Button
            size="lg"
            className="h-14 w-full rounded-xl bg-[#0F766E]"
            onPress={() => router.push('/(auth)/login')}
          >
            <StyledView className="flex-row items-center gap-2">
              <StyledText className="text-[15px] font-semibold text-white">
                Get Started
              </StyledText>
              <ArrowRight size={18} color="#FFFFFF" />
            </StyledView>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="mt-3 h-14 w-full rounded-xl border-[#C5D9D3] bg-transparent"
            onPress={() => router.push('/(auth)/register')}
          >
            <StyledText className="text-[15px] font-semibold text-[#0F766E]">
              Create Account
            </StyledText>
          </Button>

          <StyledText className="mt-4 text-center text-xs text-slate-400">
            Secure and reliable community access
          </StyledText>
        </BottomActionBar>
      }
    >
      <StyledView className="min-h-full flex-1 px-6 pb-8 pt-10">
        <StyledView className="w-full max-w-[420px] flex-1 self-center">

          {/* Brand Header */}
          <StyledView className="flex-row items-center justify-between">
            <StyledView className="flex-row items-center gap-2.5">
              <StyledView className="h-11 w-11 items-center justify-center rounded-xl bg-[#0F766E]">
                <ShieldCheck
                  size={24}
                  color="#FFFFFF"
                  strokeWidth={2}
                />
              </StyledView>

              <StyledText className="text-[17px] font-bold tracking-wide text-[#123F3C]">
                GATEGUARD
              </StyledText>
            </StyledView>

            <StyledText className="text-[10px] font-semibold tracking-widest text-slate-400">
              SECURE ACCESS
            </StyledText>
          </StyledView>

          {/* Hero Illustration */}
          <StyledView className="mt-10 items-center justify-center rounded-[28px] bg-[#EAF5F2] px-6 py-10">
            <StyledView className="h-28 w-28 items-center justify-center rounded-full border border-[#D0E8E1] bg-white">
              <CarFront
                size={54}
                color={PRIMARY}
                strokeWidth={1.5}
              />
            </StyledView>

            <StyledView className="mt-5 flex-row items-center gap-2 rounded-full bg-white px-4 py-2">
              <CheckCircle2 size={15} color={PRIMARY} />
              <StyledText className="text-xs font-semibold text-[#0F766E]">
                Smart Vehicle Access
              </StyledText>
            </StyledView>
          </StyledView>

          {/* Introduction */}
          <StyledView className="mt-9">
            <StyledText className="text-[30px] font-bold leading-[38px] tracking-tight text-[#122B2A]">
              Smarter access.{'\n'}Safer community.
            </StyledText>

            <StyledText className="mt-3 text-[15px] leading-6 text-slate-500">
              Manage vehicles, visitor passes, and gate
              notifications—all in one secure place.
            </StyledText>
          </StyledView>

          {/* Feature List */}
          <StyledView className="mt-8 gap-5">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <StyledView
                  key={feature.title}
                  className="flex-row items-center gap-4"
                >
                  <StyledView className="h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF5F2]">
                    <Icon
                      size={22}
                      color={PRIMARY}
                      strokeWidth={1.8}
                    />
                  </StyledView>

                  <StyledView className="flex-1">
                    <StyledText className="text-[15px] font-semibold text-[#183D3A]">
                      {feature.title}
                    </StyledText>

                    <StyledText className="mt-1 text-[13px] leading-5 text-slate-500">
                      {feature.description}
                    </StyledText>
                  </StyledView>
                </StyledView>
              );
            })}
          </StyledView>
        </StyledView>
      </StyledView>
    </Screen>
  );
}
