import type { UserRole } from '@/types'

export interface SessionUser {
  id: string
  name: string
  email: string
  role: UserRole
  status: 'Active' | 'Inactive'
}

export interface SessionData {
  user: SessionUser
  expiresAt: string
  remember?: boolean
}

export const SESSION_KEY = 'gatevision.session'
export const REMEMBER_KEY = 'gatevision.rememberedEmail'
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000

export function getSession(): SessionData | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SessionData
    if (!parsed?.user?.id || !parsed.expiresAt) return null
    if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    return parsed
  } catch {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
}

export function setSession(user: SessionUser, remember?: boolean) {
  const session: SessionData = {
    user,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
    remember,
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

export function getCurrentSessionUser(): SessionUser | null {
  return getSession()?.user ?? null
}
