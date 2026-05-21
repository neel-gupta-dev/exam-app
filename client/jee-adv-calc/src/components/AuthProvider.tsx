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
    // Remove /api from base url for auth route
    const authUrl = API_BASE_URL.replace('/api', '') + '/auth/google?origin=jeecalc';
    window.location.href = authUrl;
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
