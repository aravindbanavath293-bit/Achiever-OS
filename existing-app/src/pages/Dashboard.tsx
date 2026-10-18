import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { getGreeting, getTodayISO, formatDate } from '../utils/dateUtils';
import { Clock, Flame, Calendar as CalendarIcon, Target, ChevronRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Task, WeeklyScheduleEntry, Goal, StreakData } from '../types';
import { scheduleService } from '../services/scheduleService';
import { goalService } from '../services/goalService';
import { streakService } from '../services/streakService';
import { PRIORITY_COLORS } from '../types';

export default function Dashboard() {
  const { user } = useAuth();
  const { tasks, toggleComplete, isLoading: isTasksLoading } = useTasks();
  
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [schedule, setSchedule] = useState<WeeklyScheduleEntry[]>([]);
  const [goals, setGoals] = useState<(Goal & { progress: number })[]>([]);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [upcoming, setUpcoming] = useState<Task[]>([]);
  
  const today = getTodayISO();
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
  const currentDay = daysOfWeek[new Date().getDay()];

  useEffect(() => {
    if (isTasksLoading) return;
    
    // Compute today's tasks
    const todays = tasks.filter(t => t.dueDate === today);
    // Sort by priority (high, medium, low), then completion status
    todays.sort((a, b) => {
      if (a.status !== b.status) return a.status === 'completed' ? 1 : -1;
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    });
    setTodayTasks(todays);
    
    // Upcoming deadlines (next 7 days, excluding today)
    const upcomingTasks = tasks
      .filter(t => t.status === 'pending' && t.dueDate > today)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3);
    setUpcoming(upcomingTasks);

  }, [tasks, isTasksLoading, today]);

  useEffect(() => {
    // Load other async data
    const loadData = async () => {
      const sched = await scheduleService.getByDay(currentDay);
      setSchedule(sched);
      
      const goalsData = await goalService.getGoalsWithProgress();
      setGoals(goalsData.filter(g => g.status === 'in-progress').slice(0, 2));
      
      const streakData = await streakService.getData();
      setStreak(streakData);
    };
    loadData();
  }, [currentDay, user?.id]);

  const completedCount = todayTasks.filter(t => t.status === 'completed').length;
  const totalCount = todayTasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  // SVG Ring calculations
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <p className="text-label-caps text-outline tracking-wider font-bold mb-1 uppercase">
            {formatDate(new Date())}
          </p>
          <h1 className="text-display font-bold text-on-surface mb-2">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="text-body-md text-on-surface-variant flex items-center gap-2">
            You have <strong className="text-on-surface">{totalCount} tasks</strong> planned for today
            <span className="text-outline mx-1">•</span>
            {completedCount} completed
            <span className="text-outline mx-1">•</span>
            {totalCount - completedCount} remaining
          </p>
        </div>
        
        <div className="bg-surface-container rounded-2xl p-4 flex items-center gap-4 shrink-0 shadow-sm border border-outline-variant/30">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 70 70">
              <circle cx="35" cy="35" r={radius} className="stroke-surface-container-highest fill-none" strokeWidth="4" />
              <circle 
                cx="35" 
                cy="35" 
                r={radius} 
                className="stroke-primary fill-none transition-all duration-1000 ease-out" 
                strokeWidth="4" 
                strokeDasharray={circumference} 
                strokeDashoffset={strokeDashoffset} 
                strokeLinecap="round" 
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-bold text-sm text-primary">
              {progressPercent}%
            </div>
          </div>
          <div>
            <p className="font-bold text-on-surface">Daily Progress</p>
            <p className="text-sm text-on-surface-variant">Keep it up!</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Main Column (8 cols) */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* Today's Focus */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
                <Target size={22} className="text-primary" />
                Today's Focus
              </h2>
              <Link to="/tasks" className="text-sm font-medium text-primary hover:underline">View All</Link>
            </div>
            
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
              {todayTasks.length === 0 ? (
                <div className="p-8 text-center text-on-surface-variant">
                  <p>No tasks planned for today.</p>
                  <button className="mt-4 text-primary font-medium hover:underline">Add a task</button>
                </div>
              ) : (
                <div className="divide-y divide-outline-variant/50">
                  {todayTasks.map(task => (
                    <div 
                      key={task.id} 
                      className={`p-4 flex items-start gap-4 transition-all group ${
                        task.status === 'completed' ? 'bg-surface-container-low/50' : 'hover:bg-surface-container-low'
                      }`}
                    >
                      <button 
                        onClick={() => toggleComplete(task.id)}
                        className={`shrink-0 mt-0.5 rounded transition-colors cursor-pointer flex items-center justify-center w-5 h-5 border ${
                          task.status === 'completed' 
                            ? 'bg-primary border-primary text-on-primary' 
                            : 'border-outline hover:border-primary text-transparent'
                        }`}
                      >
                        <Check size={14} strokeWidth={3} className={task.status === 'completed' ? 'opacity-100' : 'opacity-0'} />
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <p className={`text-[15px] font-medium leading-tight mb-1 truncate transition-all ${
                          task.status === 'completed' ? 'text-on-surface-variant line-through' : 'text-on-surface'
                        }`}>
                          {task.title}
                        </p>
                        
                        <div className="flex items-center gap-3 text-xs">
                          {task.scheduledTime && (
                            <span className="flex items-center gap-1 text-on-surface-variant">
                              <Clock size={12} /> {task.scheduledTime}
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded-sm font-medium ${PRIORITY_COLORS[task.priority].bg} ${PRIORITY_COLORS[task.priority].text}`}>
                            {task.priority}
                          </span>
                          <span className="px-2 py-0.5 rounded-sm bg-surface-container font-medium text-on-surface-variant">
                            {task.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Today's Schedule */}
          <section>
            <h2 className="text-headline-md font-bold text-on-surface flex items-center gap-2 mb-4">
              <CalendarIcon size={22} className="text-primary" />
              Today's Schedule
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {schedule.length === 0 ? (
                <div className="col-span-full p-6 text-center text-on-surface-variant bg-surface-container-lowest border border-outline-variant rounded-2xl border-dashed">
                  No schedule blocks for today.
                </div>
              ) : (
                schedule.slice(0, 3).map(entry => (
                  <div key={entry.id} className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm border-l-4 border-l-primary">
                    <p className="font-bold text-on-surface truncate">{entry.activity}</p>
                    <p className="text-sm text-on-surface-variant flex items-center gap-1 mt-1">
                      <Clock size={12} /> {entry.startTime} - {entry.endTime}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>

        {/* Side Column (4 cols) */}
        <div className="xl:col-span-4 space-y-8">
          
          {/* Consistency Corner */}
          <section>
            <h2 className="text-title-task font-bold text-on-surface mb-3 flex items-center gap-2">
              <Flame size={18} className="text-error" />
              Consistency
            </h2>
            <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-error-container text-error flex items-center justify-center shrink-0">
                <Flame size={28} />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-on-surface tracking-tight">
                  {streak?.currentStreak || 0} <span className="text-sm font-normal text-on-surface-variant">days</span>
                </p>
                <p className="text-sm text-on-surface-variant mt-0.5">
                  Longest: <span className="font-medium text-on-surface">{streak?.longestStreak || 0} days</span>
                </p>
              </div>
            </div>
          </section>

          {/* Active Goals */}
          <section>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-title-task font-bold text-on-surface">Active Goals</h2>
              <Link to="/goals" className="text-xs font-medium text-primary hover:underline flex items-center">
                All <ChevronRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {goals.length === 0 ? (
                <div className="p-4 text-center text-sm text-on-surface-variant bg-surface-container-lowest border border-outline-variant rounded-xl border-dashed">
                  No active goals.
                </div>
              ) : (
                goals.map(goal => (
                  <div key={goal.id} className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm">
                    <p className="font-bold text-sm text-on-surface truncate mb-3">{goal.title}</p>
                    <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                      <span className="text-on-surface-variant">Progress</span>
                      <span className="text-primary">{goal.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-1000"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Upcoming Deadlines */}
          <section>
            <h2 className="text-title-task font-bold text-on-surface mb-3">Upcoming Deadlines</h2>
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-4 space-y-4">
              {upcoming.length === 0 ? (
                <div className="text-center text-sm text-on-surface-variant py-2">
                  No upcoming deadlines.
                </div>
              ) : (
                upcoming.map(task => (
                  <div key={task.id} className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded bg-error-container text-on-error-container flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold uppercase leading-none">{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short' })}</span>
                      <span className="text-sm font-bold leading-none mt-0.5">{new Date(task.dueDate).getDate()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-on-surface truncate">{task.title}</p>
                      <p className="text-xs text-on-surface-variant">{task.category}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
