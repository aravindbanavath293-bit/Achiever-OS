import { useState, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, 
  Sparkles, Plus, AlertTriangle, CheckCircle2, Circle, Edit2, Trash2, X
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { formatDate, getTodayISO, getDayOfWeek } from '../utils/dateUtils';
import { ScheduleEvent, Task, PRIORITY_CONFIG } from '../types';
import toast from 'react-hot-toast';

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
  const [eventColor, setEventColor] = useState('#203451');

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
    // Default 1 hour later
    const [h, m] = (time || '10:00').split(':').map(Number);
    const endH = (h + 1).toString().padStart(2, '0');
    setEndTime(`${endH}:${m.toString().padStart(2, '0')}`);
    setEventColor('#203451');
    setIsEventModalOpen(true);
  };

  const openEditEventModal = (ev: ScheduleEvent) => {
    setEditingEvent(ev);
    setEventTitle(ev.title);
    setEventCategory(ev.category);
    setStartTime(ev.start_time);
    setEndTime(ev.end_time);
    setEventColor(ev.color || '#203451');
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
        { title: 'Morning Deep Work: Core Project', start: '08:30', end: '10:30', cat: 'Projects', color: '#203451' },
        { title: 'Email & Urgent Communication Review', start: '10:45', end: '11:30', cat: 'Work', color: '#4C9B73' },
        { title: 'Sprint Review & Team Alignment', start: '11:30', end: '12:30', cat: 'Work', color: '#203451' },
        { title: 'Healthy Lunch & Physical Walk', start: '12:30', end: '13:30', cat: 'Health', color: '#E7A23B' },
        { title: 'Execution Block: High Priority Tasks', start: '14:00', end: '16:00', cat: 'Projects', color: '#203451' },
        { title: 'Learning & Skill Deep Dive', start: '16:30', end: '17:30', cat: 'Study', color: '#7C3AED' },
        { title: 'Daily Review & Next Day Plan', start: '17:30', end: '18:00', cat: 'Personal', color: '#059669' },
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
      toast.success('AI created an optimized daily schedule!');
    }, 1200);
  };

  // Timeline hours
  const hours = Array.from({ length: 15 }, (_, i) => i + 7); // 7 AM to 9 PM

  // Completion stats
  const completedCount = dateTasks.filter(t => t.status === 'completed').length;
  const progressPercent = dateTasks.length > 0 ? Math.round((completedCount / dateTasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header with Date Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-border shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-background rounded-lg p-1 border border-border">
            <button
              onClick={() => changeDate(-1)}
              className="p-1.5 hover:bg-white rounded text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              title="Previous Day"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setSelectedDate(getTodayISO())}
              className="px-3 py-1 text-xs font-semibold text-primary hover:bg-white rounded transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={() => changeDate(1)}
              className="p-1.5 hover:bg-white rounded text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              title="Next Day"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary flex items-center gap-2 capitalize">
              <CalendarIcon size={20} className="text-gold" />
              {dayOfWeek}, {formatDate(selectedDate)}
            </h1>
            <p className="text-xs text-on-surface-variant">Daily Schedule & Strategic Time Blocks</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={generateAIDailyPlan}
            disabled={aiGenerating}
            className="flex items-center gap-1.5 px-3 py-2 bg-gold/15 text-gold-dark hover:bg-gold/25 border border-gold/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            <Sparkles size={14} className={aiGenerating ? 'animate-spin' : ''} />
            {aiGenerating ? 'Generating...' : 'AI Daily Plan'}
          </button>
          <button
            onClick={() => openNewEventModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-xs"
          >
            <Plus size={14} />
            + Time Block
          </button>
        </div>
      </div>

      {/* Conflicts Banner */}
      {conflicts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 space-y-1">
            <span className="font-semibold">Schedule Warning: Overlapping Time Blocks Detected</span>
            {conflicts.map((c, i) => (
              <p key={i}>{c}</p>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: 2 Columns (Timeline & Daily Focus/Notes) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Chronological Daily Timeline (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-border p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-primary" />
              <h2 className="text-sm font-bold text-on-surface">Chronological Timeline</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-surface-container font-medium text-on-surface-variant">
                {dayEvents.length} Blocks Scheduled
              </span>
            </div>
            <span className="text-xs text-on-surface-variant">Click any hour to add a block</span>
          </div>

          {/* Timeline View */}
          <div className="relative space-y-1.5">
            {hours.map(hour => {
              const timeString = `${hour.toString().padStart(2, '0')}:00`;
              const hourEvents = dayEvents.filter(e => {
                const startH = parseInt(e.start_time.split(':')[0], 10);
                return startH === hour;
              });

              return (
                <div key={hour} className="group flex items-start gap-3 min-h-[58px] border-b border-gray-100 py-1.5 hover:bg-gray-50/50 rounded transition-colors">
                  <div 
                    onClick={() => openNewEventModal(timeString)}
                    className="w-14 text-right text-xs font-semibold text-secondary-text pt-1 shrink-0 cursor-pointer group-hover:text-primary"
                  >
                    {timeString}
                  </div>
                  
                  {/* Event slots */}
                  <div className="flex-1 flex flex-wrap gap-2">
                    {hourEvents.length > 0 ? (
                      hourEvents.map(ev => (
                        <div
                          key={ev.id}
                          className="flex-1 min-w-[200px] max-w-full p-2.5 rounded-lg border border-border bg-white shadow-2xs hover:shadow-xs transition-all flex items-center justify-between group/card relative"
                          style={{ borderLeftWidth: '4px', borderLeftColor: ev.color || '#203451' }}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-primary">{ev.title}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-medium">
                                {ev.category}
                              </span>
                            </div>
                            <div className="text-[11px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                              <Clock size={10} />
                              {ev.start_time} - {ev.end_time}
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditEventModal(ev)}
                              className="p-1 text-on-surface-variant hover:text-primary rounded cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => deleteEvent(ev.id)}
                              className="p-1 text-on-surface-variant hover:text-red-600 rounded cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <button
                        onClick={() => openNewEventModal(timeString)}
                        className="opacity-0 group-hover:opacity-100 w-full py-1.5 text-left px-3 text-xs text-gray-400 hover:text-primary transition-all flex items-center gap-1.5 cursor-pointer border border-dashed border-gray-200 rounded"
                      >
                        <Plus size={12} /> Schedule task or activity at {timeString}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Top Priorities, Daily Progress, Notes (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Daily Progress Card */}
          <div className="bg-white rounded-xl border border-border p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Today's Completion</span>
              <span className="text-xs font-bold text-primary">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-on-surface-variant mt-2">
              <span>{completedCount} Completed</span>
              <span>{dateTasks.length - completedCount} Remaining</span>
            </div>
          </div>

          {/* Top 3 Priorities */}
          <div className="bg-white rounded-xl border border-border p-4 shadow-xs">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Top 3 Focus Priorities</span>
              <span className="text-[10px] text-gold font-semibold">Priority 1, 2, 3</span>
            </h3>

            {topPriorities.length === 0 ? (
              <p className="text-xs text-on-surface-variant text-center py-4 bg-background rounded-lg border border-dashed border-border">
                No high-priority tasks due for this date.
              </p>
            ) : (
              <div className="space-y-2">
                {topPriorities.map((task, idx) => (
                  <div
                    key={task.id}
                    className="p-2.5 rounded-lg border border-border bg-background/50 hover:bg-white transition-colors flex items-start gap-2.5"
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="mt-0.5 text-on-surface-variant hover:text-success transition-colors cursor-pointer"
                    >
                      {task.status === 'completed' ? (
                        <CheckCircle2 size={16} className="text-success fill-success/20" />
                      ) : (
                        <Circle size={16} />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <p className={`text-xs font-medium truncate ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-on-surface'}`}>
                          {task.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${PRIORITY_CONFIG[task.priority].bg} ${PRIORITY_CONFIG[task.priority].color}`}>
                          {PRIORITY_CONFIG[task.priority].label}
                        </span>
                        <span className="text-[10px] text-on-surface-variant">{task.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Daily Unscheduled Tasks */}
          <div className="bg-white rounded-xl border border-border p-4 shadow-xs">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
              All Tasks for Date ({dateTasks.length})
            </h3>
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {dateTasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    {task.status === 'completed' ? (
                      <CheckCircle2 size={14} className="text-success shrink-0" />
                    ) : (
                      <Circle size={14} className="text-on-surface-variant shrink-0" />
                    )}
                    <span className={`truncate ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-on-surface'}`}>
                      {task.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-secondary-text shrink-0">{task.priority}</span>
                </div>
              ))}
              {dateTasks.length === 0 && (
                <p className="text-xs text-on-surface-variant text-center py-2">No tasks scheduled for this day.</p>
              )}
            </div>
          </div>

          {/* Daily Strategic Reflection / Notes */}
          <div className="bg-white rounded-xl border border-border p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Daily Focus & Notes</span>
              <span className="text-[10px] text-on-surface-variant">Auto-saved</span>
            </div>
            <textarea
              value={dailyNote}
              onChange={(e) => handleNoteChange(e.target.value)}
              placeholder="Jot down quick reflections, blockers, ideas, or meeting reminders for today..."
              rows={4}
              className="w-full text-xs p-2.5 rounded-lg border border-border bg-background focus:outline-none focus:border-primary resize-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Modal for Creating / Editing Time Block */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-border shadow-lg w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-background">
              <h3 className="text-sm font-bold text-primary">
                {editingEvent ? 'Edit Time Block' : 'Schedule New Time Block'}
              </h3>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Activity / Focus Title *</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. System Architecture Design"
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Category</label>
                  <select
                    value={eventCategory}
                    onChange={(e) => setEventCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border focus:outline-none focus:border-primary bg-white"
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
                  <label className="block text-xs font-semibold text-on-surface mb-1">Tag Accent Color</label>
                  <div className="flex items-center gap-2 pt-1.5">
                    {['#203451', '#C9A34E', '#4C9B73', '#D94B50', '#7C3AED', '#2563EB'].map(col => (
                      <button
                        type="button"
                        key={col}
                        onClick={() => setEventColor(col)}
                        className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${eventColor === col ? 'scale-110 ring-2 ring-offset-2 ring-primary' : ''}`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors cursor-pointer shadow-xs"
                >
                  {editingEvent ? 'Save Changes' : 'Add Time Block'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
