import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { Dashboard } from '@/pages/Dashboard'
import { Login } from '@/pages/Login'
import { Unauthorized } from '@/pages/Unauthorized'
import { LiveMonitor } from '@/pages/LiveMonitor'
import { Vehicles } from '@/pages/Vehicles'
import { Applications } from '@/pages/Applications'
import { Owners } from '@/pages/Owners'
import { Gates } from '@/pages/Gates'
import { Cameras } from '@/pages/Cameras'
import { AccessRules } from '@/pages/AccessRules'
import { AIModels } from '@/pages/AIModels'
import { RecognitionLogs } from '@/pages/RecognitionLogs'
import { AIConfiguration, AIConfig } from '@/pages/AIConfiguration'
import { Reports } from '@/pages/Reports'
import { Incidents } from '@/pages/Incidents'
import { AuditLogs } from '@/pages/AuditLogs'
import { AdminUsers } from '@/pages/AdminUsers'
import { RolesPermissions } from '@/pages/RolesPermissions'
import { Settings } from '@/pages/Settings'
import { Profile } from '@/pages/Profile'
import { NotFound } from '@/pages/NotFound'
import { getSession } from '@/auth/session'

function RootRedirect() {
  return <Navigate to={getSession() ? '/dashboard' : '/login'} replace />
}

export default function App() {
  return <BrowserRouter><Routes>
    <Route path="/" element={<RootRedirect />} />
    <Route path="/login" element={getSession() ? <Navigate to="/dashboard" replace /> : <Login />} />
    <Route path="/unauthorized" element={<Unauthorized />} />
    <Route element={<RequireAuth />}>
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<RequirePermission permission="dashboard:view"><Dashboard /></RequirePermission>} />
        <Route path="/monitoring" element={<RequirePermission permission="monitoring:view"><LiveMonitor /></RequirePermission>} />
        <Route path="/vehicles" element={<RequirePermission permission="vehicles:view"><Vehicles /></RequirePermission>} />
        <Route path="/applications" element={<RequirePermission permission="applications:view"><Applications /></RequirePermission>} />
        <Route path="/owners" element={<RequirePermission permission="owners:view"><Owners /></RequirePermission>} />
        <Route path="/gates" element={<RequirePermission permission="gates:view"><Gates /></RequirePermission>} />
        <Route path="/cameras" element={<RequirePermission permission="cameras:view"><Cameras /></RequirePermission>} />
        <Route path="/access-rules" element={<RequirePermission permission="accessRules:view"><AccessRules /></RequirePermission>} />
        <Route path="/ai/models" element={<RequirePermission permission="models:view"><AIModels /></RequirePermission>} />
        <Route path="/ai/logs" element={<RequirePermission permission="recognitionLogs:view"><RecognitionLogs /></RequirePermission>} />
        <Route path="/ai/configuration" element={<RequirePermission permission="settings:view"><AIConfig /></RequirePermission>} />
        <Route path="/reports" element={<RequirePermission permission="reports:view"><Reports /></RequirePermission>} />
        <Route path="/security/incidents" element={<RequirePermission permission="incidents:view"><Incidents /></RequirePermission>} />
        <Route path="/security/audit" element={<RequirePermission permission="auditLogs:view"><AuditLogs /></RequirePermission>} />
        <Route path="/system/admins" element={<RequirePermission permission="users:view"><AdminUsers /></RequirePermission>} />
        <Route path="/system/roles" element={<RequirePermission permission="roles:view"><RolesPermissions /></RequirePermission>} />
        <Route path="/system/settings" element={<RequirePermission permission="settings:view"><Settings /></RequirePermission>} />
        <Route path="/profile" element={<RequirePermission permission="profile:view"><Profile /></RequirePermission>} />
      </Route>
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes></BrowserRouter>
}
// Keep compatibility with any direct import of AIConfiguration named export.
export { AIConfiguration }
