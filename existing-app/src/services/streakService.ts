import type { StreakData } from '../types';
import { storage } from '../utils/storage';
import { seedStreakData } from '../utils/seedData';
import { getTodayISO } from '../utils/dateUtils';

const STORAGE_KEY = 'streaks';

function getData(): StreakData {
  const data = storage.get<StreakData>(STORAGE_KEY);
  if (!data) {
    storage.set(STORAGE_KEY, seedStreakData);
    return seedStreakData;
  }
  return data;
}

function save(data: StreakData): void {
  storage.set(STORAGE_KEY, data);
}

export const streakService = {
  async getData(): Promise<StreakData> {
    return getData();
  },

  async recordCompletion(): Promise<StreakData> {
    const data = getData();
    const today = getTodayISO();

    // Increment today's count
    data.history[today] = (data.history[today] || 0) + 1;

    // Update streak
    if (data.lastCompletedDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayISO = yesterday.toISOString().split('T')[0];

      if (data.lastCompletedDate === yesterdayISO) {
        data.currentStreak += 1;
      } else if (data.lastCompletedDate !== today) {
        data.currentStreak = 1;
      }

      data.lastCompletedDate = today;
      data.longestStreak = Math.max(data.longestStreak, data.currentStreak);
    }

    save(data);
    return data;
  },

  async getHeatmapData(days: number = 30): Promise<{ date: string; count: number }[]> {
    const data = getData();
    const result: { date: string; count: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      result.push({ date: dateStr, count: data.history[dateStr] || 0 });
    }

    return result;
  },

  async getWeeklyTrend(): Promise<{ day: string; count: number }[]> {
    const data = getData();
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    return days.map((dayLabel, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      return { day: dayLabel, count: data.history[dateStr] || 0 };
    });
  },
};
