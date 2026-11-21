import { useRouter } from 'expo-router';
import { ChevronLeft, Bell } from 'lucide-react-native';
import { StyledView, StyledText, StyledPressable, StyledSwitch } from '@/src/components/ui/core';
import { H2, Muted } from '@/src/components/ui/typography';
import { Card } from '@/src/components/ui/card';
import { Screen } from '@/src/components/layout/screen';
import { useAuth } from '@/src/context/AuthContext';

export default function NotificationSettingsScreen() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const prefs = user!.notificationPrefs;

  const updatePref = (key: keyof typeof prefs, value: boolean) => {
    updateUser({ notificationPrefs: { ...prefs, [key]: value } });
  };

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
            <Bell size={20} color="#0f766e" />
          </StyledView>
          <StyledView className="flex-1">
            <H2>Notification Settings</H2>
            <Muted className="mt-0.5">Manage push notifications and access alerts</Muted>
          </StyledView>
        </StyledView>

        <StyledView className="gap-2">
          <StyledText className="px-1 text-sm font-semibold text-foreground">Access alerts</StyledText>
          <Card className="p-0">
            <ToggleRow
              label="Entry and exit alerts"
              description="Receive alerts when your vehicles pass through gates."
              value={prefs.entryExit}
              onValueChange={(v) => updatePref('entryExit', v)}
              last
            />
          </Card>
        </StyledView>

        <StyledView className="gap-2">
          <StyledText className="px-1 text-sm font-semibold text-foreground">Push notifications</StyledText>
          <Card className="p-0">
            <ToggleRow
              label="Vehicle approvals"
              description="Get notified when your vehicle status changes."
              value={prefs.approvals}
              onValueChange={(v) => updatePref('approvals', v)}
            />
            <ToggleRow
              label="Security updates"
              description="Important notices from building security."
              value={prefs.security}
              onValueChange={(v) => updatePref('security', v)}
            />
            <ToggleRow
              label="Visitor updates"
              description="Alerts about visitor pass approvals and usage."
              value={prefs.visitorUpdates}
              onValueChange={(v) => updatePref('visitorUpdates', v)}
              last
            />
          </Card>
        </StyledView>

        <StyledView className="gap-2">
          <StyledText className="px-1 text-sm font-semibold text-foreground">Email</StyledText>
          <Card className="p-0">
            <ToggleRow
              label="Weekly email digest"
              description="A summary of activity delivered to your email."
              value={prefs.emailDigest}
              onValueChange={(v) => updatePref('emailDigest', v)}
              last
            />
          </Card>
        </StyledView>
      </StyledView>
    </Screen>
  );
}

function ToggleRow({
  label,
  description,
  value,
  onValueChange,
  last,
}: {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  last?: boolean;
}) {
  return (
    <StyledView
      className={`flex-row items-center justify-between px-4 py-3.5 ${last ? '' : 'border-b border-border'}`}
    >
      <StyledView className="flex-1 pr-4">
        <StyledText className="text-sm font-medium text-foreground">{label}</StyledText>
        <StyledText className="mt-0.5 text-xs text-muted-foreground">{description}</StyledText>
      </StyledView>
      <StyledSwitch value={value} onValueChange={onValueChange} />
    </StyledView>
  );
}
