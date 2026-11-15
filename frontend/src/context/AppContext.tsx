import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { mockData } from '@/data/mock'
import type { AppData } from '@/types'

const STORAGE_KEY = 'gatevision.dashboard.v1'
const cloneSeed = () => structuredClone(mockData)
function loadData(): AppData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return cloneSeed()
    const parsed = JSON.parse(stored) as AppData
    if (!parsed.vehicles || !parsed.settings || !parsed.gates) return cloneSeed()
    return parsed
  } catch { return cloneSeed() }
}
interface AppContextValue {
  data: AppData
  setData: React.Dispatch<React.SetStateAction<AppData>>
  resetData: () => void
  audit: (action: string, module: string, details: string) => void
}
const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(loadData)
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) }, [data])
  const resetData = useCallback(() => setData(cloneSeed()), [])
  const audit = useCallback((action: string, module: string, details: string) => {
    setData(prev => ({ ...prev, auditLogs: [{ id: `AUD-${Date.now()}`, timestamp: new Date().toISOString(), admin: 'Adrian Velasco', action, module, details, ipAddress: '192.168.10.18' }, ...prev.auditLogs] }))
  }, [])
  const value = useMemo(() => ({ data, setData, resetData, audit }), [data, resetData, audit])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}
