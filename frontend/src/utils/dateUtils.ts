import { DayOfWeek } from '../types';

export function formatDate(date: Date | string, _fmt?: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${(m || 0).toString().padStart(2, '0')} ${period}`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

export function isTomorrow(dateStr: string): boolean {
  const d = new Date(dateStr);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return d.toDateString() === tomorrow.toDateString();
}

export function isTaskToday(dateStr: string): boolean {
  return isToday(dateStr);
}

export function isTaskTomorrow(dateStr: string): boolean {
  return isTomorrow(dateStr);
}

export function isTaskThisWeek(dateStr: string): boolean {
  const d = new Date(dateStr);
  const today = new Date();
  const firstDay = new Date(today.setDate(today.getDate() - today.getDay() + 1));
  const lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 7));
  return d >= firstDay && d <= lastDay;
}

export function isOverdue(dateStr: string): boolean {
  return dateStr < getTodayISO();
}

export function getRelativeDateLabel(dateStr: string): string {
  if (isToday(dateStr)) return 'Today';
  if (isTomorrow(dateStr)) return 'Tomorrow';
  if (isOverdue(dateStr)) return 'Overdue';
  return formatDateShort(dateStr);
}

export function getWeekDates(baseDate?: Date): Date[] {
  const ref = baseDate ? new Date(baseDate) : new Date();
  const dayOfWeek = ref.getDay();
  const monday = new Date(ref);
  monday.setDate(ref.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function getWeekMonday(date?: Date): string {
  const ref = date ? new Date(date) : new Date();
  const dayOfWeek = ref.getDay();
  const monday = new Date(ref);
  monday.setDate(ref.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  return monday.toISOString().split('T')[0];
}

export function getWeekOfString(date: Date): string {
  return getWeekMonday(date);
}

export function getDayOfWeek(date: Date | string): DayOfWeek {
  const d = typeof date === 'string' ? new Date(date) : date;
  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[d.getDay()];
}

export function getDayOfWeekFromDate(date: Date): string {
  return getDayOfWeek(date);
}

export function formatWeekRange(weekOf: Date): string {
  const dates = getWeekDates(weekOf);
  return `${formatDateShort(dates[0])} – ${formatDateShort(dates[6])}, ${dates[0].getFullYear()}`;
}

export function getDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
