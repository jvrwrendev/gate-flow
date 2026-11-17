import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Dashboard } from '@/pages/Dashboard'
import { Login } from '@/pages/Login'
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
import { Settings } from '@/pages/Settings'
import { Profile } from '@/pages/Profile'
import { Logout, NotFound } from '@/pages/Logout'

export default function App() {
  return <BrowserRouter><Routes><Route path="/" element={<Navigate to="/dashboard" replace />} /><Route path="/login" element={<Login />} /><Route element={<AppShell />}><Route path="/dashboard" element={<Dashboard />} /><Route path="/monitoring" element={<LiveMonitor />} /><Route path="/vehicles" element={<Vehicles />} /><Route path="/applications" element={<Applications />} /><Route path="/owners" element={<Owners />} /><Route path="/gates" element={<Gates />} /><Route path="/cameras" element={<Cameras />} /><Route path="/access-rules" element={<AccessRules />} /><Route path="/ai/models" element={<AIModels />} /><Route path="/ai/logs" element={<RecognitionLogs />} /><Route path="/ai/configuration" element={<AIConfig />} /><Route path="/reports" element={<Reports />} /><Route path="/security/incidents" element={<Incidents />} /><Route path="/security/audit" element={<AuditLogs />} /><Route path="/system/admins" element={<AdminUsers />} /><Route path="/system/settings" element={<Settings />} /><Route path="/profile" element={<Profile />} /><Route path="/logout" element={<Logout />} /></Route><Route path="*" element={<NotFound />} /></Routes></BrowserRouter>
}
// Keep compatibility with any direct import of AIConfiguration named export.
export { AIConfiguration }
