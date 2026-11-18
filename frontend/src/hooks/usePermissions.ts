import { useMemo } from 'react'
import { useApp } from '@/context/AppContext'
import { getCurrentSessionUser } from '@/auth/session'
import type { Permission, UserRole } from '@/types'
import { getRolePermissions, hasPermission } from '@/auth/permissions'

export function usePermissions() {
  const { data } = useApp()
  const user = getCurrentSessionUser()
  const role = user?.role
  return useMemo(() => ({
    user,
    role,
    permissions: getRolePermissions(data, role),
    hasPermission: (permission: Permission) => hasPermission(data, role, permission),
    can: (permission: Permission) => hasPermission(data, role, permission),
    canManageUser: (targetRole: UserRole) => role === 'Super Admin' || (role === 'System Admin' && targetRole !== 'Super Admin'),
    canAssignRole: (targetRole: UserRole) => role === 'Super Admin' || (role === 'System Admin' && targetRole !== 'Super Admin'),
  }), [data, role, user])
}
