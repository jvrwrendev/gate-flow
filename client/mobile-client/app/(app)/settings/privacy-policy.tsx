import { useRouter } from 'expo-router';
import { Shield } from 'lucide-react-native';
import { StyledView, StyledText } from '@/src/components/ui/core';
import { Muted } from '@/src/components/ui/typography';
import { Card } from '@/src/components/ui/card';
import { Screen } from '@/src/components/layout/screen';
import { ScreenHeader } from '@/src/components/layout/screen-header';

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
        <ScreenHeader title="Privacy Policy" subtitle="Last updated: November 2026" showBack />

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

        <Muted className="text-[13px] leading-relaxed">
          This policy is provided for demonstration purposes within the GATEGUARD prototype and does
          not constitute legal advice.
        </Muted>
      </StyledView>
    </Screen>
  );
}
