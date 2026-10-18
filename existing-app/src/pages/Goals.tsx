import { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { goalService } from '../services/goalService';
import { Filter, Plus, MoreVertical, Calendar as CalendarIcon, Check, Trash2 } from 'lucide-react';
import type { Goal } from '../types';
import { formatDate } from '../utils/dateUtils';
import { CATEGORY_COLORS } from '../types';
import TaskModal from '../components/shared/TaskModal';

type FilterType = 'all' | 'in-progress' | 'achieved';

export default function Goals() {
  const [goals, setGoals] = useState<(Goal & { progress: number })[]>([]);
  const { tasks, toggleComplete, deleteTask, refresh: refreshTasks } = useTasks();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  
  // Modal state
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);
  const [linkedGoalId, setLinkedGoalId] = useState<string | undefined>(undefined);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    loadGoals();
  }, [tasks]);

  const loadGoals = async () => {
    const data = await goalService.getGoalsWithProgress();
    setGoals(data);
  };

  const filteredGoals = goals.filter(g => {
    if (activeFilter === 'all') return true;
    return g.status === activeFilter;
  });

  const toggleExpand = (id: string) => {
    const next = new Set(expandedGoals);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedGoals(next);
  };

  const getGoalTasks = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return [];
    return tasks.filter(t => goal.taskIds.includes(t.id));
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
    setActiveDropdown(null);
  };

  const handleCreateGoal = () => {
    setEditingGoal(undefined);
    setIsGoalModalOpen(true);
  };

  const handleDeleteGoal = async (id: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      await goalService.delete(id);
      await loadGoals();
    }
    setActiveDropdown(null);
  };

  const handleCreateTask = (goalId: string) => {
    setLinkedGoalId(goalId);
    setIsTaskModalOpen(true);
  };

  const handleDeleteMilestone = async (goalId: string, taskId: string) => {
    await goalService.unlinkTask(goalId, taskId);
    await deleteTask(taskId);
    await loadGoals();
  };

  const toggleGoalStatus = async (goal: Goal) => {
    const newStatus = goal.status === 'achieved' ? 'in-progress' : 'achieved';
    await goalService.update(goal.id, { status: newStatus });
    await loadGoals();
    setActiveDropdown(null);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8 h-full flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-display font-bold text-on-surface">Goals</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Track and manage your long-term objectives.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-surface-container rounded-lg font-medium text-sm text-on-surface hover:bg-surface-container-high transition-colors">
            <Filter size={16} /> Filter
          </button>
          <button 
            onClick={handleCreateGoal}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-medium text-sm hover:bg-surface-tint transition-colors shadow-sm cursor-pointer"
          >
            <Plus size={16} /> Add New Goal
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <FilterPill 
          label={`All Goals (${goals.length})`} 
          active={activeFilter === 'all'} 
          onClick={() => setActiveFilter('all')} 
        />
        <FilterPill 
          label={`In Progress (${goals.filter(g => g.status === 'in-progress').length})`} 
          active={activeFilter === 'in-progress'} 
          onClick={() => setActiveFilter('in-progress')} 
        />
        <FilterPill 
          label={`Achieved (${goals.filter(g => g.status === 'achieved').length})`} 
          active={activeFilter === 'achieved'} 
          onClick={() => setActiveFilter('achieved')} 
        />
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {filteredGoals.length === 0 ? (
          <div className="col-span-full py-12 text-center text-on-surface-variant border-2 border-dashed border-outline-variant rounded-2xl bg-surface-container-lowest">
            <p>No goals found matching your criteria.</p>
          </div>
        ) : (
          filteredGoals.map(goal => {
            const goalTasks = getGoalTasks(goal.id);
            const isExpanded = expandedGoals.has(goal.id);
            const isAchieved = goal.status === 'achieved';
            const catColors = CATEGORY_COLORS[goal.category] || CATEGORY_COLORS.Other;

            return (
              <div 
                key={goal.id} 
                className={`bg-surface-container-lowest border rounded-2xl transition-all shadow-sm flex overflow-hidden ${
                  isAchieved ? 'border-transparent bg-surface-container-lowest/50 opacity-80' : 'border-outline-variant'
                }`}
              >
                {/* Left accent bar */}
                <div className={`w-1.5 shrink-0 ${isAchieved ? 'bg-outline-variant' : 'bg-primary'}`} />
                
                <div className="p-6 flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold tracking-wider ${isAchieved ? 'bg-surface-container text-on-surface-variant' : `${catColors.bg} ${catColors.text}`}`}>
                        {goal.category}
                      </span>
                      {goal.targetDate && (
                        <span className="flex items-center gap-1 text-xs text-on-surface-variant font-medium">
                          <CalendarIcon size={12} />
                          {formatDate(goal.targetDate)}
                        </span>
                      )}
                      {isAchieved && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-on-primary bg-primary px-2 py-0.5 rounded-full">
                          <Check size={10} strokeWidth={4} /> Achieved
                        </span>
                      )}
                    </div>
                    
                    {/* Actions Menu */}
                    <div className="relative">
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === goal.id ? null : goal.id)}
                        className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded-full hover:bg-surface-container-high cursor-pointer"
                      >
                        <MoreVertical size={20} />
                      </button>
                      
                      {activeDropdown === goal.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                          <div className="absolute right-0 top-8 w-40 bg-surface-container-highest rounded-xl shadow-lg border border-outline-variant overflow-hidden z-20">
                            <button 
                              onClick={() => handleEditGoal(goal)}
                              className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-variant transition-colors"
                            >
                              Edit Goal
                            </button>
                            <button 
                              onClick={() => toggleGoalStatus(goal)}
                              className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-variant transition-colors"
                            >
                              Mark as {isAchieved ? 'In Progress' : 'Achieved'}
                            </button>
                            <button 
                              onClick={() => handleDeleteGoal(goal.id)}
                              className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error-container hover:text-on-error-container transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <h2 className={`text-[20px] leading-[28px] font-bold mb-4 ${isAchieved ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}>
                    {goal.title}
                  </h2>
                  
                  {/* Progress Bar */}
                  <div className="mb-5">
                    <div className="flex justify-between text-sm font-medium mb-1.5">
                      <span className="text-on-surface-variant">Progress</span>
                      <span className={isAchieved ? 'text-on-surface-variant' : 'text-primary'}>{goal.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${isAchieved ? 'bg-outline-variant' : 'bg-primary'}`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Milestones Accordion */}
                  <div className="border-t border-outline-variant/50 pt-4">
                    <button 
                      onClick={() => toggleExpand(goal.id)}
                      className="w-full flex justify-between items-center text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer group"
                    >
                      Key Milestones ({goalTasks.filter(t => t.status === 'completed').length}/{goalTasks.length})
                      <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                        <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <div className="mt-4 space-y-3">
                        {goalTasks.map(task => (
                          <div key={task.id} className="flex items-start gap-3 group/milestone">
                            <button 
                              onClick={() => toggleComplete(task.id)}
                              className={`shrink-0 mt-0.5 rounded transition-colors cursor-pointer flex items-center justify-center w-5 h-5 border ${
                                task.status === 'completed' 
                                  ? 'bg-primary border-primary text-on-primary' 
                                  : 'border-outline-variant hover:border-primary text-transparent'
                              }`}
                            >
                              <Check size={14} strokeWidth={3} className={task.status === 'completed' ? 'opacity-100' : 'opacity-0'} />
                            </button>
                            <span className={`flex-1 text-sm ${task.status === 'completed' ? 'text-on-surface-variant line-through' : 'text-on-surface font-medium'}`}>
                              {task.title}
                            </span>
                            <button
                              onClick={() => handleDeleteMilestone(goal.id, task.id)}
                              className="shrink-0 mt-0.5 w-6 h-6 rounded flex items-center justify-center text-on-surface-variant/70 hover:text-error hover:bg-error/10 transition-all cursor-pointer"
                              title="Delete milestone"
                            >
                              <Trash2 size={13} strokeWidth={2.5} />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => handleCreateTask(goal.id)}
                          className="w-full text-left py-2 text-sm font-medium text-primary hover:underline flex items-center gap-2"
                        >
                          <Plus size={16} /> Add Milestone
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isGoalModalOpen && (
        <GoalModal 
          onClose={() => setIsGoalModalOpen(false)} 
          onSave={loadGoals}
          editGoal={editingGoal} 
        />
      )}

      {isTaskModalOpen && linkedGoalId && (
        <TaskModal 
          onClose={() => {
            setIsTaskModalOpen(false);
            setLinkedGoalId(undefined);
          }} 
          onCreated={async (newTask) => {
            await goalService.linkTask(linkedGoalId, newTask.id);
            await refreshTasks();
            await loadGoals();
          }}
          editTask={undefined} // New task
        />
      )}
    </div>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-4 py-2 rounded-full font-bold text-sm transition-all border ${
        active 
          ? 'bg-surface-container border-outline-variant text-on-surface' 
          : 'bg-transparent border-transparent text-on-surface-variant hover:bg-surface-container hover:border-outline-variant/50'
      }`}
    >
      {label}
    </button>
  );
}

// Inline GoalModal component for brevity
function GoalModal({ onClose, onSave, editGoal }: { onClose: () => void, onSave: () => void, editGoal?: Goal }) {
  const [title, setTitle] = useState(editGoal?.title || '');
  const [description, setDescription] = useState(editGoal?.description || '');
  const [category, setCategory] = useState(editGoal?.category || 'Career');
  const [targetDate, setTargetDate] = useState(editGoal?.targetDate || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      if (editGoal) {
        await goalService.update(editGoal.id, { title, description, category, targetDate });
      } else {
        await goalService.create({ title, description, category, targetDate, taskIds: [], status: 'in-progress' });
      }
      onSave();
      onClose();
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-xl border border-outline-variant overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
          <h2 className="text-[20px] font-bold text-on-surface">
            {editGoal ? 'Edit Goal' : 'Create New Goal'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-on-surface">Goal Title <span className="text-error">*</span></label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2.5 bg-surface-container rounded-lg border-none outline-none focus:ring-2 focus:ring-primary" required autoFocus />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-on-surface">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-4 py-2.5 bg-surface-container rounded-lg border-none outline-none focus:ring-2 focus:ring-primary resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-on-surface">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2.5 bg-surface-container rounded-lg border-none outline-none focus:ring-2 focus:ring-primary cursor-pointer">
                {Object.keys(CATEGORY_COLORS).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-on-surface">Target Date</label>
              <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-full px-4 py-2.5 bg-surface-container rounded-lg border-none outline-none focus:ring-2 focus:ring-primary cursor-pointer" />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant mt-6 -mx-6 px-6 pb-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting || !title.trim()} className="px-6 py-2 bg-primary text-on-primary rounded-lg font-medium hover:bg-surface-tint disabled:opacity-50">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
