import { useMemo, useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { getTodayISO, formatDate } from '../utils/dateUtils';
import { Calendar as CalendarIcon, Check, Plus, AlertCircle, Clock } from 'lucide-react';
import type { Task, Priority } from '../types';
import { PRIORITY_COLORS } from '../types';
import TaskModal from '../components/shared/TaskModal';

export default function DailyPlanner() {
  const { tasks, toggleComplete } = useTasks();
  const today = getTodayISO();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { todayTasks, pendingTasks, completedTasks, upcomingDeadlines } = useMemo(() => {
    const todays = tasks.filter(t => t.dueDate === today);
    const completed = todays.filter(t => t.status === 'completed');
    const pending = todays.filter(t => t.status === 'pending');
    
    // Sort pending by priority
    pending.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    });

    // Upcoming deadlines (next 7 days, excluding today)
    const upcoming = tasks
      .filter(t => t.status === 'pending' && t.dueDate > today)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);

    return { todayTasks: todays, pendingTasks: pending, completedTasks: completed, upcomingDeadlines: upcoming };
  }, [tasks, today]);

  const progressPercent = todayTasks.length > 0 
    ? Math.round((completedTasks.length / todayTasks.length) * 100) 
    : 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-display font-bold text-on-surface mb-2">Daily Planner</h1>
          <p className="text-body-md text-on-surface-variant flex items-center gap-2">
            <CalendarIcon size={16} />
            {formatDate(new Date())}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full md:w-64">
          <div className="flex justify-between text-sm font-medium mb-2">
            <span className="text-on-surface-variant">Daily Progress</span>
            <span className="text-primary">{progressPercent}%</span>
          </div>
          <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden border border-outline-variant/30">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
              style={{ width: `${progressPercent}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 animate-[shimmer_2s_infinite]" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Main Column (8 cols) */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* Pending Tasks Grouped by Priority */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-headline-md font-bold text-on-surface">To Do Today</h2>
              <span className="px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-sm font-medium">
                {pendingTasks.length} remaining
              </span>
            </div>

            <div className="space-y-6">
              {pendingTasks.length === 0 ? (
                <div className="bg-surface-container-lowest border border-outline-variant border-dashed rounded-2xl p-8 text-center text-on-surface-variant">
                  <p>You're all caught up for today!</p>
                </div>
              ) : (
                (['high', 'medium', 'low'] as Priority[]).map(priorityLevel => {
                  const priorityTasks = pendingTasks.filter(t => t.priority === priorityLevel);
                  if (priorityTasks.length === 0) return null;

                  return (
                    <div key={priorityLevel} className="space-y-3">
                      <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${PRIORITY_COLORS[priorityLevel].text}`}>
                        {priorityLevel} Priority
                        <span className="text-xs px-2 py-0.5 rounded-full bg-surface-container font-medium text-on-surface-variant">
                          {priorityTasks.length}
                        </span>
                      </h3>
                      
                      <div className="space-y-2">
                        {priorityTasks.map(task => (
                          <TaskRow key={task.id} task={task} onToggle={() => toggleComplete(task.id)} />
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <section className="pt-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-headline-md font-bold text-on-surface-variant line-through opacity-70">Completed</h2>
                <span className="text-sm font-medium text-primary">
                  {completedTasks.length} done
                </span>
              </div>
              <div className="space-y-2 opacity-70">
                {completedTasks.map(task => (
                  <TaskRow key={task.id} task={task} onToggle={() => toggleComplete(task.id)} />
                ))}
              </div>
            </section>
          )}

        </div>

        {/* Side Column (4 cols) */}
        <div className="xl:col-span-4 space-y-8">
          
          {/* Quick Add */}
          <section className="bg-primary text-on-primary rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-2">Need to add something?</h3>
              <p className="text-primary-fixed-dim text-sm mb-4">Quickly capture a task for today.</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-on-primary text-primary py-3 rounded-xl font-bold hover:bg-surface-bright transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Plus size={18} />
                Quick Add Task
              </button>
            </div>
            {/* Background decoration */}
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          </section>

          {/* Upcoming Deadlines */}
          <section>
            <h2 className="text-title-task font-bold text-on-surface mb-4 flex items-center gap-2">
              <AlertCircle size={18} className="text-primary" />
              Looking Ahead
            </h2>
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm p-2">
              {upcomingDeadlines.length === 0 ? (
                <div className="p-4 text-center text-sm text-on-surface-variant">
                  No upcoming deadlines this week.
                </div>
              ) : (
                <div className="divide-y divide-outline-variant/50">
                  {upcomingDeadlines.map(task => (
                    <div key={task.id} className="p-4 flex gap-4 items-start">
                      <div className="w-12 h-12 rounded-xl bg-surface-container flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-primary uppercase leading-none mb-0.5">
                          {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-base font-bold text-on-surface leading-none">
                          {new Date(task.dueDate).getDate()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-on-surface truncate">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${PRIORITY_COLORS[task.priority].bg} ${PRIORITY_COLORS[task.priority].text}`}>
                            {task.priority}
                          </span>
                          <span className="text-[11px] text-on-surface-variant truncate">
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

        </div>
      </div>

      {isModalOpen && (
        <TaskModal 
          onClose={() => setIsModalOpen(false)} 
          editTask={undefined}
        />
      )}
    </div>
  );
}

// Sub-component for individual task rows
function TaskRow({ task, onToggle }: { task: Task; onToggle: () => void }) {
  return (
    <div 
      className={`group flex items-start gap-4 p-4 bg-surface-container-lowest border rounded-xl transition-all shadow-sm ${
        task.status === 'completed' 
          ? 'border-transparent bg-surface-container-lowest/50' 
          : 'border-outline-variant hover:border-primary/50'
      }`}
    >
      <button 
        onClick={onToggle}
        className={`shrink-0 mt-0.5 rounded transition-colors cursor-pointer flex items-center justify-center w-6 h-6 border-2 ${
          task.status === 'completed' 
            ? 'bg-primary border-primary text-on-primary' 
            : 'border-outline hover:border-primary text-transparent'
        }`}
      >
        <Check size={16} strokeWidth={3} className={task.status === 'completed' ? 'opacity-100' : 'opacity-0'} />
      </button>
      
      <div className="flex-1 min-w-0">
        <p className={`text-[16px] font-medium leading-tight transition-all ${
          task.status === 'completed' ? 'text-on-surface-variant line-through' : 'text-on-surface'
        }`}>
          {task.title}
        </p>
        
        {task.status !== 'completed' && (
          <div className="flex items-center gap-3 text-xs mt-2">
            {task.scheduledTime && (
              <span className="flex items-center gap-1 font-medium text-primary">
                <Clock size={12} /> {task.scheduledTime}
              </span>
            )}
            <span className="px-2 py-0.5 rounded bg-surface-container font-medium text-on-surface-variant">
              {task.category}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
