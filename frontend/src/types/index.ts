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

export type NoteColor = 'yellow' | 'blue' | 'pink' | 'orange' | 'green' | 'purple';

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
  Study: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  Career: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  Work: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Personal: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  Health: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  Finance: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  Projects: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  Exams: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  Design: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  Meeting: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  Other: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
};

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; border: string }> = {
  urgent: { label: 'Urgent', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
  high: { label: 'High', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
  medium: { label: 'Medium', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  low: { label: 'Low', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
};

export const NOTE_COLOR_VALUES: Record<NoteColor, string> = {
  yellow: '#FCF8EC', // Light Gold / Champagne
  blue: '#EFF4FF',   // Sapphire Mist
  pink: '#FBF3F1',   // Rose Gold Blush
  orange: '#FDF5EE', // Warm Copper
  green: '#F8F9FC',  // Diamond White
  purple: '#F4F0FA', // Soft Lilac / Lavender
};

export const EVENT_COLORS = [
  '#A85B49', // Rose Gold / Copper
  '#5E359E', // Deep Purple / Plum
  '#C29526', // Light Gold / Amber
  '#1D4ED8', // Sapphire Blue
  '#E11D48', // Coral Red
  '#8E4939', // Burnished Copper
  '#7C52BE', // Royal Lilac
  '#1E40AF', // Deep Sapphire
  '#B86B58', // Soft Rose Gold
  '#4A2574', // Royal Plum
];
