import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { mockData } from '@/data/mock'
import type { AppData } from '@/types'
import { getCurrentSessionUser } from '@/auth/session'
import { DEFAULT_ROLE_PERMISSIONS } from '@/auth/permissions'

const STORAGE_KEY = 'gatevision.dashboard.v2'
const LEGACY_KEY = 'gatevision.dashboard.v1'
const ALLOWED_GATE_IDS = new Set(['GT-01', 'GT-02'])

const cloneSeed = () => structuredClone(mockData)

function normalizeData(data: AppData): AppData {
  const seedGates = mockData.gates.filter(g => ALLOWED_GATE_IDS.has(g.id))
  const gates = (data.gates || []).filter(g => ALLOWED_GATE_IDS.has(g.id))
  data.gates = gates.length === seedGates.length ? gates : structuredClone(seedGates)

  const allowedGateIds = new Set(data.gates.map(g => g.id))
  const seedCameras = mockData.cameras.filter(c => allowedGateIds.has(c.gateId))
  const cameras = (data.cameras || []).filter(c => allowedGateIds.has(c.gateId))
  data.cameras = cameras.length > 0 ? cameras : structuredClone(seedCameras)

  const allowedCameraIds = new Set(data.cameras.map(c => c.id))
  data.recognitionLogs = (data.recognitionLogs || []).filter(l => allowedGateIds.has(l.gateId) && allowedCameraIds.has(l.cameraId))
  data.accessRules = (data.accessRules || []).filter(r => allowedGateIds.has(r.gateId))
  data.incidents = (data.incidents || []).filter(i => allowedGateIds.has(i.gateId))

  const removedGatePattern = /\b(GT-0[3-9]\d*|GT-[1-9]\d{2,}|CAM-0[3-9]\d*|CAM-[1-9]\d{2,}|Staff Parking|Service Gate)\b/i
  data.notifications = (data.notifications || []).filter(n => !removedGatePattern.test(`${n.title} ${n.description}`))
  data.auditLogs = (data.auditLogs || []).filter(l => {
    if (l.targetId && /^GT-|^CAM-/.test(l.targetId) && !allowedGateIds.has(l.targetId) && !allowedCameraIds.has(l.targetId)) return false
    return !removedGatePattern.test(`${l.details} ${l.action}`)
  })

  return data
}

function loadData(): AppData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY)
    if (!stored) return cloneSeed()
    const parsed = JSON.parse(stored) as AppData
    if (!parsed.vehicles || !parsed.settings || !parsed.gates) return cloneSeed()
    if (!parsed.rolePermissions) {
      parsed.rolePermissions = structuredClone(DEFAULT_ROLE_PERMISSIONS)
    } else {
      // Merge newly added default permissions for upgrades without overwriting explicit removals beyond defaults.
      for (const role of Object.keys(DEFAULT_ROLE_PERMISSIONS) as (keyof typeof DEFAULT_ROLE_PERMISSIONS)[]) {
        const defaults = DEFAULT_ROLE_PERMISSIONS[role]
        const current = parsed.rolePermissions[role] || []
        const merged = new Set(current)
        for (const perm of defaults) {
          if (perm.startsWith('visitorApplications:')) merged.add(perm)
        }
        parsed.rolePermissions[role] = Array.from(merged) as any
      }
    }
    if (!Array.isArray(parsed.visitorApplications) || parsed.visitorApplications.length === 0) {
      parsed.visitorApplications = structuredClone(mockData.visitorApplications)
    }
    if (parsed.admins) {
      parsed.admins = parsed.admins.map(a => ({
        ...a,
        role: (a.role as any) === 'System Administrator' ? 'System Admin' : a.role,
        createdAt: a.createdAt || new Date().toISOString(),
      }))
    }
    return normalizeData(parsed)
  } catch { return cloneSeed() }
}
interface AppContextValue {
  data: AppData
  setData: React.Dispatch<React.SetStateAction<AppData>>
  resetData: () => void
  audit: (action: string, module: string, details: string, result?: 'Success' | 'Failed', targetId?: string) => void
}
const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(loadData)
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) }, [data])
  const resetData = useCallback(() => setData(cloneSeed()), [])
  const audit = useCallback((action: string, module: string, details: string, result: 'Success' | 'Failed' = 'Success', targetId?: string) => {
    const actor = getCurrentSessionUser()
    setData(prev => ({ ...prev, auditLogs: [{ id: `AUD-${Date.now()}`, timestamp: new Date().toISOString(), admin: actor?.name || 'System', actorId: actor?.id, actorRole: actor?.role, action, module, details, ipAddress: '192.168.10.18', result, targetId }, ...prev.auditLogs] }))
  }, [])
  const value = useMemo(() => ({ data, setData, resetData, audit }), [data, resetData, audit])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}
