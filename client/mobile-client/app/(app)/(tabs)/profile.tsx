import { useRouter } from 'expo-router';
import { StyledView, StyledText, StyledPressable } from '@/src/components/ui/core';
import { Button } from '@/src/components/ui/button';
import { H2, Muted } from '@/src/components/ui/typography';
import { Card, CardContent } from '@/src/components/ui/card';
import { Screen } from '@/src/components/layout/screen';
import { Avatar } from '@/src/components/shared/avatar';
import { useAuth } from '@/src/context/AuthContext';
import {
  ChevronRight,
  User,
  Bell,
  LogOut,
  Shield,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <Screen scroll>
      <StyledView className="gap-6 px-4 pt-6">
        <H2>Profile</H2>

        <StyledView className="items-center gap-3">
          <Avatar name={user?.name ?? 'User'} size="lg" />
          <StyledView className="items-center">
            <StyledText className="text-xl font-semibold text-foreground">
              {user?.name}
            </StyledText>
            <Muted>{user?.email}</Muted>
            {user?.unit ? <Muted>Unit {user.unit}</Muted> : null}
          </StyledView>
        </StyledView>

        <Card>
          <CardContent className="gap-1">
            <MenuItem
              icon={<User size={20} color="#111827" />}
              label="Personal information"
              onPress={() => router.push('/settings/personal-info')}
            />
            <MenuItem
              icon={<Bell size={20} color="#111827" />}
              label="Notification preferences"
              onPress={() => router.push('/settings/notifications')}
            />
            <MenuItem
              icon={<Shield size={20} color="#111827" />}
              label="Security & access"
              onPress={() => {}}
              disabled
            />
          </CardContent>
        </Card>

        <Button variant="outline" onPress={handleLogout}>
          <LogOut size={18} color="#111827" />
          <StyledText className="ml-2 text-sm font-medium text-foreground">Log out</StyledText>
        </Button>

        <Muted className="text-center text-xs">GATEGUARD v1.0.0 · Mock data mode</Muted>
      </StyledView>
    </Screen>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <StyledPressable
      onPress={onPress}
      disabled={disabled}
      className={`flex-row items-center justify-between border-b border-border py-3 last:border-b-0 ${
        disabled ? 'opacity-50' : ''
      }`}
    >
      <StyledView className="flex-row items-center gap-3">
        <StyledView className="rounded-full bg-secondary p-2">{icon}</StyledView>
        <StyledText className="text-sm font-medium text-foreground">{label}</StyledText>
      </StyledView>
      <ChevronRight size={18} color="#737373" />
    </StyledPressable>
  );
}
