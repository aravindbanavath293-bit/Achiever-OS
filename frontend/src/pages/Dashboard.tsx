import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, Plus, Flame, CheckCircle2, Calendar, Target, Check, AlertTriangle,
  ListTodo, CalendarClock, StickyNote as StickyNoteIcon, Sparkles, CalendarRange,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { getGreeting, formatTime, isTaskToday, getRelativeDateLabel, isOverdue } from '../utils/dateUtils';
import { PRIORITY_CONFIG, CATEGORY_COLORS } from '../types';
import { format } from 'date-fns';
import { eventCardStyle } from '../utils/colors';
import { BentoGrid, BentoCard, BentoCardHeader, MetricCard, BentoProgress } from '../components/bento/Bento';
import TaskModal from '../components/shared/TaskModal';

export default function Dashboard() {
  const { user } = useAuth();
  const { tasks, goals, notes, events, streak, toggleTask, addTask } = useAppData();
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  const todayTasks = useMemo(() => tasks.filter(t => isTaskToday(t.due_date)), [tasks]);
  const completedToday = todayTasks.filter(t => t.status === 'completed').length;
  const remainingToday = todayTasks.length - completedToday;
  const progressPct = todayTasks.length > 0 ? Math.round((completedToday / todayTasks.length) * 100) : 0;

  const overdueCount = useMemo(
    () => tasks.filter(t => t.status !== 'completed' && isOverdue(t.due_date)).length,
    [tasks],
  );

  const todayFocusTasks = useMemo(() => {
    const pending = todayTasks.filter(t => t.status !== 'completed')
      .sort((a, b) => {
        const po = { urgent: 0, high: 1, medium: 2, low: 3 };
        return (po[a.priority] ?? 3) - (po[b.priority] ?? 3);
      });
    const done = todayTasks.filter(t => t.status === 'completed').slice(0, 2);
    return [...pending, ...done].slice(0, 6);
  }, [todayTasks]);

  const inProgressGoals = useMemo(() => goals.filter(g => g.status === 'in-progress'), [goals]);
  const activeGoals = inProgressGoals.slice(0, 3);

  const upcomingDeadlines = useMemo(() => {
    return tasks
      .filter(t => t.status !== 'completed' && t.due_date >= todayStr)
      .sort((a, b) => a.due_date.localeCompare(b.due_date))
      .slice(0, 4);
  }, [tasks, todayStr]);

  const todayEvents = useMemo(() => {
    const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][today.getDay()];
    return events.filter(e => e.day === dayName).sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [events, todayStr]);

  // Only the user's real notes — pinned first.
  const displayNotes = useMemo(
    () => [...notes].sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned)).slice(0, 5),
    [notes],
  );

  function getGoalProgress(goal: typeof goals[0]): number {
    if (goal.milestones.length === 0) return 0;
    return Math.round((goal.milestones.filter(m => m.completed).length / goal.milestones.length) * 100);
  }

  const noteStyles: Record<string, { bg: string; border: string; tape: string; text: string }> = {
    yellow: { bg: '#FCF8EC', border: '#EAD69B', tape: 'rgba(212, 175, 55, 0.50)', text: '#5C4412' }, // Light Gold
    blue:   { bg: '#EFF4FF', border: '#BFD3FE', tape: 'rgba(37, 99, 235, 0.45)',  text: '#1E3A8A' }, // Sapphire Blue
    pink:   { bg: '#FBF3F1', border: '#E8C6BD', tape: 'rgba(184, 107, 88, 0.50)', text: '#6E3224' }, // Rose Gold
    orange: { bg: '#FDF5EE', border: '#EED2B8', tape: 'rgba(194, 118, 72, 0.48)', text: '#743D1B' }, // Warm Copper
    green:  { bg: '#F8F9FC', border: '#DCE1EC', tape: 'rgba(100, 112, 132, 0.38)', text: '#232730' }, // Diamond White / Gunmetal
    purple: { bg: '#F4F0FA', border: '#D6C7EE', tape: 'rgba(94, 53, 158, 0.48)',  text: '#3B1D5E' }, // Soft Lilac / Plum
  };

  const progressLabel =
    todayTasks.length === 0 ? 'Nothing scheduled yet'
      : progressPct === 100 ? 'All done for today'
      : progressPct >= 50 ? 'On track'
      : progressPct > 0 ? 'In progress'
      : 'Ready to start';

  // Ring geometry
  const R = 42;
  const C = 2 * Math.PI * R;

  return (
    <div className="space-y-5 animate-fade-in">
      <BentoGrid>
        {/* ── Hero / Feature card ── */}
        <BentoCard span="two-thirds" variant="feature" className="justify-between gap-6" aria-labelledby="dash-greeting">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-200/80 text-violet-700 text-[11px] font-bold uppercase tracking-wider mb-3">
              <Calendar size={12} className="text-indigo-600" aria-hidden />
              <time dateTime={todayStr}>{format(today, 'EEEE, MMMM d, yyyy')}</time>
            </div>
            <h1 id="dash-greeting" className="text-2xl md:text-[32px] md:leading-10 font-extrabold tracking-tight text-slate-900">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-sm text-slate-600 mt-2 max-w-xl">
              {todayTasks.length === 0
                ? 'No tasks are due today. Add one or plan your time blocks to get started.'
                : <>You have <strong className="text-slate-900">{todayTasks.length} task{todayTasks.length === 1 ? '' : 's'}</strong> due today — <span className="text-blue-700 font-semibold">{completedToday} completed</span>, <span className="text-amber-700 font-semibold">{remainingToday} remaining</span>.</>}
            </p>
          </div>

          {/* Primary actions */}
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => setTaskModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary hover:gradient-primary-hover text-white text-sm font-bold shadow-sm shadow-indigo-500/25 transition-shadow hover:shadow-md cursor-pointer"
            >
              <Plus size={16} className="text-amber-100" aria-hidden /> New task
            </button>
            <Link
              to="/daily-planner"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-indigo-700 hover:border-indigo-200 text-sm font-semibold transition-colors"
            >
              <CalendarClock size={16} className="text-indigo-600" aria-hidden /> Plan my day
            </Link>
            <Link
              to="/ai-assistant"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-50/70 border border-violet-200/80 text-violet-700 hover:bg-violet-100 text-sm font-semibold transition-colors"
            >
              <Sparkles size={16} className="text-amber-500" aria-hidden /> Ask AI
            </Link>
          </div>
        </BentoCard>

        {/* ── Daily progress (status / accent card) ── */}
        <BentoCard span="third" variant="accent" className="items-center justify-center text-center gap-3" aria-label="Daily progress">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-100">Daily progress</p>
          <div className="relative w-28 h-28">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
              <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="9" />
              <circle
                cx="50" cy="50" r={R} fill="none" stroke="#FCF8EC" strokeWidth="9" strokeLinecap="round"
                strokeDasharray={C} strokeDashoffset={C - (progressPct / 100) * C}
                className="transition-[stroke-dashoffset] duration-700 ease-out"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-2xl font-extrabold text-white tabular-nums">
              {progressPct}%
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-white">{completedToday} of {todayTasks.length} tasks done</p>
            <p className="text-xs text-amber-100/90 mt-0.5">{progressLabel}</p>
          </div>
        </BentoCard>

        {/* ── Metric tiles ── */}
        <MetricCard label="Remaining today" value={remainingToday} hint={`of ${todayTasks.length} due today`} icon={ListTodo} tone="indigo" />
        <MetricCard label="Completed today" value={completedToday} valueClassName="text-blue-700" hint={`${progressPct}% of today's plan`} icon={CheckCircle2} tone="cyan" />
        <MetricCard
          label="Overdue"
          value={overdueCount}
          valueClassName={overdueCount > 0 ? 'text-rose-600' : 'text-slate-900'}
          hint={overdueCount > 0 ? 'Needs attention' : 'All caught up'}
          icon={AlertTriangle}
          tone={overdueCount > 0 ? 'rose' : 'slate'}
        />
        <MetricCard label="Goals in progress" value={inProgressGoals.length} valueClassName="text-violet-700" hint={`${goals.length} goals total`} icon={Target} tone="violet" />

        {/* ── Today's focus (large) ── */}
        <BentoCard span="two-thirds" rowSpan={2} aria-labelledby="dash-focus">
          <BentoCardHeader
            id="dash-focus"
            title="Today's focus"
            subtitle="Highest priority first"
            icon={ListTodo}
            badge={<span className="px-2 py-0.5 rounded-full bg-violet-50 border border-violet-200/70 text-violet-700 text-[11px] font-bold">{todayTasks.length}</span>}
            action={{ label: 'All tasks', to: '/tasks' }}
          />

          {todayFocusTasks.length === 0 ? (
            <div className="bento-empty">
              <CheckCircle2 size={28} className="text-indigo-300 mb-1" aria-hidden />
              <p className="font-semibold text-slate-600">No tasks scheduled for today</p>
              <button type="button" onClick={() => setTaskModalOpen(true)} className="mt-1 text-indigo-600 font-bold hover:underline cursor-pointer">
                Add your first task
              </button>
            </div>
          ) : (
            <ul className="space-y-2">
              {todayFocusTasks.map(task => {
                const isCompleted = task.status === 'completed';
                return (
                  <li key={task.id} className={`bento-row group ${isCompleted ? 'opacity-60' : ''}`}>
                    <button
                      type="button"
                      onClick={() => toggleTask(task.id)}
                      aria-pressed={isCompleted}
                      aria-label={isCompleted ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                        isCompleted
                          ? 'bg-blue-600 text-white'
                          : 'border-2 border-slate-300 hover:border-indigo-600'
                      }`}
                    >
                      {isCompleted && <Check size={13} strokeWidth={3} aria-hidden />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {task.title}
                      </p>
                      {!isCompleted && (
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {task.priority && (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${PRIORITY_CONFIG[task.priority]?.bg || 'bg-slate-50'} ${PRIORITY_CONFIG[task.priority]?.color || 'text-slate-600'} ${PRIORITY_CONFIG[task.priority]?.border || 'border-slate-200'}`}>
                              {PRIORITY_CONFIG[task.priority]?.label}
                            </span>
                          )}
                          {task.category && (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${CATEGORY_COLORS[task.category]?.bg || 'bg-indigo-50'} ${CATEGORY_COLORS[task.category]?.text || 'text-indigo-700'} ${CATEGORY_COLORS[task.category]?.border || 'border-indigo-200'}`}>
                              {task.category}
                            </span>
                          )}
                          {task.due_time && (
                            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                              <Clock size={11} aria-hidden />
                              {formatTime(task.due_time)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {isCompleted && <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">Done</span>}
                  </li>
                );
              })}
            </ul>
          )}
        </BentoCard>

        {/* ── Streak ── */}
        <BentoCard span="third" aria-labelledby="dash-streak">
          <BentoCardHeader id="dash-streak" title="Streak" subtitle={`Best: ${streak.longest_streak} days`} icon={Flame} tone="amber" />
          <div className="flex items-baseline gap-1.5 mb-4">
            <span className="bento-metric text-slate-900">{streak.current_streak}</span>
            <span className="text-sm font-semibold text-slate-500">day{streak.current_streak === 1 ? '' : 's'} active</span>
          </div>
          {/* 7-day mini heatmap */}
          <ol className="grid grid-cols-7 gap-1.5" aria-label="Completions over the last 7 days">
            {Array.from({ length: 7 }).map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (6 - i));
              const key = format(d, 'yyyy-MM-dd');
              const count = streak.history[key] || 0;
              const active = count > 0;
              const label = `${format(d, 'EEE, MMM d')}: ${count} completed`;
              return (
                <li key={key} className="flex flex-col items-center gap-1" title={label} aria-label={label}>
                  <span className={`w-full aspect-square rounded-lg flex items-center justify-center ${active ? 'gradient-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {active ? <Check size={12} strokeWidth={3} aria-hidden /> : null}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500" aria-hidden>{format(d, 'EEEEE')}</span>
                </li>
              );
            })}
          </ol>
        </BentoCard>

        {/* ── Active goals ── */}
        <BentoCard span="third" aria-labelledby="dash-goals">
          <BentoCardHeader id="dash-goals" title="Active goals" icon={Target} tone="violet" action={{ label: 'View', to: '/goals' }} />
          {activeGoals.length === 0 ? (
            <div className="bento-empty">
              <p className="font-semibold text-slate-600">No active goals yet</p>
              <Link to="/goals" className="text-indigo-600 font-bold hover:underline">Set a goal</Link>
            </div>
          ) : (
            <ul className="space-y-3.5">
              {activeGoals.map(goal => {
                const pct = getGoalProgress(goal);
                return (
                  <li key={goal.id}>
                    <div className="flex justify-between items-center mb-1.5 gap-2">
                      <p className="text-xs font-bold text-slate-800 truncate">{goal.title}</p>
                      <span className="text-xs font-extrabold text-indigo-600 shrink-0 tabular-nums">{pct}%</span>
                    </div>
                    <BentoProgress value={pct} label={`${goal.title} progress`} />
                  </li>
                );
              })}
            </ul>
          )}
        </BentoCard>

        {/* ── Schedule ── */}
        <BentoCard span="seven" aria-labelledby="dash-schedule">
          <BentoCardHeader
            id="dash-schedule"
            title="Today's schedule"
            subtitle={`${todayEvents.length} time block${todayEvents.length === 1 ? '' : 's'}`}
            icon={CalendarRange}
            tone="cyan"
            action={{ label: 'Daily schedule', to: '/daily-planner' }}
          />
          {todayEvents.length === 0 ? (
            <div className="bento-empty">
              <Clock size={24} className="text-slate-300 mb-1" aria-hidden />
              <p className="font-semibold text-slate-600">No events scheduled for today</p>
              <Link to="/daily-planner" className="text-indigo-600 font-bold hover:underline">Block out focus time</Link>
            </div>
          ) : (
            <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {todayEvents.map(event => (
                <li
                  key={event.id}
                  className="p-3.5 rounded-2xl border border-slate-100 flex flex-col gap-2"
                  style={eventCardStyle(event.color)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-700 bg-white/80 px-2 py-0.5 rounded-md">
                      {formatTime(event.start_time)} – {formatTime(event.end_time)}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider truncate">{event.category}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">{event.title}</p>
                </li>
              ))}
            </ol>
          )}
        </BentoCard>

        {/* ── Upcoming deadlines ── */}
        <BentoCard span="five" aria-labelledby="dash-deadlines">
          <BentoCardHeader id="dash-deadlines" title="Upcoming deadlines" icon={Clock} tone="amber" action={{ label: 'Manage', to: '/tasks' }} />
          {upcomingDeadlines.length === 0 ? (
            <div className="bento-empty"><p className="font-semibold text-slate-600">No upcoming deadlines</p></div>
          ) : (
            <ul className="space-y-1.5">
              {upcomingDeadlines.map(task => {
                const isUrgent = task.priority === 'urgent' || task.priority === 'high';
                return (
                  <li key={task.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isUrgent ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                      {isUrgent ? <AlertTriangle size={15} aria-hidden /> : <Calendar size={15} aria-hidden />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{task.title}</p>
                      <p className="text-[11px] font-medium text-slate-500">
                        {getRelativeDateLabel(task.due_date)} · {task.category}
                        {isUrgent && <span className="text-rose-600 font-semibold"> · {PRIORITY_CONFIG[task.priority]?.label}</span>}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </BentoCard>

        {/* ── Sticky notes (full width) ── */}
        <BentoCard span="full" aria-labelledby="dash-notes">
          <BentoCardHeader id="dash-notes" title="Sticky notes" subtitle="Pinned notes appear first" icon={StickyNoteIcon} tone="amber" action={{ label: 'All notes', to: '/sticky-notes' }} />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {displayNotes.map(note => {
              const style = noteStyles[note.color] || noteStyles.yellow;
              return (
                <Link
                  key={note.id}
                  to="/sticky-notes"
                  className="p-3.5 rounded-2xl min-h-[120px] flex flex-col relative border transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  style={{ backgroundColor: style.bg, borderColor: style.border }}
                >
                  <span className="absolute top-1.5 left-1/2 -translate-x-1/2 w-8 h-2.5 rounded-sm" style={{ backgroundColor: style.tape }} aria-hidden />
                  <h3 className="text-xs font-bold truncate mt-2 mb-1" style={{ color: style.text }}>
                    {note.title || 'Untitled note'}
                  </h3>
                  <p className="text-xs font-medium leading-relaxed flex-1 line-clamp-3" style={{ color: style.text }}>
                    {note.content}
                  </p>
                </Link>
              );
            })}
            <Link
              to="/sticky-notes"
              className="border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/40 p-3.5 rounded-2xl transition-colors min-h-[120px] flex flex-col items-center justify-center text-slate-500 hover:text-indigo-600"
            >
              <Plus size={22} aria-hidden />
              <span className="text-xs font-bold mt-1">{displayNotes.length === 0 ? 'Create your first note' : 'Add note'}</span>
            </Link>
          </div>
        </BentoCard>
      </BentoGrid>

      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSave={(taskData) => addTask(taskData)}
        mode="create"
      />
    </div>
  );
}
