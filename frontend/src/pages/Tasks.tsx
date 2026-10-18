import { useState, useMemo } from 'react';
import { Search, Filter, Plus, Clock, Edit2, Trash2, MoreVertical, CheckSquare } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { Task, Priority, TaskStatus, PRIORITY_CONFIG, CATEGORY_COLORS, DEFAULT_CATEGORIES, FilterOptions, SortConfig } from '../types';
import { formatDate, formatTime, isTaskToday, isOverdue, getTodayISO } from '../utils/dateUtils';
import TaskModal from '../components/shared/TaskModal';
import toast from 'react-hot-toast';

type QuickFilter = 'all' | 'today' | 'high-priority' | string;

export default function Tasks() {
  const { tasks, addTask, updateTask, deleteTask, toggleTask } = useAppData();
  const [searchQuery, setSearchQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ by: 'due_date', direction: 'asc' });
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showMoreFilters, setShowMoreFilters] = useState(false);

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

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-headline-lg text-on-surface">Tasks</h1>
          <p className="text-body-sm text-on-surface-variant">{filteredTasks.length} tasks shown</p>
        </div>
        <button
          onClick={() => { setEditingTask(null); setTaskModalOpen(true); }}
          className="bg-primary text-on-primary px-4 py-2 rounded-lg text-body-md font-medium flex items-center gap-1.5 hover:bg-primary-light transition-colors shadow-sm cursor-pointer"
        >
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center bg-white border border-outline-variant rounded-lg px-3 py-2 focus-within:ring-2 ring-primary transition-all">
          <Search size={16} className="text-on-surface-variant mr-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="bg-transparent border-none outline-none w-full text-body-md"
          />
        </div>
        <select
          value={`${sortConfig.by}-${sortConfig.direction}`}
          onChange={(e) => {
            const [by, dir] = e.target.value.split('-');
            setSortConfig({ by: by as SortConfig['by'], direction: dir as SortConfig['direction'] });
          }}
          className="px-3 py-2 bg-white border border-outline-variant rounded-lg text-body-sm cursor-pointer outline-none focus:ring-2 ring-primary"
        >
          <option value="due_date-asc">Due Date ↑</option>
          <option value="due_date-desc">Due Date ↓</option>
          <option value="priority-asc">Priority ↑</option>
          <option value="priority-desc">Priority ↓</option>
          <option value="created_at-desc">Newest First</option>
          <option value="title-asc">A → Z</option>
        </select>
      </div>

      {/* Quick Filter Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {quickFilters.map(f => (
          <button
            key={f.key}
            onClick={() => setQuickFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-body-sm font-medium transition-all cursor-pointer ${
              quickFilter === f.key
                ? 'bg-primary text-on-primary'
                : 'bg-white text-on-surface-variant border border-outline-variant hover:bg-surface-container-low'
            }`}
          >
            {f.label}{f.count !== undefined ? ` (${f.count})` : ''}
          </button>
        ))}
        <button
          onClick={() => setShowMoreFilters(!showMoreFilters)}
          className="px-3 py-1.5 rounded-lg text-body-sm font-medium bg-white text-on-surface-variant border border-outline-variant hover:bg-surface-container-low cursor-pointer flex items-center gap-1"
        >
          <Filter size={14} /> More
        </button>
      </div>

      {/* More Filters */}
      {showMoreFilters && (
        <div className="flex flex-wrap gap-2 p-3 bg-white border border-outline-variant rounded-lg animate-fade-in">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TaskStatus | '')}
            className="px-3 py-1.5 border border-outline-variant rounded-lg text-body-sm bg-white cursor-pointer outline-none"
          >
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          {DEFAULT_CATEGORIES.filter(c => !quickFilters.some(q => q.key === c)).map(c => (
            <button
              key={c}
              onClick={() => setQuickFilter(quickFilter === c ? 'all' : c)}
              className={`px-3 py-1.5 rounded-lg text-body-sm font-medium transition-all cursor-pointer ${
                quickFilter === c
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Task List */}
      <div className="bg-white rounded-xl border border-surface-container-highest divide-y divide-surface-container-highest">
        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <CheckSquare size={40} className="mx-auto text-outline-variant mb-3" />
            <p className="text-body-md text-on-surface-variant">No tasks found</p>
            <p className="text-body-sm text-outline mt-1">Try adjusting your filters or create a new task</p>
          </div>
        )}
        {filteredTasks.map(task => (
          <div
            key={task.id}
            className={`flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors group ${
              task.status === 'completed' ? 'opacity-50' : ''
            }`}
          >
            <input
              type="checkbox"
              checked={task.status === 'completed'}
              onChange={() => toggleTask(task.id)}
              className={`w-4.5 h-4.5 rounded cursor-pointer shrink-0 ${
                task.priority === 'urgent' || task.priority === 'high'
                  ? 'border-danger text-danger focus:ring-danger'
                  : 'border-primary text-primary focus:ring-primary'
              }`}
            />
            <div className="flex-1 min-w-0">
              <p className={`text-body-md font-medium text-on-surface truncate ${task.status === 'completed' ? 'line-through' : ''}`}>
                {task.title}
              </p>
              <div className="flex gap-1.5 mt-0.5 flex-wrap">
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${PRIORITY_CONFIG[task.priority]?.bg || ''} ${PRIORITY_CONFIG[task.priority]?.color || ''}`}>
                  {PRIORITY_CONFIG[task.priority]?.label}
                </span>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${CATEGORY_COLORS[task.category]?.bg || 'bg-surface-container-high'} ${CATEGORY_COLORS[task.category]?.text || 'text-on-surface-variant'}`}>
                  {task.category}
                </span>
                {task.due_time && (
                  <span className="text-metadata text-outline flex items-center gap-0.5">
                    <Clock size={11} /> {formatTime(task.due_time)}
                  </span>
                )}
                {isOverdue(task.due_date) && task.status !== 'completed' && (
                  <span className="text-metadata text-danger font-medium">Overdue</span>
                )}
              </div>
            </div>
            <div className="hidden sm:block text-metadata text-outline shrink-0">
              {formatDate(task.due_date, 'MMM d')}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEditTask(task)} className="p-1 text-outline hover:text-primary cursor-pointer" title="Edit">
                <Edit2 size={15} />
              </button>
              <button onClick={() => confirmDelete(task.id)} className="p-1 text-outline hover:text-danger cursor-pointer" title="Delete">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
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
