import { ChevronRight } from 'lucide-react-native';
import { Card, CardContent } from '@/src/components/ui/card';
import { StyledView, StyledText, StyledPressable } from '@/src/components/ui/core';
import { StatusPill } from './status-pill';
import { formatDate } from '@/src/lib/formatters';
import type { Vehicle } from '@/src/types';

interface VehicleCardProps {
  vehicle: Vehicle;
  onPress?: () => void;
}

export function VehicleCard({ vehicle, onPress }: VehicleCardProps) {
  return (
    <Card className="mb-3 p-0">
      <StyledPressable onPress={onPress}>
        <CardContent className="flex-row items-center justify-between p-4">
          <StyledView className="flex-1 gap-1">
            <StyledView className="flex-row flex-wrap items-center gap-2">
              <StyledText className="text-base font-semibold text-foreground">
                {vehicle.plateNumber}
              </StyledText>
              <StatusPill status={vehicle.status} />
            </StyledView>
            <StyledText className="text-sm text-muted-foreground">
              {vehicle.brand} {vehicle.model} · {vehicle.color}
            </StyledText>
            <StyledText className="text-xs text-muted-foreground">
              Submitted {formatDate(vehicle.submittedAt)}
            </StyledText>
          </StyledView>
          <ChevronRight size={20} color="#5f7a7a" />
        </CardContent>
      </StyledPressable>
    </Card>
  );
}
