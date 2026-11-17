import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
export function AppShell() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  useEffect(() => { const saved = localStorage.getItem('gatevision.sidebar'); if (saved === 'collapsed') setCollapsed(true) }, [])
  const toggle = () => setCollapsed(prev => { const next = !prev; localStorage.setItem('gatevision.sidebar', next ? 'collapsed' : 'expanded'); return next })
  return <div className="min-h-screen bg-slate-50"><Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} /><div className={cn('transition-all lg:pl-72', collapsed && 'lg:pl-20')} style={{ ['--sidebar-offset' as string]: collapsed ? '5rem' : '18rem' }}><Topbar onMenu={() => setMobileOpen(true)} onToggleSidebar={toggle} sidebarCollapsed={collapsed} /><main className="px-4 py-5 sm:px-6 lg:px-8"><Outlet /></main></div></div>
}
