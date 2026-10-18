import type { Task, FilterOptions, SortConfig } from '../types';
import { storage } from '../utils/storage';
import { seedTasks } from '../utils/seedData';
import { generateId } from '../utils/dateUtils';

const STORAGE_KEY = 'tasks';

function getAll(): Task[] {
  const tasks = storage.get<Task[]>(STORAGE_KEY);
  if (!tasks) {
    storage.set(STORAGE_KEY, seedTasks);
    return seedTasks;
  }
  return tasks;
}

function save(tasks: Task[]): void {
  storage.set(STORAGE_KEY, tasks);
}

export const taskService = {
  async getAll(): Promise<Task[]> {
    return getAll();
  },

  async getById(id: string): Promise<Task | undefined> {
    return getAll().find(t => t.id === id);
  },

  async create(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    const newTask: Task = {
      ...task,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const tasks = getAll();
    tasks.push(newTask);
    save(tasks);
    return newTask;
  },

  async update(id: string, updates: Partial<Task>): Promise<Task | null> {
    const tasks = getAll();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return null;
    tasks[index] = { ...tasks[index], ...updates };
    save(tasks);
    return tasks[index];
  },

  async delete(id: string): Promise<boolean> {
    const tasks = getAll();
    const filtered = tasks.filter(t => t.id !== id);
    if (filtered.length === tasks.length) return false;
    save(filtered);
    return true;
  },

  async toggleComplete(id: string): Promise<Task | null> {
    const tasks = getAll();
    const task = tasks.find(t => t.id === id);
    if (!task) return null;
    task.status = task.status === 'completed' ? 'pending' : 'completed';
    save(tasks);
    return task;
  },

  async filter(options: FilterOptions): Promise<Task[]> {
    let tasks = getAll();

    if (options.search) {
      const q = options.search.toLowerCase();
      tasks = tasks.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }

    if (options.category) {
      tasks = tasks.filter(t => t.category === options.category);
    }

    if (options.priority) {
      tasks = tasks.filter(t => t.priority === options.priority);
    }

    if (options.status) {
      tasks = tasks.filter(t => t.status === options.status);
    }

    if (options.dateRange) {
      tasks = tasks.filter(t => {
        const due = new Date(t.dueDate);
        return due >= new Date(options.dateRange!.start) && due <= new Date(options.dateRange!.end);
      });
    }

    return tasks;
  },

  async sort(tasks: Task[], config: SortConfig): Promise<Task[]> {
    const sorted = [...tasks];
    const dir = config.direction === 'asc' ? 1 : -1;

    sorted.sort((a, b) => {
      switch (config.by) {
        case 'deadline':
          return dir * (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        case 'priority': {
          const order = { high: 0, medium: 1, low: 2 };
          return dir * (order[a.priority] - order[b.priority]);
        }
        case 'created':
          return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        case 'completion':
          return dir * (a.status === 'completed' ? 1 : -1);
        case 'title':
          return dir * a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return sorted;
  },

  async getTodayTasks(): Promise<Task[]> {
    const today = new Date().toISOString().split('T')[0];
    return getAll().filter(t => t.dueDate === today);
  },

  async getByGoalId(goalId: string): Promise<Task[]> {
    return getAll().filter(t => t.goalId === goalId);
  },

  async getUpcomingDeadlines(limit: number = 5): Promise<Task[]> {
    const today = new Date().toISOString().split('T')[0];
    return getAll()
      .filter(t => t.status === 'pending' && t.dueDate >= today)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, limit);
  },
};
