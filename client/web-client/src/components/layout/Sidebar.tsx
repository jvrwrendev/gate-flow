import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, Settings, UserCircle } from 'lucide-react'
import * as Icons from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Permission } from '@/types'
import { usePermissions } from '@/hooks/usePermissions'
import { Dropdown, DropdownItem, DropdownLabel, DropdownSeparator } from '@/components/ui/Dropdown'
import { Tooltip, TooltipProvider } from '@/components/ui/Tooltip'

interface NavItem { name: string; path: string; icon: string; permission?: Permission }
interface NavGroup { label: string; items: NavItem[] }

const groups: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard', permission: 'dashboard:view' },
      { name: 'Live Monitoring', path: '/monitoring', icon: 'Video', permission: 'monitoring:view' },
    ],
  },
  {
    label: 'Vehicle Management',
    items: [
      { name: 'Registered Vehicles', path: '/vehicles', icon: 'Car', permission: 'vehicles:view' },
      { name: 'Vehicle Applications', path: '/applications', icon: 'FileText', permission: 'applications:view' },
      { name: 'Visitor Applications', path: '/visitor-applications', icon: 'ClipboardCheck', permission: 'visitorApplications:view' },
      { name: 'Vehicle Owners', path: '/owners', icon: 'Users', permission: 'owners:view' },
    ],
  },
  {
    label: 'Gate Management',
    items: [
      { name: 'Barrier Gates', path: '/gates', icon: 'Shield', permission: 'gates:view' },
      { name: 'Camera Management', path: '/cameras', icon: 'Camera', permission: 'cameras:view' },
      { name: 'Access Rules', path: '/access-rules', icon: 'KeyRound', permission: 'accessRules:view' },
    ],
  },
  {
    label: 'AI Management',
    items: [
      { name: 'AI Models', path: '/ai/models', icon: 'Brain', permission: 'models:view' },
      { name: 'Recognition Logs', path: '/ai/logs', icon: 'ScanText', permission: 'recognitionLogs:view' },
      { name: 'AI Configuration', path: '/ai/configuration', icon: 'SlidersHorizontal', permission: 'settings:view' },
    ],
  },
  {
    label: 'Reports & Security',
    items: [
      { name: 'Entry History', path: '/reports', icon: 'BarChart3', permission: 'reports:view' },
      { name: 'Security Incidents', path: '/security/incidents', icon: 'AlertTriangle', permission: 'incidents:view' },
      { name: 'Audit Logs', path: '/security/audit', icon: 'ClipboardList', permission: 'auditLogs:view' },
    ],
  },
  {
    label: 'System',
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
  const navigate = useNavigate()
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

  const isCollapsedDesktop = collapsed

  return (
    <TooltipProvider delayDuration={150}>
      {/* Mobile overlay */}
      <button
        type="button"
        className={cn(
          'fixed inset-0 z-40 bg-slate-900/40 transition-opacity duration-200 lg:hidden',
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
        aria-label="Close navigation overlay"
        tabIndex={mobileOpen ? 0 : -1}
      />

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-slate-200 bg-white transition-[width,transform] duration-300 ease-in-out',
          'w-[280px] lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          isCollapsedDesktop && 'lg:w-[76px]'
        )}
        aria-label="Sidebar navigation"
      >
        {/* Header */}
        <div className={cn('flex h-[72px] shrink-0 items-center border-b border-slate-200 px-5', isCollapsedDesktop && 'lg:justify-center lg:px-3')}>
          <Link to="/dashboard" className={cn('flex items-center gap-3 overflow-hidden', isCollapsedDesktop && 'lg:gap-0')} aria-label="GATEGUARD dashboard">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Icons.ShieldCheck className="h-[22px] w-[22px]" strokeWidth={2.2} />
            </div>
            <div className={cn('min-w-0 transition-opacity duration-200', isCollapsedDesktop && 'lg:hidden')}>
              <p className="truncate text-[15px] font-bold tracking-tight text-slate-900">GATEGUARD</p>
              <p className="truncate text-xs font-medium text-slate-500">Admin Console</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {visibleGroups.map((group, groupIndex) => {
            const isOpen = openGroups[group.label] ?? true
            return (
              <div key={group.label} className={cn(groupIndex > 0 && 'mt-6')}>
                <button
                  type="button"
                  onClick={() => setOpenGroups(prev => ({ ...prev, [group.label]: !isOpen }))}
                  className={cn(
                    'mb-2 flex w-full items-center justify-between px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 transition-colors hover:text-slate-600',
                    isCollapsedDesktop && 'lg:hidden'
                  )}
                  aria-expanded={isOpen}
                >
                  <span>{group.label}</span>
                  <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', !isOpen && '-rotate-90')} />
                </button>

                {isCollapsedDesktop && groupIndex > 0 && (
                  <div className="mx-auto mb-3 hidden h-px w-8 bg-slate-200 lg:block" aria-hidden="true" />
                )}

                <div className={cn('space-y-1', !isOpen && !isCollapsedDesktop && 'hidden')}>
                  {group.items.map(item => {
                    const Icon = (Icons as any)[item.icon] || Icons.Circle
                    const isLogout = item.path === '#logout'
                    const active = !isLogout && (location.pathname === item.path || location.pathname.startsWith(item.path + '/'))

                    const baseClasses = cn(
                      'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium transition-all duration-150',
                      isCollapsedDesktop && 'lg:justify-center lg:px-0 lg:py-2.5',
                      active
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    )

                    const iconClasses = cn(
                      'h-[18px] w-[18px] shrink-0 transition-colors duration-150',
                      active ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'
                    )

                    const content = isLogout ? (
                      <button
                        type="button"
                        onClick={() => {
                          onLogoutRequest?.()
                          onClose()
                        }}
                        className={baseClasses}
                      >
                        {active && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-blue-600" aria-hidden="true" />}
                        <Icon className={iconClasses} strokeWidth={active ? 2.2 : 2} />
                        <span className={cn('truncate', isCollapsedDesktop && 'lg:hidden')}>{item.name}</span>
                      </button>
                    ) : (
                      <Link to={item.path} className={baseClasses} aria-current={active ? 'page' : undefined}>
                        {active && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-blue-600" aria-hidden="true" />}
                        <Icon className={iconClasses} strokeWidth={active ? 2.2 : 2} />
                        <span className={cn('truncate', isCollapsedDesktop && 'lg:hidden')}>{item.name}</span>
                      </Link>
                    )

                    return (
                      <Tooltip key={item.path} content={item.name} side="right" disabled={!isCollapsedDesktop || mobileOpen}>
                        <div className={cn(isCollapsedDesktop && 'lg:flex lg:justify-center')}>{content}</div>
                      </Tooltip>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        {/* User profile */}
        <div className="shrink-0 border-t border-slate-200 p-3">
          <Dropdown
            align={isCollapsedDesktop ? 'start' : 'end'}
            className="w-56"
            trigger={
              <button
                type="button"
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-left transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30',
                  isCollapsedDesktop && 'lg:justify-center lg:border-transparent lg:bg-transparent lg:px-0 lg:hover:bg-slate-100'
                )}
                aria-label="User account options"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                  {initials(user?.name)}
                </div>
                <div className={cn('min-w-0 flex-1', isCollapsedDesktop && 'lg:hidden')}>
                  <p className="truncate text-sm font-semibold text-slate-900">{user?.name || 'User'}</p>
                  <p className="truncate text-xs text-slate-500">{user?.role || 'Authenticated'}</p>
                </div>
                <Icons.ChevronsUpDown className={cn('h-4 w-4 shrink-0 text-slate-400', isCollapsedDesktop && 'lg:hidden')} />
              </button>
            }
          >
            <DropdownLabel>
              <span className="block text-sm font-semibold text-slate-900">{user?.name || 'User'}</span>
              <span className="block text-xs font-normal text-slate-500">{user?.role || 'Authenticated'}</span>
            </DropdownLabel>
            <DropdownSeparator />
            <DropdownItem onClick={() => navigate('/profile')}>
              <UserCircle className="h-4 w-4" /> Profile
            </DropdownItem>
            {hasPermission('settings:view') && (
              <DropdownItem onClick={() => navigate('/system/settings')}>
                <Settings className="h-4 w-4" /> Settings
              </DropdownItem>
            )}
            <DropdownSeparator />
            <DropdownItem destructive onClick={() => onLogoutRequest?.()}>
              <LogOut className="h-4 w-4" /> Logout
            </DropdownItem>
          </Dropdown>
        </div>
      </aside>
    </TooltipProvider>
  )
}

export function sidebarNavLabels() {
  return groups.flatMap(g => g.items.map(i => i.name))
}