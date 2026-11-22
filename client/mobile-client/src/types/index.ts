import {
  type ApprovalStatus,
  type VehicleType,
  type NotificationType,
  type PassStatus,
  type AccessDirection,
  type AccessResult,
} from '@/src/lib/constants';

export type { ApprovalStatus, VehicleType, NotificationType, PassStatus, AccessDirection, AccessResult };

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  avatarUrl?: string;
  unit?: string;
  notificationPrefs: NotificationPreferences;
}

export interface NotificationPreferences {
  approvals: boolean;
  entryExit: boolean;
  security: boolean;
  visitorUpdates: boolean;
  emailDigest: boolean;
}

export interface Vehicle {
  id: string;
  ownerId: string;
  plateNumber: string;
  type: VehicleType;
  brand: string;
  model: string;
  color: string;
  photoUrl?: string;
  status: ApprovalStatus;
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface ApprovalStep {
  status: ApprovalStatus;
  label: string;
  description: string;
  timestamp?: string;
}

export interface VisitorPass {
  id: string;
  hostUserId: string;
  visitorName: string;
  visitorPhone?: string;
  purpose: string;
  vehiclePlate?: string;
  vehicleType?: VehicleType;
  vehiclePhotoUrl?: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: PassStatus;
  requestedAt: string;
  reviewedAt?: string;
  notes?: string;
}

export interface AccessLog {
  id: string;
  vehicleId?: string;
  plateNumber: string;
  direction: AccessDirection;
  timestamp: string;
  gate: string;
  result: AccessResult;
  notes?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  relatedId?: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
  unit?: string;
};

export type CreateVehiclePayload = {
  plateNumber: string;
  type: VehicleType;
  brand: string;
  model: string;
  color: string;
  photoUrl?: string;
};

export type CreateVisitorPassPayload = {
  visitorName: string;
  visitorPhone?: string;
  purpose: string;
  vehiclePlate?: string;
  vehicleType?: VehicleType;
  vehiclePhotoUrl?: string;
  scheduledStart: string;
  scheduledEnd: string;
  notes?: string;
};
