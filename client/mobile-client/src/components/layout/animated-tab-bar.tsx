import { useEffect } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import { StyledText } from '@/src/components/ui/core';
import { colors } from '@/src/theme/colors';
import { LayoutDashboard, CarFront, History, Bell, User } from 'lucide-react-native';

const ACTIVE_BG = colors.primary;
const INACTIVE_ICON = colors.mutedForeground;
const ACTIVE_FG = colors.white;

const ICONS: Record<string, typeof LayoutDashboard> = {
  index: LayoutDashboard,
  vehicles: CarFront,
  history: History,
  notifications: Bell,
  profile: User,
};

const LABELS: Record<string, string> = {
  index: 'Home',
  vehicles: 'Vehicles',
  history: 'History',
  notifications: 'Alerts',
  profile: 'Profile',
};

function TabItem({
  routeName,
  label,
  isFocused,
  onPress,
  onLongPress,
  accessibilityLabel,
}: {
  routeName: string;
  label: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  accessibilityLabel?: string;
}) {
  const progress = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isFocused ? 1 : 0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [isFocused, progress]);

  const containerStyle = useAnimatedStyle(() => {
    return {
      flex: interpolate(progress.value, [0, 1], [1, 1.9]),
    };
  });

  const pillStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(progress.value, [0, 1], ['rgba(8,127,232,0)', ACTIVE_BG]),
      paddingHorizontal: interpolate(progress.value, [0, 1], [0, 14]),
    };
  });

  const labelStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      maxWidth: interpolate(progress.value, [0, 1], [0, 120]),
      marginLeft: interpolate(progress.value, [0, 1], [0, 6]),
      transform: [{ translateX: interpolate(progress.value, [0, 1], [-4, 0]) }],
    };
  });

  const normalizedRoute = routeName.toLowerCase();
  const iconKey =
    ICONS[routeName]
      ? routeName
      : normalizedRoute.includes('vehicle')
        ? 'vehicles'
        : routeName;
  const Icon = ICONS[iconKey] ?? LayoutDashboard;

  return (
    <Animated.View style={[styles.itemContainer, containerStyle]}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        accessibilityRole="tab"
        accessibilityState={{ selected: isFocused }}
        accessibilityLabel={accessibilityLabel ?? label}
        style={styles.pressable}
      >
        <Animated.View style={[styles.pill, pillStyle]}>
          <Icon size={22} color={isFocused ? ACTIVE_FG : INACTIVE_ICON} strokeWidth={2.2} />
          <Animated.View style={[styles.labelWrap, labelStyle]}>
            <StyledText
              numberOfLines={1}
              className="text-[13px] font-semibold"
              style={{ color: ACTIVE_FG }}
            >
              {label}
            </StyledText>
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export function AnimatedTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 10);

  return (
    <View
      style={[
        styles.bar,
        {
          bottom,
        },
      ]}
    >
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const descriptor = descriptors[route.key];
        const options = descriptor?.options ?? {};
        const routeNavigation = descriptor?.navigation ?? navigation;
        const label =
          LABELS[route.name] ??
          (typeof options.tabBarLabel === 'string'
            ? options.tabBarLabel
            : typeof options.title === 'string'
              ? options.title
              : route.name);

        const onPress = () => {
          const event = routeNavigation?.emit?.({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event?.defaultPrevented) {
            if (routeNavigation?.navigate) {
              routeNavigation.navigate(route.name, route.params);
            } else {
              navigation?.navigate?.(route.name, route.params);
            }
          }
        };

        const onLongPress = () => {
          routeNavigation?.emit?.({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TabItem
            key={route.key}
            routeName={route.name}
            label={label}
            isFocused={isFocused}
            onPress={onPress}
            onLongPress={onLongPress}
            accessibilityLabel={options.tabBarAccessibilityLabel}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 64,
    backgroundColor: '#ffffff',
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  itemContainer: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressable: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pill: {
    height: 44,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  labelWrap: {
    overflow: 'hidden',
    justifyContent: 'center',
  },
});
