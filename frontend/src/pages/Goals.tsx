import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Trophy, Plus, Filter, Calendar as CalendarIcon, CheckCircle2, 
  Circle, Edit2, Trash2, X, ChevronDown, Check, MoreVertical, Target, Sparkles, Award
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { Goal, Milestone, DEFAULT_CATEGORIES, CATEGORY_COLORS } from '../types';
import { formatDate } from '../utils/dateUtils';
import toast from 'react-hot-toast';
import { BentoGrid, MetricCard, BentoProgress } from '../components/bento/Bento';

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
      toast.success('New goal created!');
    }
    setIsModalOpen(false);
  };

  const toggleStatus = (goal: Goal) => {
    const nextStatus = goal.status === 'achieved' ? 'in-progress' : 'achieved';
    updateGoal(goal.id, { status: nextStatus });
    toast.success(nextStatus === 'achieved' ? 'Goal achieved! 🎉' : 'Goal moved to In Progress');
    setActiveMenuId(null);
  };

  // Metrics summary
  const inProgressCount = goals.filter(g => g.status === 'in-progress').length;
  const achievedCount = goals.filter(g => g.status === 'achieved').length;
  const successRate = goals.length > 0 ? Math.round((achievedCount / goals.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 md:p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
            <Trophy size={22} className="text-amber-500" />
            Strategic Goals & Milestones
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Track measurable outcomes, roadmap milestones, and quarterly high-impact achievements
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2.5 gradient-primary hover:gradient-primary-hover text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm shadow-indigo-500/25 hover:shadow-md shrink-0"
        >
          <Plus size={16} />
          <span>+ Add New Goal</span>
        </button>
      </div>

      {/* KPI Metric Overview */}
      <BentoGrid>
        <MetricCard label="Total goals" value={goals.length} icon={Target} tone="indigo" />
        <MetricCard label="In progress" value={inProgressCount} valueClassName="text-indigo-600" icon={Sparkles} tone="violet" />
        <MetricCard label="Achieved" value={achievedCount} valueClassName="text-emerald-600" icon={Award} tone="emerald" />
        <MetricCard
          label="Success rate"
          value={`${successRate}%`}
          valueClassName="text-amber-600"
          hint={<BentoProgress value={successRate} label="Goal success rate" className="mt-2" />}
          icon={Trophy}
          tone="amber"
        />
      </BentoGrid>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 md:p-3.5 rounded-2xl border border-slate-200/90 shadow-xs text-xs">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filter === 'all' ? 'gradient-primary text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Goals ({goals.length})
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filter === 'in-progress' ? 'gradient-primary text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            In Progress ({inProgressCount})
          </button>
          <button
            onClick={() => setFilter('achieved')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filter === 'achieved' ? 'gradient-primary text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Achieved ({achievedCount})
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-bold flex items-center gap-1">
            <Filter size={13} /> Category:
          </span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Categories</option>
            {DEFAULT_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 2-Column Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredGoals.map(goal => {
          const totalMilestones = goal.milestones.length;
          const completedMilestones = goal.milestones.filter(m => m.completed).length;
          const progress = totalMilestones > 0 
            ? Math.round((completedMilestones / totalMilestones) * 100) 
            : (goal.status === 'achieved' ? 100 : 0);
          const categoryStyle = CATEGORY_COLORS[goal.category] || CATEGORY_COLORS.Other;

          return (
            <div
              key={goal.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm flex flex-col justify-between transition-all hover:shadow-md relative ${
                goal.status === 'achieved' 
                  ? 'border-emerald-200 border-l-[5px] border-l-emerald-500' 
                  : 'border-slate-200/90 border-l-[5px] border-l-indigo-600'
              }`}
            >
              <div>
                {/* Header: Category Badge & Menu */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}>
                      {goal.category}
                    </span>
                    {goal.status === 'achieved' && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <Check size={11} strokeWidth={3} /> Achieved
                      </span>
                    )}
                  </div>

                  {/* Goal Dropdown Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === goal.id ? null : goal.id)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {activeMenuId === goal.id && (
                      <div className="absolute right-0 top-7 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 w-40 z-20 text-xs animate-scale-in">
                        <button
                          onClick={() => toggleStatus(goal)}
                          className="w-full text-left px-3.5 py-2 hover:bg-indigo-50 hover:text-indigo-600 font-medium cursor-pointer text-slate-700"
                        >
                          Mark {goal.status === 'achieved' ? 'In Progress' : 'Achieved'}
                        </button>
                        <button
                          onClick={() => openEditModal(goal)}
                          className="w-full text-left px-3.5 py-2 hover:bg-slate-100 font-medium cursor-pointer text-slate-700"
                        >
                          Edit Goal
                        </button>
                        <button
                          onClick={() => {
                            deleteGoal(goal.id);
                            setActiveMenuId(null);
                            toast.success('Goal deleted');
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 font-medium cursor-pointer"
                        >
                          Delete Goal
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Goal Title & Description */}
                <h3 className="text-base font-extrabold text-slate-900 mb-1 leading-snug">{goal.title}</h3>
                {goal.description && (
                  <p className="text-xs text-slate-500 mb-3.5 line-clamp-2 leading-relaxed">{goal.description}</p>
                )}

                {/* Target Date */}
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-3.5">
                  <CalendarIcon size={13} className="text-amber-500" />
                  <span>Target: {formatDate(goal.target_date)}</span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                    <span className="text-slate-500 text-[11px] uppercase tracking-wider">Milestone Progress</span>
                    <span className="text-indigo-600 font-black">{progress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        progress === 100 
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                          : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Milestones Checklist */}
                <div>
                  <h4 className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2.5">
                    Roadmap Milestones ({completedMilestones}/{totalMilestones})
                  </h4>
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1 scrollbar-hide">
                    {goal.milestones.map(m => (
                      <div
                        key={m.id}
                        onClick={() => toggleMilestone(goal.id, m.id)}
                        className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-xs"
                      >
                        <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${
                          m.completed ? 'bg-emerald-500 text-white' : 'border-2 border-slate-300'
                        }`}>
                          {m.completed && <Check size={11} strokeWidth={3} />}
                        </div>
                        <span className={`text-xs font-medium ${m.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {m.title}
                        </span>
                      </div>
                    ))}
                    {goal.milestones.length === 0 && (
                      <p className="text-xs text-slate-400 italic py-1">No milestones defined yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredGoals.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200 p-8 shadow-xs">
            <Trophy size={42} className="mx-auto text-amber-300 mb-3" />
            <h3 className="text-base font-bold text-slate-900">No Goals Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Start by creating your ambitious goal and break it down into achievable milestones.
            </p>
            <button
              onClick={openCreateModal}
              className="mt-4 px-5 py-2.5 gradient-primary hover:gradient-primary-hover text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              + Create Your First Goal
            </button>
          </div>
        )}
      </div>

      {/* Goal Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
              <h3 className="text-sm font-bold text-slate-900">
                {editingGoal ? 'Edit Goal Details' : 'Create New Goal'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Goal Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master Full-Stack Architecture"
                  required
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe what achieving this outcome unlocks..."
                  rows={2}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    {DEFAULT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Target Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Milestones editor */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Milestone Roadmap Steps ({milestones.length})
                </label>
                <div className="space-y-1.5 mb-2">
                  {milestones.map((m, idx) => (
                    <div key={m.id} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[11px] font-bold text-indigo-600 w-5">{idx + 1}.</span>
                      <span className="text-xs text-slate-800 font-medium flex-1">{m.title}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMilestone(m.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
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
                    className="flex-1 px-3.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddMilestone}
                    className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-xl text-xs font-bold text-indigo-700 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold gradient-primary hover:gradient-primary-hover text-white rounded-xl shadow-xs cursor-pointer"
                >
                  {editingGoal ? 'Save Changes' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
