import { useRouter } from 'expo-router';
import { StyledView, StyledText, StyledPressable, StyledSwitch } from '@/src/components/ui/core';
import { H2 } from '@/src/components/ui/typography';
import { Card, CardContent } from '@/src/components/ui/card';
import { Screen } from '@/src/components/layout/screen';
import { useAuth } from '@/src/context/AuthContext';
import { ChevronLeft } from 'lucide-react-native';

export default function NotificationPreferencesScreen() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const prefs = user!.notificationPrefs;

  const updatePref = (key: keyof typeof prefs, value: boolean) => {
    updateUser({ notificationPrefs: { ...prefs, [key]: value } });
  };

  return (
    <Screen scroll>
      <StyledView className="px-4 pt-6">
        <StyledPressable
          onPress={() => router.back()}
          className="mb-4 flex-row items-center gap-1 self-start"
        >
          <ChevronLeft size={20} color="#111827" />
          <StyledText className="text-sm font-medium text-foreground">Back</StyledText>
        </StyledPressable>

        <H2 className="mb-6">Notification preferences</H2>

        <Card>
          <CardContent className="gap-1">
            <ToggleRow
              label="Vehicle approvals"
              description="Get notified when your vehicle status changes."
              value={prefs.approvals}
              onValueChange={(v) => updatePref('approvals', v)}
            />
            <ToggleRow
              label="Entry / exit alerts"
              description="Receive alerts when your vehicles pass through gates."
              value={prefs.entryExit}
              onValueChange={(v) => updatePref('entryExit', v)}
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
            />
            <ToggleRow
              label="Weekly email digest"
              description="A summary of activity every week."
              value={prefs.emailDigest}
              onValueChange={(v) => updatePref('emailDigest', v)}
            />
          </CardContent>
        </Card>
      </StyledView>
    </Screen>
  );
}

function ToggleRow({
  label,
  description,
  value,
  onValueChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <StyledView className="flex-row items-center justify-between border-b border-border py-3 last:border-b-0">
      <StyledView className="flex-1 pr-4">
        <StyledText className="text-sm font-medium text-foreground">{label}</StyledText>
        <StyledText className="mt-0.5 text-xs text-muted-foreground">{description}</StyledText>
      </StyledView>
      <StyledSwitch value={value} onValueChange={onValueChange} />
    </StyledView>
  );
}
