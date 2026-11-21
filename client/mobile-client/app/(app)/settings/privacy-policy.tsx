import { useRouter } from 'expo-router';
import { ChevronLeft, Shield } from 'lucide-react-native';
import { StyledView, StyledText, StyledPressable } from '@/src/components/ui/core';
import { H2, Muted } from '@/src/components/ui/typography';
import { Card } from '@/src/components/ui/card';
import { Screen } from '@/src/components/layout/screen';

const sections = [
  {
    title: 'Information we collect',
    body: 'GATEGUARD collects account details, vehicle information, visitor pass requests, and access activity records to provide secure gate access management. In this prototype, all data is mock and stored locally in memory.',
  },
  {
    title: 'How we use information',
    body: 'Information is used to verify vehicles, process visitor access requests, display entry/exit history, and deliver notifications related to approvals and security updates.',
  },
  {
    title: 'Data sharing',
    body: 'Access-related information may be shared with authorized facility administrators and security personnel for operational and safety purposes. No real data is transmitted in this demo environment.',
  },
  {
    title: 'Security',
    body: 'We apply reasonable safeguards to protect account and access information. When integrated with a production backend, industry-standard security controls and encryption should be enforced.',
  },
  {
    title: 'Your choices',
    body: 'You can review and update personal information and manage notification preferences within the app. For account or data requests in a production deployment, contact your facility administrator.',
  },
];

export default function PrivacyPolicyScreen() {
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
            <Shield size={20} color="#0f766e" />
          </StyledView>
          <StyledView className="flex-1">
            <H2>Privacy Policy</H2>
            <Muted className="mt-0.5">Last updated: November 2026</Muted>
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
          This policy is provided for demonstration purposes within the GATEGUARD prototype and does
          not constitute legal advice.
        </Muted>
      </StyledView>
    </Screen>
  );
}
