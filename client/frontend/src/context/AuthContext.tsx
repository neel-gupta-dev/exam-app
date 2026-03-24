'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';

import { User } from '@/types';
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch {
      localStorage.removeItem('kv_token');
      setToken(null);
      setUser(null);
      router.push('/login');
    }
  }, [router]);

  // Hydrate from API on mount and add listeners
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('kv_token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const { data } = await api.get('/auth/me');
          setUser(data);
        } catch {
          localStorage.removeItem('kv_token');
          setToken(null);
          setUser(null);
        }
      } else {
        setToken(null);
        setUser(null);
      }
      setIsLoading(false);
    };

    initAuth();

    // Sync auth across tabs via storage event (token changes)
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'kv_token') {
        initAuth();
      }
    };
    
    // Refresh user cache on window focus
    const onFocus = () => {
      if (localStorage.getItem('kv_token')) {
        api.get('/auth/me')
          .then(({ data }) => setUser(data))
          .catch(() => {});
      }
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onFocus);
    
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { token: jwt, ...userData } = data;
    localStorage.setItem('kv_token', jwt);
    setToken(jwt);
    setUser(userData);
    toast.success('Welcome back!');
    router.push('/');
  }, [router]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    const { token: jwt, ...userData } = data;
    localStorage.setItem('kv_token', jwt);
    setToken(jwt);
    setUser(userData);
    toast.success('Account created!');
    router.push('/');
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem('kv_token');
    setToken(null);
    setUser(null);
    router.push('/login');
  }, [router]);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, ...data };
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, updateUser, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
