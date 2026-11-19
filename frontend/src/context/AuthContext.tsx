import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';
import type { User } from '../types';

interface JwtPayload {
  id: string;
  role: 'user' | 'admin';
  exp: number;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function decodeUser(token: string): User | null {
  try {
    const payload = jwtDecode<JwtPayload>(token);
    return { _id: payload.id, name: '', email: '', role: payload.role };
  } catch {
    return null;
  }
}

function getStoredToken(): string | null {
  return localStorage.getItem('token');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [user, setUser]   = useState<User | null>(() => {
    const t = getStoredToken();
    return t ? decodeUser(t) : null;
  });

  const persist = useCallback((t: string) => {
    localStorage.setItem('token', t);
    setToken(t);
    setUser(decodeUser(t));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<{ token: string }>('/api/auth/login', { email, password });
    persist(data.token);
  }, [persist]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { data } = await api.post<{ token: string }>('/api/auth/register', { name, email, password });
    persist(data.token);
  }, [persist]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, login, register, logout }),
    [user, token, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext debe usarse dentro de AuthProvider');
  return ctx;
}
