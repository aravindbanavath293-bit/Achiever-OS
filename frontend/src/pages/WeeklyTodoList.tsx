import { useState, useMemo } from 'react';
import { Plus, Check, Trash2, Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { getWeekDates, formatDateShort } from '../utils/dateUtils';
import { DayOfWeek, DAYS_OF_WEEK } from '../types';
import { BentoGrid, BentoCard, MetricCard, BentoProgress } from '../components/bento/Bento';

const DAY_THEMES: Record<DayOfWeek, { 
  name: string; 
  headerBg: string; 
  cardBg: string; 
  accentColor: string; 
  borderColor: string;
  badgeBg: string;
  badgeText: string;
}> = {
  monday: {
    name: 'MONDAY',
    headerBg: 'bg-gradient-to-b from-indigo-500 to-indigo-600 text-white',
    cardBg: 'bg-indigo-50/20',
    accentColor: '#4F46E5',
    borderColor: 'border-indigo-100',
    badgeBg: 'bg-indigo-100/70',
    badgeText: 'text-indigo-800',
  },
  tuesday: {
    name: 'TUESDAY',
    headerBg: 'bg-gradient-to-b from-pink-500 to-rose-500 text-white',
    cardBg: 'bg-pink-50/20',
    accentColor: '#EC4899',
    borderColor: 'border-pink-100',
    badgeBg: 'bg-pink-100/70',
    badgeText: 'text-pink-800',
  },
  wednesday: {
    name: 'WEDNESDAY',
    headerBg: 'bg-gradient-to-b from-amber-500 to-orange-500 text-white',
    cardBg: 'bg-amber-50/20',
    accentColor: '#F59E0B',
    borderColor: 'border-amber-100',
    badgeBg: 'bg-amber-100/70',
    badgeText: 'text-amber-800',
  },
  thursday: {
    name: 'THURSDAY',
    headerBg: 'bg-gradient-to-b from-cyan-500 to-blue-600 text-white',
    cardBg: 'bg-cyan-50/20',
    accentColor: '#06B6D4',
    borderColor: 'border-cyan-100',
    badgeBg: 'bg-cyan-100/70',
    badgeText: 'text-cyan-800',
  },
  friday: {
    name: 'FRIDAY',
    headerBg: 'bg-gradient-to-b from-emerald-500 to-teal-600 text-white',
    cardBg: 'bg-emerald-50/20',
    accentColor: '#10B981',
    borderColor: 'border-emerald-100',
    badgeBg: 'bg-emerald-100/70',
    badgeText: 'text-emerald-800',
  },
  saturday: {
    name: 'SATURDAY',
    headerBg: 'bg-gradient-to-b from-violet-500 to-purple-600 text-white',
    cardBg: 'bg-violet-50/20',
    accentColor: '#8B5CF6',
    borderColor: 'border-violet-100',
    badgeBg: 'bg-violet-100/70',
    badgeText: 'text-violet-800',
  },
  sunday: {
    name: 'SUNDAY',
    headerBg: 'bg-gradient-to-b from-rose-500 to-red-600 text-white',
    cardBg: 'bg-rose-50/20',
    accentColor: '#F43F5E',
    borderColor: 'border-rose-100',
    badgeBg: 'bg-rose-100/70',
    badgeText: 'text-rose-800',
  },
};

export default function WeeklyTodoList() {
  const { tasks, addTask, toggleTask, updateTask, deleteTask } = useAppData();
  const [currentWeekMonday, setCurrentWeekMonday] = useState<Date>(() => {
    const dates = getWeekDates();
    return dates[0];
  });

  const [newTaskInput, setNewTaskInput] = useState<{ [key: string]: string }>({});

  const weekDates = useMemo(() => {
    return getWeekDates(currentWeekMonday);
  }, [currentWeekMonday]);

  const prevWeek = () => {
    const d = new Date(currentWeekMonday);
    d.setDate(d.getDate() - 7);
    setCurrentWeekMonday(d);
  };

  const nextWeek = () => {
    const d = new Date(currentWeekMonday);
    d.setDate(d.getDate() + 7);
    setCurrentWeekMonday(d);
  };

  const goToThisWeek = () => {
    const dates = getWeekDates();
    setCurrentWeekMonday(dates[0]);
  };

  const handleAddTaskForDate = (dateStr: string) => {
    const text = newTaskInput[dateStr]?.trim();
    if (!text) return;

    addTask({
      title: text,
      description: '',
      category: 'General',
      priority: 'medium',
      status: 'todo',
      due_date: dateStr,
      is_recurring: false,
      tags: [],
      subtasks: [],
    });

    setNewTaskInput(prev => ({ ...prev, [dateStr]: '' }));
  };

  // Weekly stats
  const weekStartISO = weekDates[0]?.toISOString().split('T')[0] || '';
  const weekEndISO = weekDates[6]?.toISOString().split('T')[0] || '';
  const weekTasks = useMemo(() => {
    return tasks.filter(t => t.due_date >= weekStartISO && t.due_date <= weekEndISO);
  }, [tasks, weekStartISO, weekEndISO]);

  const completedWeekTasks = weekTasks.filter(t => t.status === 'completed');
  const weekVelocity = weekTasks.length > 0 ? Math.round((completedWeekTasks.length / weekTasks.length) * 100) : 0;
  const highPriorityPending = weekTasks.filter(t => t.status !== 'completed' && (t.priority === 'urgent' || t.priority === 'high')).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Bento Header Feature Card */}
      <BentoCard span="full" variant="feature" className="p-5 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
              <CalendarIcon size={22} className="text-indigo-600" />
              Weekly To-Do Board
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Organized 7-day focus overview with individual day completion velocity
            </p>
          </div>

          {/* Week Switcher */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <button
              type="button"
              onClick={prevWeek}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors cursor-pointer"
              title="Previous Week"
              aria-label="Previous week"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={goToThisWeek}
              className="px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              {formatDateShort(weekDates[0])} – {formatDateShort(weekDates[6])}
            </button>
            <button
              type="button"
              onClick={nextWeek}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors cursor-pointer"
              title="Next Week"
              aria-label="Next week"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </BentoCard>

      {/* Bento Metric KPI Tiles */}
      <BentoGrid>
        <MetricCard label="Week Tasks" value={weekTasks.length} icon={CalendarIcon} tone="indigo" hint="Total across 7 days" />
        <MetricCard label="Completed" value={completedWeekTasks.length} valueClassName="text-emerald-600" icon={CheckCircle2} tone="emerald" hint={`${weekTasks.length - completedWeekTasks.length} pending`} />
        <MetricCard 
          label="Weekly Velocity" 
          value={`${weekVelocity}%`} 
          valueClassName="text-indigo-600" 
          icon={CheckCircle2} 
          tone="violet" 
          hint={<BentoProgress value={weekVelocity} label="Weekly completion rate" className="mt-2" />} 
        />
        <MetricCard 
          label="High Priority Due" 
          value={highPriorityPending} 
          valueClassName={highPriorityPending > 0 ? "text-rose-600" : "text-slate-900"} 
          icon={CalendarIcon} 
          tone={highPriorityPending > 0 ? "rose" : "slate"} 
          hint="Urgent and high focus tasks" 
        />
      </BentoGrid>

      {/* 2-Column Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {DAYS_OF_WEEK.map((day, idx) => {
          const theme = DAY_THEMES[day];
          const dateObj = weekDates[idx];
          const dateStr = dateObj ? dateObj.toISOString().split('T')[0] : '';
          
          // Tasks due on this specific date
          const dayTasks = tasks.filter(t => t.due_date === dateStr);
          const completedCount = dayTasks.filter(t => t.status === 'completed').length;
          const percentage = dayTasks.length > 0 ? Math.round((completedCount / dayTasks.length) * 100) : 0;

          return (
            <div
              key={day}
              className={`flex rounded-2xl overflow-hidden border ${theme.borderColor} ${theme.cardBg} bg-white shadow-xs hover:shadow-md transition-all min-h-[230px]`}
            >
              {/* Vertical Header Bar */}
              <div
                className={`w-12 shrink-0 flex items-center justify-center py-4 select-none ${theme.headerBg} shadow-2xs`}
              >
                <span
                  className="font-black text-xs tracking-widest uppercase rotate-180"
                  style={{ writingMode: 'vertical-rl' }}
                >
                  {theme.name}
                </span>
              </div>

              {/* Day Tasks Content */}
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  {/* Top Bar for the Day */}
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {dateObj ? `${dateObj.getDate()} ${dateObj.toLocaleDateString('en-US', { month: 'short' })}` : ''}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${theme.badgeBg} ${theme.badgeText}`}>
                        {completedCount}/{dayTasks.length} Done
                      </span>
                    </div>
                    <span className="text-xs font-black text-indigo-600">{percentage}%</span>
                  </div>

                  {/* Task Items */}
                  <div className="space-y-2 mb-3 max-h-52 overflow-y-auto pr-1 scrollbar-hide">
                    {dayTasks.map(task => {
                      const isCompleted = task.status === 'completed';
                      return (
                        <div
                          key={task.id}
                          className="group flex items-center justify-between gap-2.5 bg-white hover:bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80 transition-all shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <button
                              onClick={() => toggleTask(task.id)}
                              className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                                isCompleted
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : 'border-slate-300 hover:border-indigo-600 bg-white'
                              }`}
                            >
                              {isCompleted && <Check size={11} strokeWidth={3} />}
                            </button>
                            <input
                              type="text"
                              value={task.title}
                              onChange={(e) => updateTask(task.id, { title: e.target.value })}
                              className={`text-xs font-semibold bg-transparent focus:outline-none w-full truncate ${
                                isCompleted ? 'line-through text-slate-400' : 'text-slate-800'
                              }`}
                            />
                          </div>

                          <button
                            onClick={() => deleteTask(task.id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-opacity cursor-pointer p-1 rounded-md hover:bg-rose-50"
                            title="Delete task"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      );
                    })}

                    {dayTasks.length === 0 && (
                      <p className="text-[11px] text-slate-400 italic py-3 text-center">No tasks scheduled for {day}.</p>
                    )}
                  </div>
                </div>

                {/* Add Quick Task Input */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <input
                    type="text"
                    value={newTaskInput[dateStr] || ''}
                    onChange={(e) => setNewTaskInput(prev => ({ ...prev, [dateStr]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddTaskForDate(dateStr);
                    }}
                    placeholder={`+ Add task for ${day.slice(0, 3)}...`}
                    className="flex-1 text-xs px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 placeholder-slate-400 transition-all"
                  />
                  <button
                    onClick={() => handleAddTaskForDate(dateStr)}
                    className="p-1.5 gradient-primary hover:gradient-primary-hover text-white rounded-xl shadow-2xs transition-all cursor-pointer shrink-0"
                    title="Add Task"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
