import { useState, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, 
  Sparkles, Plus, AlertTriangle, CheckCircle2, Circle, Edit2, Trash2, X, Check,
  Target, BookOpen, CalendarDays, ListTodo
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { useAppData } from '../context/AppDataContext';
import { formatDate, getTodayISO, getDayOfWeek } from '../utils/dateUtils';
import { ScheduleEvent, PRIORITY_CONFIG, EVENT_COLORS } from '../types';
import toast from 'react-hot-toast';
import { eventCardStyle } from '../utils/colors';
import { BentoGrid, BentoCard, BentoCardHeader, MetricCard, BentoProgress } from '../components/bento/Bento';

export default function DailyPlanner() {
  const { tasks, events, addEvent, updateEvent, deleteEvent, toggleTask } = useAppData();
  const [selectedDate, setSelectedDate] = useState<string>(getTodayISO());
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [dailyNote, setDailyNote] = useState<string>(() => {
    return localStorage.getItem(`daily_note_${getTodayISO()}`) || '';
  });
  const [aiGenerating, setAiGenerating] = useState(false);

  // Form state
  const [eventTitle, setEventTitle] = useState('');
  const [eventCategory, setEventCategory] = useState('Work');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [eventColor, setEventColor] = useState('#4F46E5');

  // Navigate date
  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    const newDateStr = d.toISOString().split('T')[0];
    setSelectedDate(newDateStr);
    setDailyNote(localStorage.getItem(`daily_note_${newDateStr}`) || '');
  };

  const dayOfWeek = useMemo(() => getDayOfWeek(selectedDate), [selectedDate]);

  // Tasks for this date
  const dateTasks = useMemo(() => {
    return tasks.filter(t => t.due_date === selectedDate);
  }, [tasks, selectedDate]);

  // Top 3 priority tasks
  const topPriorities = useMemo(() => {
    const pending = dateTasks.filter(t => t.status !== 'completed');
    const order = { urgent: 0, high: 1, medium: 2, low: 3 };
    return [...pending].sort((a, b) => order[a.priority] - order[b.priority]).slice(0, 3);
  }, [dateTasks]);

  // Events for this day
  const dayEvents = useMemo(() => {
    return events
      .filter(e => e.day === dayOfWeek)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [events, dayOfWeek]);

  // Conflict detection
  const conflicts = useMemo(() => {
    const list: string[] = [];
    for (let i = 0; i < dayEvents.length; i++) {
      for (let j = i + 1; j < dayEvents.length; j++) {
        const e1 = dayEvents[i];
        const e2 = dayEvents[j];
        if (e1.start_time < e2.end_time && e2.start_time < e1.end_time) {
          list.push(`Overlap between "${e1.title}" (${e1.start_time}-${e1.end_time}) and "${e2.title}" (${e2.start_time}-${e2.end_time})`);
        }
      }
    }
    return list;
  }, [dayEvents]);

  // Save daily note
  const handleNoteChange = (text: string) => {
    setDailyNote(text);
    localStorage.setItem(`daily_note_${selectedDate}`, text);
  };

  // Open modal for new/edit event
  const openNewEventModal = (time?: string) => {
    setEditingEvent(null);
    setEventTitle('');
    setEventCategory('Work');
    setStartTime(time || '10:00');
    const [h, m] = (time || '10:00').split(':').map(Number);
    const endH = (h + 1).toString().padStart(2, '0');
    setEndTime(`${endH}:${m.toString().padStart(2, '0')}`);
    setEventColor('#4F46E5');
    setIsEventModalOpen(true);
  };

  const openEditEventModal = (ev: ScheduleEvent) => {
    setEditingEvent(ev);
    setEventTitle(ev.title);
    setEventCategory(ev.category);
    setStartTime(ev.start_time);
    setEndTime(ev.end_time);
    setEventColor(ev.color || '#4F46E5');
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) {
      toast.error('Title is required');
      return;
    }
    if (startTime >= endTime) {
      toast.error('End time must be after start time');
      return;
    }

    if (editingEvent) {
      updateEvent(editingEvent.id, {
        title: eventTitle.trim(),
        category: eventCategory,
        start_time: startTime,
        end_time: endTime,
        color: eventColor,
      });
      toast.success('Time block updated');
    } else {
      addEvent({
        title: eventTitle.trim(),
        category: eventCategory,
        day: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        color: eventColor,
      });
      toast.success('Time block scheduled');
    }
    setIsEventModalOpen(false);
  };

  // AI Daily Plan Generator
  const generateAIDailyPlan = () => {
    setAiGenerating(true);
    setTimeout(() => {
      const suggestedBlocks = [
        { title: 'Morning Deep Work: High Priority Focus', start: '08:30', end: '10:30', cat: 'Work', color: '#4F46E5' },
        { title: 'Communication, Emails & Team Standup', start: '10:45', end: '11:30', cat: 'Meeting', color: '#06B6D4' },
        { title: 'Deep Problem Solving & Implementation', start: '11:30', end: '12:30', cat: 'Projects', color: '#7C3AED' },
        { title: 'Nutritious Lunch & Outdoor Walk', start: '12:30', end: '13:30', cat: 'Health', color: '#10B981' },
        { title: 'Execution Block: Milestone Review', start: '14:00', end: '16:00', cat: 'Projects', color: '#4F46E5' },
        { title: 'Continuous Learning & Upskilling', start: '16:30', end: '17:30', cat: 'Study', color: '#F59E0B' },
        { title: 'Daily Wrap-up & Tomorrow Preparation', start: '17:30', end: '18:00', cat: 'Personal', color: '#EC4899' },
      ];

      suggestedBlocks.forEach(sb => {
        addEvent({
          title: sb.title,
          category: sb.cat,
          day: dayOfWeek,
          start_time: sb.start,
          end_time: sb.end,
          color: sb.color,
        });
      });

      setAiGenerating(false);
      toast.success('AI successfully optimized your daily schedule!');
    }, 1000);
  };

  // Timeline hours (7 AM to 9 PM)
  const hours = Array.from({ length: 15 }, (_, i) => i + 7);

  // Completion stats
  const completedCount = dateTasks.filter(t => t.status === 'completed').length;
  const progressPercent = dateTasks.length > 0 ? Math.round((completedCount / dateTasks.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Bento Header Feature Card */}
      <BentoCard span="full" variant="feature" className="p-5 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 flex-wrap">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <button
                type="button"
                onClick={() => changeDate(-1)}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors cursor-pointer"
                title="Previous Day"
                aria-label="Previous day"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => setSelectedDate(getTodayISO())}
                className="px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => changeDate(1)}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors cursor-pointer"
                title="Next Day"
                aria-label="Next day"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2 capitalize tracking-tight">
                <CalendarIcon size={22} className="text-indigo-600" />
                {dayOfWeek}, {formatDate(selectedDate)}
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Daily Schedule · Chronological Time Blocking</p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={generateAIDailyPlan}
              disabled={aiGenerating}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-100 border border-violet-200/80 dark:border-violet-700/60 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              <Sparkles size={14} className={`text-violet-600 ${aiGenerating ? 'animate-spin' : ''}`} />
              <span>{aiGenerating ? 'Planning...' : 'AI Auto-Plan'}</span>
            </button>
            <button
              type="button"
              onClick={() => openNewEventModal()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 gradient-primary hover:gradient-primary-hover text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm shadow-indigo-500/25 hover:shadow-md hover:shadow-indigo-500/35"
            >
              <Plus size={15} />
              <span>+ Time Block</span>
            </button>
          </div>
        </div>
      </BentoCard>

      {/* Conflicts Notice Banner */}
      {conflicts.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-start gap-3 shadow-2xs animate-fade-in">
          <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <span className="font-bold text-amber-800 dark:text-amber-300">Schedule Notice: Overlapping Time Blocks Detected</span>
            {conflicts.map((c, i) => (
              <p key={i} className="text-amber-700 dark:text-amber-400 font-medium">{c}</p>
            ))}
          </div>
        </div>
      )}

      {/* Bento Metric KPI Tiles */}
      <BentoGrid>
        <MetricCard 
          label="Tasks Due" 
          value={dateTasks.length} 
          icon={ListTodo} 
          tone="indigo" 
          hint={`${completedCount} completed for this date`}
        />
        <MetricCard 
          label="Time Blocks" 
          value={dayEvents.length} 
          icon={Clock} 
          tone="cyan" 
          valueClassName="text-cyan-600"
          hint={`${hours.length} total daylight hours`}
        />
        <MetricCard 
          label="Top Priorities" 
          value={topPriorities.length} 
          icon={Target} 
          tone="amber" 
          valueClassName="text-amber-600"
          hint={topPriorities.length > 0 ? "High impact focus items" : "All priorities completed"}
        />
        <MetricCard 
          label="Execution Velocity" 
          value={`${progressPercent}%`} 
          icon={CheckCircle2} 
          tone="emerald" 
          valueClassName="text-emerald-600"
          hint={<BentoProgress value={progressPercent} label="Daily task execution velocity" className="mt-2" />}
        />
      </BentoGrid>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Chronological Daily Timeline (8 cols) */}
        <BentoCard span="two-thirds" className="p-5 md:p-6">
          <BentoCardHeader
            title="Chronological Hourly Timeline"
            subtitle="Plan focus sprints & time blocks"
            icon={Clock}
            tone="indigo"
            badge={
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 font-bold text-indigo-700 dark:text-indigo-300">
                {dayEvents.length} Blocks
              </span>
            }
            right={<span className="text-xs text-slate-400 hidden sm:inline">Click any hour to schedule</span>}
          />

          {/* Timeline View */}
          <div className="space-y-1.5 mt-2">
            {hours.map(hour => {
              const timeString = `${hour.toString().padStart(2, '0')}:00`;
              const hourEvents = dayEvents.filter(e => {
                const startH = parseInt(e.start_time.split(':')[0], 10);
                return startH === hour;
              });

              return (
                <div key={hour} className="group flex items-start gap-3 min-h-[58px] border-b border-slate-100/90 dark:border-slate-800/80 py-2 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 rounded-xl px-2 transition-colors">
                  <div 
                    onClick={() => openNewEventModal(timeString)}
                    className="w-14 text-right text-xs font-bold text-slate-400 pt-1 shrink-0 cursor-pointer group-hover:text-indigo-600 transition-colors"
                  >
                    {timeString}
                  </div>
                  
                  {/* Event slots */}
                  <div className="flex-1 flex flex-wrap gap-2.5">
                    {hourEvents.length > 0 ? (
                      hourEvents.map(ev => (
                        <div
                          key={ev.id}
                          className="flex-1 min-w-[220px] max-w-full p-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between group/card relative"
                          style={eventCardStyle(ev.color)}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs md:text-sm font-bold text-slate-900 dark:text-slate-100">{ev.title}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/90 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 shadow-2xs">
                                {ev.category}
                              </span>
                            </div>
                            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                              <Clock size={11} className="text-slate-400" />
                              <span>{ev.start_time} - {ev.end_time}</span>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => openEditEventModal(ev)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                              title="Edit"
                              aria-label="Edit time block"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteEvent(ev.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                              title="Delete"
                              aria-label="Delete time block"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <button
                        type="button"
                        onClick={() => openNewEventModal(timeString)}
                        className="opacity-0 group-hover:opacity-100 w-full py-1.5 text-left px-3 text-xs font-semibold text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center gap-1.5 cursor-pointer border border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-300 rounded-lg hover:bg-white dark:hover:bg-slate-800"
                      >
                        <Plus size={13} /> Schedule focus block at {timeString}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </BentoCard>

        {/* Right Column: Top Priorities, Daily Progress, Notes (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Top 3 Priorities Bento Card */}
          <BentoCard span="full" className="p-5">
            <BentoCardHeader
              title="Daily Priorities"
              subtitle="Must-complete focus items"
              icon={Target}
              tone="amber"
              badge={<span className="text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-200 dark:border-amber-800">Must Complete</span>}
            />

            {topPriorities.length === 0 ? (
              <div className="bento-empty py-6">
                <CheckCircle2 size={24} className="text-emerald-400 mb-1" />
                <p className="font-semibold text-slate-600 dark:text-slate-300">No pending high-priority tasks</p>
                <p className="text-slate-400 text-[11px]">All key priorities for today are handled!</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {topPriorities.map((task, idx) => {
                  const isCompleted = task.status === 'completed';
                  return (
                    <div
                      key={task.id}
                      className={`p-3 rounded-xl border transition-all flex items-start gap-2.5 ${
                        isCompleted 
                          ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-70' 
                          : 'bg-slate-50/50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-200'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleTask(task.id)}
                        aria-label={`Mark task ${task.title} as ${isCompleted ? 'incomplete' : 'completed'}`}
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-all cursor-pointer shrink-0 mt-0.5 ${
                          isCompleted
                            ? 'bg-emerald-500 text-white'
                            : 'border-2 border-slate-300 dark:border-slate-600 hover:border-indigo-600 bg-white dark:bg-slate-700'
                        }`}
                      >
                        {isCompleted && <Check size={12} strokeWidth={3} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full gradient-primary text-white text-[10px] font-black flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <p className={`text-xs font-bold truncate ${isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}>
                            {task.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${PRIORITY_CONFIG[task.priority]?.bg} ${PRIORITY_CONFIG[task.priority]?.color} ${PRIORITY_CONFIG[task.priority]?.border}`}>
                            {PRIORITY_CONFIG[task.priority]?.label}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{task.category}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </BentoCard>

          {/* All Tasks for Date Bento Card */}
          <BentoCard span="full" className="p-5">
            <BentoCardHeader
              title="All Date Tasks"
              subtitle="Scheduled due today"
              icon={ListTodo}
              tone="indigo"
              badge={<span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full">{dateTasks.length}</span>}
            />
            <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 scrollbar-hide">
              {dateTasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                      task.status === 'completed' ? 'bg-emerald-500 text-white' : 'border border-slate-300 dark:border-slate-600'
                    }`}>
                      {task.status === 'completed' && <Check size={10} strokeWidth={3} />}
                    </div>
                    <span className={`truncate font-medium ${task.status === 'completed' ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                      {task.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 capitalize shrink-0 ml-2">{task.priority}</span>
                </div>
              ))}
              {dateTasks.length === 0 && (
                <div className="bento-empty py-4">
                  <p className="text-xs text-slate-400">No tasks scheduled for this day.</p>
                </div>
              )}
            </div>
          </BentoCard>

          {/* Daily Strategic Reflection / Notes Bento Card */}
          <BentoCard span="full" variant="muted" className="p-5">
            <BentoCardHeader
              title="Daily Reflection"
              subtitle="Notes & scratchpad"
              icon={BookOpen}
              tone="violet"
              badge={
                <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Auto-saved
                </span>
              }
            />
            <textarea
              value={dailyNote}
              onChange={(e) => handleNoteChange(e.target.value)}
              placeholder="Jot down quick reflections, blockers, ideas, or meeting highlights for today..."
              rows={4}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none transition-all placeholder:text-slate-400"
            />
          </BentoCard>
        </div>
      </div>

      {/* Modal for Creating / Editing Time Block - rendered via portal */}
      {isEventModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {editingEvent ? 'Edit Time Block' : 'Schedule New Time Block'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEventModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Activity / Focus Title *</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Deep Work: System Architecture"
                  required
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Category</label>
                  <select
                    value={eventCategory}
                    onChange={(e) => setEventCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="Work">Work</option>
                    <option value="Study">Study</option>
                    <option value="Projects">Projects</option>
                    <option value="Health">Health</option>
                    <option value="Personal">Personal</option>
                    <option value="Meeting">Meeting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">Color Tag</label>
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    {EVENT_COLORS.map(col => (
                      <button
                        type="button"
                        key={col}
                        onClick={() => setEventColor(col)}
                        className={`w-6 h-6 rounded-full transition-transform cursor-pointer shadow-2xs ${
                          eventColor === col ? 'scale-125 ring-2 ring-offset-2 ring-indigo-600' : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold gradient-primary hover:gradient-primary-hover text-white rounded-xl shadow-xs cursor-pointer"
                >
                  {editingEvent ? 'Save Changes' : 'Schedule Block'}
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
