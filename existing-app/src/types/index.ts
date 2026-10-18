// ── Core Data Model ──

export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'completed';
export type ThemeMode = 'light' | 'dark' | 'system';

export const DEFAULT_CATEGORIES = [
  'Study', 'Career', 'Work', 'Personal', 'Health', 'Projects', 'Exams', 'Other'
] as const;

export type DefaultCategory = typeof DEFAULT_CATEGORIES[number];

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string; // ISO date string
  createdAt: string;
  goalId?: string;
  scheduledTime?: string; // HH:MM format
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  taskIds: string[];
  targetDate?: string;
  createdAt: string;
  status: 'in-progress' | 'achieved';
}

export interface WeeklyScheduleEntry {
  id: string;
  day: DayOfWeek;
  activity: string;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  color: string;
  weekOf: string;    // ISO date string of the week's Monday (e.g. "2026-09-14")
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: ThemeMode;
  notifications: NotificationPreferences;
}

export interface NotificationPreferences {
  inAppAlerts: boolean;
  emailDigests: boolean;
  pushNotifications: boolean;
  upcomingTasks: boolean;
  deadlines: boolean;
  dailyPlanning: boolean;
  incompleteTasks: boolean;
  goalMilestones: boolean;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string;
  history: Record<string, number>; // date string → tasks completed count
}

export interface StickyNote {
  id: string;
  title: string;
  content: string;
  color: 'yellow' | 'blue' | 'pink' | 'orange' | 'green';
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyTodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface WeeklyTodoDay {
  day: DayOfWeek | 'weekly';
  items: WeeklyTodoItem[];
}

export interface AppNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
}

// ── Utility Types ──

export interface FilterOptions {
  category?: string;
  priority?: Priority;
  status?: TaskStatus;
  dateRange?: { start: string; end: string };
  search?: string;
}

export type SortOption = 'deadline' | 'priority' | 'created' | 'completion' | 'title';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  by: SortOption;
  direction: SortDirection;
}

// ── Category color mapping ──
export const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Study: { bg: 'bg-blue-100', text: 'text-blue-800' },
  Career: { bg: 'bg-primary-fixed', text: 'text-on-primary-fixed' },
  Work: { bg: 'bg-surface-variant', text: 'text-on-surface-variant' },
  Personal: { bg: 'bg-purple-100', text: 'text-purple-800' },
  Health: { bg: 'bg-tertiary-fixed', text: 'text-on-tertiary-fixed' },
  Projects: { bg: 'bg-amber-100', text: 'text-amber-800' },
  Exams: { bg: 'bg-red-100', text: 'text-red-800' },
  Other: { bg: 'bg-surface-container-high', text: 'text-on-surface-variant' },
  Design: { bg: 'bg-primary-fixed', text: 'text-on-primary-fixed' },
  Meeting: { bg: 'bg-surface-container-high', text: 'text-on-surface-variant' },
  Finance: { bg: 'bg-surface-variant', text: 'text-on-surface-variant' },
};

export const PRIORITY_COLORS: Record<Priority, { text: string; border: string; bg: string }> = {
  high: { text: 'text-priority-high', border: 'border-priority-high', bg: 'bg-error-container' },
  medium: { text: 'text-priority-medium', border: 'border-priority-medium', bg: 'bg-amber-100' },
  low: { text: 'text-priority-low', border: 'border-priority-low', bg: 'bg-green-100' },
};

export const NOTE_COLORS: Record<StickyNote['color'], string> = {
  yellow: 'bg-note-yellow',
  blue: 'bg-note-blue',
  pink: 'bg-note-pink',
  orange: 'bg-note-orange',
  green: 'bg-note-green',
};
