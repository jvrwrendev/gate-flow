import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import * as Icons from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Permission } from '@/types'
import { usePermissions } from '@/hooks/usePermissions'

interface NavItem { name: string; path: string; icon: string; permission?: Permission }
interface NavGroup { label: string; items: NavItem[] }

const groups: NavGroup[] = [
  {
    label: 'MAIN',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard', permission: 'dashboard:view' },
      { name: 'Live Monitoring', path: '/monitoring', icon: 'Video', permission: 'monitoring:view' },
    ],
  },
  {
    label: 'VEHICLE MANAGEMENT',
    items: [
      { name: 'Registered Vehicles', path: '/vehicles', icon: 'Car', permission: 'vehicles:view' },
      { name: 'Vehicle Applications', path: '/applications', icon: 'FileText', permission: 'applications:view' },
      { name: 'Vehicle Owners', path: '/owners', icon: 'Users', permission: 'owners:view' },
    ],
  },
  {
    label: 'GATE MANAGEMENT',
    items: [
      { name: 'Barrier Gates', path: '/gates', icon: 'Shield', permission: 'gates:view' },
      { name: 'Camera Management', path: '/cameras', icon: 'Camera', permission: 'cameras:view' },
      { name: 'Access Rules', path: '/access-rules', icon: 'KeyRound', permission: 'accessRules:view' },
    ],
  },
  {
    label: 'AI MANAGEMENT',
    items: [
      { name: 'AI Models', path: '/ai/models', icon: 'Brain', permission: 'models:view' },
      { name: 'Recognition Logs', path: '/ai/logs', icon: 'ScanText', permission: 'recognitionLogs:view' },
      { name: 'AI Configuration', path: '/ai/configuration', icon: 'SlidersHorizontal', permission: 'settings:view' },
    ],
  },
  {
    label: 'REPORTS & SECURITY',
    items: [
      { name: 'Entry History', path: '/reports', icon: 'BarChart3', permission: 'reports:view' },
      { name: 'Security Incidents', path: '/security/incidents', icon: 'AlertTriangle', permission: 'incidents:view' },
      { name: 'Audit Logs', path: '/security/audit', icon: 'ClipboardList', permission: 'auditLogs:view' },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { name: 'User Management', path: '/system/admins', icon: 'UserCog', permission: 'users:view' },
      { name: 'Roles & Permissions', path: '/system/roles', icon: 'ShieldCheck', permission: 'roles:view' },
      { name: 'System Settings', path: '/system/settings', icon: 'Settings', permission: 'settings:view' },
      { name: 'Profile', path: '/profile', icon: 'UserCircle', permission: 'profile:view' },
      { name: 'Logout', path: '#logout', icon: 'LogOut' },
    ],
  },
]

function initials(name?: string) {
  if (!name) return 'U'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase() || '')
    .join('')
}

export function Sidebar({
  collapsed,
  mobileOpen,
  onClose,
  onLogoutRequest,
}: {
  collapsed: boolean
  mobileOpen: boolean
  onClose: () => void
  onLogoutRequest?: () => void
}) {
  const location = useLocation()
  const { user, hasPermission } = usePermissions()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(Object.fromEntries(groups.map(g => [g.label, true])))

  useEffect(() => {
    onClose()
  }, [location.pathname, onClose])

  const visibleGroups = useMemo(
    () =>
      groups
        .map(group => ({
          ...group,
          items: group.items.filter(item => !item.permission || hasPermission(item.permission)),
        }))
        .filter(group => group.items.length > 0),
    [hasPermission]
  )

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
          onClick={onClose}
          aria-label="Close navigation"
        />
      )}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-72 border-r border-slate-200 bg-white transition-transform lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          collapsed && 'lg:w-20'
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white">
            <Icons.Shield className="h-5 w-5" />
          </div>
          <div className={cn('min-w-0', collapsed && 'lg:hidden')}>
            <p className="text-sm font-semibold text-slate-900">GateVision</p>
            <p className="text-xs text-slate-500">Barrier Gate Console</p>
          </div>
        </div>

        <nav className="h-[calc(100vh-128px)] overflow-y-auto px-3 py-4">
          {visibleGroups.map(group => (
            <div key={group.label} className="mb-5">
              <button
                type="button"
                onClick={() => setOpenGroups(prev => ({ ...prev, [group.label]: !prev[group.label] }))}
                className={cn(
                  'mb-1 flex w-full items-center justify-between px-2 text-[11px] font-medium uppercase tracking-wide text-slate-500',
                  collapsed && 'lg:hidden'
                )}
              >
                <span>{group.label}</span>
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', !openGroups[group.label] && '-rotate-90')} />
              </button>

              <div className={cn('space-y-1', !openGroups[group.label] && !collapsed && 'hidden')}>
                {group.items.map(item => {
                  const Icon = (Icons as any)[item.icon] || Icons.Circle
                  const isLogout = item.path === '#logout'
                  const active = !isLogout && (location.pathname === item.path || location.pathname.startsWith(item.path + '/'))

                  if (isLogout) {
                    return (
                      <button
                        key={item.path}
                        type="button"
                        onClick={() => {
                          onLogoutRequest?.()
                          onClose()
                        }}
                        className={cn(
                          'group flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900',
                          collapsed && 'lg:justify-center lg:px-2'
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0 text-slate-500 group-hover:text-slate-700" />
                        <span className={cn(collapsed && 'lg:hidden')}>{item.name}</span>
                      </button>
                    )
                  }

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                        collapsed && 'lg:justify-center lg:px-2'
                      )}
                    >
                      <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700')} />
                      <span className={cn(collapsed && 'lg:hidden')}>{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 p-3">
          <div className={cn('flex items-center gap-3 rounded-md bg-slate-50 px-3 py-2', collapsed && 'lg:justify-center')}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
              {initials(user?.name)}
            </div>
            <div className={cn('min-w-0', collapsed && 'lg:hidden')}>
              <p className="truncate text-sm font-medium text-slate-900">{user?.name || 'User'}</p>
              <p className="truncate text-xs text-slate-500">{user?.role || 'Authenticated'}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export function sidebarNavLabels() {
  return groups.flatMap(g => g.items.map(i => i.name))
}
