import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Plus, Clock, Edit2, Trash2, Check, Flag, Calendar, ChevronDown, CheckSquare } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { Task, Priority, TaskStatus, PRIORITY_CONFIG, CATEGORY_COLORS, DEFAULT_CATEGORIES, SortConfig } from '../types';
import { formatTime, isTaskToday, isOverdue, getRelativeDateLabel } from '../utils/dateUtils';
import TaskModal from '../components/shared/TaskModal';
import toast from 'react-hot-toast';

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
    }
  }

  function confirmDelete(taskId: string) {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId);
    }
  }

  const quickFilters: { key: QuickFilter; label: string; count?: number }[] = [
    { key: 'all', label: 'All Tasks', count: taskCounts.all },
    { key: 'today', label: 'Today', count: taskCounts.today },
    { key: 'high-priority', label: 'High Priority', count: taskCounts.highPriority },
    { key: 'Work', label: 'Work' },
    { key: 'Study', label: 'Study' },
    { key: 'Personal', label: 'Personal' },
  ];

  const getPriorityStyle = (priority: Priority) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return 'text-danger font-semibold';
      case 'medium':
        return 'text-amber-600 font-medium';
      case 'low':
      default:
        return 'text-secondary-text font-normal';
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Page Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">Tasks</h1>
          <p className="text-xs text-secondary-text mt-0.5">{filteredTasks.length} tasks matching criteria</p>
        </div>
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-full border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline"
            />
          </div>
          <button
            onClick={() => { setEditingTask(null); setTaskModalOpen(true); }}
            className="bg-primary hover:bg-primary-dark text-white px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            <Plus size={15} /> Create New Task
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-border/60">
        <button
          onClick={() => setShowMoreFilters(!showMoreFilters)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors cursor-pointer ${
            showMoreFilters || statusFilter
              ? 'bg-primary text-white border-primary'
              : 'bg-surface-container border-border text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <Filter size={13} />
          Filter
        </button>

        <div className="h-4 w-px bg-border mx-0.5 hidden sm:block" />

        {quickFilters.map(f => (
          <button
            key={f.key}
            onClick={() => setQuickFilter(f.key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              quickFilter === f.key
                ? 'bg-primary text-white font-semibold shadow-xs'
                : 'bg-white text-on-surface-variant border border-border hover:bg-surface-container-low'
            }`}
          >
            {f.label}{f.count !== undefined ? ` (${f.count})` : ''}
          </button>
        ))}

        <button
          onClick={() => setShowMoreFilters(!showMoreFilters)}
          className="px-3 py-1 rounded-full text-xs font-medium bg-white text-on-surface-variant border border-border hover:bg-surface-container-low cursor-pointer flex items-center gap-1 ml-auto sm:ml-0"
        >
          More <ChevronDown size={13} />
        </button>

        {/* Sort selector */}
        <div className="ml-auto flex items-center gap-1.5 text-xs text-secondary-text">
          <span className="hidden sm:inline">Sort:</span>
          <select
            value={`${sortConfig.by}-${sortConfig.direction}`}
            onChange={(e) => {
              const [by, dir] = e.target.value.split('-');
              setSortConfig({ by: by as SortConfig['by'], direction: dir as SortConfig['direction'] });
            }}
            className="px-2.5 py-1 bg-white border border-border rounded-lg text-xs cursor-pointer outline-none focus:border-primary"
          >
            <option value="due_date-asc">Due Date ↑</option>
            <option value="due_date-desc">Due Date ↓</option>
            <option value="priority-asc">Priority ↑</option>
            <option value="priority-desc">Priority ↓</option>
            <option value="created_at-desc">Newest First</option>
            <option value="title-asc">A → Z</option>
          </select>
        </div>
      </div>

      {/* Expanded More Filters Drawer */}
      {showMoreFilters && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-white border border-border rounded-xl shadow-xs animate-fade-in">
          <span className="text-xs font-semibold text-primary">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TaskStatus | '')}
            className="px-2.5 py-1 border border-border rounded-lg text-xs bg-white cursor-pointer outline-none"
          >
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <span className="text-xs font-semibold text-primary ml-2">All Categories:</span>
          {DEFAULT_CATEGORIES.filter(c => !quickFilters.some(q => q.key === c)).map(c => (
            <button
              key={c}
              onClick={() => setQuickFilter(quickFilter === c ? 'all' : c)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                quickFilter === c
                  ? 'bg-primary text-white'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {c}
            </button>
          ))}
          {statusFilter && (
            <button
              onClick={() => setStatusFilter('')}
              className="text-xs text-danger hover:underline ml-auto cursor-pointer"
            >
              Clear Status Filter
            </button>
          )}
        </div>
      )}

      {/* Discrete Task Cards Container (Reference Design Matching) */}
      <div className="flex flex-col gap-2.5">
        {filteredTasks.length === 0 && (
          <div className="text-center py-14 bg-white rounded-xl border border-border">
            <CheckSquare size={38} className="mx-auto text-outline-variant mb-2.5" />
            <p className="text-sm font-semibold text-on-surface">No tasks found</p>
            <p className="text-xs text-secondary-text mt-1">Try adjusting your filters or click Create New Task</p>
          </div>
        )}

        {filteredTasks.map(task => {
          const isCompleted = task.status === 'completed';
          const priorityStyle = getPriorityStyle(task.priority);

          return (
            <div
              key={task.id}
              onClick={() => handleEditTask(task)}
              className={`group flex items-start gap-3.5 p-3.5 sm:p-4 bg-white border border-border rounded-xl hover:bg-surface-container-low hover:border-outline/40 transition-all cursor-pointer shadow-xs ${
                isCompleted ? 'opacity-65 bg-surface-container-low/50' : ''
              }`}
            >
              {/* Checkbox button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTask(task.id);
                }}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 mt-0.5 cursor-pointer ${
                  isCompleted
                    ? 'bg-primary border-primary text-white'
                    : 'border-outline hover:border-primary bg-white group-hover:border-primary'
                }`}
                title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
              >
                {isCompleted && <Check size={14} className="stroke-[3]" />}
              </button>

              {/* Task Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <h3
                    className={`text-sm sm:text-[15px] font-medium text-on-surface truncate ${
                      isCompleted ? 'line-through text-outline' : ''
                    }`}
                  >
                    {task.title}
                  </h3>

                  {/* Actions on hover */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTask(task);
                      }}
                      className="p-1 text-secondary-text hover:text-primary transition-colors cursor-pointer"
                      title="Edit task"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDelete(task.id);
                      }}
                      className="p-1 text-secondary-text hover:text-danger transition-colors cursor-pointer"
                      title="Delete task"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Metadata Pills & Flags */}
                <div className="flex flex-wrap items-center gap-2.5 mt-1.5">
                  <span className={`inline-flex items-center gap-1 text-xs ${priorityStyle}`}>
                    <Flag size={12} /> {PRIORITY_CONFIG[task.priority]?.label || task.priority}
                  </span>

                  <span className="inline-flex items-center gap-1 text-xs text-secondary-text">
                    <Calendar size={12} /> {getRelativeDateLabel(task.due_date)}
                  </span>

                  {task.due_time && (
                    <span className="inline-flex items-center gap-1 text-xs text-secondary-text">
                      <Clock size={12} /> {formatTime(task.due_time)}
                    </span>
                  )}

                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                      CATEGORY_COLORS[task.category]?.bg || 'bg-surface-container-high'
                    } ${CATEGORY_COLORS[task.category]?.text || 'text-on-surface-variant'}`}
                  >
                    {task.category}
                  </span>

                  {isOverdue(task.due_date) && !isCompleted && (
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-100 text-danger">
                      Overdue
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
