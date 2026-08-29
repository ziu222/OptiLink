import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import * as authApi from '../api/auth';
import { setAccessToken } from '../lib/tokenStore';
import type { RegisterPayload, UpdateProfilePayload, User } from '../types/auth';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  // Silent refresh on load: the refresh token lives in an httpOnly cookie.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { accessToken } = await authApi.refresh();
        setAccessToken(accessToken);
        const { user: current } = await authApi.me();
        if (!cancelled) {
          setUser(current);
          setStatus('authenticated');
        }
      } catch {
        if (!cancelled) {
          setAccessToken(null);
          setUser(null);
          setStatus('unauthenticated');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, user: current } = await authApi.login({ email, password });
    setAccessToken(accessToken);
    setUser(current);
    setStatus('authenticated');
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const { accessToken, user: current } = await authApi.register(payload);
    setAccessToken(accessToken);
    setUser(current);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // best effort — clear local state regardless
    }
    setAccessToken(null);
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const updateProfile = useCallback(async (payload: UpdateProfilePayload) => {
    const { user: current } = await authApi.updateProfile(payload);
    setUser(current);
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
