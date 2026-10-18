import { Task, Goal, StickyNote, ScheduleEvent, StreakData, DayOfWeek } from '../types';
import { format, addDays, subDays } from 'date-fns';

const today = new Date();
const todayStr = format(today, 'yyyy-MM-dd');
const tomorrowStr = format(addDays(today, 1), 'yyyy-MM-dd');
const nextWeekStr = format(addDays(today, 7), 'yyyy-MM-dd');
const in3DaysStr = format(addDays(today, 3), 'yyyy-MM-dd');
const in10DaysStr = format(addDays(today, 10), 'yyyy-MM-dd');

function uid(): string {
  return Math.random().toString(36).substr(2, 9);
}

function getDayName(): DayOfWeek {
  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[today.getDay()];
}

function getWeekOf(): string {
  const d = new Date(today);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return format(d, 'yyyy-MM-dd');
}

export const DEMO_USER = {
  id: 'demo-user',
  name: 'Alex',
  email: 'alex@achieveros.app',
  avatar: '',
  created_at: format(subDays(today, 30), 'yyyy-MM-dd'),
};

export const SEED_TASKS: Task[] = [
  { id: uid(), user_id: 'demo-user', title: 'Finalize Q4 Marketing Strategy', description: 'Review and finalize the marketing strategy for Q4', category: 'Work', priority: 'urgent', status: 'todo', due_date: todayStr, due_time: '10:00', scheduled_time: '10:00', estimated_minutes: 90, is_recurring: false, tags: ['marketing', 'strategy'], subtasks: [], created_at: format(subDays(today, 2), "yyyy-MM-dd'T'HH:mm:ss"), updated_at: format(subDays(today, 2), "yyyy-MM-dd'T'HH:mm:ss") },
  { id: uid(), user_id: 'demo-user', title: 'Review Design System Updates', description: 'Go through the latest design system changes', category: 'Design', priority: 'medium', status: 'todo', due_date: todayStr, due_time: '13:30', scheduled_time: '13:30', estimated_minutes: 30, is_recurring: false, tags: ['design'], subtasks: [], created_at: format(subDays(today, 1), "yyyy-MM-dd'T'HH:mm:ss"), updated_at: format(subDays(today, 1), "yyyy-MM-dd'T'HH:mm:ss") },
  { id: uid(), user_id: 'demo-user', title: 'Sync with Engineering Team', description: 'Weekly sync meeting with the engineering team', category: 'Meeting', priority: 'medium', status: 'todo', due_date: todayStr, due_time: '15:00', scheduled_time: '15:00', estimated_minutes: 60, is_recurring: true, recurrence_pattern: 'weekly', tags: ['meeting'], subtasks: [], created_at: format(subDays(today, 5), "yyyy-MM-dd'T'HH:mm:ss"), updated_at: format(subDays(today, 5), "yyyy-MM-dd'T'HH:mm:ss") },
  { id: uid(), user_id: 'demo-user', title: 'Inbox Zero', description: 'Clear email inbox', category: 'Personal', priority: 'low', status: 'completed', due_date: todayStr, due_time: '09:00', scheduled_time: '09:00', estimated_minutes: 20, is_recurring: false, tags: [], subtasks: [], created_at: format(subDays(today, 1), "yyyy-MM-dd'T'HH:mm:ss"), updated_at: todayStr + 'T09:15:00' },
  { id: uid(), user_id: 'demo-user', title: 'Prepare Sprint Demo', description: 'Prepare demo for sprint review', category: 'Work', priority: 'high', status: 'todo', due_date: todayStr, due_time: '16:00', scheduled_time: '16:00', estimated_minutes: 45, is_recurring: false, tags: ['sprint'], subtasks: [{ id: uid(), title: 'Update slides', completed: true }, { id: uid(), title: 'Test demo flow', completed: false }], created_at: format(subDays(today, 3), "yyyy-MM-dd'T'HH:mm:ss"), updated_at: format(subDays(today, 3), "yyyy-MM-dd'T'HH:mm:ss") },
  { id: uid(), user_id: 'demo-user', title: 'Read Chapter 5 - System Design', description: 'Continue reading system design interview book', category: 'Study', priority: 'medium', status: 'completed', due_date: todayStr, estimated_minutes: 60, is_recurring: false, tags: ['learning', 'books'], subtasks: [], created_at: format(subDays(today, 2), "yyyy-MM-dd'T'HH:mm:ss"), updated_at: todayStr + 'T08:30:00' },
  { id: uid(), user_id: 'demo-user', title: 'Gym Workout', description: 'Upper body workout', category: 'Health', priority: 'low', status: 'completed', due_date: todayStr, scheduled_time: '07:00', estimated_minutes: 60, is_recurring: true, recurrence_pattern: 'daily', tags: ['fitness'], subtasks: [], created_at: format(subDays(today, 10), "yyyy-MM-dd'T'HH:mm:ss"), updated_at: todayStr + 'T08:00:00' },
  { id: uid(), user_id: 'demo-user', title: 'Tax Filing', description: 'Complete tax filing for the year', category: 'Finance', priority: 'urgent', status: 'todo', due_date: tomorrowStr, estimated_minutes: 120, is_recurring: false, tags: ['finance', 'deadline'], subtasks: [], created_at: format(subDays(today, 7), "yyyy-MM-dd'T'HH:mm:ss"), updated_at: format(subDays(today, 7), "yyyy-MM-dd'T'HH:mm:ss") },
  { id: uid(), user_id: 'demo-user', title: 'Project Alpha Launch', description: 'Final preparations for Project Alpha launch', category: 'Work', priority: 'high', status: 'in-progress', due_date: nextWeekStr, estimated_minutes: 480, is_recurring: false, tags: ['project', 'launch'], subtasks: [{ id: uid(), title: 'QA sign-off', completed: true }, { id: uid(), title: 'Deploy to staging', completed: true }, { id: uid(), title: 'Production deploy', completed: false }], created_at: format(subDays(today, 14), "yyyy-MM-dd'T'HH:mm:ss"), updated_at: format(subDays(today, 1), "yyyy-MM-dd'T'HH:mm:ss") },
  { id: uid(), user_id: 'demo-user', title: 'Renew Passport', description: 'Apply for passport renewal', category: 'Personal', priority: 'medium', status: 'todo', due_date: in10DaysStr, estimated_minutes: 60, is_recurring: false, tags: ['personal'], subtasks: [], created_at: format(subDays(today, 5), "yyyy-MM-dd'T'HH:mm:ss"), updated_at: format(subDays(today, 5), "yyyy-MM-dd'T'HH:mm:ss") },
  { id: uid(), user_id: 'demo-user', title: 'Complete React Tutorial Module 3', description: 'Finish hooks and context module', category: 'Study', priority: 'medium', status: 'in-progress', due_date: in3DaysStr, estimated_minutes: 120, is_recurring: false, tags: ['learning', 'react'], subtasks: [{ id: uid(), title: 'useState exercises', completed: true }, { id: uid(), title: 'useEffect exercises', completed: true }, { id: uid(), title: 'useContext exercises', completed: false }], created_at: format(subDays(today, 8), "yyyy-MM-dd'T'HH:mm:ss"), updated_at: format(subDays(today, 1), "yyyy-MM-dd'T'HH:mm:ss") },
];

export const SEED_GOALS: Goal[] = [
  { id: uid(), user_id: 'demo-user', title: 'Learn React', description: 'Complete React learning path', category: 'Education', target_date: format(addDays(today, 60), 'yyyy-MM-dd'), status: 'in-progress', milestones: [{ id: uid(), title: 'Complete fundamentals', completed: true }, { id: uid(), title: 'Build 3 projects', completed: true }, { id: uid(), title: 'Learn advanced patterns', completed: true }, { id: uid(), title: 'Build production app', completed: false }, { id: uid(), title: 'Write blog posts', completed: false }], created_at: format(subDays(today, 30), "yyyy-MM-dd'T'HH:mm:ss"), updated_at: format(subDays(today, 1), "yyyy-MM-dd'T'HH:mm:ss") },
  { id: uid(), user_id: 'demo-user', title: 'Read 12 Books', description: 'Read 12 books this year', category: 'Personal', target_date: format(addDays(today, 90), 'yyyy-MM-dd'), status: 'in-progress', milestones: [{ id: uid(), title: 'Book 1: Atomic Habits', completed: true }, { id: uid(), title: 'Book 2: Deep Work', completed: true }, { id: uid(), title: 'Book 3: System Design', completed: false }, { id: uid(), title: 'Book 4: Clean Code', completed: false }], created_at: format(subDays(today, 60), "yyyy-MM-dd'T'HH:mm:ss"), updated_at: format(subDays(today, 3), "yyyy-MM-dd'T'HH:mm:ss") },
  { id: uid(), user_id: 'demo-user', title: 'Get Fit', description: 'Achieve target fitness level', category: 'Health', target_date: format(addDays(today, 120), 'yyyy-MM-dd'), status: 'in-progress', milestones: [{ id: uid(), title: 'Establish workout routine', completed: true }, { id: uid(), title: 'Run 5K', completed: false }, { id: uid(), title: 'Reach target weight', completed: false }], created_at: format(subDays(today, 45), "yyyy-MM-dd'T'HH:mm:ss"), updated_at: format(subDays(today, 2), "yyyy-MM-dd'T'HH:mm:ss") },
  { id: uid(), user_id: 'demo-user', title: 'Launch Side Project', description: 'Build and ship a SaaS product', category: 'Career', target_date: format(addDays(today, 180), 'yyyy-MM-dd'), status: 'in-progress', milestones: [{ id: uid(), title: 'Define MVP', completed: true }, { id: uid(), title: 'Build prototype', completed: true }, { id: uid(), title: 'Beta testing', completed: false }, { id: uid(), title: 'Public launch', completed: false }], created_at: format(subDays(today, 90), "yyyy-MM-dd'T'HH:mm:ss"), updated_at: format(subDays(today, 5), "yyyy-MM-dd'T'HH:mm:ss") },
];

export const SEED_NOTES: StickyNote[] = [
  { id: uid(), user_id: 'demo-user', title: 'Groceries', content: 'Buy groceries and healthy meal prep ingredients', color: 'yellow', is_pinned: false, created_at: format(subDays(today, 3), "yyyy-MM-dd'T'HH:mm:ss"), updated_at: format(subDays(today, 3), "yyyy-MM-dd'T'HH:mm:ss") },
  { id: uid(), user_id: 'demo-user', title: 'Design Review', content: 'Call the design team regarding mobile drawer animation and card borders', color: 'pink', is_pinned: false, created_at: format(subDays(today, 2), "yyyy-MM-dd'T'HH:mm:ss"), updated_at: format(subDays(today, 2), "yyyy-MM-dd'T'HH:mm:ss") },
  { id: uid(), user_id: 'demo-user', title: 'Quarterly OKRs', content: 'Check Q4 goals - ensure TypeScript backend migration is on schedule', color: 'blue', is_pinned: true, created_at: format(subDays(today, 1), "yyyy-MM-dd'T'HH:mm:ss"), updated_at: format(subDays(today, 1), "yyyy-MM-dd'T'HH:mm:ss") },
  { id: uid(), user_id: 'demo-user', title: 'Security Checklist', content: 'Cybersecurity project research notes - Check OWASP top 10 updates and pgvector isolation', color: 'orange', is_pinned: false, created_at: format(subDays(today, 5), "yyyy-MM-dd'T'HH:mm:ss"), updated_at: format(subDays(today, 5), "yyyy-MM-dd'T'HH:mm:ss") },
  { id: uid(), user_id: 'demo-user', title: 'Thesis Meeting', content: 'Meeting with Prof. Smith about machine learning and agent orchestration', color: 'green', is_pinned: false, created_at: format(subDays(today, 4), "yyyy-MM-dd'T'HH:mm:ss"), updated_at: format(subDays(today, 4), "yyyy-MM-dd'T'HH:mm:ss") },
];

export const SEED_EVENTS: ScheduleEvent[] = [
  { id: uid(), user_id: 'demo-user', title: 'Deep Work: Strategy', day: getDayName(), start_time: '10:00', end_time: '11:30', category: 'Work', color: '#203451', week_of: getWeekOf(), created_at: todayStr, updated_at: todayStr },
  { id: uid(), user_id: 'demo-user', title: 'Design Review', day: getDayName(), start_time: '13:30', end_time: '14:00', category: 'Design', color: '#C9A34E', week_of: getWeekOf(), created_at: todayStr, updated_at: todayStr },
  { id: uid(), user_id: 'demo-user', title: 'Team Standup', day: getDayName(), start_time: '09:00', end_time: '09:30', category: 'Meeting', color: '#4C9B73', week_of: getWeekOf(), created_at: todayStr, updated_at: todayStr },
  { id: uid(), user_id: 'demo-user', title: 'Coding Session', day: 'tuesday', start_time: '14:00', end_time: '16:00', category: 'Work', color: '#203451', week_of: getWeekOf(), created_at: todayStr, updated_at: todayStr },
  { id: uid(), user_id: 'demo-user', title: 'Study Group', day: 'wednesday', start_time: '16:00', end_time: '17:30', category: 'Study', color: '#7c3aed', week_of: getWeekOf(), created_at: todayStr, updated_at: todayStr },
  { id: uid(), user_id: 'demo-user', title: 'Gym', day: 'thursday', start_time: '07:00', end_time: '08:00', category: 'Health', color: '#4C9B73', week_of: getWeekOf(), created_at: todayStr, updated_at: todayStr },
  { id: uid(), user_id: 'demo-user', title: 'Sprint Review', day: 'friday', start_time: '15:00', end_time: '16:00', category: 'Work', color: '#d97706', week_of: getWeekOf(), created_at: todayStr, updated_at: todayStr },
];

export const SEED_STREAK: StreakData = {
  current_streak: 7,
  longest_streak: 14,
  last_completed_date: todayStr,
  history: (() => {
    const h: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const d = format(subDays(today, i), 'yyyy-MM-dd');
      h[d] = Math.floor(Math.random() * 4) + (i < 7 ? 2 : 0);
    }
    return h;
  })(),
};
