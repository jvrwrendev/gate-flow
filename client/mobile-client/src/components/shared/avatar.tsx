import { User } from 'lucide-react-native';
import { StyledView, StyledText } from '@/src/components/ui/core';
import { cn } from '@/src/lib/utils';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const sizeMap = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-20 w-20',
};

const textMap = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-2xl',
};

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  return (
    <StyledView
      className={cn(
        'items-center justify-center rounded-full bg-secondary',
        sizeMap[size],
        className
      )}
    >
      <StyledText className={cn('font-semibold text-secondary-foreground', textMap[size])}>
        {initials(name)}
      </StyledText>
    </StyledView>
  );
}

export function AvatarPlaceholder({ size = 'md', className }: Omit<AvatarProps, 'name'>) {
  return (
    <StyledView
      className={cn(
        'items-center justify-center rounded-full bg-muted',
        sizeMap[size],
        className
      )}
    >
      <User size={size === 'lg' ? 32 : size === 'md' ? 20 : 16} color="#737373" />
    </StyledView>
  );
}
