import { useRouter } from 'expo-router';
import { Shield, Car, Bell, UserCheck } from 'lucide-react-native';
import { StyledView, StyledText } from '@/src/components/ui/core';
import { Button } from '@/src/components/ui/button';
import { H1, Muted } from '@/src/components/ui/typography';
import { Screen } from '@/src/components/layout/screen';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <Screen scroll className="bg-background">
      <StyledView className="flex-1 justify-between px-6 py-10">
        <StyledView className="flex-1 justify-center">
          <StyledView className="w-full max-w-[420px] self-center">
            <StyledView className="items-center">
              <StyledView className="h-16 w-16 items-center justify-center rounded-2xl bg-primary">
                <Shield size={30} color="#ffffff" strokeWidth={2} />
              </StyledView>
              <H1 className="mt-6 text-center text-[30px] leading-tight">GATEGUARD</H1>
              <Muted className="mt-2 text-center text-[15px] leading-relaxed">
                Secure, seamless vehicle access for your community
              </Muted>
            </StyledView>

            <StyledView className="mt-10 gap-3">
              <FeatureRow
                icon={<Car size={18} color="#0f766e" />}
                text="Register and manage your vehicles"
              />
              <FeatureRow
                icon={<UserCheck size={18} color="#0f766e" />}
                text="Request and track visitor access passes"
              />
              <FeatureRow
                icon={<Bell size={18} color="#0f766e" />}
                text="Stay updated with approvals and gate alerts"
              />
            </StyledView>
          </StyledView>
        </StyledView>

        <StyledView className="w-full max-w-[420px] gap-3 self-center">
          <Button size="lg" className="w-full" onPress={() => router.push('/(auth)/login')}>
            Sign in
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onPress={() => router.push('/(auth)/register')}
          >
            Create account
          </Button>
          <Muted className="mt-2 text-center text-xs">
            Manage gate access with confidence
          </Muted>
        </StyledView>
      </StyledView>
    </Screen>
  );
}

function FeatureRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <StyledView className="flex-row items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3.5">
      <StyledView className="h-9 w-9 items-center justify-center rounded-xl bg-secondary">
        {icon}
      </StyledView>
      <StyledText className="flex-1 text-sm font-medium text-foreground">{text}</StyledText>
    </StyledView>
  );
}
