import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ChevronRight,
  User,
  KeyRound,
  Bell,
  ShieldCheck,
  FileText,
  Info,
  LogOut,
} from 'lucide-react-native';
import { StyledView, StyledText, StyledPressable } from '@/src/components/ui/core';
import { H2, Muted } from '@/src/components/ui/typography';
import { Card } from '@/src/components/ui/card';
import { Screen } from '@/src/components/layout/screen';
import { ScreenHeader } from '@/src/components/layout/screen-header';
import { Avatar } from '@/src/components/shared/avatar';
import { useAuth } from '@/src/context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to sign out of GATEGUARD?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <Screen scroll>
      <StyledView className="gap-5 px-5 pt-4">
        <ScreenHeader title="Profile & Settings" subtitle="Manage your account and preferences" />

        <Card className="flex-row items-center gap-4 p-4">
          <Avatar name={user?.name ?? 'User'} size="lg" />
          <StyledView className="flex-1">
            <StyledText className="text-lg font-semibold text-foreground">
              {user?.name}
            </StyledText>
            <Muted>{user?.email}</Muted>
            {user?.phone ? <Muted className="mt-0.5">{user.phone}</Muted> : null}
            {user?.unit ? (
              <StyledView className="mt-2 self-start rounded-full border border-border bg-accent px-2.5 py-1">
                <StyledText className="text-[13px] font-medium text-accent-foreground">
                  Unit {user.unit}
                </StyledText>
              </StyledView>
            ) : null}
          </StyledView>
        </Card>

        <StyledView className="gap-2">
          <SectionLabel title="Account" />
          <Card className="p-0">
            <MenuItem
              icon={<User size={20} color="#087FE8" />}
              label="Personal Information"
              description="View and edit your profile details"
              onPress={() => router.push('/settings/personal-info')}
            />
            <MenuItem
              icon={<KeyRound size={20} color="#087FE8" />}
              label="Change Password"
              description="Update your account password"
              onPress={() => router.push('/settings/change-password')}
              last
            />
          </Card>
        </StyledView>

        <StyledView className="gap-2">
          <SectionLabel title="Preferences" />
          <Card className="p-0">
            <MenuItem
              icon={<Bell size={20} color="#087FE8" />}
              label="Notification Settings"
              description="Manage push notifications and access alerts"
              onPress={() => router.push('/settings/notifications')}
              last
            />
          </Card>
        </StyledView>

        <StyledView className="gap-2">
          <SectionLabel title="Legal &amp; About" />
          <Card className="p-0">
            <MenuItem
              icon={<ShieldCheck size={20} color="#087FE8" />}
              label="Privacy Policy"
              description="How your information is handled"
              onPress={() => router.push('/settings/privacy-policy')}
            />
            <MenuItem
              icon={<FileText size={20} color="#087FE8" />}
              label="Terms &amp; Conditions"
              description="Application terms of use"
              onPress={() => router.push('/settings/terms')}
            />
            <MenuItem
              icon={<Info size={20} color="#087FE8" />}
              label="About GATEGUARD"
              description="App information and version"
              onPress={() => router.push('/settings/about')}
              last
            />
          </Card>
        </StyledView>

        <Card className="p-0">
          <StyledPressable
            onPress={handleLogout}
            className="flex-row items-center justify-between px-4 py-3.5"
            accessibilityRole="button"
          >
            <StyledView className="flex-row items-center gap-3">
              <StyledView className="h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
                <LogOut size={20} color="#dc2626" />
              </StyledView>
              <StyledView>
                <StyledText className="text-sm font-semibold text-destructive">Logout</StyledText>
                <StyledText className="text-[13px] text-muted-foreground">
                  Sign out of your account
                </StyledText>
              </StyledView>
            </StyledView>
            <ChevronRight size={18} color="#64748B" />
          </StyledPressable>
        </Card>
      </StyledView>
    </Screen>
  );
}

function SectionLabel({ title }: { title: string }) {
  return (
    <StyledText className="px-1 text-sm font-semibold text-foreground">{title}</StyledText>
  );
}

function MenuItem({
  icon,
  label,
  description,
  onPress,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <StyledPressable
      onPress={onPress}
      className={`flex-row items-center justify-between px-4 py-3.5 ${last ? '' : 'border-b border-border'}`}
      accessibilityRole="button"
    >
      <StyledView className="flex-1 flex-row items-center gap-3 pr-3">
        <StyledView className="h-10 w-10 items-center justify-center rounded-xl bg-accent">
          {icon}
        </StyledView>
        <StyledView className="flex-1">
          <StyledText className="text-sm font-medium text-foreground">{label}</StyledText>
          {description ? (
            <StyledText className="mt-0.5 text-[13px] leading-5 text-muted-foreground">{description}</StyledText>
          ) : null}
        </StyledView>
      </StyledView>
      <ChevronRight size={18} color="#64748B" />
    </StyledPressable>
  );
}
