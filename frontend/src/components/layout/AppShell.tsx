import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/components/ui/Toast'
import { clearSession } from '@/auth/session'

export function AppShell() {
  const navigate = useNavigate()
  const { audit } = useApp()
  const { toast } = useToast()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)

  useEffect(() => { const saved = localStorage.getItem('gatevision.sidebar'); if (saved === 'collapsed') setCollapsed(true) }, [])
  const toggle = () => setCollapsed(prev => { const next = !prev; localStorage.setItem('gatevision.sidebar', next ? 'collapsed' : 'expanded'); return next })

  const confirmLogout = () => {
    clearSession()
    audit('Logout', 'Authentication', 'Administrator signed out (simulated)', 'Success')
    toast('Session ended', 'info', 'You have been signed out.')
    setLogoutOpen(false)
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} onLogoutRequest={() => setLogoutOpen(true)} />
      <div className={cn('transition-all lg:pl-72', collapsed && 'lg:pl-20')} style={{ ['--sidebar-offset' as string]: collapsed ? '5rem' : '18rem' }}>
        <Topbar onMenu={() => setMobileOpen(true)} onToggleSidebar={toggle} sidebarCollapsed={collapsed} onLogoutRequest={() => setLogoutOpen(true)} />
        <main className="px-4 py-5 sm:px-6 lg:px-8"><Outlet /></main>
      </div>
      <ConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title="Confirm logout"
        description="Are you sure you want to sign out? Your simulated session will end and you will return to the login page."
        confirmLabel="Sign out"
        destructive
        onConfirm={confirmLogout}
      />
    </div>
  )
}
