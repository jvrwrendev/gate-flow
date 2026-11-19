export const APP_NAME = 'GATEGUARD';

export const APPROVAL_STATUSES = [
  'PENDING_VERIFICATION',
  'PENDING_APPROVAL',
  'APPROVED',
  'REJECTED',
] as const;

export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export const VEHICLE_TYPES = [
  'Car',
  'Motorcycle',
  'SUV',
  'Truck',
  'Van',
  'Other',
] as const;

export type VehicleType = (typeof VEHICLE_TYPES)[number];

export const NOTIFICATION_TYPES = [
  'APPROVAL',
  'ENTRY_EXIT',
  'SECURITY',
  'VISITOR',
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const PASS_STATUSES = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'USED',
  'EXPIRED',
] as const;

export type PassStatus = (typeof PASS_STATUSES)[number];

export const ACCESS_DIRECTIONS = ['ENTRY', 'EXIT'] as const;

export type AccessDirection = (typeof ACCESS_DIRECTIONS)[number];

export const ACCESS_RESULTS = ['GRANTED', 'DENIED'] as const;

export type AccessResult = (typeof ACCESS_RESULTS)[number];

export const MOCK_DELAY = {
  min: 400,
  max: 900,
} as const;
