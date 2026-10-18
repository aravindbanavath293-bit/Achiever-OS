import { useState, useMemo } from 'react';
import { Search, Filter, MoreVertical, Plus, Calendar as CalendarIcon, Check, Flame } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { formatDate, getTodayISO } from '../utils/dateUtils';
import type { Task } from '../types';
import { PRIORITY_COLORS } from '../types';
import TaskModal from '../components/shared/TaskModal';

type FilterType = 'all' | 'today' | 'high' | 'work';
type SortType = 'deadline' | 'priority' | 'created';

export default function Tasks() {
  const { tasks, toggleComplete, deleteTask } = useTasks();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('deadline');
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const today = getTodayISO();

  // Filter and sort logic
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }

    // Pills
    if (activeFilter === 'today') {
      result = result.filter(t => t.dueDate === today);
    } else if (activeFilter === 'high') {
      result = result.filter(t => t.priority === 'high');
    } else if (activeFilter === 'work') {
      result = result.filter(t => t.category.toLowerCase() === 'work');
    }

    // Sort (completed always at bottom)
    result.sort((a, b) => {
      if (a.status !== b.status) return a.status === 'completed' ? 1 : -1;
      
      if (sortBy === 'deadline') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortBy === 'priority') {
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.priority] - order[b.priority];
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Newest first
      }
    });

    return result;
  }, [tasks, searchQuery, activeFilter, sortBy, today]);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
    setActiveDropdown(null);
  };

  const handleCreate = () => {
    setEditingTask(undefined);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(id);
    }
    setActiveDropdown(null);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8 h-full flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-display font-bold text-on-surface">Tasks</h1>
        
        <div className="relative w-full md:w-auto md:min-w-[320px]">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-surface-container rounded-full border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface placeholder:text-outline"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <button className="shrink-0 flex items-center gap-2 px-4 py-2 bg-surface-container-high rounded-full font-medium text-sm text-on-surface hover:bg-surface-variant transition-colors border border-outline-variant">
          <Filter size={16} /> Filter
        </button>
        <div className="w-px h-6 bg-outline-variant shrink-0" />
        
        <FilterPill label="All Tasks" active={activeFilter === 'all'} onClick={() => setActiveFilter('all')} />
        <FilterPill label="Today" active={activeFilter === 'today'} onClick={() => setActiveFilter('today')} />
        <FilterPill label="High Priority" active={activeFilter === 'high'} onClick={() => setActiveFilter('high')} />
        <FilterPill label="Work" active={activeFilter === 'work'} onClick={() => setActiveFilter('work')} />
        
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortType)}
          className="ml-auto bg-transparent text-sm font-medium text-on-surface-variant outline-none cursor-pointer"
        >
          <option value="deadline">Sort by Deadline</option>
          <option value="priority">Sort by Priority</option>
          <option value="created">Sort by Newest</option>
        </select>
      </div>

      {/* Task List */}
      <div className="flex-1 bg-transparent rounded-none border-none">
        {filteredTasks.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-on-surface-variant border-2 border-dashed border-outline-variant rounded-2xl bg-surface-container-lowest">
            <p className="mb-4">No tasks found matching your criteria.</p>
            <button onClick={handleCreate} className="text-primary font-medium flex items-center gap-2 hover:underline">
              <Plus size={16} /> Create a task
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map(task => (
              <div 
                key={task.id} 
                className={`group flex items-start gap-4 p-4 md:p-5 bg-surface-container-lowest border rounded-xl transition-all shadow-sm hover:shadow-md ${
                  task.status === 'completed' 
                    ? 'border-outline-variant opacity-70 bg-surface-container-lowest/50' 
                    : 'border-outline-variant hover:border-primary/50'
                }`}
              >
                {/* Checkbox */}
                <button 
                  onClick={() => toggleComplete(task.id)}
                  className={`shrink-0 mt-0.5 rounded transition-colors cursor-pointer flex items-center justify-center w-6 h-6 border-2 ${
                    task.status === 'completed' 
                      ? 'bg-primary border-primary text-on-primary' 
                      : 'border-outline hover:border-primary text-transparent'
                  }`}
                >
                  <Check size={16} strokeWidth={3} className={task.status === 'completed' ? 'opacity-100' : 'opacity-0'} />
                </button>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-[16px] font-medium mb-1.5 transition-all ${
                    task.status === 'completed' ? 'text-on-surface-variant line-through' : 'text-on-surface'
                  }`}>
                    {task.title}
                  </p>
                  
                  {task.description && (
                    <p className="text-sm text-on-surface-variant mb-3 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-3 text-[12px] font-medium">
                    <span className={`px-2 py-0.5 rounded flex items-center gap-1 ${PRIORITY_COLORS[task.priority].bg} ${PRIORITY_COLORS[task.priority].text}`}>
                      <Flame size={12} className={task.priority === 'high' ? 'opacity-100' : 'opacity-70'} />
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                    
                    <span className={`flex items-center gap-1 ${task.dueDate < today && task.status !== 'completed' ? 'text-error font-bold' : 'text-on-surface-variant'}`}>
                      <CalendarIcon size={12} />
                      {formatDate(task.dueDate)}
                    </span>
                    
                    <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                      {task.category}
                    </span>
                  </div>
                </div>

                {/* Actions Menu */}
                <div className="relative shrink-0">
                  <button 
                    onClick={() => setActiveDropdown(activeDropdown === task.id ? null : task.id)}
                    className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
                  >
                    <MoreVertical size={20} />
                  </button>
                  
                  {activeDropdown === task.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                      <div className="absolute right-0 top-10 w-44 bg-surface-container-highest rounded-xl shadow-lg border border-outline-variant overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                        <button 
                          onClick={() => handleEdit(task)}
                          className="w-full text-left px-4 py-2.5 text-sm text-on-surface hover:bg-surface-variant transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => { toggleComplete(task.id); setActiveDropdown(null); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-on-surface hover:bg-surface-variant transition-colors"
                        >
                          {task.status === 'completed' ? 'Mark Incomplete' : 'Mark Complete'}
                        </button>
                        <button 
                          onClick={() => handleDelete(task.id)}
                          className="w-full text-left px-4 py-2.5 text-sm text-error hover:bg-error-container hover:text-on-error-container transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <TaskModal onClose={() => setIsModalOpen(false)} editTask={editingTask} />
      )}
    </div>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-4 py-2 rounded-full font-medium text-sm transition-all border ${
        active 
          ? 'bg-primary border-primary text-on-primary' 
          : 'bg-transparent border-outline-variant text-on-surface-variant hover:bg-surface-container'
      }`}
    >
      {label}
    </button>
  );
}
