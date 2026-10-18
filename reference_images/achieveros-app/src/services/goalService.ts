import type { Goal } from '../types';
import { storage } from '../utils/storage';
import { seedGoals } from '../utils/seedData';
import { generateId } from '../utils/dateUtils';
import { taskService } from './taskService';

const STORAGE_KEY = 'goals';

function getAll(): Goal[] {
  const goals = storage.get<Goal[]>(STORAGE_KEY);
  if (!goals) {
    storage.set(STORAGE_KEY, seedGoals);
    return seedGoals;
  }
  return goals;
}

function save(goals: Goal[]): void {
  storage.set(STORAGE_KEY, goals);
}

export const goalService = {
  async getAll(): Promise<Goal[]> {
    return getAll();
  },

  async getById(id: string): Promise<Goal | undefined> {
    return getAll().find(g => g.id === id);
  },

  async create(goal: Omit<Goal, 'id' | 'createdAt'>): Promise<Goal> {
    const newGoal: Goal = {
      ...goal,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const goals = getAll();
    goals.push(newGoal);
    save(goals);
    return newGoal;
  },

  async update(id: string, updates: Partial<Goal>): Promise<Goal | null> {
    const goals = getAll();
    const index = goals.findIndex(g => g.id === id);
    if (index === -1) return null;
    goals[index] = { ...goals[index], ...updates };
    save(goals);
    return goals[index];
  },

  async delete(id: string): Promise<boolean> {
    const goals = getAll();
    const filtered = goals.filter(g => g.id !== id);
    if (filtered.length === goals.length) return false;
    save(filtered);
    return true;
  },

  async linkTask(goalId: string, taskId: string): Promise<void> {
    const goals = getAll();
    const goal = goals.find(g => g.id === goalId);
    if (goal && !goal.taskIds.includes(taskId)) {
      goal.taskIds.push(taskId);
      save(goals);
    }
  },

  async unlinkTask(goalId: string, taskId: string): Promise<void> {
    const goals = getAll();
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      goal.taskIds = goal.taskIds.filter(id => id !== taskId);
      save(goals);
    }
  },

  async getProgress(goalId: string): Promise<number> {
    const goal = getAll().find(g => g.id === goalId);
    if (!goal || goal.taskIds.length === 0) return 0;
    const tasks = await taskService.getAll();
    const linkedTasks = tasks.filter(t => goal.taskIds.includes(t.id));
    if (linkedTasks.length === 0) return 0;
    const completed = linkedTasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / linkedTasks.length) * 100);
  },

  async getGoalsWithProgress(): Promise<(Goal & { progress: number })[]> {
    const goals = getAll();
    const tasks = await taskService.getAll();
    return goals.map(goal => {
      const linkedTasks = tasks.filter(t => goal.taskIds.includes(t.id));
      const completed = linkedTasks.filter(t => t.status === 'completed').length;
      const progress = linkedTasks.length > 0 ? Math.round((completed / linkedTasks.length) * 100) : 0;
      return { ...goal, progress };
    });
  },
};
