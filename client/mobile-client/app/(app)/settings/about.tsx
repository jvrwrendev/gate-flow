import { useRouter } from 'expo-router';
import { Info, ShieldCheck, Car, Bell } from 'lucide-react-native';
import { StyledView, StyledText } from '@/src/components/ui/core';
import { Muted } from '@/src/components/ui/typography';
import { Card } from '@/src/components/ui/card';
import { Screen } from '@/src/components/layout/screen';
import { ScreenHeader } from '@/src/components/layout/screen-header';

export default function AboutScreen() {
  const router = useRouter();
  const version = '1.0.0';
  const appName = 'GATEGUARD';

  return (
    <Screen scroll>
      <StyledView className="gap-5 px-5 pt-4">
        <ScreenHeader title="About GATEGUARD" subtitle="Application information" showBack />

        <Card className="items-center gap-2 p-5">
          <StyledView className="h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <ShieldCheck size={26} color="#ffffff" />
          </StyledView>
          <StyledText className="mt-1 text-lg font-semibold text-foreground">{appName}</StyledText>
          <StyledText className="text-sm text-muted-foreground">Version {version}</StyledText>
          <StyledView className="mt-1 rounded-full border border-border bg-accent px-3 py-1">
            <StyledText className="text-[13px] font-medium text-accent-foreground">
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
          <InfoRow icon={<Car size={18} color="#087FE8" />} label="Vehicle registration & approvals" />
          <InfoRow icon={<ShieldCheck size={18} color="#087FE8" />} label="Secure access visibility" />
          <InfoRow icon={<Bell size={18} color="#087FE8" />} label="Alerts & notifications" last />
        </Card>

        <Muted className="text-center text-[13px]">© 2026 GATEGUARD. All rights reserved.</Muted>
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
      <StyledView className="h-9 w-9 items-center justify-center rounded-xl bg-accent">
        {icon}
      </StyledView>
      <StyledText className="flex-1 text-sm font-medium text-foreground">{label}</StyledText>
    </StyledView>
  );
}
