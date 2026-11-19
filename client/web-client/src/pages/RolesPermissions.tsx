import { useMemo, useState } from 'react'
import { RotateCcw, Save, ShieldCheck } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/components/ui/Toast'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { ALL_ROLES, DEFAULT_ROLE_PERMISSIONS, canManageRolePermissions } from '@/auth/permissions'
import { usePermissions } from '@/hooks/usePermissions'
import type { Permission, UserRole } from '@/types'

type ActionType = 'view' | 'create' | 'edit' | 'delete' | 'operate'

interface ModuleDef {
  key: string
  label: string
  actions: Partial<Record<ActionType, Permission[]>>
}

const MODULES: ModuleDef[] = [
  { key: 'dashboard', label: 'Dashboard', actions: { view: ['dashboard:view'] } },
  { key: 'monitoring', label: 'Live Monitoring', actions: { view: ['monitoring:view'] } },
  { key: 'vehicles', label: 'Vehicle Records', actions: { view: ['vehicles:view', 'applications:view', 'owners:view'], create: ['vehicles:manage', 'applications:manage', 'owners:manage'], edit: ['vehicles:manage', 'applications:manage', 'owners:manage'], delete: ['vehicles:manage', 'applications:manage', 'owners:manage'] } },
  { key: 'gates', label: 'Gate Control', actions: { view: ['gates:view'], operate: ['gateControl:operate'] } },
  { key: 'logs', label: 'Access Logs', actions: { view: ['recognitionLogs:view', 'accessRules:view'] } },
  { key: 'incidents', label: 'Security Incidents', actions: { view: ['incidents:view'], create: ['incidents:report', 'incidents:manage'], edit: ['incidents:manage'], delete: ['incidents:manage'] } },
  { key: 'reports', label: 'Reports', actions: { view: ['reports:view'] } },
  { key: 'users', label: 'User Management', actions: { view: ['users:view'], create: ['users:manage'], edit: ['users:manage', 'users:assignRoles'], delete: ['users:manage'] } },
  { key: 'roles', label: 'Roles & Permissions', actions: { view: ['roles:view'], create: ['roles:manage'], edit: ['roles:manage'], delete: ['roles:manage'] } },
  { key: 'settings', label: 'System Settings', actions: { view: ['settings:view'], edit: ['settings:manage'] } },
  { key: 'cameras', label: 'Camera Management', actions: { view: ['cameras:view'], create: ['cameras:manage'], edit: ['cameras:manage'], delete: ['cameras:manage'] } },
  { key: 'models', label: 'AI Models', actions: { view: ['models:view'], create: ['models:manage'], edit: ['models:manage'], delete: ['models:manage'] } },
  { key: 'audit', label: 'Audit Logs', actions: { view: ['auditLogs:view'] } },
]

const ACTION_LABELS: { key: ActionType; label: string }[] = [
  { key: 'view', label: 'View' },
  { key: 'create', label: 'Create' },
  { key: 'edit', label: 'Edit' },
  { key: 'delete', label: 'Delete' },
  { key: 'operate', label: 'Operate' },
]

function clonePermissions(perms: Record<UserRole, Permission[]>) {
  return structuredClone(perms)
}

function hasAction(perms: Permission[], module: ModuleDef, action: ActionType) {
  const required = module.actions[action]
  if (!required || required.length === 0) return null
  return required.every(p => perms.includes(p))
}

function setAction(perms: Permission[], module: ModuleDef, action: ActionType, enabled: boolean): Permission[] {
  const required = module.actions[action] || []
  const set = new Set(perms)
  for (const p of required) {
    if (enabled) set.add(p)
    else set.delete(p)
  }
  // If view is removed, remove all other actions for module for consistency
  if (action === 'view' && !enabled) {
    for (const a of ACTION_LABELS) {
      if (a.key === 'view') continue
      for (const p of module.actions[a.key] || []) set.delete(p)
    }
  }
  // If any non-view action enabled, ensure view is enabled
  if (action !== 'view' && enabled) {
    for (const p of module.actions.view || []) set.add(p)
  }
  // Super Admin protection for roles module should not remove critical access accidentally in UI; handled elsewhere
  return Array.from(set)
}

export function RolesPermissions() {
  const { data, setData, audit } = useApp()
  const { toast } = useToast()
  const { role: actorRole } = usePermissions()
  const canEdit = canManageRolePermissions(actorRole)

  const [selectedRole, setSelectedRole] = useState<UserRole>('Super Admin')
  const [draft, setDraft] = useState<Record<UserRole, Permission[]>>(() => clonePermissions(data.rolePermissions))
  const [confirmSave, setConfirmSave] = useState(false)

  // Sync draft if data changes externally and user hasn't diverged much? keep simple: allow reset.
  const currentPerms = draft[selectedRole] || []

  const changed = useMemo(() => JSON.stringify(draft) !== JSON.stringify(data.rolePermissions), [draft, data.rolePermissions])

  const toggle = (role: UserRole, module: ModuleDef, action: ActionType) => {
    if (!canEdit) return
    if (role === 'Super Admin' && module.key === 'roles') {
      // protect Super Admin role-permission management from accidental lockout
      return
    }
    setDraft(prev => {
      const rolePerms = prev[role] || []
      const current = hasAction(rolePerms, module, action)
      if (current === null) return prev
      return { ...prev, [role]: setAction(rolePerms, module, action, !current) }
    })
  }

  const save = () => {
    if (!canEdit) {
      toast('Permission denied', 'error', 'Only Super Admin can modify role permissions.')
      return
    }
    // Ensure Super Admin always keeps roles manage/view
    const next = clonePermissions(draft)
    const superSet = new Set(next['Super Admin'])
    superSet.add('roles:view'); superSet.add('roles:manage'); superSet.add('users:view'); superSet.add('users:manage')
    next['Super Admin'] = Array.from(superSet)
    setData(prev => ({ ...prev, rolePermissions: next }))
    audit('Updated role permissions', 'Roles & Permissions', 'Role permission matrix updated', 'Success')
    toast('Permissions saved', 'success', 'Updated permissions are applied immediately.')
    setConfirmSave(false)
  }

  const reset = () => {
    setDraft(clonePermissions(DEFAULT_ROLE_PERMISSIONS))
    toast('Permissions reset', 'info', 'Defaults restored in draft. Save to apply.')
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Roles & Permissions"
        description="Configure module-level permissions for each role. Changes apply immediately to affected accounts."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={reset} disabled={!canEdit}><RotateCcw className="h-4 w-4" />Reset</Button>
            <Button onClick={() => setConfirmSave(true)} disabled={!canEdit || !changed}><Save className="h-4 w-4" />Save Changes</Button>
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <Card>
          <CardHeader><CardTitle>Roles</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {ALL_ROLES.map(role => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${selectedRole === role ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
              >
                <span className="font-medium">{role}</span>
                {selectedRole === role && <ShieldCheck className="h-4 w-4" />}
              </button>
            ))}
            {!canEdit && <p className="pt-2 text-xs text-slate-500">Only Super Admin can modify role permissions.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Permission Matrix</CardTitle>
              <p className="mt-1 text-xs text-slate-500">Role: <span className="font-medium text-slate-700">{selectedRole}</span></p>
            </div>
            <Badge value={canEdit ? 'Editable' : 'Read-only'} variant={canEdit ? 'blue' : 'secondary'} />
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-slate-50/80 text-[11px] uppercase tracking-[0.08em] text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Module</th>
                    {ACTION_LABELS.map(a => <th key={a.key} className="px-4 py-3 text-center">{a.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {MODULES.map(module => (
                    <tr key={module.key} className="border-t border-slate-100">
                      <td className="px-5 py-3 font-medium text-slate-900">{module.label}</td>
                      {ACTION_LABELS.map(action => {
                        const state = hasAction(currentPerms, module, action.key)
                        const disabled = state === null || !canEdit || (selectedRole === 'Super Admin' && module.key === 'roles')
                        return (
                          <td key={action.key} className="px-4 py-3 text-center">
                            {state === null ? (
                              <span className="text-slate-300">—</span>
                            ) : (
                              <Checkbox
                                checked={state}
                                disabled={disabled}
                                onCheckedChange={() => toggle(selectedRole, module, action.key)}
                                aria-label={`${module.label} ${action.label} for ${selectedRole}`}
                              />
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmSave}
        onOpenChange={setConfirmSave}
        title="Save permission changes"
        description="This will update role permissions immediately for all affected accounts. Super Admin role-management access is protected."
        confirmLabel="Save Changes"
        onConfirm={save}
      />
    </div>
  )
}
