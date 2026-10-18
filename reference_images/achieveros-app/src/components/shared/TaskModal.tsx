import { useState } from 'react';
import type { Task, Priority } from '../../types';
import { useTasks } from '../../context/TaskContext';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import { getTodayISO } from '../../utils/dateUtils';
import { DEFAULT_CATEGORIES } from '../../types';

interface TaskModalProps {
  onClose: () => void;
  editTask?: Task;
  onCreated?: (task: Task) => void | Promise<void>;
}

export default function TaskModal({ onClose, editTask, onCreated }: TaskModalProps) {
  const { createTask, updateTask } = useTasks();
  const isEditing = !!editTask;

  const [title, setTitle] = useState(editTask?.title || '');
  const [description, setDescription] = useState(editTask?.description || '');
  const [category, setCategory] = useState(editTask?.category || 'Work');
  const [priority, setPriority] = useState<Priority>(editTask?.priority || 'medium');
  const [dueDate, setDueDate] = useState(editTask?.dueDate || getTodayISO());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateTask(editTask.id, {
          title,
          description,
          category,
          priority,
          dueDate,
        });
      } else {
        const newTask = await createTask({
          title,
          description,
          category,
          priority,
          status: 'pending',
          dueDate,
        });
        if (onCreated) {
          await onCreated(newTask);
        }
      }
      onClose();
    } catch (error) {
      console.error('Failed to save task', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest dark:bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-xl border border-outline-variant overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
          <h2 className="text-[20px] leading-[28px] font-bold text-on-surface">
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-[14px] font-medium text-on-surface">
              Task Title <span className="text-error">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Complete quarterly review"
              className="w-full px-4 py-2.5 bg-surface-container rounded-lg border-none outline-none focus:ring-2 focus:ring-primary text-on-surface transition-all placeholder:text-outline"
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-[14px] font-medium text-on-surface">
              Description <span className="text-outline font-normal">(Optional)</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details about this task..."
              rows={3}
              className="w-full px-4 py-2.5 bg-surface-container rounded-lg border-none outline-none focus:ring-2 focus:ring-primary text-on-surface transition-all resize-none placeholder:text-outline"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div className="space-y-2">
              <label htmlFor="category" className="block text-[14px] font-medium text-on-surface">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-container rounded-lg border-none outline-none focus:ring-2 focus:ring-primary text-on-surface cursor-pointer"
              >
                {DEFAULT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <label htmlFor="dueDate" className="block text-[14px] font-medium text-on-surface">
                Due Date
              </label>
              <div className="relative">
                <input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 pl-11 bg-surface-container rounded-lg border-none outline-none focus:ring-2 focus:ring-primary text-on-surface cursor-pointer"
                  required
                />
                <CalendarIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-3">
            <label className="block text-[14px] font-medium text-on-surface">
              Priority
            </label>
            <div className="flex gap-3">
              {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm capitalize border transition-all cursor-pointer ${
                    priority === p
                      ? p === 'high' ? 'bg-error-container text-on-error-container border-error-container'
                      : p === 'medium' ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-900/50'
                      : 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-900/50'
                      : 'bg-transparent border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-outline-variant flex justify-end gap-3 bg-surface-container-lowest">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim()}
            className="px-6 py-2 bg-primary text-on-primary rounded-lg font-medium hover:bg-surface-tint transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Task'}
          </button>
        </div>

      </div>
    </div>
  );
}
