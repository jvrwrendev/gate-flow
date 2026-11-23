import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, LogOut, Menu, PanelLeft, Search, Settings, UserCircle } from 'lucide-react'
import { Dropdown, DropdownItem, DropdownLabel, DropdownSeparator } from '@/components/ui/Dropdown'
import { Input } from '@/components/ui/Field'
import { useApp } from '@/context/AppContext'
import { usePermissions } from '@/hooks/usePermissions'

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/monitoring': 'Live Monitoring',
  '/vehicles': 'Registered Vehicles',
  '/applications': 'Vehicle Applications',
  '/visitor-applications': 'Visitor Applications',
  '/owners': 'Vehicle Owners',
  '/gates': 'Barrier Gates',
  '/cameras': 'Camera Management',
  '/access-rules': 'Access Rules',
  '/ai/models': 'AI Models',
  '/ai/logs': 'Recognition Logs',
  '/ai/configuration': 'AI Configuration',
  '/reports': 'Entry History',
  '/security/incidents': 'Security Incidents',
  '/security/audit': 'Audit Logs',
  '/system/admins': 'User Management',
  '/system/roles': 'Roles & Permissions',
  '/system/settings': 'System Settings',
  '/profile': 'Profile',
}

function initials(name?: string) {
  if (!name) return 'U'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase() || '')
    .join('')
}

export function Topbar({
  onMenu,
  onToggleSidebar,
  sidebarCollapsed,
  onLogoutRequest,
}: {
  onMenu: () => void
  onToggleSidebar: () => void
  sidebarCollapsed: boolean
  onLogoutRequest?: () => void
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const { data, setData } = useApp()
  const { user, hasPermission } = usePermissions()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const crumbs = useMemo(() => titles[location.pathname] || 'GATEGUARD', [location.pathname])

  const searchResults = useMemo(() => {
    if (query.trim().length < 2) return []
    const q = query.toLowerCase()
    return [
      ...(hasPermission('vehicles:view')
        ? data.vehicles
            .filter(v => v.plate.toLowerCase().includes(q) || v.ownerName.toLowerCase().includes(q))
            .slice(0, 5)
            .map(v => ({ label: `${v.plate} · ${v.ownerName}`, path: '/vehicles', type: 'Vehicle' }))
        : []),
      ...(hasPermission('applications:view')
        ? data.applications
            .filter(a => a.reference.toLowerCase().includes(q) || a.plate.toLowerCase().includes(q))
            .slice(0, 3)
            .map(a => ({ label: `${a.reference} · ${a.plate}`, path: '/applications', type: 'Application' }))
        : []),
      ...(hasPermission('visitorApplications:view')
        ? (data.visitorApplications || [])
            .filter(a => a.reference.toLowerCase().includes(q) || a.visitorName.toLowerCase().includes(q) || a.vehiclePlate.toLowerCase().includes(q))
            .slice(0, 3)
            .map(a => ({ label: `${a.reference} · ${a.visitorName}`, path: '/visitor-applications', type: 'Visitor App' }))
        : []),
      ...(hasPermission('gates:view')
        ? data.gates.filter(g => g.name.toLowerCase().includes(q)).slice(0, 3).map(g => ({ label: g.name, path: '/gates', type: 'Gate' }))
        : []),
      ...(hasPermission('cameras:view')
        ? data.cameras
            .filter(c => c.name.toLowerCase().includes(q))
            .slice(0, 3)
            .map(c => ({ label: c.name, path: '/cameras', type: 'Camera' }))
        : []),
    ]
  }, [data, query, hasPermission])

  useEffect(() => {
    setOpen(searchResults.length > 0)
  }, [searchResults])

  const markAllRead = () => setData(prev => ({ ...prev, notifications: prev.notifications.map(n => ({ ...n, read: true })) }))

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onMenu}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={onToggleSidebar}
        className="hidden h-9 w-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 lg:inline-flex"
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <PanelLeft className="h-5 w-5" />
      </button>

      <div className="min-w-0">
        <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Operations / {crumbs}</div>
        <h2 className="truncate text-sm font-semibold text-slate-900">{crumbs}</h2>
      </div>

      <div className="relative ml-auto hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onFocus={() => setOpen(searchResults.length > 0)}
          placeholder="Search plates, owners, gates, cameras..."
          className="pl-9"
          aria-label="Search"
        />
        {open && (
          <div className="absolute mt-2 w-full rounded-md border border-slate-200 bg-white p-1 shadow-lg">
            {searchResults.map((r, i) => (
              <button
                key={i}
                type="button"
                onMouseDown={() => {
                  navigate(r.path)
                  setQuery('')
                  setOpen(false)
                }}
                className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-left text-sm hover:bg-slate-50"
              >
                <span className="font-medium text-slate-800">{r.label}</span>
                <span className="text-xs text-slate-500">{r.type}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 sm:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          System: {data.gates.filter(g => g.status === 'Online').length}/{data.gates.length} gates online
        </div>

        <Dropdown
          trigger={
            <button
              type="button"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {data.notifications.some(n => !n.read) && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />}
            </button>
          }
        >
          <DropdownLabel>Notifications</DropdownLabel>
          {data.notifications.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-slate-500">No notifications</div>
          ) : (
            data.notifications.map(n => (
              <button
                key={n.id}
                type="button"
                onClick={() => setData(prev => ({ ...prev, notifications: prev.notifications.map(x => x.id === n.id ? { ...x, read: true } : x) }))}
                className="flex w-full items-start gap-2 rounded-sm px-3 py-2 text-left hover:bg-slate-50"
              >
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-transparent' : 'bg-blue-600'}`} />
                <div className="min-w-0">
                  <p className={`text-sm ${n.read ? 'font-medium text-slate-700' : 'font-semibold text-slate-900'}`}>{n.title}</p>
                  <p className="text-xs text-slate-500">{n.description}</p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {new Date(n.timestamp).toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}
                  </p>
                </div>
              </button>
            ))
          )}
          <DropdownSeparator />
          <DropdownItem onClick={markAllRead}>Mark all as read</DropdownItem>
        </Dropdown>

        <Dropdown
          trigger={
            <button
              type="button"
              className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-[11px] font-semibold text-white">
                {initials(user?.name)}
              </div>
              <span className="hidden sm:inline">{user?.name?.split(' ')[0] || 'User'}</span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>
          }
        >
          <DropdownLabel>
            <span className="block text-sm font-medium text-slate-900">{user?.name}</span>
            <span className="block text-xs font-normal text-slate-500">{user?.role}</span>
          </DropdownLabel>
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
    </header>
  )
}
