import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, Check, Sparkles, Calendar, Clock, Flag, Tag, CheckSquare } from 'lucide-react';
import { Task, Priority, TaskStatus, DEFAULT_CATEGORIES, Subtask, PRIORITY_CONFIG } from '../../types';
import { getTodayISO } from '../../utils/dateUtils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  task?: Task | null;
  mode?: 'create' | 'edit';
}

const PRIORITIES: { value: Priority; label: string; badge: string }[] = [
  { value: 'low', label: 'Low', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'medium', label: 'Medium', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'high', label: 'High', badge: 'bg-orange-50 text-orange-700 border-orange-200' },
  { value: 'urgent', label: 'Urgent', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
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

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-scale-in border border-slate-200 overflow-hidden">
        {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center text-white">
                <CheckSquare size={16} />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                {mode === 'edit' ? 'Edit Task Details' : 'Create New Task'}
              </h2>
            </div>
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-6 space-y-4 overflow-y-auto flex-1 scrollbar-hide">
              {/* Title */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Task Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What outcome needs to be achieved?"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs md:text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all bg-white font-medium"
                  required
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Description / Notes</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add context, links, or specific acceptance criteria..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs md:text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none bg-white font-normal"
                />
              </div>

              {/* Row: Category + Priority */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-500 outline-none bg-white cursor-pointer"
                  >
                    {DEFAULT_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-500 outline-none bg-white cursor-pointer capitalize"
                  >
                    {PRIORITIES.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row: Due Date + Time */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-500 outline-none bg-white cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Due Time (Optional)</label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-500 outline-none bg-white cursor-pointer"
                  />
                </div>
              </div>

              {/* Estimated Duration */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Estimated Focus Duration (minutes)</label>
                <input
                  type="number"
                  value={estimatedMinutes || ''}
                  onChange={(e) => setEstimatedMinutes(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="e.g. 45"
                  min={1}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-500 outline-none bg-white"
                />
              </div>

              {/* Status (edit mode) */}
              {mode === 'edit' && (
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-500 outline-none bg-white cursor-pointer capitalize"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              )}

              {/* Subtasks */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5">Checklist / Subtasks</label>
                <div className="space-y-1.5 mb-2">
                  {subtasks.map((st) => (
                    <div key={st.id} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <button
                        type="button"
                        onClick={() => setSubtasks(prev => prev.map(s => s.id === st.id ? { ...s, completed: !s.completed } : s))}
                        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 cursor-pointer ${
                          st.completed ? 'bg-emerald-500 text-white' : 'border border-slate-300 bg-white'
                        }`}
                      >
                        {st.completed && <Check size={10} strokeWidth={3} />}
                      </button>
                      <span className={`flex-1 font-medium ${st.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {st.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSubtasks(prev => prev.filter(s => s.id !== st.id))}
                        className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                      >
                        <Trash2 size={13} />
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
                    placeholder="+ Add subtask item..."
                    className="flex-1 px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs focus:border-indigo-500 outline-none bg-white"
                  />
                  <button 
                    type="button" 
                    onClick={addSubtask} 
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5">Tags</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {tags.map(t => (
                    <span key={t} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-[11px] font-bold">
                      #{t}
                      <button type="button" onClick={() => setTags(prev => prev.filter(x => x !== t))} className="hover:text-rose-600 cursor-pointer ml-0.5">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    placeholder="Add tag and press Enter..."
                    className="flex-1 px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs focus:border-indigo-500 outline-none bg-white"
                  />
                  <button 
                    type="button" 
                    onClick={addTag} 
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Actions - Sticky Footer */}
            <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-slate-50/70 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 gradient-primary hover:gradient-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                {mode === 'edit' ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    );
  }
