import type { ReactElement } from 'react'
import { Navigate } from 'react-router-dom'
import type { Permission } from '@/types'
import { usePermissions } from '@/hooks/usePermissions'

export function RequirePermission({ permission, children }: { permission: Permission; children: ReactElement }) {
  const { user, hasPermission } = usePermissions()
  if (!user) return <Navigate to="/login" replace />
  if (!hasPermission(permission)) return <Navigate to="/unauthorized" replace />
  return children
}
