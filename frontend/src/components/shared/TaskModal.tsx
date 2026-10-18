import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Task, Priority, TaskStatus, DEFAULT_CATEGORIES, Subtask } from '../../types';
import { getTodayISO } from '../../utils/dateUtils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  task?: Task | null;
  mode?: 'create' | 'edit';
}

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-success' },
  { value: 'medium', label: 'Medium', color: 'bg-warning' },
  { value: 'high', label: 'High', color: 'bg-danger' },
  { value: 'urgent', label: 'Urgent', color: 'bg-error' },
];

export default function TaskModal({ isOpen, onClose, onSave, task, mode = 'create' }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('Work');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [dueDate, setDueDate] = useState(getTodayISO());
  const [dueTime, setDueTime] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | undefined>();
  const [isRecurring, setIsRecurring] = useState(false);
  const [goalId, setGoalId] = useState<string | undefined>();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [subtaskInput, setSubtaskInput] = useState('');

  useEffect(() => {
    if (task && mode === 'edit') {
      setTitle(task.title);
      setDescription(task.description);
      setCategory(task.category);
      setPriority(task.priority);
      setStatus(task.status);
      setDueDate(task.due_date);
      setDueTime(task.due_time || '');
      setEstimatedMinutes(task.estimated_minutes);
      setIsRecurring(task.is_recurring);
      setGoalId(task.goal_id);
      setTags(task.tags);
      setSubtasks(task.subtasks);
    } else {
      resetForm();
    }
  }, [task, mode, isOpen]);

  function resetForm() {
    setTitle(''); setDescription(''); setCategory('Work'); setPriority('medium');
    setStatus('todo'); setDueDate(getTodayISO()); setDueTime('');
    setEstimatedMinutes(undefined); setIsRecurring(false); setGoalId(undefined);
    setTags([]); setTagInput(''); setSubtasks([]); setSubtaskInput('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      category, priority, status,
      due_date: dueDate,
      due_time: dueTime || undefined,
      scheduled_time: dueTime || undefined,
      estimated_minutes: estimatedMinutes,
      is_recurring: isRecurring,
      goal_id: goalId,
      tags,
      subtasks,
    });
    resetForm();
    onClose();
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) { setTags(prev => [...prev, t]); setTagInput(''); }
  }

  function addSubtask() {
    const t = subtaskInput.trim();
    if (t) {
      setSubtasks(prev => [...prev, { id: `st-${Date.now()}`, title: t, completed: false }]);
      setSubtaskInput('');
    }
  }

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[88vh] flex flex-col animate-scale-in border border-border overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border shrink-0 bg-white">
            <h2 className="text-base sm:text-lg font-bold text-primary">{mode === 'edit' ? 'Edit Task' : 'Create New Task'}</h2>
            <button onClick={onClose} className="text-secondary-text hover:text-on-surface p-1 rounded-md transition-colors cursor-pointer">
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-5 space-y-3.5 overflow-y-auto flex-1">
            {/* Title */}
            <div>
              <label className="text-body-sm font-medium text-on-surface block mb-1">Task Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full px-3 py-2 border border-outline-variant rounded-lg text-body-md focus:ring-2 ring-primary outline-none transition-all bg-white"
                required
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-body-sm font-medium text-on-surface block mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details..."
                rows={2}
                className="w-full px-3 py-2 border border-outline-variant rounded-lg text-body-md focus:ring-2 ring-primary outline-none transition-all resize-none bg-white"
              />
            </div>

            {/* Row: Category + Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-body-sm font-medium text-on-surface block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg text-body-md focus:ring-2 ring-primary outline-none bg-white cursor-pointer"
                >
                  {DEFAULT_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-body-sm font-medium text-on-surface block mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg text-body-md focus:ring-2 ring-primary outline-none bg-white cursor-pointer"
                >
                  {PRIORITIES.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row: Due Date + Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-body-sm font-medium text-on-surface block mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg text-body-md focus:ring-2 ring-primary outline-none bg-white cursor-pointer"
                />
              </div>
              <div>
                <label className="text-body-sm font-medium text-on-surface block mb-1">Due Time</label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg text-body-md focus:ring-2 ring-primary outline-none bg-white cursor-pointer"
                />
              </div>
            </div>

            {/* Estimated Duration */}
            <div>
              <label className="text-body-sm font-medium text-on-surface block mb-1">Estimated Duration (minutes)</label>
              <input
                type="number"
                value={estimatedMinutes || ''}
                onChange={(e) => setEstimatedMinutes(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="e.g. 60"
                min={1}
                className="w-full px-3 py-2 border border-outline-variant rounded-lg text-body-md focus:ring-2 ring-primary outline-none bg-white"
              />
            </div>

            {/* Status (edit mode) */}
            {mode === 'edit' && (
              <div>
                <label className="text-body-sm font-medium text-on-surface block mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg text-body-md focus:ring-2 ring-primary outline-none bg-white cursor-pointer"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            )}

            {/* Subtasks */}
            <div>
              <label className="text-body-sm font-medium text-on-surface block mb-1">Subtasks</label>
              <div className="space-y-1.5 mb-2">
                {subtasks.map((st, i) => (
                  <div key={st.id} className="flex items-center gap-2 text-body-sm">
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => setSubtasks(prev => prev.map(s => s.id === st.id ? { ...s, completed: !s.completed } : s))}
                      className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className={st.completed ? 'line-through text-on-surface-variant' : 'text-on-surface'}>{st.title}</span>
                    <button
                      type="button"
                      onClick={() => setSubtasks(prev => prev.filter(s => s.id !== st.id))}
                      className="ml-auto text-on-surface-variant hover:text-danger cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={subtaskInput}
                  onChange={(e) => setSubtaskInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubtask(); } }}
                  placeholder="Add subtask..."
                  className="flex-1 px-3 py-1.5 border border-outline-variant rounded-lg text-body-sm focus:ring-2 ring-primary outline-none bg-white"
                />
                <button type="button" onClick={addSubtask} className="text-primary hover:text-primary-light cursor-pointer">
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="text-body-sm font-medium text-on-surface block mb-1">Tags</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map(t => (
                  <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-fixed text-on-primary-fixed rounded text-[11px] font-medium">
                    {t}
                    <button type="button" onClick={() => setTags(prev => prev.filter(x => x !== t))} className="hover:text-danger cursor-pointer">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  placeholder="Add tag..."
                  className="flex-1 px-3 py-1.5 border border-outline-variant rounded-lg text-body-sm focus:ring-2 ring-primary outline-none bg-white"
                />
                <button type="button" onClick={addTag} className="text-primary hover:text-primary-light cursor-pointer">
                  <Plus size={18} />
                </button>
              </div>
            </div>

            </div>

            {/* Actions - Sticky Footer */}
            <div className="flex items-center justify-end gap-2.5 px-5 py-3 border-t border-border bg-surface-container-low shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-semibold text-secondary-text hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                {mode === 'edit' ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
