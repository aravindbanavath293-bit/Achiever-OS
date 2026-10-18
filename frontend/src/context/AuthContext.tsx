import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { User } from '../types';
import { DEMO_USER } from '../utils/seedData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem('achieveros_user');
    const token = localStorage.getItem('achieveros_token');
    
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsDemoMode(!token);
      } catch {
        localStorage.removeItem('achieveros_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // Try real backend first
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('achieveros_token', data.access_token);
        localStorage.setItem('achieveros_user', JSON.stringify(data.user));
        setUser(data.user);
        setIsDemoMode(false);
        return;
      }
    } catch {
      // Backend unavailable - fall through to demo mode
    }

    // Demo mode fallback
    if (email && password) {
      const demoUser = { ...DEMO_USER, name: email.split('@')[0] || 'Alex', email };
      localStorage.setItem('achieveros_user', JSON.stringify(demoUser));
      setUser(demoUser);
      setIsDemoMode(true);
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('achieveros_token', data.access_token);
        localStorage.setItem('achieveros_user', JSON.stringify(data.user));
        setUser(data.user);
        setIsDemoMode(false);
        return;
      }
    } catch {
      // Backend unavailable - fall through to demo mode
    }

    // Demo mode fallback
    const demoUser = { ...DEMO_USER, name, email };
    localStorage.setItem('achieveros_user', JSON.stringify(demoUser));
    setUser(demoUser);
    setIsDemoMode(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('achieveros_token');
    localStorage.removeItem('achieveros_user');
    setUser(null);
    setIsDemoMode(false);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      localStorage.setItem('achieveros_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, isDemoMode, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
