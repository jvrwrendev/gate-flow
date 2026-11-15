import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
const groups = [
  { label: 'MAIN', items: [{ name: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' }, { name: 'Live Monitoring', path: '/monitoring', icon: 'Video' }] },
  { label: 'VEHICLE MANAGEMENT', items: [{ name: 'Registered Vehicles', path: '/vehicles', icon: 'Car' }, { name: 'Vehicle Applications', path: '/applications', icon: 'FileText' }, { name: 'Vehicle Owners', path: '/owners', icon: 'Users' }] },
  { label: 'GATE MANAGEMENT', items: [{ name: 'Barrier Gates', path: '/gates', icon: 'Shield' }, { name: 'Camera Management', path: '/cameras', icon: 'Camera' }, { name: 'Access Rules', path: '/access-rules', icon: 'KeyRound' }] },
  { label: 'AI MANAGEMENT', items: [{ name: 'AI Models', path: '/ai/models', icon: 'Brain' }, { name: 'Recognition Logs', path: '/ai/logs', icon: 'ScanText' }, { name: 'AI Configuration', path: '/ai/configuration', icon: 'SlidersHorizontal' }] },
  { label: 'REPORTS & SECURITY', items: [{ name: 'Entry History', path: '/reports', icon: 'BarChart3' }, { name: 'Security Incidents', path: '/security/incidents', icon: 'AlertTriangle' }, { name: 'Audit Logs', path: '/security/audit', icon: 'ClipboardList' }] },
  { label: 'SYSTEM', items: [{ name: 'Admin Users', path: '/system/admins', icon: 'UserCog' }, { name: 'System Settings', path: '/system/settings', icon: 'Settings' }, { name: 'Profile', path: '/profile', icon: 'UserCircle' }, { name: 'Logout', path: '/logout', icon: 'LogOut' }] },
]
import * as Icons from 'lucide-react'
export function Sidebar({ collapsed, mobileOpen, onClose }: { collapsed: boolean; mobileOpen: boolean; onClose: () => void }) {
  const location = useLocation()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(Object.fromEntries(groups.map(g => [g.label, true])))
  useEffect(() => { onClose() }, [location.pathname, onClose])
  return <>
    {mobileOpen && <button className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden" onClick={onClose} aria-label="Close navigation" />}
    <aside className={cn('fixed left-0 top-0 z-50 h-screen w-72 border-r border-slate-200 bg-white text-slate-600 transition-transform lg:translate-x-0', mobileOpen ? 'translate-x-0' : '-translate-x-full', collapsed && 'lg:w-20')}>
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white"><Icons.Shield className="h-5 w-5" /></div><div className={cn('min-w-0', collapsed && 'lg:hidden')}><p className="font-display text-[15px] font-semibold text-slate-900">GateVision</p><p className="text-[11px] text-slate-500">Barrier Gate Console</p></div></div>
      <nav className="sidebar-scroll h-[calc(100vh-128px)] overflow-y-auto px-3 py-4">
        {groups.map(group => <div key={group.label} className="mb-5"><button onClick={() => setOpenGroups(prev => ({...prev, [group.label]: !prev[group.label]}))} className={cn('mb-1 flex w-full items-center justify-between px-2 text-[11px] font-semibold tracking-[0.12em] text-slate-400', collapsed && 'lg:hidden')}><span>{group.label}</span><ChevronDown className={cn('h-3.5 w-3.5 transition', !openGroups[group.label] && '-rotate-90')} /></button><div className={cn('space-y-1', !openGroups[group.label] && !collapsed && 'hidden')}>{group.items.map(item => { const Icon = (Icons as any)[item.icon] || Icons.Circle; const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/'); const isLogout = item.path === '/logout'; return <Link key={item.path} to={item.path} className={cn('group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors', active && !isLogout ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900', collapsed && 'lg:justify-center lg:px-2')}><Icon className={cn('h-[18px] w-[18px] shrink-0', active && !isLogout ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600')} /><span className={cn(collapsed && 'lg:hidden')}>{item.name}</span>{active && !isLogout && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600" />}</Link> })}</div></div>)}
      </nav>
      <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 p-3"><div className={cn('flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5', collapsed && 'lg:justify-center')}><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">AV</div><div className={cn(collapsed && 'lg:hidden')}><p className="text-sm font-medium text-slate-900">Adrian Velasco</p><p className="text-[11px] text-slate-500">Super Admin</p></div></div></div>
    </aside>
  </>
}
export function sidebarNavLabels() { return groups.flatMap(g => g.items.map(i => i.name)) }
