import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import { authService } from '../services/authService';
import { storage } from '../utils/storage';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session or auto-login with seed data
    const init = async () => {
      let currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        // Auto-login for demo purposes
        currentUser = await authService.autoLogin();
      }
      storage.setCurrentUser(currentUser?.id ?? null);
      setUser(currentUser);
      setIsLoading(false);
    };
    init();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    if (result.success && result.user) {
      storage.setCurrentUser(result.user.id);
      setUser(result.user);
    }
    return { success: result.success, error: result.error };
  };

  const signup = async (name: string, email: string, password: string) => {
    const result = await authService.signup(name, email, password);
    if (result.success && result.user) {
      storage.setCurrentUser(result.user.id);
      setUser(result.user);
    }
    return { success: result.success, error: result.error };
  };

  const logout = async () => {
    await authService.logout();
    storage.setCurrentUser(null);
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    const updated = await authService.updateProfile(updates);
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      signup,
      logout,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
