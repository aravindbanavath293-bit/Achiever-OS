import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, Filter, Plus, Clock, Edit2, Trash2, Check, Flag, 
  Calendar, ChevronDown, CheckSquare, Sparkles, CheckCircle2 
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { Task, Priority, TaskStatus, PRIORITY_CONFIG, CATEGORY_COLORS, DEFAULT_CATEGORIES, SortConfig } from '../types';
import { formatTime, isTaskToday, isOverdue, getRelativeDateLabel } from '../utils/dateUtils';
import TaskModal from '../components/shared/TaskModal';
import toast from 'react-hot-toast';
import { BentoGrid, MetricCard } from '../components/bento/Bento';

type QuickFilter = 'all' | 'today' | 'high-priority' | string;

export default function Tasks() {
  const { tasks, addTask, updateTask, deleteTask, toggleTask } = useAppData();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ by: 'due_date', direction: 'asc' });
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }

    // Quick filter
    if (quickFilter === 'today') {
      result = result.filter(t => isTaskToday(t.due_date));
    } else if (quickFilter === 'high-priority') {
      result = result.filter(t => t.priority === 'high' || t.priority === 'urgent');
    } else if (quickFilter !== 'all') {
      result = result.filter(t => t.category === quickFilter);
    }

    // Status filter
    if (statusFilter) {
      result = result.filter(t => t.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      const dir = sortConfig.direction === 'asc' ? 1 : -1;
      switch (sortConfig.by) {
        case 'due_date': return dir * a.due_date.localeCompare(b.due_date);
        case 'priority': {
          const po: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
          return dir * ((po[a.priority] ?? 3) - (po[b.priority] ?? 3));
        }
        case 'created_at': return dir * a.created_at.localeCompare(b.created_at);
        case 'title': return dir * a.title.localeCompare(b.title);
        default: return 0;
      }
    });

    return result;
  }, [tasks, searchQuery, quickFilter, statusFilter, sortConfig]);

  const taskCounts = useMemo(() => ({
    all: tasks.length,
    today: tasks.filter(t => isTaskToday(t.due_date)).length,
    highPriority: tasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  }), [tasks]);

  function handleEditTask(task: Task) {
    setEditingTask(task);
    setTaskModalOpen(true);
  }

  function handleSaveTask(taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      toast.success('Task updated');
      setEditingTask(null);
    } else {
      addTask(taskData);
      toast.success('Task created successfully');
    }
  }

  function confirmDelete(taskId: string) {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId);
      toast.success('Task deleted');
    }
  }

  const quickFilters: { key: QuickFilter; label: string; count?: number }[] = [
    { key: 'all', label: 'All Tasks', count: taskCounts.all },
    { key: 'today', label: 'Due Today', count: taskCounts.today },
    { key: 'high-priority', label: 'High Priority', count: taskCounts.highPriority },
    { key: 'Work', label: 'Work' },
    { key: 'Study', label: 'Study' },
    { key: 'Personal', label: 'Personal' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Quick Metrics Bar */}
      <BentoGrid>
        <MetricCard label="Total tasks" value={taskCounts.all} icon={CheckSquare} tone="indigo" />
        <MetricCard label="Due today" value={taskCounts.today} valueClassName="text-violet-700" icon={Calendar} tone="violet" />
        <MetricCard label="High priority" value={taskCounts.highPriority} valueClassName="text-rose-600" icon={Flag} tone="rose" />
        <MetricCard
          label="Completed"
          value={taskCounts.completed}
          valueClassName="text-blue-700"
          hint={taskCounts.all > 0 ? `${Math.round((taskCounts.completed / taskCounts.all) * 100)}% of all tasks` : undefined}
          icon={CheckCircle2}
          tone="cyan"
        />
      </BentoGrid>

      {/* Main Action Bar */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, descriptions, tags..."
            className="w-full pl-9 pr-3.5 py-2.5 text-xs md:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <span className="font-semibold text-slate-500">Sort:</span>
            <select
              value={`${sortConfig.by}-${sortConfig.direction}`}
              onChange={(e) => {
                const [by, dir] = e.target.value.split('-');
                setSortConfig({ by: by as SortConfig['by'], direction: dir as SortConfig['direction'] });
              }}
              className="bg-transparent text-xs font-semibold text-slate-800 cursor-pointer outline-none"
            >
              <option value="due_date-asc">Due Date ↑</option>
              <option value="due_date-desc">Due Date ↓</option>
              <option value="priority-asc">Priority ↑</option>
              <option value="priority-desc">Priority ↓</option>
              <option value="created_at-desc">Newest First</option>
              <option value="title-asc">A → Z</option>
            </select>
          </div>

          <button
            onClick={() => { setEditingTask(null); setTaskModalOpen(true); }}
            className="gradient-primary hover:gradient-primary-hover text-white px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-indigo-500/25 hover:shadow-md hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shrink-0 ml-auto md:ml-0"
          >
            <Plus size={16} />
            <span>Create New Task</span>
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setShowMoreFilters(!showMoreFilters)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
            showMoreFilters || statusFilter
              ? 'gradient-primary text-white border-transparent shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Filter size={13} />
          <span>Filters</span>
          {statusFilter && <span className="w-1.5 h-1.5 rounded-full bg-white ml-0.5" />}
        </button>

        <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

        {quickFilters.map(f => {
          const isActive = quickFilter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setQuickFilter(f.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-violet-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
              }`}
            >
              {f.label}{f.count !== undefined ? ` (${f.count})` : ''}
            </button>
          );
        })}

        <button
          onClick={() => setShowMoreFilters(!showMoreFilters)}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 cursor-pointer flex items-center gap-1 ml-auto sm:ml-0"
        >
          <span>More</span>
          <ChevronDown size={13} className={showMoreFilters ? 'rotate-180 transition-transform' : ''} />
        </button>
      </div>

      {/* Expanded Filter Panel */}
      {showMoreFilters && (
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3 animate-fade-in">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Status:</span>
            <div className="flex gap-1.5 flex-wrap">
              {(['', 'todo', 'in-progress', 'completed'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === '' ? 'All Statuses' : st === 'todo' ? 'To Do' : st === 'in-progress' ? 'In Progress' : 'Completed'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700">Category:</span>
            <div className="flex gap-1.5 flex-wrap">
              {DEFAULT_CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setQuickFilter(quickFilter === c ? 'all' : c)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    quickFilter === c
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Task Cards List */}
      <div className="flex flex-col gap-3">
        {filteredTasks.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
            <CheckSquare size={42} className="mx-auto text-indigo-200 mb-3" />
            <p className="text-base font-bold text-slate-800">No matching tasks found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search criteria, reset active filters, or create a brand new task.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setQuickFilter('all'); setStatusFilter(''); }}
              className="mt-4 px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl border border-indigo-200 transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {filteredTasks.map(task => {
          const isCompleted = task.status === 'completed';
          const overdue = isOverdue(task.due_date) && !isCompleted;
          const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
          const categoryStyle = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.Other;

          return (
            <div
              key={task.id}
              onClick={() => handleEditTask(task)}
              className={`group flex items-start gap-4 p-4 bg-white border rounded-2xl transition-all cursor-pointer ${
                isCompleted 
                  ? 'border-slate-200 bg-slate-50/60 opacity-75' 
                  : 'border-slate-200/90 hover:border-indigo-300 hover:shadow-sm'
              }`}
            >
              {/* Checkbox */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTask(task.id);
                }}
                className={`w-5 h-5 rounded-md flex items-center justify-center transition-all shrink-0 mt-0.5 cursor-pointer ${
                  isCompleted
                    ? 'bg-emerald-500 text-white shadow-2xs'
                    : 'border-2 border-slate-300 group-hover:border-indigo-600 bg-white group-hover:scale-105'
                }`}
                title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
              >
                {isCompleted && <Check size={13} strokeWidth={3} />}
              </button>

              {/* Task Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <h3
                    className={`text-sm md:text-base font-bold truncate transition-colors ${
                      isCompleted ? 'line-through text-slate-400' : 'text-slate-900 group-hover:text-indigo-600'
                    }`}
                  >
                    {task.title}
                  </h3>

                  {/* Hover Actions */}
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTask(task);
                      }}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit task"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDelete(task.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete task"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {task.description && (
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-normal">
                    {task.description}
                  </p>
                )}

                {/* Metadata Badges */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${priority.bg} ${priority.color} ${priority.border}`}>
                    <Flag size={10} />
                    <span>{priority.label}</span>
                  </span>

                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                    overdue ? 'text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200' : 'text-slate-500'
                  }`}>
                    <Calendar size={12} className={overdue ? 'text-rose-500' : 'text-slate-400'} />
                    <span>{getRelativeDateLabel(task.due_date)}</span>
                    {overdue && <span className="text-[10px] uppercase tracking-wider font-extrabold ml-0.5">· Overdue</span>}
                  </span>

                  {task.due_time && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                      <Clock size={11} className="text-slate-400" />
                      <span>{formatTime(task.due_time)}</span>
                    </span>
                  )}

                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}>
                    {task.category}
                  </span>

                  {task.subtasks && task.subtasks.length > 0 && (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => { setTaskModalOpen(false); setEditingTask(null); }}
        onSave={handleSaveTask}
        task={editingTask}
        mode={editingTask ? 'edit' : 'create'}
      />
    </div>
  );
}
