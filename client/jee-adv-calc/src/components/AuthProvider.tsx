"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '../lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  loginWithGoogle: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
  loginWithGoogle: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for token in URL hash (from redirect)
    const hash = window.location.hash;
    if (hash.includes('token=')) {
      const params = new URLSearchParams(hash.replace('#', '?'));
      const token = params.get('token');
      if (token) {
        localStorage.setItem('token', token);
        // Clear hash to keep URL clean
        window.history.replaceState(null, '', window.location.pathname);
      }
    }

    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const loginWithGoogle = () => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    
    // The backend mounts routes on both '/' and '/api', so we can just append
    // /auth/google directly to whatever base URL is provided.
    // If API_BASE_URL doesn't end with a slash, we add one implicitly.
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const authUrl = `${baseUrl}/auth/google?origin=jeecalc`;
    
    window.location.href = authUrl;
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
