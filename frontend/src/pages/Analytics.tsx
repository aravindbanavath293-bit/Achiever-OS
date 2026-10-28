import { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Flame, Target, CheckCircle2, TrendingUp, BarChart3, PieChart as PieIcon, CalendarDays, Gauge, AlertTriangle, Flag, CalendarClock,
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useTheme } from '../context/ThemeContext';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { BentoGrid, BentoCard, BentoCardHeader, MetricCard } from '../components/bento/Bento';
import { getTodayISO } from '../utils/dateUtils';

type Period = '7-days' | '30-days' | 'this-month' | 'this-year';

const PERIODS: { key: Period; label: string; short: string }[] = [
  { key: '7-days', label: 'Last 7 days', short: '7D' },
  { key: '30-days', label: 'Last 30 days', short: '30D' },
  { key: 'this-month', label: 'This month', short: 'Month' },
  { key: 'this-year', label: 'This year', short: 'Year' },
];

export default function Analytics() {
  const { tasks, goals, streak } = useAppData();
  const { theme } = useTheme();
  const reducedMotion = usePrefersReducedMotion();
  const [period, setPeriod] = useState<Period>('7-days');

  const isDark = theme === 'dark';
  const chart = {
    grid: isDark ? '#252A36' : '#F1F3F8',
    tick: isDark ? '#94A0B4' : '#647084',
    planned: isDark ? '#3B1D5E' : '#EAE2F6',   // Lavender / Soft Lilac & Deep Plum
    completed: isDark ? '#D99280' : '#A85B49', // Rose Gold / Copper
    tooltipBg: isDark ? '#151821' : '#FFFFFF',
    tooltipBorder: isDark ? '#252A36' : '#E2E6EE',
    tooltipText: isDark ? '#F8F9FC' : '#17191F',
  };
  const tooltipStyle = {
    backgroundColor: chart.tooltipBg,
    borderRadius: '12px',
    border: `1px solid ${chart.tooltipBorder}`,
    color: chart.tooltipText,
    fontSize: '12px',
    boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15)',
    fontWeight: 600,
  };

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

  // Category breakdown (luxury palette)
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    completedTasks.forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });

    const colors = ['#A85B49', '#5E359E', '#C29526', '#1D4ED8', '#E11D48', '#8E4939', '#7C52BE', '#1E40AF'];
    return Object.entries(counts).map(([name, count], idx) => ({
      name,
      value: count,
      color: colors[idx % colors.length],
    }));
  }, [completedTasks]);

  // Activity Heatmap (Last 28 days)
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

  // Open workload snapshot (real counts from current tasks)
  const workload = useMemo(() => {
    const todayISO = getTodayISO();
    const in7 = new Date();
    in7.setDate(in7.getDate() + 7);
    const in7ISO = in7.toISOString().split('T')[0];
    const open = tasks.filter(t => t.status !== 'completed');
    return {
      open: open.length,
      overdue: open.filter(t => t.due_date < todayISO).length,
      next7: open.filter(t => t.due_date >= todayISO && t.due_date <= in7ISO).length,
      highPriority: open.filter(t => t.priority === 'high' || t.priority === 'urgent').length,
    };
  }, [tasks]);

  const achievedGoals = goals.filter(g => g.status === 'achieved').length;
  const activeDays = heatmapData.filter(c => c.count > 0).length;
  const periodLabel = PERIODS.find(p => p.key === period)?.label ?? '';

  return (
    <div className="space-y-5 animate-fade-in">
      <BentoGrid>
        {/* Header with period filter */}
        <BentoCard span="full" variant="feature" className="sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold flex items-center gap-2.5 tracking-tight">
              <BarChart3 size={22} className="text-indigo-600" aria-hidden />
              Productivity analytics
            </h1>
            <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">
              Completion trends, streak consistency and focus by category
            </p>
          </div>

          <div className="bento-segmented self-start sm:self-auto overflow-x-auto max-w-full" role="group" aria-label="Reporting period">
            {PERIODS.map(p => (
              <button
                key={p.key}
                type="button"
                aria-pressed={period === p.key}
                onClick={() => setPeriod(p.key)}
                className="whitespace-nowrap"
              >
                <span className="hidden sm:inline">{p.label}</span>
                <span className="sm:hidden">{p.short}</span>
              </button>
            ))}
          </div>
        </BentoCard>

        {/* KPI tiles */}
        <MetricCard
          label="Active streak"
          value={<>{streak.current_streak}<span className="text-base font-semibold text-slate-500 ml-1">days</span></>}
          hint={`Best: ${streak.longest_streak} days`}
          icon={Flame}
          tone="amber"
        />
        <MetricCard
          label="Tasks completed"
          value={completedTasks.length}
          valueClassName="text-blue-700"
          hint={`of ${periodTasks.length} planned · ${periodLabel.toLowerCase()}`}
          icon={CheckCircle2}
          tone="cyan"
        />
        <MetricCard
          label="Completion rate"
          value={`${completionRate}%`}
          valueClassName="text-indigo-600"
          hint={periodTasks.length === 0 ? 'No tasks planned in range' : completionRate >= 70 ? 'Strong pace' : 'Room to improve'}
          icon={TrendingUp}
          tone="indigo"
        />
        <MetricCard
          label="Goals achieved"
          value={achievedGoals}
          valueClassName="text-violet-600"
          hint={`of ${goals.length} total`}
          icon={Target}
          tone="violet"
        />

        {/* Planned vs Completed */}
        <BentoCard span="two-thirds" aria-labelledby="an-velocity">
          <BentoCardHeader
            id="an-velocity"
            title="Planned vs completed"
            subtitle={periodLabel}
            icon={BarChart3}
            right={
              <div className="hidden sm:flex items-center gap-3.5 text-xs font-semibold text-slate-600" aria-hidden>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: chart.planned }} /> Planned</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: chart.completed }} /> Completed</span>
              </div>
            }
          />
          <div className="h-64 w-full" role="img" aria-label={`Bar chart of planned versus completed tasks, ${periodLabel.toLowerCase()}. ${completedTasks.length} of ${periodTasks.length} completed.`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 6, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chart.grid} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: chart.tick, fontSize: 11, fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: chart.tick, fontSize: 11, fontWeight: 600 }} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.06)' }} />
                <Bar dataKey="planned" name="Planned" fill={chart.planned} radius={[6, 6, 0, 0]} isAnimationActive={!reducedMotion} animationDuration={600} />
                <Bar dataKey="completed" name="Completed" fill={chart.completed} radius={[6, 6, 0, 0]} isAnimationActive={!reducedMotion} animationDuration={600} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </BentoCard>

        {/* Category distribution */}
        <BentoCard span="third" aria-labelledby="an-category">
          <BentoCardHeader id="an-category" title="By category" subtitle="Completed tasks" icon={PieIcon} tone="violet" />
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
                    innerRadius={46}
                    outerRadius={72}
                    paddingAngle={4}
                    stroke="none"
                    isAnimationActive={!reducedMotion}
                    animationDuration={600}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="bento-empty w-full h-full"><p>No completed tasks in this range</p></div>
            )}
          </div>

          {categoryData.length > 0 && (
            <ul className="space-y-2 pt-3 mt-3 border-t border-slate-100">
              {categoryData.slice(0, 5).map(c => (
                <li key={c.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-medium text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} aria-hidden />
                    {c.name}
                  </span>
                  <span className="font-bold text-slate-900 tabular-nums">{c.value} task{c.value === 1 ? '' : 's'}</span>
                </li>
              ))}
            </ul>
          )}
        </BentoCard>

        {/* 28-day heatmap */}
        <BentoCard span="two-thirds" aria-labelledby="an-heatmap">
          <BentoCardHeader
            id="an-heatmap"
            title="28-day consistency"
            subtitle={`${activeDays} active day${activeDays === 1 ? '' : 's'} in the last 4 weeks`}
            icon={CalendarDays}
            tone="indigo"
            right={
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold" aria-hidden>
                <span>Less</span>
                <span className="w-3 h-3 rounded bg-slate-100" />
                <span className="w-3 h-3 rounded bg-indigo-100" />
                <span className="w-3 h-3 rounded bg-indigo-400" />
                <span className="w-3 h-3 rounded bg-indigo-600" />
                <span>More</span>
              </div>
            }
          />
          <ol className="grid grid-cols-7 gap-1.5 sm:gap-2" aria-label="Daily completions, last 28 days">
            {heatmapData.map(cell => {
              let bg = 'bg-slate-100 text-slate-500';
              if (cell.count === 1) bg = 'bg-indigo-100 text-indigo-900';
              else if (cell.count === 2) bg = 'bg-indigo-400 text-white';
              else if (cell.count >= 3) bg = 'bg-indigo-600 text-white';
              const label = `${cell.date}: ${cell.count} task${cell.count === 1 ? '' : 's'} completed`;
              return (
                <li
                  key={cell.date}
                  className={`aspect-square sm:aspect-auto sm:h-10 rounded-lg ${bg} flex items-center justify-center text-[11px] font-bold`}
                  title={label}
                  aria-label={label}
                >
                  {new Date(cell.date).getDate()}
                </li>
              );
            })}
          </ol>
        </BentoCard>

        {/* Open workload status */}
        <BentoCard span="third" variant="muted" aria-labelledby="an-workload">
          <BentoCardHeader id="an-workload" title="Open workload" subtitle={`${workload.open} open task${workload.open === 1 ? '' : 's'}`} icon={Gauge} tone="slate" />
          <ul className="space-y-2.5">
            <li className="bento-row">
              <span className="bento-card__icon w-8 h-8 bg-rose-50 text-rose-600"><AlertTriangle size={15} aria-hidden /></span>
              <span className="flex-1 text-xs font-semibold text-slate-700">Overdue</span>
              <span className={`text-lg font-extrabold tabular-nums ${workload.overdue > 0 ? 'text-rose-600' : 'text-slate-900'}`}>{workload.overdue}</span>
            </li>
            <li className="bento-row">
              <span className="bento-card__icon w-8 h-8 bg-indigo-50 text-indigo-600"><CalendarClock size={15} aria-hidden /></span>
              <span className="flex-1 text-xs font-semibold text-slate-700">Due in next 7 days</span>
              <span className="text-lg font-extrabold tabular-nums text-slate-900">{workload.next7}</span>
            </li>
            <li className="bento-row">
              <span className="bento-card__icon w-8 h-8 bg-amber-50 text-amber-600"><Flag size={15} aria-hidden /></span>
              <span className="flex-1 text-xs font-semibold text-slate-700">High / urgent priority</span>
              <span className="text-lg font-extrabold tabular-nums text-slate-900">{workload.highPriority}</span>
            </li>
          </ul>
        </BentoCard>
      </BentoGrid>
    </div>
  );
}
