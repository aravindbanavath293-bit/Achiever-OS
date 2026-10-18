// localStorage wrapper for clean data access
// Supports user-scoped keys so each account gets isolated data.

const BASE_PREFIX = 'achieveros_';
// Keys that should NOT be scoped per-user (needed before login)
const GLOBAL_KEYS = new Set(['auth', 'user']);
// All data keys that services use (excluding global keys)
const DATA_KEYS = ['tasks', 'goals', 'notes', 'schedule', 'streak', 'weekly_todos', 'theme'];

let currentUserId: string | null = null;
type UserChangeListener = (userId: string | null) => void;
const userChangeListeners: UserChangeListener[] = [];

function prefixFor(key: string): string {
  if (GLOBAL_KEYS.has(key) || !currentUserId) {
    return BASE_PREFIX;
  }
  return `${BASE_PREFIX}${currentUserId}_`;
}

/**
 * One-time migration: copy data from old unscoped keys (achieveros_tasks)
 * to the new user-scoped keys (achieveros_userId_tasks).
 * Only runs once per user — sets a flag so it doesn't repeat.
 */
function migrateOldData(userId: string): void {
  const migrationFlag = `${BASE_PREFIX}${userId}_migrated`;
  if (localStorage.getItem(migrationFlag)) return; // already migrated

  for (const key of DATA_KEYS) {
    const oldFullKey = BASE_PREFIX + key;
    const newFullKey = `${BASE_PREFIX}${userId}_${key}`;

    const oldData = localStorage.getItem(oldFullKey);
    // Only migrate if old data exists AND new scoped key doesn't already have data
    if (oldData && !localStorage.getItem(newFullKey)) {
      localStorage.setItem(newFullKey, oldData);
    }
  }

  // Mark migration as done for this user
  localStorage.setItem(migrationFlag, 'true');
}

export const storage = {
  /**
   * Set the current user ID so all subsequent reads/writes
   * are scoped to that user's namespace.
   */
  setCurrentUser(userId: string | null): void {
    if (currentUserId === userId) return;
    currentUserId = userId;

    // Migrate old unscoped data to the user's namespace (runs once per user)
    if (userId) {
      migrateOldData(userId);
    }

    // Notify listeners so pages can reload their data
    userChangeListeners.forEach(fn => fn(userId));
  },

  getCurrentUserId(): string | null {
    return currentUserId;
  },

  /**
   * Register a callback that fires whenever the active user changes.
   * Returns an unsubscribe function.
   */
  onUserChange(listener: UserChangeListener): () => void {
    userChangeListeners.push(listener);
    return () => {
      const idx = userChangeListeners.indexOf(listener);
      if (idx !== -1) userChangeListeners.splice(idx, 1);
    };
  },

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(prefixFor(key) + key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(prefixFor(key) + key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error);
    }
  },

  remove(key: string): void {
    localStorage.removeItem(prefixFor(key) + key);
  },

  clear(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith(BASE_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  },
};
