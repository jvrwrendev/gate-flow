import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import * as authService from '@/src/services/auth.mock';
import type { AuthSession, LoginPayload, RegisterPayload, User } from '@/src/types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<Pick<User, 'name' | 'phone' | 'unit' | 'notificationPrefs'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const next = await authService.login(payload);
      setSession(next);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      const next = await authService.register(payload);
      setSession(next);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setSession(null);
    setIsLoading(false);
  }, []);

  const updateUser = useCallback(
    async (updates: Partial<Pick<User, 'name' | 'phone' | 'unit' | 'notificationPrefs'>>) => {
      if (!session) return;
      const updated = await authService.updateUser(session.user.id, updates);
      setSession({ ...session, user: updated });
    },
    [session]
  );

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        isLoading,
        isAuthenticated: !!session,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
