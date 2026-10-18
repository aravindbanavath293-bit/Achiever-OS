// ── Core Data Models ──

export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in-progress' | 'completed';
export type ThemeMode = 'light' | 'dark' | 'system';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export const DAYS_OF_WEEK: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const DEFAULT_CATEGORIES = [
  'Study', 'Career', 'Work', 'Personal', 'Health', 'Finance', 'Projects', 'Exams', 'Other'
] as const;

export type DefaultCategory = typeof DEFAULT_CATEGORIES[number];

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  created_at: string;
}

export interface UserSettings {
  theme: ThemeMode;
  notifications: NotificationPreferences;
}

export interface NotificationPreferences {
  in_app_alerts: boolean;
  email_digests: boolean;
  push_notifications: boolean;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  status: TaskStatus;
  due_date: string;
  due_time?: string;
  start_date?: string;
  scheduled_time?: string;
  estimated_minutes?: number;
  is_recurring: boolean;
  recurrence_pattern?: string;
  goal_id?: string;
  tags: string[];
  subtasks: Subtask[];
  created_at: string;
  updated_at: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  target_date: string;
  status: 'in-progress' | 'achieved';
  milestones: Milestone[];
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface ScheduleEvent {
  id: string;
  user_id: string;
  title: string;
  day: DayOfWeek;
  start_time: string;
  end_time: string;
  category: string;
  color: string;
  week_of?: string;
  created_at: string;
  updated_at: string;
}

export interface DailyPlan {
  id: string;
  user_id: string;
  date: string;
  top_priorities: string[];
  time_blocks: TimeBlock[];
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface TimeBlock {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  task_id?: string;
  category: string;
  completed: boolean;
}

export interface StickyNote {
  id: string;
  user_id: string;
  title: string;
  content: string;
  color: NoteColor;
  pinned?: boolean;
  is_pinned?: boolean;
  created_at: string;
  updated_at: string;
}

export type NoteColor = 'yellow' | 'blue' | 'pink' | 'orange' | 'green';

export interface ActivityLog {
  id: string;
  user_id: string;
  date: string;
  tasks_completed: number;
  tasks_created: number;
}

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_completed_date: string;
  history: Record<string, number>;
}

export interface AppNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  agent?: string;
  references?: AIReference[];
}

export interface AIReference {
  type: 'task' | 'goal' | 'note' | 'event';
  id: string;
  title: string;
}

export interface AIConversation {
  id: string;
  user_id: string;
  title: string;
  messages: AIMessage[];
  created_at: string;
  updated_at: string;
}

// ── UI Helpers ──

export interface FilterOptions {
  category?: string;
  priority?: Priority;
  status?: TaskStatus;
  dateRange?: { start: string; end: string };
  search?: string;
}

export type SortOption = 'due_date' | 'priority' | 'created_at' | 'title';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  by: SortOption;
  direction: SortDirection;
}

// ── Color Mappings ──

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Study: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  Career: { bg: 'bg-primary-fixed', text: 'text-on-primary-fixed', border: 'border-primary' },
  Work: { bg: 'bg-surface-variant', text: 'text-on-surface-variant', border: 'border-outline-variant' },
  Personal: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  Health: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
  Finance: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  Projects: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
  Exams: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  Design: { bg: 'bg-primary-fixed', text: 'text-on-primary-fixed', border: 'border-primary' },
  Meeting: { bg: 'bg-surface-container-high', text: 'text-on-surface-variant', border: 'border-outline-variant' },
  Other: { bg: 'bg-surface-container-high', text: 'text-on-surface-variant', border: 'border-outline-variant' },
};

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; border: string }> = {
  urgent: { label: 'Urgent', color: 'text-danger', bg: 'bg-danger-light', border: 'border-danger' },
  high: { label: 'High', color: 'text-danger', bg: 'bg-danger-light', border: 'border-danger' },
  medium: { label: 'Medium', color: 'text-warning', bg: 'bg-warning-light', border: 'border-warning' },
  low: { label: 'Low', color: 'text-success', bg: 'bg-success-light', border: 'border-success' },
};

export const NOTE_COLOR_VALUES: Record<NoteColor, string> = {
  yellow: '#fef3c7',
  blue: '#e0f2fe',
  pink: '#fce7f3',
  orange: '#ffedd5',
  green: '#dcfce7',
};

export const EVENT_COLORS = [
  '#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626',
  '#7c3aed', '#db2777', '#2563eb', '#16a34a', '#ea580c',
];
