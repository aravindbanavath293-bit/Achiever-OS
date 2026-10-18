import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { streakService } from '../services/streakService';
import { goalService } from '../services/goalService';
import { scheduleService } from '../services/scheduleService';
import type { StreakData, Goal, WeeklyScheduleEntry } from '../types';
import { Flame, Target, CheckCircle2, TrendingUp, Calendar } from 'lucide-react';
import { getWeekDates } from '../utils/dateUtils';

type Period = 'this-week' | 'last-week' | 'this-month' | 'this-year';

/** Returns start/end ISO strings and an array of all dates for the selected period */
function getDateRange(period: Period): { start: string; end: string; dates: Date[] } {
  const today = new Date();
  let start: Date;
  let end: Date;

  switch (period) {
    case 'this-week': {
      const week = getWeekDates();
      start = week[0];
      end = week[6];
      break;
    }
    case 'last-week': {
      const lastMonday = new Date(today);
      const dayOfWeek = today.getDay();
      lastMonday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) - 7);
      const week = getWeekDates(lastMonday);
      start = week[0];
      end = week[6];
      break;
    }
    case 'this-month': {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      break;
    }
    case 'this-year': {
      start = new Date(today.getFullYear(), 0, 1);
      end = new Date(today.getFullYear(), 11, 31);
      break;
    }
  }

  // Build array of all dates in the range
  const dates: Date[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
    dates,
  };
}

export default function Analytics() {
  const { user } = useAuth();
  const { tasks } = useTasks();
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [goals, setGoals] = useState<(Goal & { progress: number })[]>([]);
  const [scheduleEntries, setScheduleEntries] = useState<WeeklyScheduleEntry[]>([]);
  const [period, setPeriod] = useState<Period>('this-week');

  useEffect(() => {
    const loadData = async () => {
      const s = await streakService.getData();
      setStreak(s);
      
      const g = await goalService.getGoalsWithProgress();
      setGoals(g);

      const sched = await scheduleService.getAll();
      setScheduleEntries(sched);
    };
    loadData();
  }, [user?.id]);

  const range = useMemo(() => getDateRange(period), [period]);

  // ── Filter tasks within the selected period ──
  const periodTasks = useMemo(() => {
    return tasks.filter(t => t.dueDate >= range.start && t.dueDate <= range.end);
  }, [tasks, range]);

  // ── Productivity chart: planned vs completed per day/week/month ──
  const productivityData = useMemo(() => {
    if (period === 'this-week' || period === 'last-week') {
      // Show Mon–Sun breakdown
      const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return range.dates.map((date, i) => {
        const isoDate = date.toISOString().split('T')[0];
        const dayTasks = tasks.filter(t => t.dueDate === isoDate);
        return {
          day: weekDays[i],
          planned: dayTasks.length,
          completed: dayTasks.filter(t => t.status === 'completed').length,
        };
      });
    } else if (period === 'this-month') {
      // Group by week within the month
      const weeks: { day: string; planned: number; completed: number }[] = [];
      let weekStart = 0;
      const totalDays = range.dates.length;
      let weekNum = 1;
      while (weekStart < totalDays) {
        const weekEnd = Math.min(weekStart + 7, totalDays);
        const weekDates = range.dates.slice(weekStart, weekEnd);
        const weekISOs = weekDates.map(d => d.toISOString().split('T')[0]);
        const weekTasks = tasks.filter(t => weekISOs.includes(t.dueDate));
        weeks.push({
          day: `Week ${weekNum}`,
          planned: weekTasks.length,
          completed: weekTasks.filter(t => t.status === 'completed').length,
        });
        weekStart = weekEnd;
        weekNum++;
      }
      return weeks;
    } else {
      // This year — group by month
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const year = new Date().getFullYear();
      return months.map((label, monthIdx) => {
        const monthStart = `${year}-${(monthIdx + 1).toString().padStart(2, '0')}-01`;
        const lastDay = new Date(year, monthIdx + 1, 0).getDate();
        const monthEnd = `${year}-${(monthIdx + 1).toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
        const monthTasks = tasks.filter(t => t.dueDate >= monthStart && t.dueDate <= monthEnd);
        return {
          day: label,
          planned: monthTasks.length,
          completed: monthTasks.filter(t => t.status === 'completed').length,
        };
      });
    }
  }, [tasks, range, period]);

  // ── Focus Time Distribution: aggregate scheduled hours by time-of-day ──
  const focusTimeData = useMemo(() => {
    const buckets = [
      { label: '6am', startHour: 6, endHour: 8 },
      { label: '8am', startHour: 8, endHour: 10 },
      { label: '10am', startHour: 10, endHour: 12 },
      { label: '12pm', startHour: 12, endHour: 14 },
      { label: '2pm', startHour: 14, endHour: 16 },
      { label: '4pm', startHour: 16, endHour: 18 },
      { label: '6pm', startHour: 18, endHour: 20 },
      { label: '8pm', startHour: 20, endHour: 22 },
      { label: '10pm', startHour: 22, endHour: 24 },
    ];

    // For weekly periods, filter by weekOf; for month/year, use all entries
    let relevantEntries = scheduleEntries;
    if (period === 'this-week' || period === 'last-week') {
      const weekMonday = range.start;
      relevantEntries = scheduleEntries.filter(e => e.weekOf === weekMonday);
    }

    // For averaging when showing monthly/yearly
    const numWeeks = period === 'this-year' ? 52 : period === 'this-month' ? 4 : 1;

    return buckets.map(bucket => {
      let totalHours = 0;

      for (const entry of relevantEntries) {
        const [startH, startM] = entry.startTime.split(':').map(Number);
        const [endH, endM] = entry.endTime.split(':').map(Number);
        const entryStart = startH + (startM || 0) / 60;
        const entryEnd = endH + (endM || 0) / 60;

        // Calculate overlap between this entry and this time bucket
        const overlapStart = Math.max(entryStart, bucket.startHour);
        const overlapEnd = Math.min(entryEnd, bucket.endHour);
        if (overlapEnd > overlapStart) {
          totalHours += overlapEnd - overlapStart;
        }
      }

      return {
        time: bucket.label,
        hours: Math.round((totalHours / numWeeks) * 10) / 10,
      };
    });
  }, [scheduleEntries, period, range]);

  // ── KPI stats for the selected period ──
  const totalCompletedPeriod = periodTasks.filter(t => t.status === 'completed').length;
  const completionRate = periodTasks.length > 0 ? Math.round((totalCompletedPeriod / periodTasks.length) * 100) : 0;
  
  const achievedGoals = goals.filter(g => g.status === 'achieved').length;
  const activeGoals = goals.filter(g => g.status === 'in-progress').length;

  // Dynamic chart title based on period
  const chartTitle = period === 'this-year' ? 'Monthly Productivity' : period === 'this-month' ? 'Weekly Productivity' : 'Daily Productivity';

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-display font-bold text-on-surface">Analytics</h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Track your productivity trends and consistency.
          </p>
        </div>
        
        <select 
          value={period}
          onChange={e => setPeriod(e.target.value as Period)}
          className="px-4 py-2 bg-surface-container rounded-lg border-none outline-none focus:ring-2 focus:ring-primary font-medium text-sm text-on-surface w-full md:w-auto"
        >
          <option value="this-week">This Week</option>
          <option value="last-week">Last Week</option>
          <option value="this-month">This Month</option>
          <option value="this-year">This Year</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-error-container text-error flex items-center justify-center shrink-0">
            <Flame size={24} />
          </div>
          <div>
            <p className="text-on-surface-variant text-sm font-medium">Current Streak</p>
            <p className="text-2xl font-extrabold text-on-surface">{streak?.currentStreak || 0} <span className="text-sm font-normal">days</span></p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-on-surface-variant text-sm font-medium">Tasks Completed</p>
            <p className="text-2xl font-extrabold text-on-surface">{totalCompletedPeriod}</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-tertiary-container text-tertiary flex items-center justify-center shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-on-surface-variant text-sm font-medium">Completion Rate</p>
            <p className="text-2xl font-extrabold text-on-surface">{completionRate}%</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-secondary-container text-secondary flex items-center justify-center shrink-0">
            <Target size={24} />
          </div>
          <div>
            <p className="text-on-surface-variant text-sm font-medium">Active Goals</p>
            <p className="text-2xl font-extrabold text-on-surface">{activeGoals}</p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Productivity Chart */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col">
          <h2 className="text-title-task font-bold text-on-surface mb-6">{chartTitle}</h2>
          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-outline-variant)" opacity={0.5} />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 12 }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 12 }} 
                  allowDecimals={false}
                />
                <Tooltip 
                  cursor={{ fill: 'var(--color-surface-container-low)' }}
                  contentStyle={{ 
                    backgroundColor: 'var(--color-surface-container-highest)', 
                    border: 'none',
                    borderRadius: '8px',
                    color: 'var(--color-on-surface)',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="planned" fill="var(--color-surface-variant)" radius={[4, 4, 4, 4]} />
                <Bar dataKey="completed" fill="var(--color-primary)" radius={[4, 4, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
              <div className="w-3 h-3 rounded-full bg-surface-variant" /> Planned
            </div>
            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
              <div className="w-3 h-3 rounded-full bg-primary" /> Completed
            </div>
          </div>
        </div>

        {/* Focus Time Distribution Area Chart */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col">
          <h2 className="text-title-task font-bold text-on-surface mb-6">Focus Time Distribution</h2>
          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={focusTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-tertiary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-tertiary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-outline-variant)" opacity={0.5} />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 12 }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 12 }} 
                  unit="h"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-surface-container-highest)', 
                    border: 'none',
                    borderRadius: '8px',
                    color: 'var(--color-on-surface)',
                  }}
                  formatter={((value: number) => [`${value}h`, 'Focus Time']) as never}
                />
                <Area type="monotone" dataKey="hours" stroke="var(--color-tertiary)" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
      
      {/* Goals Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-1 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm">
          <h2 className="text-title-task font-bold text-on-surface mb-6">Goals Overview</h2>
          
          <div className="flex items-center justify-between mb-4">
            <div className="w-1/2 text-center border-r border-outline-variant">
              <p className="text-3xl font-extrabold text-on-surface">{activeGoals}</p>
              <p className="text-sm font-medium text-on-surface-variant mt-1">In Progress</p>
            </div>
            <div className="w-1/2 text-center">
              <p className="text-3xl font-extrabold text-primary">{achievedGoals}</p>
              <p className="text-sm font-medium text-on-surface-variant mt-1">Achieved</p>
            </div>
          </div>
          
          <div className="space-y-4 mt-6">
            {goals.slice(0, 3).map(goal => (
              <div key={goal.id}>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span className="text-on-surface truncate pr-2">{goal.title}</span>
                  <span className="text-on-surface-variant shrink-0">{goal.progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${goal.status === 'achieved' ? 'bg-primary' : 'bg-primary/70'}`}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-2 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col justify-center items-center text-center">
          <Calendar size={48} className="text-outline-variant mb-4" />
          <h3 className="text-lg font-bold text-on-surface mb-2">More Analytics Coming Soon</h3>
          <p className="text-on-surface-variant max-w-sm">
            We are working on detailed task category breakdowns, habit tracking correlations, and AI productivity insights.
          </p>
        </div>

      </div>

    </div>
  );
}
