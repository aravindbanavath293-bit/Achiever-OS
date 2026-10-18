import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon, Clock, AlertTriangle, Trash2 } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { getWeekDates, getWeekMonday, formatDateShort } from '../utils/dateUtils';
import { DayOfWeek, DAYS_OF_WEEK, ScheduleEvent } from '../types';
import toast from 'react-hot-toast';

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 7 AM to 10 PM

const EVENT_COLORS: { label: string; bg: string; border: string; text: string }[] = [
  { label: 'Navy', bg: 'bg-[#203451]/10', border: 'border-[#203451]', text: 'text-[#203451]' },
  { label: 'Gold', bg: 'bg-[#C9A34E]/15', border: 'border-[#C9A34E]', text: 'text-[#8A6A24]' },
  { label: 'Emerald', bg: 'bg-[#4C9B73]/15', border: 'border-[#4C9B73]', text: 'text-[#2D6C4D]' },
  { label: 'Rose', bg: 'bg-[#D94B50]/15', border: 'border-[#D94B50]', text: 'text-[#9E2A2E]' },
  { label: 'Purple', bg: 'bg-purple-100', border: 'border-purple-600', text: 'text-purple-800' },
  { label: 'Sky', bg: 'bg-sky-100', border: 'border-sky-600', text: 'text-sky-800' },
];

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
  const [eventColor, setEventColor] = useState('#203451');

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
    setEventColor('#203451');
    setIsModalOpen(true);
  };

  const openEditEventModal = (ev: ScheduleEvent) => {
    setEditingEvent(ev);
    setEventDay(ev.day);
    setEventTitle(ev.title);
    setEventCategory(ev.category);
    setStartTime(ev.start_time);
    setEndTime(ev.end_time);
    setEventColor(ev.color || '#203451');
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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-border shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <CalendarIcon size={20} className="text-gold" />
            Weekly Timetable
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {formatDateShort(weekStart)} – {formatDateShort(weekEnd)}, {weekStart.getFullYear()}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Week Navigation */}
          <div className="flex items-center bg-background rounded-lg p-1 border border-border">
            <button
              onClick={prevWeek}
              className="p-1.5 hover:bg-white rounded text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              title="Previous Week"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={goToThisWeek}
              className="px-3 py-1 text-xs font-semibold text-primary hover:bg-white rounded transition-colors cursor-pointer"
            >
              This Week
            </button>
            <button
              onClick={nextWeek}
              className="p-1.5 hover:bg-white rounded text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              title="Next Week"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            onClick={() => openNewEventModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-xs shrink-0"
          >
            <Plus size={14} />
            + New Event
          </button>
        </div>
      </div>

      {/* Conflicts warning */}
      {conflicts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3 text-xs text-amber-800">
          <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Schedule Overlaps Detected:</span>
            <div className="mt-1 space-y-0.5">
              {conflicts.slice(0, 3).map((c, i) => (
                <div key={i}>{c}</div>
              ))}
              {conflicts.length > 3 && (
                <div className="text-[11px] font-semibold text-amber-700">
                  + {conflicts.length - 3} more conflict(s)
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Timetable Grid Card */}
      <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[850px]">
            {/* Days Header */}
            <div className="grid grid-cols-8 border-b border-border bg-surface-container-low text-center">
              <div className="p-3 border-r border-border flex items-center justify-center">
                <span className="text-[10px] font-bold text-secondary-text uppercase tracking-wider">Time</span>
              </div>
              {DAYS_OF_WEEK.map((d, i) => {
                const date = weekDates[i];
                const isToday = date && date.toDateString() === todayStr;
                return (
                  <div
                    key={d}
                    className={`p-2.5 border-r border-border last:border-r-0 ${isToday ? 'bg-primary/5' : ''} ${i >= 5 ? 'bg-gray-50/70' : ''}`}
                  >
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-secondary-text">
                      {d.slice(0, 3)}
                    </span>
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold mt-1 ${isToday ? 'bg-primary text-white shadow-xs' : 'text-on-surface'}`}>
                      {date ? date.getDate() : ''}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Hours Grid */}
            <div className="divide-y divide-gray-100">
              {HOURS.map(hour => {
                const timeString = `${hour.toString().padStart(2, '0')}:00`;
                return (
                  <div key={hour} className="grid grid-cols-8 min-h-[64px] group">
                    {/* Time Label */}
                    <div className="p-2 border-r border-border flex items-start justify-center bg-gray-50/40">
                      <span className="text-[10px] font-semibold text-secondary-text mt-1 px-1.5 py-0.5 rounded bg-white border border-gray-200">
                        {formatHour(hour)}
                      </span>
                    </div>

                    {/* Day Columns */}
                    {DAYS_OF_WEEK.map((day, dayIdx) => {
                      // Find events for this day starting in this hour
                      const cellEvents = events.filter(e => {
                        if (e.day !== day) return false;
                        const startH = parseInt(e.start_time.split(':')[0], 10);
                        return startH === hour;
                      });

                      const isWeekend = dayIdx >= 5;

                      return (
                        <div
                          key={`${day}-${hour}`}
                          className={`p-1 border-r border-gray-100 last:border-r-0 relative hover:bg-blue-50/20 transition-colors ${isWeekend ? 'bg-gray-50/30' : ''}`}
                        >
                          {cellEvents.map(ev => (
                            <div
                              key={ev.id}
                              onClick={() => openEditEventModal(ev)}
                              className="p-1.5 rounded border mb-1 cursor-pointer hover:shadow-xs transition-all text-left group/ev relative overflow-hidden"
                              style={{
                                backgroundColor: `${ev.color || '#203451'}12`,
                                borderColor: ev.color || '#203451',
                                borderLeftWidth: '3px',
                              }}
                            >
                              <div className="text-[11px] font-bold truncate text-primary leading-tight">
                                {ev.title}
                              </div>
                              <div className="text-[9px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                                <Clock size={8} />
                                {ev.start_time}-{ev.end_time}
                              </div>
                            </div>
                          ))}

                          {/* Quick Add Button on Hover when empty */}
                          {cellEvents.length === 0 && (
                            <button
                              onClick={() => openNewEventModal(day, timeString)}
                              className="opacity-0 group-hover:opacity-100 absolute inset-1 flex items-center justify-center text-primary/40 hover:text-primary transition-opacity cursor-pointer"
                              title={`Add event at ${timeString} on ${day}`}
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

      {/* Modal for Creating/Editing Event */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-border shadow-lg w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-background">
              <h3 className="text-sm font-bold text-primary">
                {editingEvent ? 'Edit Timetable Event' : 'Add Timetable Event'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Event Title *</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g., Database Systems Lecture"
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Day of Week</label>
                  <select
                    value={eventDay}
                    onChange={(e) => setEventDay(e.target.value as DayOfWeek)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border focus:outline-none focus:border-primary bg-white capitalize"
                  >
                    {DAYS_OF_WEEK.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Category</label>
                  <select
                    value={eventCategory}
                    onChange={(e) => setEventCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border focus:outline-none focus:border-primary bg-white"
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

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">Color Accent</label>
                <div className="flex items-center gap-2">
                  {['#203451', '#C9A34E', '#4C9B73', '#D94B50', '#7C3AED', '#0284C7'].map(c => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setEventColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${eventColor === c ? 'scale-110 ring-2 ring-offset-2 ring-primary' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-border">
                {editingEvent ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
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
                    {editingEvent ? 'Save Changes' : 'Create Event'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
