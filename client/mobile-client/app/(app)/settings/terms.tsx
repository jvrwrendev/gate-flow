import { useRouter } from 'expo-router';
import { ChevronLeft, FileText } from 'lucide-react-native';
import { StyledView, StyledText, StyledPressable } from '@/src/components/ui/core';
import { H2, Muted } from '@/src/components/ui/typography';
import { Card } from '@/src/components/ui/card';
import { Screen } from '@/src/components/layout/screen';

const sections = [
  {
    title: 'Acceptance of terms',
    body: 'By using the GATEGUARD mobile application, you agree to comply with these terms and with your facility’s access and security policies.',
  },
  {
    title: 'Authorized use',
    body: 'You are responsible for providing accurate vehicle and visitor information and for using the app only for lawful, authorized access management purposes.',
  },
  {
    title: 'Vehicle and visitor submissions',
    body: 'Registrations and visitor pass requests may be subject to verification and approval by facility administrators or security personnel. Approval is not guaranteed.',
  },
  {
    title: 'Notifications and access records',
    body: 'The app may display access history, alerts, and status updates. In production environments, availability and accuracy depend on integrated systems and network conditions.',
  },
  {
    title: 'Prototype notice',
    body: 'This version of GATEGUARD is a mock-data prototype for demonstration only. Features, workflows, and content may change prior to production release.',
  },
];

export default function TermsScreen() {
  const router = useRouter();

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
            <FileText size={20} color="#0f766e" />
          </StyledView>
          <StyledView className="flex-1">
            <H2>Terms &amp; Conditions</H2>
            <Muted className="mt-0.5">Please review before using GATEGUARD</Muted>
          </StyledView>
        </StyledView>

        <Card className="gap-4 p-4">
          {sections.map((section) => (
            <StyledView key={section.title} className="gap-1.5">
              <StyledText className="text-sm font-semibold text-foreground">
                {section.title}
              </StyledText>
              <StyledText className="text-sm leading-relaxed text-muted-foreground">
                {section.body}
              </StyledText>
            </StyledView>
          ))}
        </Card>

        <Muted className="text-xs leading-relaxed">
          These terms are sample content for the GATEGUARD prototype and should be replaced with
          approved legal terms for production use.
        </Muted>
      </StyledView>
    </Screen>
  );
}
