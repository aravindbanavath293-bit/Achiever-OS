import type { User } from '../types';
import { storage } from '../utils/storage';
import { seedUser } from '../utils/seedData';


const STORAGE_KEY = 'auth';
const USER_KEY = 'user';

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
}

function getAuthState(): AuthState {
  return storage.get<AuthState>(STORAGE_KEY) || { isAuthenticated: false, userId: null };
}

function getUser(): User {
  return storage.get<User>(USER_KEY) || seedUser;
}

export const authService = {
  async login(email: string, _password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    // Mock: accept any valid-looking credentials
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    if (!email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    // Generate a deterministic user ID from the email so each account is unique
    const userId = 'user-' + email.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const existingUser = getUser();
    const user: User = {
      ...existingUser,
      id: userId,
      email,
    };
    storage.set(USER_KEY, user);
    storage.set(STORAGE_KEY, { isAuthenticated: true, userId: user.id });
    return { success: true, user };
  },

  async signup(name: string, email: string, _password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 700));
    if (!email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (name.length < 2) {
      return { success: false, error: 'Name must be at least 2 characters.' };
    }
    // Generate a deterministic user ID from the email so each account is unique
    const userId = 'user-' + email.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const user: User = {
      ...seedUser,
      id: userId,
      name,
      email,
    };
    storage.set(USER_KEY, user);
    storage.set(STORAGE_KEY, { isAuthenticated: true, userId: user.id });
    return { success: true, user };
  },

  async logout(): Promise<void> {
    storage.set(STORAGE_KEY, { isAuthenticated: false, userId: null });
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (!email.includes('@')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }
    return { success: true, message: 'Password reset link has been sent to your email.' };
  },

  async getCurrentUser(): Promise<User | null> {
    const auth = getAuthState();
    if (!auth.isAuthenticated) return null;
    return getUser();
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    const user = getUser();
    const updated = { ...user, ...updates };
    storage.set(USER_KEY, updated);
    return updated;
  },

  isAuthenticated(): boolean {
    return getAuthState().isAuthenticated;
  },

  // Auto-login with seed data for demo
  async autoLogin(): Promise<User> {
    const user = getUser();
    storage.set(USER_KEY, user);
    storage.set(STORAGE_KEY, { isAuthenticated: true, userId: user.id });
    return user;
  },
};
