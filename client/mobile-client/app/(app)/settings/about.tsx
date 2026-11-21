import { useRouter } from 'expo-router';
import { ChevronLeft, Info, ShieldCheck, Car, Bell } from 'lucide-react-native';
import { StyledView, StyledText, StyledPressable } from '@/src/components/ui/core';
import { H2, Muted } from '@/src/components/ui/typography';
import { Card } from '@/src/components/ui/card';
import { Screen } from '@/src/components/layout/screen';

export default function AboutScreen() {
  const router = useRouter();
  const version = '1.0.0';
  const appName = 'GATEGUARD';

  return (
    <Screen scroll>
      <StyledView className="gap-5 px-5 pt-4">
        <StyledPressable
          onPress={() => router.back()}
          className="flex-row items-center gap-1 self-start"
        >
          <ChevronLeft size={20} color="#0f766e" />
          <StyledText className="text-sm font-medium text-foreground">Back</StyledText>
        </StyledPressable>

        <StyledView className="flex-row items-center gap-3">
          <StyledView className="h-11 w-11 items-center justify-center rounded-xl bg-secondary">
            <Info size={20} color="#0f766e" />
          </StyledView>
          <StyledView className="flex-1">
            <H2>About GATEGUARD</H2>
            <Muted className="mt-0.5">Application information</Muted>
          </StyledView>
        </StyledView>

        <Card className="items-center gap-2 p-5">
          <StyledView className="h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <ShieldCheck size={26} color="#ffffff" />
          </StyledView>
          <StyledText className="mt-1 text-lg font-semibold text-foreground">{appName}</StyledText>
          <StyledText className="text-sm text-muted-foreground">Version {version}</StyledText>
          <StyledView className="mt-1 rounded-full border border-border bg-secondary px-3 py-1">
            <StyledText className="text-xs font-medium text-secondary-foreground">
              Mock prototype
            </StyledText>
          </StyledView>
        </Card>

        <Card className="gap-3 p-4">
          <StyledText className="text-sm font-semibold text-foreground">Overview</StyledText>
          <StyledText className="text-sm leading-relaxed text-muted-foreground">
            GATEGUARD is a mobile experience for AI-assisted automatic barrier gate access
            management. It helps residents and authorized users register vehicles, request visitor
            passes, track approvals, review access history, and receive important notifications.
          </StyledText>
        </Card>

        <Card className="gap-0 p-0">
          <InfoRow icon={<Car size={18} color="#0f766e" />} label="Vehicle registration & approvals" />
          <InfoRow icon={<ShieldCheck size={18} color="#0f766e" />} label="Secure access visibility" />
          <InfoRow icon={<Bell size={18} color="#0f766e" />} label="Alerts & notifications" last />
        </Card>

        <Muted className="text-center text-xs">© 2026 GATEGUARD. All rights reserved.</Muted>
      </StyledView>
    </Screen>
  );
}

function InfoRow({
  icon,
  label,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  last?: boolean;
}) {
  return (
    <StyledView
      className={`flex-row items-center gap-3 px-4 py-3.5 ${last ? '' : 'border-b border-border'}`}
    >
      <StyledView className="h-9 w-9 items-center justify-center rounded-xl bg-secondary">
        {icon}
      </StyledView>
      <StyledText className="flex-1 text-sm font-medium text-foreground">{label}</StyledText>
    </StyledView>
  );
}
