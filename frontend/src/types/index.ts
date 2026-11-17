export type Status = 'Active' | 'Inactive' | 'Online' | 'Offline'
export type VehicleType = 'Sedan' | 'SUV' | 'Pickup' | 'Van' | 'Motorcycle' | 'Tricycle' | 'Bus' | 'Truck'
export type VehicleColor = 'White' | 'Black' | 'Silver' | 'Gray' | 'Red' | 'Blue' | 'Green' | 'Brown' | 'Other'
export type AccessDecision = 'AUTHORIZED' | 'DENIED' | 'NEEDS REVIEW'

export interface Vehicle {
  id: string; plate: string; ownerId: string; ownerName: string; contact: string
  type: VehicleType; model: string; color: VehicleColor; registrationDate: string
  status: 'Authorized' | 'Pending' | 'Suspended' | 'Denied'
}
export interface Owner {
  id: string; name: string; email: string; phone: string; address: string
  joined: string; status: 'Active' | 'Inactive'
}
export interface Application {
  id: string; reference: string; ownerId: string; ownerName: string; email: string; phone: string
  plate: string; type: VehicleType; model: string; color: VehicleColor; submitted: string
  status: 'Pending' | 'Approved' | 'Rejected'; remarks: string; purpose: string
}
export interface Gate {
  id: string; name: string; location: string; cameraId: string; controllerId: string
  status: 'Online' | 'Offline'; barrier: 'OPEN' | 'CLOSED'; mode: 'AUTOMATIC' | 'MANUAL'
  entriesToday: number; lastActivity: string
}
export interface Camera {
  id: string; name: string; location: string; model: string; type: 'Bullet' | 'PTZ' | 'Dome'
  status: 'Online' | 'Offline'; gateId: string; protocol: 'RTSP' | 'ONVIF'; lastConnection: string
  ipAddress: string
}
export interface AccessRule {
  id: string; name: string; vehicleId: string; gateId: string; days: string[]
  startTime: string; endTime: string; expires: string; active: boolean; autoApproval: boolean
}
export interface RecognitionLog {
  id: string; timestamp: string; plate: string; type: VehicleType; color: VehicleColor
  confidence: number; cameraId: string; gateId: string; decision: AccessDecision; reason: string
}
export interface AIModel {
  id: string; category: 'Vehicle Detection' | 'License Plate Recognition' | 'Vehicle Classification' | 'Vehicle Color Recognition'
  name: string; version: string; status: 'Active' | 'Inactive'; accuracy: number
  lastUpdated: string; size: string; description: string; metricLabel: string
}
export interface Incident {
  id: string; type: string; severity: 'Critical' | 'High' | 'Medium' | 'Low'
  timestamp: string; gateId: string; description: string; status: 'Open' | 'Investigating' | 'Resolved'; remarks: string
}
export interface AdminUser {
  id: string; name: string; email: string; contactNumber: string; password?: string
  role: 'Super Admin' | 'System Administrator' | 'Security Personnel' | 'Gate Operator' | 'Viewer'
  status: 'Active' | 'Inactive'; lastLogin: string
}
export interface AuditLog {
  id: string; timestamp: string; admin: string; action: string; module: string; details: string; ipAddress: string
}
export interface SystemSettings {
  platformName: string; timezone: string; dateFormat: string; timeFormat: '12-hour' | '24-hour'
  confidenceThreshold: number; automaticGates: boolean; emailNotifications: boolean
  pushNotifications: boolean; incidentAlerts: boolean; reviewThreshold: number
}
export interface AppNotification {
  id: string; title: string; description: string; timestamp: string; read: boolean; severity: 'info' | 'warning' | 'critical'
}
export interface AppData {
  vehicles: Vehicle[]; owners: Owner[]; applications: Application[]; gates: Gate[]; cameras: Camera[]
  accessRules: AccessRule[]; recognitionLogs: RecognitionLog[]; models: AIModel[]; incidents: Incident[]
  admins: AdminUser[]; auditLogs: AuditLog[]; notifications: AppNotification[]; settings: SystemSettings
}
export interface SelectOption { value: string; label: string }
