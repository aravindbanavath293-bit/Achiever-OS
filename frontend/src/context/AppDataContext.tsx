import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { Task, Goal, StickyNote, ScheduleEvent, StreakData, DailyPlan, Subtask, Milestone } from '../types';
import { SEED_TASKS, SEED_GOALS, SEED_NOTES, SEED_EVENTS, SEED_STREAK } from '../utils/seedData';
import { getTodayISO } from '../utils/dateUtils';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface AppDataContextType {
  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  // Goals
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Goal;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  // Notes
  notes: StickyNote[];
  addNote: (note: Omit<StickyNote, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => StickyNote;
  updateNote: (id: string, updates: Partial<StickyNote>) => void;
  deleteNote: (id: string) => void;
  // Events
  events: ScheduleEvent[];
  addEvent: (event: Omit<ScheduleEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => ScheduleEvent;
  updateEvent: (id: string, updates: Partial<ScheduleEvent>) => void;
  deleteEvent: (id: string) => void;
  // Daily Plans
  dailyPlans: DailyPlan[];
  getDailyPlan: (date: string) => DailyPlan | undefined;
  saveDailyPlan: (plan: DailyPlan) => void;
  // Streak
  streak: StreakData;
}

const AppDataContext = createContext<AppDataContextType | null>(null);

const STORAGE_KEY = 'achieveros_data';

function loadData<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${key}`);
    return stored ? JSON.parse(stored) : fallback;
  } catch { return fallback; }
}

function saveData<T>(key: string, data: T): void {
  localStorage.setItem(`${STORAGE_KEY}_${key}`, JSON.stringify(data));
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(() => loadData('tasks', SEED_TASKS));
  const [goals, setGoals] = useState<Goal[]>(() => loadData('goals', SEED_GOALS));
  const [notes, setNotes] = useState<StickyNote[]>(() => loadData('notes', SEED_NOTES));
  const [events, setEvents] = useState<ScheduleEvent[]>(() => loadData('events', SEED_EVENTS));
  const [dailyPlans, setDailyPlans] = useState<DailyPlan[]>(() => loadData('daily_plans', []));
  const [streak, setStreak] = useState<StreakData>(() => loadData('streak', SEED_STREAK));

  // Persist on change
  useEffect(() => { saveData('tasks', tasks); }, [tasks]);
  useEffect(() => { saveData('goals', goals); }, [goals]);
  useEffect(() => { saveData('notes', notes); }, [notes]);
  useEffect(() => { saveData('events', events); }, [events]);
  useEffect(() => { saveData('daily_plans', dailyPlans); }, [dailyPlans]);
  useEffect(() => { saveData('streak', streak); }, [streak]);

  const now = () => new Date().toISOString();
  const userId = user?.id || 'demo-user';

  // ── Task Operations ──
  const addTask = useCallback((task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Task => {
    const newTask: Task = { ...task, id: uid(), user_id: userId, created_at: now(), updated_at: now() };
    setTasks(prev => [newTask, ...prev]);
    toast.success('Task created');
    return newTask;
  }, [userId]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates, updated_at: now() } : t));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    toast.success('Task deleted');
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const newStatus = t.status === 'completed' ? 'todo' : 'completed';
      if (newStatus === 'completed') {
        // Update streak
        const today = getTodayISO();
        setStreak(s => ({
          ...s,
          last_completed_date: today,
          current_streak: s.last_completed_date === today ? s.current_streak : s.current_streak + 1,
          longest_streak: Math.max(s.longest_streak, s.last_completed_date === today ? s.current_streak : s.current_streak + 1),
          history: { ...s.history, [today]: (s.history[today] || 0) + 1 },
        }));
      }
      return { ...t, status: newStatus as Task['status'], updated_at: now() };
    }));
  }, []);

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return { ...t, subtasks: t.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s), updated_at: now() };
    }));
  }, []);

  // ── Goal Operations ──
  const addGoal = useCallback((goal: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Goal => {
    const newGoal: Goal = { ...goal, id: uid(), user_id: userId, created_at: now(), updated_at: now() };
    setGoals(prev => [newGoal, ...prev]);
    toast.success('Goal created');
    return newGoal;
  }, [userId]);

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates, updated_at: now() } : g));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    toast.success('Goal deleted');
  }, []);

  const toggleMilestone = useCallback((goalId: string, milestoneId: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      const updated = { ...g, milestones: g.milestones.map(m => m.id === milestoneId ? { ...m, completed: !m.completed } : m), updated_at: now() };
      const total = updated.milestones.length;
      const done = updated.milestones.filter(m => m.completed).length;
      if (total > 0 && done === total) updated.status = 'achieved';
      return updated;
    }));
  }, []);

  // ── Note Operations ──
  const addNote = useCallback((note: Omit<StickyNote, 'id' | 'user_id' | 'created_at' | 'updated_at'>): StickyNote => {
    const newNote: StickyNote = { ...note, id: uid(), user_id: userId, created_at: now(), updated_at: now() };
    setNotes(prev => [newNote, ...prev]);
    return newNote;
  }, [userId]);

  const updateNote = useCallback((id: string, updates: Partial<StickyNote>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, updated_at: now() } : n));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    toast.success('Note deleted');
  }, []);

  // ── Event Operations ──
  const addEvent = useCallback((event: Omit<ScheduleEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>): ScheduleEvent => {
    const newEvent: ScheduleEvent = { ...event, id: uid(), user_id: userId, created_at: now(), updated_at: now() };
    setEvents(prev => [...prev, newEvent]);
    toast.success('Event created');
    return newEvent;
  }, [userId]);

  const updateEvent = useCallback((id: string, updates: Partial<ScheduleEvent>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates, updated_at: now() } : e));
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    toast.success('Event deleted');
  }, []);

  // ── Daily Plan Operations ──
  const getDailyPlan = useCallback((date: string) => {
    return dailyPlans.find(p => p.date === date);
  }, [dailyPlans]);

  const saveDailyPlan = useCallback((plan: DailyPlan) => {
    setDailyPlans(prev => {
      const idx = prev.findIndex(p => p.date === plan.date);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...plan, updated_at: now() };
        return updated;
      }
      return [...prev, { ...plan, id: uid(), user_id: userId, created_at: now(), updated_at: now() }];
    });
  }, [userId]);

  return (
    <AppDataContext.Provider value={{
      tasks, addTask, updateTask, deleteTask, toggleTask, toggleSubtask,
      goals, addGoal, updateGoal, deleteGoal, toggleMilestone,
      notes, addNote, updateNote, deleteNote,
      events, addEvent, updateEvent, deleteEvent,
      dailyPlans, getDailyPlan, saveDailyPlan,
      streak,
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
