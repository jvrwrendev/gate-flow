import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, LogOut, Menu, PanelLeft, Search, Settings, UserCircle } from 'lucide-react'
import { Dropdown, DropdownItem, DropdownLabel, DropdownSeparator } from '@/components/ui/Dropdown'
import { useApp } from '@/context/AppContext'
import { usePermissions } from '@/hooks/usePermissions'

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard', '/monitoring': 'Live Monitoring', '/vehicles': 'Registered Vehicles', '/applications': 'Vehicle Applications', '/owners': 'Vehicle Owners', '/gates': 'Barrier Gates', '/cameras': 'Camera Management', '/access-rules': 'Access Rules', '/ai/models': 'AI Models', '/ai/logs': 'Recognition Logs', '/ai/configuration': 'AI Configuration', '/reports': 'Entry History', '/security/incidents': 'Security Incidents', '/security/audit': 'Audit Logs', '/system/admins': 'User Management', '/system/roles': 'Roles & Permissions', '/system/settings': 'System Settings', '/profile': 'Profile',
}

function initials(name?: string) {
  if (!name) return 'U'
  return name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('')
}

export function Topbar({ onMenu, onToggleSidebar, sidebarCollapsed, onLogoutRequest }: { onMenu: () => void; onToggleSidebar: () => void; sidebarCollapsed: boolean; onLogoutRequest?: () => void }) {
  const location = useLocation(); const navigate = useNavigate(); const { data, setData } = useApp()
  const { user, hasPermission } = usePermissions()
  const [query, setQuery] = useState(''); const [open, setOpen] = useState(false)
  const crumbs = useMemo(() => titles[location.pathname] || 'GateVision', [location.pathname])
  const searchResults = useMemo(() => {
    if (query.trim().length < 2) return []
    const q = query.toLowerCase()
    return [
      ...(hasPermission('vehicles:view') ? data.vehicles.filter(v => v.plate.toLowerCase().includes(q) || v.ownerName.toLowerCase().includes(q)).slice(0, 5).map(v => ({ label: `${v.plate} · ${v.ownerName}`, path: '/vehicles', type: 'Vehicle' })) : []),
      ...(hasPermission('applications:view') ? data.applications.filter(a => a.reference.toLowerCase().includes(q) || a.plate.toLowerCase().includes(q)).slice(0, 3).map(a => ({ label: `${a.reference} · ${a.plate}`, path: '/applications', type: 'Application' })) : []),
      ...(hasPermission('gates:view') ? data.gates.filter(g => g.name.toLowerCase().includes(q)).slice(0, 3).map(g => ({ label: g.name, path: '/gates', type: 'Gate' })) : []),
      ...(hasPermission('cameras:view') ? data.cameras.filter(c => c.name.toLowerCase().includes(q)).slice(0, 3).map(c => ({ label: c.name, path: '/cameras', type: 'Camera' })) : []),
    ]
  }, [data, query, hasPermission])
  useEffect(() => { setOpen(searchResults.length > 0) }, [searchResults])
  const markAllRead = () => setData(prev => ({ ...prev, notifications: prev.notifications.map(n => ({ ...n, read: true })) }))
  return <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
    <button onClick={onMenu} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open navigation"><Menu className="h-5 w-5" /></button>
    <button onClick={onToggleSidebar} className="hidden h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 lg:inline-flex" aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}><PanelLeft className="h-5 w-5" /></button>
    <div className="min-w-0"><div className="text-[11px] font-semibold uppercase tracking-[.12em] text-slate-400">Operations / {crumbs}</div><h2 className="truncate font-display text-[17px] font-bold text-slate-950">{crumbs}</h2></div>
    <div className="relative ml-auto hidden max-w-md flex-1 md:block"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={e => setQuery(e.target.value)} onBlur={() => window.setTimeout(() => setOpen(false), 120)} onFocus={() => setOpen(searchResults.length > 0)} placeholder="Search plates, owners, gates, cameras..." className="form-input h-10 pl-9" />{open && <div className="absolute mt-2 w-full rounded-xl border border-slate-200 bg-white p-1 shadow-lg">{searchResults.map((r, i) => <button key={i} onMouseDown={() => { navigate(r.path); setQuery(''); setOpen(false) }} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50"><span className="font-medium text-slate-800">{r.label}</span><span className="text-xs text-slate-400">{r.type}</span></button>)}</div>}</div>
    <div className="flex items-center gap-2">
      <div className="hidden items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:flex"><span className="h-2 w-2 rounded-full bg-emerald-500" />System: {data.gates.filter(g => g.status === 'Online').length}/{data.gates.length} gates online</div>
      <Dropdown trigger={<button className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100" aria-label="Notifications"><Bell className="h-5 w-5" />{data.notifications.some(n => !n.read) && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />}</button>}>
        <DropdownLabel>Notifications</DropdownLabel>
        {data.notifications.length === 0 ? <div className="px-3 py-8 text-center text-sm text-slate-500">No notifications</div> : data.notifications.map(n => <div key={n.id} className="rounded-lg px-3 py-2 hover:bg-slate-50"><p className="text-sm font-medium text-slate-900">{n.title}</p><p className="text-xs text-slate-500">{n.description}</p><p className="mt-1 text-[11px] text-slate-400">{new Date(n.timestamp).toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}</p></div>)}
        <DropdownSeparator />
        <DropdownItem onClick={markAllRead}>Mark all as read</DropdownItem>
      </Dropdown>
      <Dropdown trigger={<button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"><div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">{initials(user?.name)}</div><span className="hidden sm:inline">{user?.name?.split(' ')[0] || 'User'}</span><ChevronDown className="h-4 w-4 text-slate-400" /></button>}>
        <DropdownLabel><span className="block text-sm font-medium text-slate-900">{user?.name}</span><span className="block text-xs font-normal normal-case tracking-normal text-slate-500">{user?.role}</span></DropdownLabel>
        <DropdownItem onClick={() => navigate('/profile')}><UserCircle className="h-4 w-4" /> Profile</DropdownItem>
        {hasPermission('settings:view') && <DropdownItem onClick={() => navigate('/system/settings')}><Settings className="h-4 w-4" /> Settings</DropdownItem>}
        <DropdownSeparator />
        <DropdownItem destructive onClick={() => onLogoutRequest?.()}><LogOut className="h-4 w-4" /> Logout</DropdownItem>
      </Dropdown>
    </div>
  </header>
}
