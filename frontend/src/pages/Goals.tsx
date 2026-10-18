import { useState, useMemo } from 'react';
import { 
  Trophy, Plus, Filter, Calendar as CalendarIcon, CheckCircle2, 
  Circle, Edit2, Trash2, X, ChevronDown, Check, MoreVertical 
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { Goal, Milestone, DEFAULT_CATEGORIES } from '../types';
import { formatDate } from '../utils/dateUtils';
import toast from 'react-hot-toast';

type GoalFilter = 'all' | 'in-progress' | 'achieved';

export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal, toggleMilestone } = useAppData();
  const [filter, setFilter] = useState<GoalFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Career');
  const [targetDate, setTargetDate] = useState('');
  const [milestones, setMilestones] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newMilestoneText, setNewMilestoneText] = useState('');

  // Dropdown menus
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Filtered goals
  const filteredGoals = useMemo(() => {
    return goals.filter(g => {
      if (filter !== 'all' && g.status !== filter) return false;
      if (categoryFilter !== 'all' && g.category !== categoryFilter) return false;
      return true;
    });
  }, [goals, filter, categoryFilter]);

  const openCreateModal = () => {
    setEditingGoal(null);
    setTitle('');
    setDescription('');
    setCategory('Career');
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    setTargetDate(d.toISOString().split('T')[0]);
    setMilestones([
      { id: 'm-1', title: 'Phase 1: Planning and Research', completed: false },
      { id: 'm-2', title: 'Phase 2: Core Execution', completed: false },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setDescription(goal.description);
    setCategory(goal.category);
    setTargetDate(goal.target_date);
    setMilestones([...goal.milestones]);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleAddMilestone = () => {
    if (!newMilestoneText.trim()) return;
    setMilestones(prev => [
      ...prev,
      { id: `m-${Date.now()}`, title: newMilestoneText.trim(), completed: false }
    ]);
    setNewMilestoneText('');
  };

  const handleRemoveMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (editingGoal) {
      updateGoal(editingGoal.id, {
        title: title.trim(),
        description: description.trim(),
        category,
        target_date: targetDate,
        milestones,
      });
      toast.success('Goal updated');
    } else {
      addGoal({
        title: title.trim(),
        description: description.trim(),
        category,
        target_date: targetDate,
        status: 'in-progress',
        milestones,
      });
    }
    setIsModalOpen(false);
  };

  const toggleStatus = (goal: Goal) => {
    const nextStatus = goal.status === 'achieved' ? 'in-progress' : 'achieved';
    updateGoal(goal.id, { status: nextStatus });
    toast.success(nextStatus === 'achieved' ? 'Goal achieved! 🎉' : 'Goal moved to In Progress');
    setActiveMenuId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-border shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <Trophy size={20} className="text-gold" />
            Strategic Goals & Milestones
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Track measurable outcomes, milestones, and high-impact quarterly objectives
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-xs shrink-0"
        >
          <Plus size={14} />
          + Add New Goal
        </button>
      </div>

      {/* Filter and Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-border shadow-xs text-xs">
        {/* Status Filters */}
        <div className="flex items-center gap-1 bg-background p-1 rounded-lg border border-border">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded font-medium transition-colors cursor-pointer ${
              filter === 'all' ? 'bg-primary text-white shadow-2xs' : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            All Goals ({goals.length})
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`px-3 py-1.5 rounded font-medium transition-colors cursor-pointer ${
              filter === 'in-progress' ? 'bg-primary text-white shadow-2xs' : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            In Progress ({goals.filter(g => g.status === 'in-progress').length})
          </button>
          <button
            onClick={() => setFilter('achieved')}
            className={`px-3 py-1.5 rounded font-medium transition-colors cursor-pointer ${
              filter === 'achieved' ? 'bg-primary text-white shadow-2xs' : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Achieved ({goals.filter(g => g.status === 'achieved').length})
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <span className="text-on-surface-variant font-medium flex items-center gap-1">
            <Filter size={13} /> Category:
          </span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-border bg-white text-on-surface font-medium focus:outline-none focus:border-primary"
          >
            <option value="all">All Categories</option>
            {DEFAULT_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 2-Column Goals Grid matching reference */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredGoals.map(goal => {
          const totalMilestones = goal.milestones.length;
          const completedMilestones = goal.milestones.filter(m => m.completed).length;
          const progress = totalMilestones > 0 
            ? Math.round((completedMilestones / totalMilestones) * 100) 
            : (goal.status === 'achieved' ? 100 : 0);

          return (
            <div
              key={goal.id}
              className={`bg-white rounded-xl border border-border p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-sm relative ${
                goal.status === 'achieved' ? 'border-l-4 border-l-success' : 'border-l-4 border-l-primary'
              }`}
            >
              <div>
                {/* Header: Category Badge & Menu */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface-container text-primary">
                      {goal.category}
                    </span>
                    {goal.status === 'achieved' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-success-light text-success flex items-center gap-1">
                        <Check size={11} strokeWidth={3} /> Achieved
                      </span>
                    )}
                  </div>

                  {/* Goal Dropdown Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === goal.id ? null : goal.id)}
                      className="p-1 text-on-surface-variant hover:text-primary rounded cursor-pointer"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {activeMenuId === goal.id && (
                      <div className="absolute right-0 top-6 bg-white border border-border rounded-lg shadow-lg py-1 w-36 z-20 text-xs">
                        <button
                          onClick={() => toggleStatus(goal)}
                          className="w-full text-left px-3 py-1.5 hover:bg-surface-container cursor-pointer text-on-surface"
                        >
                          Mark {goal.status === 'achieved' ? 'In Progress' : 'Achieved'}
                        </button>
                        <button
                          onClick={() => openEditModal(goal)}
                          className="w-full text-left px-3 py-1.5 hover:bg-surface-container cursor-pointer text-on-surface"
                        >
                          Edit Goal
                        </button>
                        <button
                          onClick={() => {
                            deleteGoal(goal.id);
                            setActiveMenuId(null);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 cursor-pointer"
                        >
                          Delete Goal
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Goal Title & Description */}
                <h3 className="text-sm font-bold text-primary mb-1">{goal.title}</h3>
                {goal.description && (
                  <p className="text-xs text-on-surface-variant mb-3 line-clamp-2">{goal.description}</p>
                )}

                {/* Target Date */}
                <div className="flex items-center gap-1 text-[11px] text-secondary-text mb-3">
                  <CalendarIcon size={12} className="text-gold" />
                  <span>Target: {formatDate(goal.target_date)}</span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center text-xs font-semibold mb-1">
                    <span className="text-on-surface-variant text-[11px]">Progress</span>
                    <span className="text-primary">{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        progress === 100 ? 'bg-success' : 'bg-primary'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Milestones Checklist */}
                <div>
                  <h4 className="text-[11px] font-bold text-on-surface uppercase tracking-wider mb-2">
                    Milestones ({completedMilestones}/{totalMilestones})
                  </h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {goal.milestones.map(m => (
                      <div
                        key={m.id}
                        onClick={() => toggleMilestone(goal.id, m.id)}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-container/60 transition-colors cursor-pointer text-xs"
                      >
                        {m.completed ? (
                          <CheckCircle2 size={14} className="text-success shrink-0" />
                        ) : (
                          <Circle size={14} className="text-gray-400 shrink-0" />
                        )}
                        <span className={`text-xs ${m.completed ? 'line-through text-gray-400' : 'text-on-surface'}`}>
                          {m.title}
                        </span>
                      </div>
                    ))}
                    {goal.milestones.length === 0 && (
                      <p className="text-[11px] text-gray-400 italic">No milestones defined.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredGoals.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-border p-8">
            <Trophy size={32} className="mx-auto text-gray-300 mb-2" />
            <h3 className="text-sm font-bold text-primary">No Goals Found</h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Start by creating your first ambitious goal and milestone checklist.
            </p>
            <button
              onClick={openCreateModal}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-xs font-medium cursor-pointer"
            >
              + Create Goal
            </button>
          </div>
        )}
      </div>

      {/* Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-border shadow-lg w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-background">
              <h3 className="text-sm font-bold text-primary">
                {editingGoal ? 'Edit Goal' : 'Create New Goal'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[85vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Goal Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master Full-Stack Architecture"
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe what achieving this goal looks like..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border focus:outline-none focus:border-primary bg-white"
                  >
                    {DEFAULT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Target Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Milestones editor */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Milestone Roadmap ({milestones.length})
                </label>
                <div className="space-y-1.5 mb-2">
                  {milestones.map((m, idx) => (
                    <div key={m.id} className="flex items-center gap-2 bg-background p-2 rounded-lg border border-border">
                      <span className="text-[10px] font-bold text-secondary-text w-4">{idx + 1}.</span>
                      <span className="text-xs text-on-surface flex-1">{m.title}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMilestone(m.id)}
                        className="text-gray-400 hover:text-red-500 cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMilestoneText}
                    onChange={(e) => setNewMilestoneText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddMilestone();
                      }
                    }}
                    placeholder="+ Add milestone step..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-border focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={handleAddMilestone}
                    className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high rounded-lg text-xs font-semibold text-primary cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors cursor-pointer shadow-xs"
                >
                  {editingGoal ? 'Save Changes' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
