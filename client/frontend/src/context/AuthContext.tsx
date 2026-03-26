'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';

import { User } from '@/types';
interface AuthContextType {
  user: User | null;
  token: string | null;
  sessionId: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  fetchUser: () => Promise<void>;
  hapticsEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch {
      localStorage.removeItem('kv_token');
      localStorage.removeItem('kv_sessionId');
      setToken(null);
      setSessionId(null);
      setUser(null);
      router.push('/login');
    }
  }, [router]);

  // Hydrate from API on mount and add listeners
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('kv_token');
      const storedSessionId = localStorage.getItem('kv_sessionId');
      if (storedToken) {
        setToken(storedToken);
        if (storedSessionId) setSessionId(storedSessionId);
        
        try {
          const { data } = await api.get('/auth/me');
          setUser(data);
        } catch {
          localStorage.removeItem('kv_token');
          localStorage.removeItem('kv_sessionId');
          setToken(null);
          setSessionId(null);
          setUser(null);
        }
      } else {
        setToken(null);
        setUser(null);
        setSessionId(null);
      }
      setIsLoading(false);
    };

    initAuth();

    // Safety Timeout: Force disable loader after 10 seconds if network/CORS fails silently
    const safetyTimer = setTimeout(() => {
      setIsLoading(prev => {
        if (prev) {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL;
          console.error("[Auth] Initial auth check timed out after 10s.", {
            configuredApiUrl: apiUrl,
            message: !apiUrl ? "NEXT_PUBLIC_API_URL is NOT SET! API calls will fail on production." : "Network or CORS issue detected."
          });
          toast.error(
            !apiUrl 
              ? "System Configuration Error: API URL is missing." 
              : "Connection is taking longer than expected. Please check your network.", 
            {
              id: 'network-timeout-warning',
              duration: 10000
            }
          );
          return false;
        }
        return prev;
      });
    }, 10000);

    // Heartbeat Interval (10 minutes)
    const heartbeatInterval = setInterval(() => {
      const sId = localStorage.getItem('kv_sessionId');
      const tk = localStorage.getItem('kv_token');
      if (sId && tk) {
        api.post('/auth/ping', { sessionId: sId }).catch(() => {});
      }
    }, 10 * 60 * 1000);

    // Visibility Change Listener (Navigator Beacon for reliable closure + Anti-Distraction Title)
    const originalTitle = document.title;
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        document.title = "Don't Get Distracted, Work Hard.";
        const sId = localStorage.getItem('kv_sessionId');
        const tk = localStorage.getItem('kv_token');
        if (sId && tk) {
          // Use beacon for reliable delivery on tab close/hide
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
          const url = `${baseUrl}/auth/ping`;
          const data = JSON.stringify({ sessionId: sId });
          navigator.sendBeacon(url, data);
        }
      } else {
        document.title = originalTitle;
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resourceAdded', fetchUser);
    window.addEventListener('resourceDeleted', fetchUser);
    window.addEventListener('focusSessionCompleted', fetchUser);
    
    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resourceAdded', fetchUser);
      window.removeEventListener('resourceDeleted', fetchUser);
      window.removeEventListener('focusSessionCompleted', fetchUser);
    };
  }, []);

  const fetchPublicIp = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout

      const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
      clearTimeout(timeoutId);
      const data = await res.json();
      return data.ip;
    } catch (e) {
      console.warn("[Auth] Public IP fetch failed or timed out", e);
      return 'unknown';
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    const publicIp = await fetchPublicIp();
    const { data } = await api.post('/auth/login', { email, password, publicIp });
    const { token: jwt, sessionId: sId, ...userData } = data;
    localStorage.setItem('kv_token', jwt);
    localStorage.setItem('kv_sessionId', sId || '');
    setToken(jwt);
    setSessionId(sId || null);
    setUser(userData);
    toast.success('Welcome back!');
    router.push('/');
  }, [router]);

  const loginWithToken = useCallback(async (jwt: string) => {
    localStorage.setItem('kv_token', jwt);
    setToken(jwt);
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
      toast.success('Logged in with Google!');
    } catch (err) {
      console.error("[Auth] loginWithToken failed:", err);
      localStorage.removeItem('kv_token');
      setToken(null);
      toast.error('Session initialization failed');
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const publicIp = await fetchPublicIp();
    const { data } = await api.post('/auth/register', { name, email, password, publicIp });
    const { token: jwt, sessionId: sId, ...userData } = data;
    localStorage.setItem('kv_token', jwt);
    localStorage.setItem('kv_sessionId', sId || '');
    setToken(jwt);
    setSessionId(sId || null);
    setUser(userData);
    toast.success('Account created!');
    router.push('/');
  }, [router]);

  const logout = useCallback(async () => {
    const sId = localStorage.getItem('kv_sessionId');
    if (sId) {
      try {
        await api.post('/auth/logout', { sessionId: sId });
      } catch (err) {
        console.error("Logout session closure failed", err);
      }
    }
    localStorage.removeItem('kv_token');
    localStorage.removeItem('kv_sessionId');
    setToken(null);
    setSessionId(null);
    setUser(null);
    router.push('/login');
  }, [router]);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, ...data };
    });
  }, []);

  const [hapticsEnabled, setHapticsEnabledState] = useState(true);

  useEffect(() => {
    const storedHaptics = localStorage.getItem('kv_hapticsEnabled');
    if (storedHaptics !== null) {
      setHapticsEnabledState(storedHaptics === 'true');
    }
  }, []);

  const setHapticsEnabled = useCallback((enabled: boolean) => {
    setHapticsEnabledState(enabled);
    localStorage.setItem('kv_hapticsEnabled', String(enabled));
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      sessionId, 
      isLoading, 
      login, 
      loginWithToken,
      register, 
      logout, 
      updateUser, 
      fetchUser,
      hapticsEnabled,
      setHapticsEnabled,
    }}>
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
