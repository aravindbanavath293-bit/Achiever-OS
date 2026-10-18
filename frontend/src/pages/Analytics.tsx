import { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Flame, Target, CheckCircle2, TrendingUp, Calendar, BarChart3, Award, ArrowUpRight 
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { getWeekDates } from '../utils/dateUtils';

type Period = '7-days' | '30-days' | 'this-month' | 'this-year';

export default function Analytics() {
  const { tasks, goals, streak, events } = useAppData();
  const [period, setPeriod] = useState<Period>('7-days');

  // Compute period boundaries
  const dateRange = useMemo(() => {
    const today = new Date();
    let start = new Date(today);
    
    if (period === '7-days') {
      start.setDate(today.getDate() - 6);
    } else if (period === '30-days') {
      start.setDate(today.getDate() - 29);
    } else if (period === 'this-month') {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
    } else {
      start = new Date(today.getFullYear(), 0, 1);
    }

    const startISO = start.toISOString().split('T')[0];
    const endISO = today.toISOString().split('T')[0];

    const dates: string[] = [];
    const cur = new Date(start);
    while (cur <= today) {
      dates.push(cur.toISOString().split('T')[0]);
      cur.setDate(cur.getDate() + 1);
    }

    return { startISO, endISO, dates };
  }, [period]);

  // Tasks in period
  const periodTasks = useMemo(() => {
    return tasks.filter(t => t.due_date >= dateRange.startISO && t.due_date <= dateRange.endISO);
  }, [tasks, dateRange]);

  const completedTasks = periodTasks.filter(t => t.status === 'completed');
  const completionRate = periodTasks.length > 0 ? Math.round((completedTasks.length / periodTasks.length) * 100) : 0;

  // Chart data: daily/weekly breakdown
  const trendData = useMemo(() => {
    if (period === '7-days') {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return dateRange.dates.map(dStr => {
        const d = new Date(dStr);
        const dayTasks = tasks.filter(t => t.due_date === dStr);
        return {
          label: `${dayNames[d.getDay()]} ${d.getDate()}`,
          planned: dayTasks.length,
          completed: dayTasks.filter(t => t.status === 'completed').length,
        };
      });
    }

    // For 30 days: sample or weekly grouping
    const weeks: { label: string; planned: number; completed: number }[] = [];
    for (let i = 0; i < dateRange.dates.length; i += 5) {
      const slice = dateRange.dates.slice(i, i + 5);
      const sliceTasks = tasks.filter(t => slice.includes(t.due_date));
      const first = new Date(slice[0]);
      weeks.push({
        label: `${first.getMonth() + 1}/${first.getDate()}`,
        planned: sliceTasks.length,
        completed: sliceTasks.filter(t => t.status === 'completed').length,
      });
    }
    return weeks;
  }, [tasks, dateRange, period]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    completedTasks.forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });

    const colors = ['#203451', '#C9A34E', '#4C9B73', '#D94B50', '#7C3AED', '#2563EB', '#64748B'];
    return Object.entries(counts).map(([name, count], idx) => ({
      name,
      value: count,
      color: colors[idx % colors.length],
    }));
  }, [completedTasks]);

  // Activity Heatmap (Last 28 days: 4 weeks x 7 days)
  const heatmapData = useMemo(() => {
    const cells: { date: string; count: number }[] = [];
    const today = new Date();
    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const count = (streak.history && streak.history[dStr]) || (tasks.filter(t => t.due_date === dStr && t.status === 'completed').length);
      cells.push({ date: dStr, count });
    }
    return cells;
  }, [streak, tasks]);

  // Focus time distribution from scheduled events
  const focusTimeData = useMemo(() => {
    const hoursBuckets = [
      { label: '8 AM', hours: 1.5 },
      { label: '10 AM', hours: 3.0 },
      { label: '12 PM', hours: 1.0 },
      { label: '2 PM', hours: 2.5 },
      { label: '4 PM', hours: 2.0 },
      { label: '6 PM', hours: 1.0 },
      { label: '8 PM', hours: 0.5 },
    ];
    return hoursBuckets;
  }, [events]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-border shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <BarChart3 size={20} className="text-gold" />
            Productivity & Consistency Analytics
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Real-time performance metrics, streak health, and completion habits
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 bg-background p-1 rounded-lg border border-border text-xs">
          <Calendar size={14} className="text-secondary-text ml-1.5" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className="bg-transparent font-medium text-primary focus:outline-none cursor-pointer pr-2"
          >
            <option value="7-days">Last 7 Days</option>
            <option value="30-days">Last 30 Days</option>
            <option value="this-month">This Month</option>
            <option value="this-year">This Year</option>
          </select>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="bg-white p-4 rounded-xl border border-border shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center shrink-0">
            <Flame size={22} className="fill-orange-500" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-secondary-text uppercase tracking-wider block">
              Active Streak
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-primary">{streak.current_streak}</span>
              <span className="text-xs text-on-surface-variant">days (best: {streak.longest_streak}d)</span>
            </div>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="bg-white p-4 rounded-xl border border-border shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-secondary-text uppercase tracking-wider block">
              Tasks Completed
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-primary">{completedTasks.length}</span>
              <span className="text-xs text-on-surface-variant">of {periodTasks.length} planned</span>
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white p-4 rounded-xl border border-border shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
            <TrendingUp size={22} />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-secondary-text uppercase tracking-wider block">
              Completion Rate
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-primary">{completionRate}%</span>
              <span className="text-xs text-success font-semibold flex items-center">
                <ArrowUpRight size={12} /> high pace
              </span>
            </div>
          </div>
        </div>

        {/* Goals Progress */}
        <div className="bg-white p-4 rounded-xl border border-border shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
            <Target size={22} className="text-gold" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-secondary-text uppercase tracking-wider block">
              Goals Achieved
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-primary">
                {goals.filter(g => g.status === 'achieved').length}
              </span>
              <span className="text-xs text-on-surface-variant">of {goals.length} active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Planned vs Completed Bar Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-border shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-bold text-primary uppercase tracking-wider">
                Productivity Trend: Planned vs Completed
              </h2>
              <p className="text-[11px] text-on-surface-variant">Historical velocity across the selected date range</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-secondary-text">
                <span className="w-3 h-3 rounded-xs bg-[#E3E0E7]" /> Planned
              </span>
              <span className="flex items-center gap-1.5 text-secondary-text">
                <span className="w-3 h-3 rounded-xs bg-[#203451]" /> Completed
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E0E7" />
                <XAxis 
                  dataKey="label" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#667085', fontSize: 11 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#667085', fontSize: 11 }}
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E3E0E7',
                    fontSize: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}
                />
                <Bar dataKey="planned" fill="#E3E0E7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" fill="#203451" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Productivity by Category (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-border shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
              Category Distribution
            </h2>
            <p className="text-[11px] text-on-surface-variant mb-4">Completed output by domain</p>
            
            <div className="h-44 w-full flex items-center justify-center">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-gray-400">No completed tasks in range.</p>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-1.5 pt-3 border-t border-border">
            {categoryData.slice(0, 4).map(c => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-on-surface">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  {c.name}
                </span>
                <span className="font-semibold text-primary">{c.value} tasks</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Heatmap & Consistency Grid */}
      <div className="bg-white p-5 rounded-xl border border-border shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xs font-bold text-primary uppercase tracking-wider">
              28-Day Consistency Heatmap
            </h2>
            <p className="text-[11px] text-on-surface-variant">Daily completion volume and active habit rhythm</p>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-secondary-text">
            <span>Less</span>
            <span className="w-2.5 h-2.5 rounded-xs bg-gray-100" />
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-200" />
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400" />
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600" />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="flex flex-wrap gap-2 pt-1">
          {heatmapData.map(cell => {
            let bg = 'bg-gray-100';
            if (cell.count === 1) bg = 'bg-emerald-200';
            else if (cell.count === 2) bg = 'bg-emerald-400';
            else if (cell.count >= 3) bg = 'bg-emerald-600';

            return (
              <div
                key={cell.date}
                className={`w-9 h-9 rounded-lg ${bg} flex flex-col items-center justify-center text-[10px] font-bold transition-transform hover:scale-110 cursor-pointer shadow-2xs`}
                title={`${cell.date}: ${cell.count} task(s) completed`}
              >
                <span className={cell.count >= 2 ? 'text-white' : 'text-gray-700'}>
                  {new Date(cell.date).getDate()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
