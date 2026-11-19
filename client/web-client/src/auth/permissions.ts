import type { AppData, Permission, UserRole } from '@/types'

export const ALL_ROLES: UserRole[] = ['Super Admin', 'System Admin', 'Security Personnel', 'Gate Operator', 'Viewer']

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  'Super Admin': [
    'dashboard:view', 'monitoring:view', 'vehicles:view', 'vehicles:manage', 'applications:view', 'applications:manage',
    'owners:view', 'owners:manage', 'gates:view', 'gates:manage', 'gateControl:operate', 'cameras:view', 'cameras:manage',
    'accessRules:view', 'accessRules:manage', 'models:view', 'models:manage', 'recognitionLogs:view', 'reports:view',
    'incidents:view', 'incidents:manage', 'incidents:report', 'auditLogs:view', 'users:view', 'users:manage', 'users:assignRoles',
    'roles:view', 'roles:manage', 'settings:view', 'settings:manage', 'profile:view',
  ],
  'System Admin': [
    'dashboard:view', 'monitoring:view', 'vehicles:view', 'vehicles:manage', 'applications:view', 'applications:manage',
    'owners:view', 'owners:manage', 'gates:view', 'gates:manage', 'gateControl:operate', 'cameras:view', 'cameras:manage',
    'accessRules:view', 'accessRules:manage', 'models:view', 'models:manage', 'recognitionLogs:view', 'reports:view',
    'incidents:view', 'incidents:manage', 'auditLogs:view', 'users:view', 'users:manage', 'roles:view',
    'settings:view', 'settings:manage', 'profile:view',
  ],
  'Security Personnel': [
    'dashboard:view', 'monitoring:view', 'vehicles:view', 'applications:view', 'owners:view', 'gates:view', 'gateControl:operate',
    'cameras:view', 'accessRules:view', 'models:view', 'recognitionLogs:view', 'reports:view', 'incidents:view', 'incidents:manage', 'profile:view',
  ],
  'Gate Operator': [
    'dashboard:view', 'monitoring:view', 'vehicles:view', 'applications:view', 'owners:view', 'gates:view', 'gateControl:operate',
    'cameras:view', 'accessRules:view', 'models:view', 'recognitionLogs:view', 'reports:view', 'incidents:view', 'incidents:report', 'profile:view',
  ],
  'Viewer': [
    'dashboard:view', 'monitoring:view', 'vehicles:view', 'applications:view', 'owners:view', 'gates:view', 'cameras:view',
    'accessRules:view', 'models:view', 'recognitionLogs:view', 'reports:view', 'incidents:view', 'profile:view',
  ],
}

export type RolePermissionsMap = Record<UserRole, Permission[]>

export function getRolePermissions(data: Pick<AppData, 'rolePermissions'> | null | undefined, role: UserRole | undefined): Permission[] {
  if (!role) return []
  return data?.rolePermissions?.[role] ?? DEFAULT_ROLE_PERMISSIONS[role] ?? []
}

export function hasPermissionForRole(rolePermissions: RolePermissionsMap | undefined, role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false
  const perms = rolePermissions?.[role] ?? DEFAULT_ROLE_PERMISSIONS[role] ?? []
  return perms.includes(permission)
}

export function hasPermission(data: Pick<AppData, 'rolePermissions'> | null | undefined, role: UserRole | undefined, permission: Permission): boolean {
  return hasPermissionForRole(data?.rolePermissions, role, permission)
}

export function hasAnyPermission(data: Pick<AppData, 'rolePermissions'> | null | undefined, role: UserRole | undefined, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(data, role, permission))
}

export function canManageUser(actorRole: UserRole | undefined, targetRole: UserRole): boolean {
  if (!actorRole) return false
  if (actorRole === 'Super Admin') return true
  if (actorRole === 'System Admin') return targetRole !== 'Super Admin'
  return false
}

export function canAssignRole(actorRole: UserRole | undefined, role: UserRole): boolean {
  if (!actorRole) return false
  if (actorRole === 'Super Admin') return true
  if (actorRole === 'System Admin') return role !== 'Super Admin'
  return false
}

export function canManageRolePermissions(actorRole: UserRole | undefined): boolean {
  return actorRole === 'Super Admin'
}
