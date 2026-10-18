import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MoreVertical, Plus, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { getGreeting, formatDate, formatTime, isTaskToday, getRelativeDateLabel } from '../utils/dateUtils';
import { PRIORITY_CONFIG, CATEGORY_COLORS } from '../types';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const { tasks, goals, notes, events, streak, toggleTask } = useAppData();

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  const todayTasks = useMemo(() => tasks.filter(t => isTaskToday(t.due_date)), [tasks]);
  const completedToday = todayTasks.filter(t => t.status === 'completed').length;
  const remainingToday = todayTasks.length - completedToday;
  const progressPct = todayTasks.length > 0 ? Math.round((completedToday / todayTasks.length) * 100) : 0;

  const todayFocusTasks = useMemo(() => {
    const pending = todayTasks.filter(t => t.status !== 'completed')
      .sort((a, b) => {
        const po = { urgent: 0, high: 1, medium: 2, low: 3 };
        return (po[a.priority] ?? 3) - (po[b.priority] ?? 3);
      });
    const done = todayTasks.filter(t => t.status === 'completed').slice(0, 2);
    return [...pending, ...done].slice(0, 6);
  }, [todayTasks]);

  const activeGoals = useMemo(() => goals.filter(g => g.status === 'in-progress').slice(0, 3), [goals]);

  const upcomingDeadlines = useMemo(() => {
    return tasks
      .filter(t => t.status !== 'completed' && t.due_date >= todayStr)
      .sort((a, b) => a.due_date.localeCompare(b.due_date))
      .slice(0, 4);
  }, [tasks, todayStr]);

  const todayEvents = useMemo(() => {
    const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][today.getDay()];
    return events.filter(e => e.day === dayName).sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [events, today]);

  const displayNotes = useMemo(() => notes.slice(0, 3), [notes]);

  function getGoalProgress(goal: typeof goals[0]): number {
    if (goal.milestones.length === 0) return 0;
    return Math.round((goal.milestones.filter(m => m.completed).length / goal.milestones.length) * 100);
  }

  const noteColors: Record<string, string> = {
    yellow: '#fef3c7', blue: '#e0f2fe', pink: '#fce7f3', orange: '#ffedd5', green: '#dcfce7'
  };

  const noteRotations = ['rotate-1', '-rotate-2', 'rotate-2'];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Welcome Card */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 md:p-5 rounded-xl border border-surface-container-highest">
        <div>
          <p className="text-label-caps text-outline uppercase tracking-wider mb-1">
            {format(today, 'EEEE, MMM d')}
          </p>
          <h2 className="text-display text-on-surface mb-1.5">
            {getGreeting()}, {user?.name || 'Alex'}! 👋
          </h2>
          <p className="text-body-md text-on-surface-variant">
            You have <strong className="text-primary">{todayTasks.length} tasks</strong> planned for today · {completedToday} completed · {remainingToday} remaining
          </p>
        </div>
        <div className="flex items-center gap-3 bg-surface-container-low p-3.5 rounded-lg">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-surface-container-highest stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
              <path className="text-primary stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeDasharray={`${progressPct}, 100`} strokeWidth="3" />
            </svg>
            <span className="absolute text-label-caps text-primary">{progressPct}%</span>
          </div>
          <div>
            <p className="text-body-md font-semibold text-on-surface">Daily Progress</p>
            <p className="text-metadata text-outline">{progressPct >= 50 ? 'On track' : progressPct > 0 ? 'Keep going' : 'Get started'}</p>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-4">
          {/* Today's Focus */}
          <section className="bg-white rounded-xl border border-surface-container-highest p-4 md:p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-headline-md text-on-surface">Today's Focus</h3>
              <Link to="/tasks" className="text-primary text-body-sm hover:underline">View All</Link>
            </div>
            <div className="space-y-1">
              {todayFocusTasks.length === 0 && (
                <p className="text-body-md text-on-surface-variant py-6 text-center">No tasks planned for today. Create one to get started!</p>
              )}
              {todayFocusTasks.map(task => (
                <div key={task.id} className={`flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container-low transition-colors group ${task.status === 'completed' ? 'bg-surface-container-low opacity-60' : ''}`}>
                  <input
                    type="checkbox"
                    checked={task.status === 'completed'}
                    onChange={() => toggleTask(task.id)}
                    className={`w-4.5 h-4.5 rounded cursor-pointer ${
                      task.priority === 'urgent' || task.priority === 'high'
                        ? 'border-danger text-danger focus:ring-danger'
                        : 'border-primary text-primary focus:ring-primary'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-title-task text-on-surface group-hover:text-primary transition-colors ${task.status === 'completed' ? 'line-through' : ''}`}>
                      {task.title}
                    </p>
                    {task.status !== 'completed' && (
                      <div className="flex gap-1.5 mt-0.5 flex-wrap">
                        {task.priority !== 'medium' && task.priority !== 'low' && (
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${PRIORITY_CONFIG[task.priority]?.bg || ''} ${PRIORITY_CONFIG[task.priority]?.color || ''}`}>
                            {PRIORITY_CONFIG[task.priority]?.label}
                          </span>
                        )}
                        {task.category && (
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${CATEGORY_COLORS[task.category]?.bg || 'bg-surface-container-high'} ${CATEGORY_COLORS[task.category]?.text || 'text-on-surface-variant'}`}>
                            {task.category}
                          </span>
                        )}
                        {task.due_time && (
                          <span className="text-metadata text-outline flex items-center gap-0.5">
                            <Clock size={12} />
                            {formatTime(task.due_time)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {task.status !== 'completed' && (
                    <button className="opacity-0 group-hover:opacity-100 text-outline hover:text-on-surface transition-opacity p-1 cursor-pointer">
                      <MoreVertical size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Schedule */}
          <section className="bg-white rounded-xl border border-surface-container-highest p-4 md:p-5">
            <h3 className="text-headline-md text-on-surface mb-3">Schedule</h3>
            {todayEvents.length === 0 ? (
              <p className="text-body-md text-on-surface-variant text-center py-4">No events scheduled for today</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {todayEvents.map(event => (
                  <div key={event.id} className="bg-surface-container rounded-lg p-2.5 border-l-4 flex flex-col justify-center min-h-[52px]" style={{ borderLeftColor: event.color || '#4f46e5' }}>
                    <p className="text-body-sm font-semibold text-on-surface">{formatTime(event.start_time)} - {formatTime(event.end_time)}</p>
                    <p className="text-metadata text-on-surface-variant">{event.title}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Sticky Notes Preview */}
          <section className="bg-white rounded-xl border border-surface-container-highest p-4 md:p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-headline-md text-on-surface">Sticky Notes</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {displayNotes.map((note, i) => (
                <Link
                  key={note.id}
                  to="/sticky-notes"
                  className={`p-3 rounded shadow-sm hover:rotate-0 transition-transform cursor-pointer min-h-[100px] flex flex-col relative group ${noteRotations[i] || ''}`}
                  style={{ backgroundColor: noteColors[note.color] || noteColors.yellow }}
                >
                  <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-7 h-2.5 bg-white/40 rounded-sm shadow-sm" />
                  <p className="font-[Caveat,cursive] text-xl text-gray-800 leading-tight mt-2 flex-1">{note.content}</p>
                </Link>
              ))}
              <Link
                to="/sticky-notes"
                className="bg-surface-container-low border-2 border-dashed border-outline-variant p-3 rounded hover:bg-surface-container transition-colors cursor-pointer min-h-[100px] flex flex-col items-center justify-center text-outline group"
              >
                <Plus size={24} className="group-hover:text-primary transition-colors" />
                <span className="text-body-sm mt-0.5 group-hover:text-primary transition-colors">New Note</span>
              </Link>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-4">
          {/* Streak */}
          <section className="bg-white rounded-xl border border-surface-container-highest p-4 md:p-5 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <Flame size={56} />
            </div>
            <h3 className="text-headline-md text-on-surface flex justify-center items-center gap-1.5">
              <span className="text-danger">🔥</span> {streak.current_streak}-Day Streak
            </h3>
            <p className="text-body-sm text-on-surface-variant mb-3">
              {streak.current_streak >= 7 ? "You're on fire! Keep it up." : `Keep going! ${7 - streak.current_streak} more days to hit 7.`}
            </p>
            <div className="grid grid-cols-7 gap-1 mt-3 max-w-[180px] mx-auto">
              {Array.from({ length: 7 }).map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                const key = format(d, 'yyyy-MM-dd');
                const count = streak.history[key] || 0;
                const opacity = count > 0 ? Math.min(0.2 + count * 0.15, 1) : 0;
                return (
                  <div
                    key={i}
                    className="w-full aspect-square rounded"
                    style={{
                      backgroundColor: count > 0 ? `rgba(32, 52, 81, ${opacity})` : '#eae7ea',
                    }}
                    title={`${format(d, 'MMM d')}: ${count} tasks`}
                  />
                );
              })}
            </div>
          </section>

          {/* Active Goals */}
          <section className="bg-white rounded-xl border border-surface-container-highest p-4 md:p-5">
            <h3 className="text-headline-md text-on-surface mb-3">Active Goals</h3>
            {activeGoals.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant text-center py-3">No active goals</p>
            ) : (
              <div className="space-y-3.5">
                {activeGoals.map(goal => {
                  const pct = getGoalProgress(goal);
                  return (
                    <div key={goal.id}>
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-body-sm font-medium text-on-surface">{goal.title}</p>
                        <p className="text-metadata text-primary">{pct}%</p>
                      </div>
                      <div className="w-full bg-surface-container-high rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Upcoming Deadlines */}
          <section className="bg-white rounded-xl border border-surface-container-highest p-4 md:p-5">
            <h3 className="text-headline-md text-on-surface mb-3">Upcoming Deadlines</h3>
            {upcomingDeadlines.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant text-center py-3">No upcoming deadlines</p>
            ) : (
              <ul className="space-y-2">
                {upcomingDeadlines.map(task => {
                  const isUrgent = task.priority === 'urgent' || task.priority === 'high';
                  return (
                    <li key={task.id} className="flex items-start gap-2">
                      {isUrgent ? (
                        <span className="text-danger mt-0.5 text-[16px]">⚠</span>
                      ) : (
                        <span className="text-outline mt-0.5 text-[16px]">📅</span>
                      )}
                      <div>
                        <p className="text-body-sm font-medium text-on-surface">{task.title}</p>
                        <p className="text-metadata text-outline">{getRelativeDateLabel(task.due_date)} · {task.category}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
