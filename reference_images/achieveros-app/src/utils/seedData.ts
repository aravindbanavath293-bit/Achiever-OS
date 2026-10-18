import type { Task, Goal, WeeklyScheduleEntry, StickyNote, StreakData, WeeklyTodoDay, User } from '../types';
import { getDaysAgo, getTodayISO, getWeekMonday } from './dateUtils';

const today = getTodayISO();
const tomorrow = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })();
const in3Days = (() => { const d = new Date(); d.setDate(d.getDate() + 3); return d.toISOString().split('T')[0]; })();
const in5Days = (() => { const d = new Date(); d.setDate(d.getDate() + 5); return d.toISOString().split('T')[0]; })();
const in7Days = (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().split('T')[0]; })();
const in14Days = (() => { const d = new Date(); d.setDate(d.getDate() + 14); return d.toISOString().split('T')[0]; })();
const yesterday = getDaysAgo(1);

export const seedUser: User = {
  id: 'user-1',
  name: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  avatar: '',
  preferences: {
    theme: 'light',
    notifications: {
      inAppAlerts: true,
      emailDigests: false,
      pushNotifications: true,
      upcomingTasks: true,
      deadlines: true,
      dailyPlanning: true,
      incompleteTasks: false,
      goalMilestones: true,
    },
  },
};

export const seedTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Finalize Q4 Marketing Strategy',
    description: 'Complete the marketing strategy presentation for Q4 including budget allocations and campaign timelines.',
    category: 'Work',
    priority: 'high',
    status: 'pending',
    dueDate: today,
    createdAt: getDaysAgo(3),
    scheduledTime: '10:00',
  },
  {
    id: 'task-2',
    title: 'Review Design System Updates',
    description: 'Go through the latest design system changes and provide feedback on component updates.',
    category: 'Design',
    priority: 'medium',
    status: 'pending',
    dueDate: today,
    createdAt: getDaysAgo(2),
    goalId: 'goal-1',
    scheduledTime: '13:30',
  },
  {
    id: 'task-3',
    title: 'Sync with Engineering Team',
    description: 'Weekly sync to discuss sprint progress and blockers.',
    category: 'Meeting',
    priority: 'low',
    status: 'pending',
    dueDate: today,
    createdAt: getDaysAgo(1),
  },
  {
    id: 'task-4',
    title: 'Inbox Zero',
    description: 'Clear all unread emails and respond to pending messages.',
    category: 'Personal',
    priority: 'low',
    status: 'completed',
    dueDate: today,
    createdAt: getDaysAgo(1),
  },
  {
    id: 'task-5',
    title: 'Complete React Tutorial Chapter 5',
    description: 'Finish hooks and context API tutorial chapter with exercises.',
    category: 'Study',
    priority: 'medium',
    status: 'completed',
    dueDate: today,
    createdAt: getDaysAgo(5),
    goalId: 'goal-2',
  },
  {
    id: 'task-6',
    title: 'Prepare Tax Filing Documents',
    description: 'Gather all necessary documents for annual tax filing.',
    category: 'Finance',
    priority: 'high',
    status: 'pending',
    dueDate: tomorrow,
    createdAt: getDaysAgo(7),
  },
  {
    id: 'task-7',
    title: 'Project Alpha Launch Prep',
    description: 'Final review of launch checklist and stakeholder communication.',
    category: 'Work',
    priority: 'high',
    status: 'pending',
    dueDate: in5Days,
    createdAt: getDaysAgo(10),
    goalId: 'goal-1',
  },
  {
    id: 'task-8',
    title: 'Renew Passport',
    description: 'Submit passport renewal application with updated photos.',
    category: 'Personal',
    priority: 'medium',
    status: 'pending',
    dueDate: in14Days,
    createdAt: getDaysAgo(5),
  },
  {
    id: 'task-9',
    title: 'Read "Atomic Habits" Chapter 3',
    description: 'Continue reading and take notes on habit stacking techniques.',
    category: 'Personal',
    priority: 'low',
    status: 'pending',
    dueDate: in3Days,
    createdAt: getDaysAgo(2),
    goalId: 'goal-3',
  },
  {
    id: 'task-10',
    title: 'Complete React Router v6 Migration',
    description: 'Migrate all routes from v5 to v6 syntax.',
    category: 'Projects',
    priority: 'high',
    status: 'completed',
    dueDate: yesterday,
    createdAt: getDaysAgo(8),
    goalId: 'goal-2',
  },
  {
    id: 'task-11',
    title: 'Morning Workout - Cardio',
    description: '30 min running + 15 min stretching.',
    category: 'Health',
    priority: 'medium',
    status: 'completed',
    dueDate: today,
    createdAt: getDaysAgo(1),
  },
  {
    id: 'task-12',
    title: 'Market Research & Validation',
    description: 'Complete competitive analysis and user interview synthesis.',
    category: 'Career',
    priority: 'high',
    status: 'completed',
    dueDate: getDaysAgo(14),
    createdAt: getDaysAgo(30),
    goalId: 'goal-1',
  },
  {
    id: 'task-13',
    title: 'MVP Development',
    description: 'Build core features for the SaaS product MVP.',
    category: 'Career',
    priority: 'high',
    status: 'completed',
    dueDate: getDaysAgo(7),
    createdAt: getDaysAgo(25),
    goalId: 'goal-1',
  },
  {
    id: 'task-14',
    title: 'Beta Testing',
    description: 'Run beta tests with 10 users and collect feedback.',
    category: 'Career',
    priority: 'high',
    status: 'completed',
    dueDate: getDaysAgo(3),
    createdAt: getDaysAgo(20),
    goalId: 'goal-1',
  },
  {
    id: 'task-15',
    title: 'Marketing Site Launch',
    description: 'Design and deploy the product marketing website.',
    category: 'Career',
    priority: 'medium',
    status: 'pending',
    dueDate: in7Days,
    createdAt: getDaysAgo(5),
    goalId: 'goal-1',
  },
  {
    id: 'task-16',
    title: 'Public Release',
    description: 'Launch product publicly with press release and social media campaign.',
    category: 'Career',
    priority: 'high',
    status: 'pending',
    dueDate: in14Days,
    createdAt: getDaysAgo(5),
    goalId: 'goal-1',
  },
];

export const seedGoals: Goal[] = [
  {
    id: 'goal-1',
    title: 'Launch Independent SaaS Product',
    description: 'Build and launch a SaaS product by Q4 2024.',
    category: 'Career',
    taskIds: ['task-12', 'task-13', 'task-14', 'task-15', 'task-16', 'task-2', 'task-7'],
    targetDate: in14Days,
    createdAt: getDaysAgo(60),
    status: 'in-progress',
  },
  {
    id: 'goal-2',
    title: 'Learn React',
    description: 'Complete React learning path with projects.',
    category: 'Study',
    taskIds: ['task-5', 'task-10'],
    targetDate: in14Days,
    createdAt: getDaysAgo(30),
    status: 'in-progress',
  },
  {
    id: 'goal-3',
    title: 'Read 12 Books This Year',
    description: 'Read one book per month across various genres.',
    category: 'Personal',
    taskIds: ['task-9'],
    targetDate: in14Days,
    createdAt: getDaysAgo(90),
    status: 'in-progress',
  },
];

const thisWeekMonday = getWeekMonday();

export const seedSchedule: WeeklyScheduleEntry[] = [
  { id: 'sched-1', day: 'monday', activity: 'Deep Work', startTime: '08:00', endTime: '10:00', color: 'timetable-blue', weekOf: thisWeekMonday },
  { id: 'sched-2', day: 'monday', activity: 'Deep Work', startTime: '10:00', endTime: '12:00', color: 'timetable-blue', weekOf: thisWeekMonday },
  { id: 'sched-3', day: 'monday', activity: 'Lunch', startTime: '12:00', endTime: '13:00', color: 'timetable-gray', weekOf: thisWeekMonday },
  { id: 'sched-4', day: 'tuesday', activity: 'Team Sync', startTime: '08:00', endTime: '09:00', color: 'timetable-yellow', weekOf: thisWeekMonday },
  { id: 'sched-5', day: 'wednesday', activity: 'Workout', startTime: '08:00', endTime: '09:00', color: 'timetable-orange', weekOf: thisWeekMonday },
  { id: 'sched-6', day: 'wednesday', activity: 'Client Call', startTime: '10:00', endTime: '11:00', color: 'timetable-blue', weekOf: thisWeekMonday },
  { id: 'sched-7', day: 'friday', activity: 'Project Review', startTime: '08:00', endTime: '10:00', color: 'timetable-green', weekOf: thisWeekMonday },
  { id: 'sched-8', day: 'friday', activity: 'Project Review', startTime: '10:00', endTime: '12:00', color: 'timetable-green', weekOf: thisWeekMonday },
  { id: 'sched-9', day: 'saturday', activity: 'Study', startTime: '08:00', endTime: '10:00', color: 'timetable-gray', weekOf: thisWeekMonday },
  { id: 'sched-10', day: 'saturday', activity: 'Study', startTime: '10:00', endTime: '12:00', color: 'timetable-gray', weekOf: thisWeekMonday },
  { id: 'sched-11', day: 'saturday', activity: 'Study', startTime: '12:00', endTime: '13:00', color: 'timetable-gray', weekOf: thisWeekMonday },
];

export const seedNotes: StickyNote[] = [
  {
    id: 'note-1',
    title: 'Social Media',
    content: '- Plan social content\n- Build content calendar\n- Plan promotion and distribution',
    color: 'yellow',
    createdAt: getDaysAgo(5),
    updatedAt: getDaysAgo(2),
  },
  {
    id: 'note-2',
    title: 'Content Strategy',
    content: 'Would need time to get insights (goals, personals, budget, audits), but after, it would be good to focus on assembling my team. Also need to brainstorm on tooling.',
    color: 'blue',
    createdAt: getDaysAgo(7),
    updatedAt: getDaysAgo(3),
  },
  {
    id: 'note-3',
    title: 'Email A/B Tests',
    content: '- Subject lines\n- Sender\n- CTA\n- Sending times',
    color: 'pink',
    createdAt: getDaysAgo(3),
    updatedAt: getDaysAgo(1),
  },
  {
    id: 'note-4',
    title: 'Banner Ads',
    content: 'Notes from the workshop:\n- Sizing matters\n- Choose distinctive imagery\n- The landing page must match the display ad',
    color: 'orange',
    createdAt: getDaysAgo(2),
    updatedAt: getDaysAgo(1),
  },
];

export const seedStreakData: StreakData = (() => {
  const history: Record<string, number> = {};
  // Build a 30-day history with realistic data (7-day active streak)
  for (let i = 0; i < 30; i++) {
    const date = getDaysAgo(i);
    if (i <= 6) {
      // Current 7-day streak
      history[date] = Math.floor(Math.random() * 6) + 3; // 3-8 tasks
    } else if (i >= 8 && i <= 12) {
      history[date] = Math.floor(Math.random() * 5) + 1;
    } else if (i >= 15 && i <= 20) {
      history[date] = Math.floor(Math.random() * 4) + 2;
    } else if (i >= 23 && i <= 28) {
      history[date] = Math.floor(Math.random() * 3) + 1;
    } else {
      history[date] = 0;
    }
  }
  return {
    currentStreak: 7,
    longestStreak: 24,
    lastCompletedDate: today,
    history,
  };
})();

export const seedWeeklyTodos: WeeklyTodoDay[] = [
  { day: 'monday', items: [
    { id: 'wt-1', text: 'Team standup meeting', completed: true },
    { id: 'wt-2', text: 'Review pull requests', completed: true },
    { id: 'wt-3', text: 'Update project documentation', completed: false },
    { id: 'wt-4', text: '', completed: false },
  ]},
  { day: 'tuesday', items: [
    { id: 'wt-5', text: 'Client presentation prep', completed: false },
    { id: 'wt-6', text: 'Design review session', completed: false },
    { id: 'wt-7', text: '', completed: false },
    { id: 'wt-8', text: '', completed: false },
  ]},
  { day: 'wednesday', items: [
    { id: 'wt-9', text: 'Sprint planning', completed: false },
    { id: 'wt-10', text: 'Code review', completed: false },
    { id: 'wt-11', text: '', completed: false },
    { id: 'wt-12', text: '', completed: false },
  ]},
  { day: 'thursday', items: [
    { id: 'wt-13', text: 'Backend API testing', completed: false },
    { id: 'wt-14', text: '', completed: false },
    { id: 'wt-15', text: '', completed: false },
    { id: 'wt-16', text: '', completed: false },
  ]},
  { day: 'friday', items: [
    { id: 'wt-17', text: 'Weekly retrospective', completed: false },
    { id: 'wt-18', text: 'Deploy to staging', completed: false },
    { id: 'wt-19', text: '', completed: false },
    { id: 'wt-20', text: '', completed: false },
  ]},
  { day: 'saturday', items: [
    { id: 'wt-21', text: 'Personal project work', completed: false },
    { id: 'wt-22', text: '', completed: false },
    { id: 'wt-23', text: '', completed: false },
    { id: 'wt-24', text: '', completed: false },
  ]},
  { day: 'sunday', items: [
    { id: 'wt-25', text: 'Weekly planning', completed: false },
    { id: 'wt-26', text: '', completed: false },
    { id: 'wt-27', text: '', completed: false },
    { id: 'wt-28', text: '', completed: false },
  ]},
  { day: 'weekly', items: [
    { id: 'wt-29', text: 'Exercise 3 times', completed: false },
    { id: 'wt-30', text: 'Read for 30 min daily', completed: false },
    { id: 'wt-31', text: '', completed: false },
    { id: 'wt-32', text: '', completed: false },
  ]},
];
