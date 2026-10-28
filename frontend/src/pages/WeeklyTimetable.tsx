import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon, Clock, AlertTriangle, Trash2, CalendarDays, Zap, CheckCircle2 } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { getWeekDates, formatDateShort } from '../utils/dateUtils';
import { DayOfWeek, DAYS_OF_WEEK, ScheduleEvent, EVENT_COLORS } from '../types';
import toast from 'react-hot-toast';
import { eventCardStyle } from '../utils/colors';
import { BentoGrid, BentoCard, MetricCard } from '../components/bento/Bento';

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 7 AM to 10 PM

export default function WeeklyTimetable() {
  const { events, addEvent, updateEvent, deleteEvent } = useAppData();
  const [weekDates, setWeekDates] = useState<Date[]>(getWeekDates());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);

  // Form state
  const [eventDay, setEventDay] = useState<DayOfWeek>('monday');
  const [eventTitle, setEventTitle] = useState('');
  const [eventCategory, setEventCategory] = useState('Work');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [eventColor, setEventColor] = useState('#4F46E5');

  const todayStr = new Date().toDateString();
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  // Navigation
  const nextWeek = () => {
    const d = new Date(weekDates[0]);
    d.setDate(d.getDate() + 7);
    setWeekDates(getWeekDates(d));
  };

  const prevWeek = () => {
    const d = new Date(weekDates[0]);
    d.setDate(d.getDate() - 7);
    setWeekDates(getWeekDates(d));
  };

  const goToThisWeek = () => {
    setWeekDates(getWeekDates());
  };

  const openNewEventModal = (day: DayOfWeek = 'monday', time: string = '09:00') => {
    setEditingEvent(null);
    setEventDay(day);
    setEventTitle('');
    setEventCategory('Work');
    setStartTime(time);
    const [h, m] = time.split(':').map(Number);
    const endH = (h + 1).toString().padStart(2, '0');
    setEndTime(`${endH}:${m.toString().padStart(2, '0')}`);
    setEventColor('#4F46E5');
    setIsModalOpen(true);
  };

  const openEditEventModal = (ev: ScheduleEvent) => {
    setEditingEvent(ev);
    setEventDay(ev.day);
    setEventTitle(ev.title);
    setEventCategory(ev.category);
    setStartTime(ev.start_time);
    setEndTime(ev.end_time);
    setEventColor(ev.color || '#4F46E5');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
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
        day: eventDay,
        start_time: startTime,
        end_time: endTime,
        color: eventColor,
      });
      toast.success('Event updated');
    } else {
      addEvent({
        title: eventTitle.trim(),
        category: eventCategory,
        day: eventDay,
        start_time: startTime,
        end_time: endTime,
        color: eventColor,
      });
      toast.success('Event added to timetable');
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!editingEvent) return;
    deleteEvent(editingEvent.id);
    toast.success('Event removed');
    setIsModalOpen(false);
  };

  // Conflict detection
  const conflicts = useMemo(() => {
    const list: string[] = [];
    DAYS_OF_WEEK.forEach(day => {
      const dayEvs = events.filter(e => e.day === day).sort((a, b) => a.start_time.localeCompare(b.start_time));
      for (let i = 0; i < dayEvs.length; i++) {
        for (let j = i + 1; j < dayEvs.length; j++) {
          const e1 = dayEvs[i];
          const e2 = dayEvs[j];
          if (e1.start_time < e2.end_time && e2.start_time < e1.end_time) {
            list.push(`${day.toUpperCase()}: "${e1.title}" (${e1.start_time}-${e1.end_time}) overlaps with "${e2.title}" (${e2.start_time}-${e2.end_time})`);
          }
        }
      }
    });
    return list;
  }, [events]);

  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 || 12;
    return `${h} ${ampm}`;
  };

  const conflictCount = conflicts.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Bento Header Feature Card */}
      <BentoCard span="full" variant="feature" className="p-5 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
              <CalendarIcon size={22} className="text-indigo-600" />
              Weekly Timetable
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {formatDateShort(weekStart)} – {formatDateShort(weekEnd)}, {weekStart.getFullYear()} · Master Class & Focus Schedule
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Week Navigation */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <button
                type="button"
                onClick={prevWeek}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors cursor-pointer"
                title="Previous Week"
                aria-label="Previous week"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={goToThisWeek}
                className="px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                This Week
              </button>
              <button
                type="button"
                onClick={nextWeek}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors cursor-pointer"
                title="Next Week"
                aria-label="Next week"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => openNewEventModal()}
              className="flex items-center gap-1.5 px-4 py-2.5 gradient-primary hover:gradient-primary-hover text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm shadow-indigo-500/25 hover:shadow-md shrink-0 ml-auto sm:ml-0"
            >
              <Plus size={15} />
              <span>+ New Event</span>
            </button>
          </div>
        </div>
      </BentoCard>

      {/* Bento Metric KPI Tiles */}
      <BentoGrid>
        <MetricCard label="Weekly Time Blocks" value={events.length} icon={CalendarDays} tone="indigo" hint="Recurring weekly schedule" />
        <MetricCard label="Active Days" value="7 Days" valueClassName="text-cyan-600" icon={Clock} tone="cyan" hint="Mon through Sun" />
        <MetricCard label="Schedule Status" value={conflictCount === 0 ? "Optimal" : `${conflictCount} Overlaps`} valueClassName={conflictCount === 0 ? "text-emerald-600" : "text-amber-600"} icon={Zap} tone={conflictCount === 0 ? "emerald" : "amber"} hint={conflictCount === 0 ? "No overlapping blocks" : "Check overlap notices below"} />
        <MetricCard label="Time Window" value="7 AM - 10 PM" valueClassName="text-violet-600" icon={CalendarIcon} tone="violet" hint="16 hours coverage per day" />
      </BentoGrid>

      {/* Conflicts warning */}
      {conflicts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900 shadow-2xs">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-800">Schedule Overlaps Detected:</span>
            <div className="mt-1 space-y-0.5">
              {conflicts.slice(0, 3).map((c, i) => (
                <div key={i} className="text-amber-700 font-medium">{c}</div>
              ))}
              {conflicts.length > 3 && (
                <div className="text-[11px] font-bold text-amber-800 mt-1">
                  + {conflicts.length - 3} more conflict(s)
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Timetable Grid Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[880px]">
            {/* Days Header */}
            <div className="grid grid-cols-8 border-b border-indigo-200 bg-gradient-to-r from-indigo-100 via-violet-100 to-pink-100 text-center">
              <div className="p-3.5 border-r border-slate-200 flex items-center justify-center">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Time</span>
              </div>
              {DAYS_OF_WEEK.map((d, i) => {
                const date = weekDates[i];
                const isToday = date && date.toDateString() === todayStr;
                return (
                  <div
                    key={d}
                    className={`p-3 border-r border-slate-200 last:border-r-0 transition-colors ${
                      isToday ? 'bg-indigo-200/70' : i >= 5 ? 'bg-pink-100/60' : ''
                    }`}
                  >
                    <span className={`block text-[11px] font-extrabold uppercase tracking-wider ${
                      isToday ? 'text-indigo-700' : 'text-slate-500'
                    }`}>
                      {d.slice(0, 3)}
                    </span>
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black mt-1 ${
                      isToday ? 'gradient-primary text-white shadow-xs' : 'text-slate-800'
                    }`}>
                      {date ? date.getDate() : ''}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Hours Grid */}
            <div className="divide-y divide-slate-100">
              {HOURS.map(hour => {
                const timeString = `${hour.toString().padStart(2, '0')}:00`;
                return (
                  <div key={hour} className="grid grid-cols-8 min-h-[64px] group">
                    {/* Time Label */}
                    <div className="p-2 border-r border-slate-200 flex items-start justify-center bg-indigo-50/70">
                      <span className="text-[10px] font-bold text-indigo-700 mt-1 px-1.5 py-0.5 rounded-md bg-white border border-indigo-200 shadow-2xs">
                        {formatHour(hour)}
                      </span>
                    </div>

                    {/* Day Columns */}
                    {DAYS_OF_WEEK.map((day, dayIdx) => {
                      const cellEvents = events.filter(e => {
                        if (e.day !== day) return false;
                        const startH = parseInt(e.start_time.split(':')[0], 10);
                        return startH === hour;
                      });

                      const isWeekend = dayIdx >= 5;

                      return (
                        <div
                          key={`${day}-${hour}`}
                          className={`p-1.5 border-r border-slate-100 last:border-r-0 relative hover:bg-indigo-50/30 transition-colors ${
                            isWeekend ? 'bg-pink-50/50' : ''
                          }`}
                        >
                          {cellEvents.map(ev => (
                            <div
                              key={ev.id}
                              onClick={() => openEditEventModal(ev)}
                              className="p-2 rounded-xl border mb-1.5 cursor-pointer hover:shadow-xs transition-all text-left relative overflow-hidden group/ev"
                              style={eventCardStyle(ev.color)}
                            >
                              <div className="text-[11px] font-bold truncate text-slate-900 leading-tight">
                                {ev.title}
                              </div>
                              <div className="text-[9px] font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
                                <Clock size={9} className="text-slate-400" />
                                <span>{ev.start_time}-{ev.end_time}</span>
                              </div>
                            </div>
                          ))}

                          {/* Quick Add Button on Hover when empty */}
                          {cellEvents.length === 0 && (
                            <button
                              onClick={() => openNewEventModal(day, timeString)}
                              className="opacity-0 group-hover:opacity-100 absolute inset-1 flex items-center justify-center text-indigo-400 hover:text-indigo-600 transition-opacity cursor-pointer"
                              title={`Schedule at ${timeString} on ${day}`}
                            >
                              <Plus size={14} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Creating/Editing Event - rendered via portal to be perfectly centered */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
              <h3 className="text-sm font-bold text-slate-900">
                {editingEvent ? 'Edit Timetable Event' : 'Add Timetable Event'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Event Title *</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g., Deep Learning Workshop"
                  required
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Day of Week</label>
                  <select
                    value={eventDay}
                    onChange={(e) => setEventDay(e.target.value as DayOfWeek)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-white capitalize"
                  >
                    {DAYS_OF_WEEK.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Category</label>
                  <select
                    value={eventCategory}
                    onChange={(e) => setEventCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="Work">Work</option>
                    <option value="Study">Study</option>
                    <option value="Lecture">Lecture</option>
                    <option value="Projects">Projects</option>
                    <option value="Health">Health</option>
                    <option value="Personal">Personal</option>
                    <option value="Meeting">Meeting</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Color Accent</label>
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  {EVENT_COLORS.map(c => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setEventColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform cursor-pointer shadow-2xs ${
                        eventColor === c ? 'scale-125 ring-2 ring-offset-2 ring-indigo-600' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                {editingEvent ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold gradient-primary hover:gradient-primary-hover text-white rounded-xl shadow-xs cursor-pointer"
                  >
                    {editingEvent ? 'Save Changes' : 'Create Event'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
