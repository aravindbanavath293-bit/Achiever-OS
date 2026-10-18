import { useState, useMemo } from 'react';
import { Plus, Check, Trash2, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { getWeekDates, formatDateShort } from '../utils/dateUtils';
import { DayOfWeek, DAYS_OF_WEEK } from '../types';

const DAY_THEMES: Record<DayOfWeek, { 
  name: string; 
  headerBg: string; 
  cardBg: string; 
  headerText: string; 
  accentColor: string; 
  borderColor: string;
}> = {
  monday: {
    name: 'MONDAY',
    headerBg: 'bg-[#D8B4E2]',
    cardBg: 'bg-[#F9F3FA]',
    headerText: 'text-[#4A1E63]',
    accentColor: '#9333EA',
    borderColor: 'border-[#E2C7E9]',
  },
  tuesday: {
    name: 'TUESDAY',
    headerBg: 'bg-[#F9A8D4]',
    cardBg: 'bg-[#FDF2F8]',
    headerText: 'text-[#831843]',
    accentColor: '#EC4899',
    borderColor: 'border-[#FBCFE8]',
  },
  wednesday: {
    name: 'WEDNESDAY',
    headerBg: 'bg-[#FDBA74]',
    cardBg: 'bg-[#FFF7ED]',
    headerText: 'text-[#7C2D12]',
    accentColor: '#EA580C',
    borderColor: 'border-[#FED7AA]',
  },
  thursday: {
    name: 'THURSDAY',
    headerBg: 'bg-[#93C5FD]',
    cardBg: 'bg-[#EFF6FF]',
    headerText: 'text-[#1E3A8A]',
    accentColor: '#2563EB',
    borderColor: 'border-[#BFDBFE]',
  },
  friday: {
    name: 'FRIDAY',
    headerBg: 'bg-[#86EFAC]',
    cardBg: 'bg-[#F0FDF4]',
    headerText: 'text-[#14532D]',
    accentColor: '#16A34A',
    borderColor: 'border-[#BBF7D0]',
  },
  saturday: {
    name: 'SATURDAY',
    headerBg: 'bg-[#FDE047]',
    cardBg: 'bg-[#FEFCE8]',
    headerText: 'text-[#713F12]',
    accentColor: '#CA8A04',
    borderColor: 'border-[#FEF08A]',
  },
  sunday: {
    name: 'SUNDAY',
    headerBg: 'bg-[#FDA4AF]',
    cardBg: 'bg-[#FFF1F2]',
    headerText: 'text-[#881337]',
    accentColor: '#E11D48',
    borderColor: 'border-[#FECDD3]',
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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-border shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <CalendarIcon size={20} className="text-gold" />
            Weekly To-Do List
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Organized weekly overview matching the colorful daily planner specification
          </p>
        </div>

        {/* Week Switcher */}
        <div className="flex items-center gap-2 bg-background p-1 rounded-lg border border-border">
          <button
            onClick={prevWeek}
            className="p-1.5 hover:bg-white rounded text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            title="Previous Week"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={goToThisWeek}
            className="px-3 py-1 text-xs font-semibold text-primary hover:bg-white rounded transition-colors cursor-pointer"
          >
            {formatDateShort(weekDates[0])} – {formatDateShort(weekDates[6])}
          </button>
          <button
            onClick={nextWeek}
            className="p-1.5 hover:bg-white rounded text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            title="Next Week"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* 2-Column Responsive Grid matching reference */}
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
              className={`flex rounded-xl overflow-hidden border ${theme.borderColor} ${theme.cardBg} shadow-2xs hover:shadow-xs transition-shadow min-h-[220px]`}
            >
              {/* Vertical Header Bar */}
              <div
                className={`w-12 shrink-0 flex items-center justify-center py-4 select-none ${theme.headerBg}`}
              >
                <span
                  className="font-black text-sm tracking-widest uppercase rotate-180"
                  style={{ writingMode: 'vertical-rl', color: 'rgba(0, 0, 0, 0.65)' }}
                >
                  {theme.name}
                </span>
              </div>

              {/* Day Tasks List */}
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  {/* Top Bar for the Day */}
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-black/10">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-on-surface">
                        {dateObj ? `${dateObj.getDate()} ${dateObj.toLocaleDateString('en-US', { month: 'short' })}` : ''}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/70 font-semibold text-secondary-text border border-black/5">
                        {completedCount}/{dayTasks.length} Done
                      </span>
                    </div>
                    <span className="text-xs font-bold text-primary">{percentage}%</span>
                  </div>

                  {/* Task Items */}
                  <div className="space-y-2 mb-3 max-h-52 overflow-y-auto pr-1">
                    {dayTasks.map(task => (
                      <div
                        key={task.id}
                        className="group flex items-center justify-between gap-2 bg-white/80 hover:bg-white p-2 rounded-lg border border-black/5 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <button
                            onClick={() => toggleTask(task.id)}
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                              task.status === 'completed'
                                ? 'bg-primary border-primary text-white'
                                : 'border-gray-300 hover:border-primary bg-white'
                            }`}
                          >
                            {task.status === 'completed' && <Check size={12} strokeWidth={3} />}
                          </button>
                          <input
                            type="text"
                            value={task.title}
                            onChange={(e) => updateTask(task.id, { title: e.target.value })}
                            className={`text-xs font-medium bg-transparent focus:outline-none w-full truncate ${
                              task.status === 'completed' ? 'line-through text-gray-400' : 'text-on-surface'
                            }`}
                          />
                        </div>

                        <button
                          onClick={() => deleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity cursor-pointer p-0.5"
                          title="Delete task"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}

                    {dayTasks.length === 0 && (
                      <p className="text-[11px] text-gray-400 italic py-2">No tasks planned for {day}.</p>
                    )}
                  </div>
                </div>

                {/* Add Quick Task Input */}
                <div className="pt-2 border-t border-black/5 flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newTaskInput[dateStr] || ''}
                    onChange={(e) => setNewTaskInput(prev => ({ ...prev, [dateStr]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddTaskForDate(dateStr);
                    }}
                    placeholder={`+ Add task for ${day.slice(0, 3)}...`}
                    className="flex-1 text-xs px-2.5 py-1.5 rounded-lg bg-white/90 border border-black/10 focus:outline-none focus:border-primary placeholder-gray-400 transition-colors"
                  />
                  <button
                    onClick={() => handleAddTaskForDate(dateStr)}
                    className="p-1.5 bg-white hover:bg-primary hover:text-white text-primary rounded-lg border border-black/10 transition-colors cursor-pointer shrink-0"
                    title="Add Task"
                  >
                    <Plus size={14} />
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
