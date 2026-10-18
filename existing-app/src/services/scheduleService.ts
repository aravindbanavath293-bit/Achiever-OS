import type { WeeklyScheduleEntry } from '../types';
import { storage } from '../utils/storage';
import { seedSchedule } from '../utils/seedData';
import { generateId, getWeekMonday } from '../utils/dateUtils';

const STORAGE_KEY = 'schedule';

function getAll(): WeeklyScheduleEntry[] {
  const entries = storage.get<WeeklyScheduleEntry[]>(STORAGE_KEY);
  if (!entries) {
    storage.set(STORAGE_KEY, seedSchedule);
    return seedSchedule;
  }
  // Migrate old entries that don't have weekOf (assign to current week)
  let migrated = false;
  const currentWeek = getWeekMonday();
  for (const entry of entries) {
    if (!entry.weekOf) {
      entry.weekOf = currentWeek;
      migrated = true;
    }
  }
  if (migrated) {
    storage.set(STORAGE_KEY, entries);
  }
  return entries;
}

function save(entries: WeeklyScheduleEntry[]): void {
  storage.set(STORAGE_KEY, entries);
}

export const scheduleService = {
  async getAll(): Promise<WeeklyScheduleEntry[]> {
    return getAll();
  },

  async getByWeek(weekOf: string): Promise<WeeklyScheduleEntry[]> {
    return getAll().filter(e => e.weekOf === weekOf);
  },

  async create(entry: Omit<WeeklyScheduleEntry, 'id'>): Promise<WeeklyScheduleEntry> {
    const newEntry: WeeklyScheduleEntry = { ...entry, id: generateId() };
    const entries = getAll();
    entries.push(newEntry);
    save(entries);
    return newEntry;
  },

  async update(id: string, updates: Partial<WeeklyScheduleEntry>): Promise<WeeklyScheduleEntry | null> {
    const entries = getAll();
    const index = entries.findIndex(e => e.id === id);
    if (index === -1) return null;
    entries[index] = { ...entries[index], ...updates };
    save(entries);
    return entries[index];
  },

  async delete(id: string): Promise<boolean> {
    const entries = getAll();
    const filtered = entries.filter(e => e.id !== id);
    if (filtered.length === entries.length) return false;
    save(filtered);
    return true;
  },

  async getByDay(day: string): Promise<WeeklyScheduleEntry[]> {
    return getAll().filter(e => e.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
  },
};
