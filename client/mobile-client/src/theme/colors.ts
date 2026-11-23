export const colors = {
  primary: '#087FE8',
  primaryForeground: '#FFFFFF',
  secondary: '#003B80',
  secondaryForeground: '#FFFFFF',
  navy: '#0B2348',
  background: '#FFFFFF',
  surface: '#F8FAFC',
  border: '#E2E8F0',
  input: '#E2E8F0',
  mutedForeground: '#64748B',
  accent: '#EBF4FF',
  accentForeground: '#003B80',
  white: '#FFFFFF',
  destructive: '#DC2626',
  success: '#16A34A',
  warning: '#D97706',
  info: '#0284C7',
} as const;

export type ThemeColor = keyof typeof colors;
