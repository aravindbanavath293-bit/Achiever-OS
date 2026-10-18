import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Task, FilterOptions, SortConfig } from '../types';
import { taskService } from '../services/taskService';
import { streakService } from '../services/streakService';
import { useAuth } from './AuthContext';

interface TaskContextType {
  tasks: Task[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  filterTasks: (options: FilterOptions) => Promise<Task[]>;
  sortTasks: (tasks: Task[], config: SortConfig) => Promise<Task[]>;
}

const TaskContext = createContext<TaskContextType | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const allTasks = await taskService.getAll();
    setTasks(allTasks);
    setIsLoading(false);
  }, [user?.id]);

  useEffect(() => { refresh(); }, [refresh]);

  const createTask = async (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask = await taskService.create(task);
    await refresh();
    return newTask;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    await taskService.update(id, updates);
    await refresh();
  };

  const deleteTask = async (id: string) => {
    await taskService.delete(id);
    await refresh();
  };

  const toggleComplete = async (id: string) => {
    const task = await taskService.toggleComplete(id);
    if (task?.status === 'completed') {
      await streakService.recordCompletion();
    }
    await refresh();
  };

  const filterTasks = async (options: FilterOptions) => {
    return taskService.filter(options);
  };

  const sortTasks = async (taskList: Task[], config: SortConfig) => {
    return taskService.sort(taskList, config);
  };

  return (
    <TaskContext.Provider value={{
      tasks, isLoading, refresh,
      createTask, updateTask, deleteTask, toggleComplete,
      filterTasks, sortTasks,
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within TaskProvider');
  return ctx;
}
